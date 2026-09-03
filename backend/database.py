import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/interview_db")

# Create SQLAlchemy engine
# - pool_pre_ping: tests each connection with a lightweight query before use,
#   so dead connections are detected and replaced instead of crashing the request.
# - pool_recycle: proactively discards and replaces connections older than this
#   many seconds, since Neon (and most managed Postgres) silently closes idle
#   connections after a short period — recycling before that happens avoids
#   the "SSL error: unexpected eof while reading" crash.
# - connect_args keepalives: keeps the underlying TCP connection alive so it
#   doesn't get silently dropped by proxies/load balancers between requests.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=280,       # recycle connections every ~4.5 minutes (under Neon's idle timeout)
    pool_size=5,
    max_overflow=10,
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "sslmode": "require",
    },
)

# Session factory for DB operations
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for models
Base = declarative_base()

def get_db():
    """Dependency helper for FastAPI route handlers to get a DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()