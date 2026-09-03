import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

with engine.connect() as conn:
    conn.execute(text(
        "ALTER TABLE sessions ADD COLUMN IF NOT EXISTS current_stage_started_at TIMESTAMPTZ;"
    ))
    conn.commit()

print("Column added successfully!")