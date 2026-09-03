from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import FeedbackReport
from backend.services.feedback_generator import generate_feedback_report

router = APIRouter(prefix="/session", tags=["feedback"])


@router.post("/{session_id}/feedback", status_code=status.HTTP_201_CREATED)
def create_feedback(session_id: int, db: Session = Depends(get_db)):
    try:
        report = generate_feedback_report(session_id, db)
    except ValueError as err:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(err))
    except RuntimeError as err:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(err))

    return {
        "session_id": report.session_id,
        "technical_score": report.technical_score,
        "communication_score": report.communication_score,
        "summary": report.summary,
        "improvement_areas": report.improvement_areas,
    }


@router.get("/{session_id}/feedback")
def get_feedback(session_id: int, db: Session = Depends(get_db)):
    report = db.query(FeedbackReport).filter(FeedbackReport.session_id == session_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Feedback report not found for this session.")

    return {
        "session_id": report.session_id,
        "technical_score": report.technical_score,
        "communication_score": report.communication_score,
        "summary": report.summary,
        "improvement_areas": report.improvement_areas,
    }