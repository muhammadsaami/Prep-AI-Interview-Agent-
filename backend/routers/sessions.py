from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Resume, InterviewSession, FeedbackReport
from backend.services.question_generator import generate_interview_questions

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"]
)


class SessionCreate(BaseModel):
    user_id: int
    resume_id: int
    target_role: str


@router.post("/create", status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new interview session.
    Fetches the resume's parsed JSON, generates tailored interview questions via LLM,
    saves the session to the database, and returns the session ID and generated questions.
    """
    # 1. Validate target_role
    target_role = payload.target_role.strip() if payload.target_role else ""
    if not target_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="target_role cannot be empty."
        )

    # 2. Verify user exists
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {payload.user_id} not found."
        )

    # 3. Verify resume exists
    resume = db.query(Resume).filter(Resume.id == payload.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with id {payload.resume_id} not found."
        )

    if resume.user_id != payload.user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resume id {payload.resume_id} does not belong to user id {payload.user_id}."
        )

    # 4. Generate interview questions via Groq LLM
    try:
        questions = generate_interview_questions(resume.parsed_json or {}, target_role)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error generating questions: {str(err)}"
        )

    # 5. Create new session record and initial messages in database
    try:
        import json
        from backend.models import Message

        first_stage = questions[0].get("type", "intro") if questions else "intro"
        if first_stage in ["technical", "resume-specific"]:
            initial_stage = "technical"
        elif first_stage == "behavioral":
            initial_stage = "behavioral"
        else:
            initial_stage = "intro"

        new_session = InterviewSession(
            user_id=payload.user_id,
            resume_id=payload.resume_id,
            target_role=target_role,
            stage=initial_stage,
            status="active"
        )
        db.add(new_session)
        db.commit()
        db.refresh(new_session)

        # Store generated questions and initial state metadata in system message for session tracking
        state_metadata = {
            "questions": questions,
            "current_question_index": 0,
            "follow_up_count": 0
        }
        system_msg = Message(
            session_id=new_session.id,
            sender="system",
            content=json.dumps(state_metadata),
            stage=initial_stage
        )
        db.add(system_msg)

        # Store initial agent welcome message with the first question
        first_q_text = questions[0]["question"] if questions else "Could you introduce yourself and tell me about your background?"
        welcome_text = f"Welcome to your mock interview for the {target_role} position!\n\nLet's begin with our first question:\n{first_q_text}"
        agent_msg = Message(
            session_id=new_session.id,
            sender="agent",
            content=welcome_text,
            stage=initial_stage
        )
        db.add(agent_msg)

        db.commit()
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session record: {str(err)}"
        )

    return {
        "session_id": new_session.id,
        "user_id": new_session.user_id,
        "resume_id": new_session.resume_id,
        "target_role": new_session.target_role,
        "stage": new_session.stage,
        "status": new_session.status,
        "started_at": new_session.started_at,
        "questions": questions,
        "initial_message": welcome_text
    }


@router.get("/user/{user_id}")
def get_user_sessions(user_id: int, db: Session = Depends(get_db)):
    """
    Fetch all interview sessions for a given user, along with their
    feedback scores (if a feedback report exists for that session).
    Used by the Dashboard to show session history cards.
    """
    sessions = (
        db.query(InterviewSession)
        .filter(InterviewSession.user_id == user_id)
        .order_by(InterviewSession.started_at.desc())
        .all()
    )

    result = []
    for s in sessions:
        feedback = (
            db.query(FeedbackReport)
            .filter(FeedbackReport.session_id == s.id)
            .first()
        )
        result.append({
            "session_id": s.id,
            "target_role": s.target_role,
            "status": s.status,
            "started_at": s.started_at,
            "technical_score": feedback.technical_score if feedback else None,
            "communication_score": feedback.communication_score if feedback else None,
        })

    return result


@router.get("/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    """
    Fetch a single session's details, including its stage and status.
    Used by the Interview page to know the current state when loading.
    """
    session_obj = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found."
        )

    return {
        "session_id": session_obj.id,
        "user_id": session_obj.user_id,
        "resume_id": session_obj.resume_id,
        "target_role": session_obj.target_role,
        "stage": session_obj.stage,
        "status": session_obj.status,
        "started_at": session_obj.started_at,
    }