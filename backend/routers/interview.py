from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import InterviewSession, Message
from backend.services.interview_agent import process_user_response
from backend.services.speech_service import synthesize_speech

router = APIRouter(
    prefix="/interview",
    tags=["interview"]
)


class UserResponsePayload(BaseModel):
    message: str


class SpeakRequest(BaseModel):
    text: str


@router.post("/{session_id}/respond")
def respond_to_interview(
    session_id: int,
    payload: UserResponsePayload,
    db: Session = Depends(get_db)
):
    """
    Accepts user message, processes it through the LangGraph interview state machine,
    saves state & message history, and returns the agent's next reply.
    """
    user_message = payload.message.strip() if payload.message else ""
    if not user_message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="message field cannot be empty."
        )

    try:
        result = process_user_response(session_id, user_message, db)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Interview agent error: {str(err)}"
        )

    return {
        "session_id": session_id,
        "reply": result["reply"],
        "stage": result["stage"],
        "status": result["status"],
        "stage_started_at": result.get("stage_started_at"),
        "stage_time_limit_seconds": result.get("stage_time_limit_seconds")
    }


@router.post("/{session_id}/speak")
def speak_text(
    session_id: int,
    payload: SpeakRequest,
):
    """
    Converts the given text to speech audio using ElevenLabs and
    returns raw MP3 bytes that the frontend can play directly.
    """
    text = payload.text.strip() if payload.text else ""
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="text field cannot be empty."
        )

    try:
        audio_bytes = synthesize_speech(text)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(err)
        )
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )

    return Response(content=audio_bytes, media_type="audio/mpeg")


@router.get("/{session_id}/history")
def get_interview_history(
    session_id: int,
    db: Session = Depends(get_db)
):
    """
    Returns complete message history for a given interview session.
    """
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session with id {session_id} not found."
        )

    messages = (
        db.query(Message)
        .filter(Message.session_id == session_id, Message.sender != "system")
        .order_by(Message.created_at.asc())
        .all()
    )

    history = [
        {
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "stage": m.stage,
            "created_at": m.created_at
        }
        for m in messages
    ]

    return {
        "session_id": session_id,
        "stage": session.stage,
        "status": session.status,
        "messages": history
    }