from backend.routers.resume import router as resume_router
from backend.routers.users import router as users_router
from backend.routers.sessions import router as sessions_router
from backend.routers.interview import router as interview_router
from backend.routers.feedback import router as feedback_router
from backend.routers.auth import router as auth_router
from backend.routers.stats import router as stats_router

__all__ = ["resume_router", "users_router", "sessions_router", "interview_router", "feedback_router", "auth_router", "stats_router"]