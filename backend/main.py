import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from backend.routers import resume_router, users_router, sessions_router, interview_router, auth_router, feedback_router, stats_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="AI Interview Prep Agent API",
    description="Backend API for AI Interview Prep application powered by LangGraph & Groq",
    version="0.1.0"
)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(resume_router)
app.include_router(sessions_router)
app.include_router(interview_router)
app.include_router(feedback_router)
app.include_router(stats_router)


@app.get("/")
def read_root():
    return {"message": "AI Interview Prep Agent API is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)