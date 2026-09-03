import os
import sys

# Ensure project root directory is in sys.path when script is executed directly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from backend.database import engine, Base
from backend.models import User, Resume, InterviewSession, Message, FeedbackReport


def init_db():
    """Verify database connectivity and create all defined tables."""
    print("Testing database connection...")
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("[SUCCESS] Database connection test passed!")
    except OperationalError as e:
        print(f"[ERROR] Connection failed: Unable to connect to the database.")
        print(f"Details: {e}")
        print("\nPlease verify your DATABASE_URL in backend/.env and ensure PostgreSQL service is running.")
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Unexpected error connecting to database: {e}")
        sys.exit(1)

    print("\nCreating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[SUCCESS] All database tables created successfully!")
        print("   Tables created: users, resumes, sessions, messages, feedback_reports")
    except Exception as e:
        print(f"[ERROR] Error creating tables: {e}")
        sys.exit(1)


if __name__ == "__main__":
    init_db()
