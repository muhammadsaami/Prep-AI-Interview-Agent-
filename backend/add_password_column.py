import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

with engine.connect() as conn:
    # Add column as nullable first (since old rows have no password)
    conn.execute(text(
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS hashed_password VARCHAR(255);"
    ))
    conn.commit()

print("Column added successfully!")