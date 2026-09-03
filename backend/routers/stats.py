from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.database import get_db
from backend.models import InterviewSession, FeedbackReport, User

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/public")
def get_public_stats(db: Session = Depends(get_db)):
    """
    Returns real, DB-derived metrics for display on the public landing page.
    No fabricated numbers — every value here reflects actual usage so far,
    even if the numbers are still small.
    """
    interviews_completed = (
        db.query(func.count(InterviewSession.id))
        .filter(InterviewSession.status == "completed")
        .scalar()
    ) or 0

    total_users = db.query(func.count(User.id)).scalar() or 0

    avg_technical = db.query(func.avg(FeedbackReport.technical_score)).scalar()
    avg_communication = db.query(func.avg(FeedbackReport.communication_score)).scalar()

    scores = [s for s in [avg_technical, avg_communication] if s is not None]
    avg_score = round(sum(scores) / len(scores)) if scores else None

    return {
        "interviews_completed": interviews_completed,
        "total_users": total_users,
        "avg_score": avg_score,  # None if no feedback reports exist yet
    }