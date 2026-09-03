from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, Resume
from backend.services.resume_parser import extract_text_from_pdf, parse_resume_with_llm

router = APIRouter(
    prefix="/resume",
    tags=["resume"]
)


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_resume(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Accepts a PDF resume upload, extracts text, parses structured data via Groq LLM,
    saves raw text and parsed JSON to the database, and returns the parsed resume.
    """
    # 1. Validate file extension and MIME type
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files (.pdf) are allowed."
        )

    # 2. Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found."
        )

    # 3. Read file bytes and extract raw text using pdfplumber
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_pdf(file_bytes)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process PDF file: {str(err)}"
        )

    # 4. Send raw text to Groq LLM for structured JSON parsing
    try:
        parsed_json = parse_resume_with_llm(raw_text)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"LLM JSON parsing error: {str(err)}"
        )
    except RuntimeError as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error parsing resume with LLM: {str(err)}"
        )

    # 5. Save raw text and parsed JSON to resumes table
    try:
        resume_record = Resume(
            user_id=user_id,
            raw_text=raw_text,
            parsed_json=parsed_json
        )
        db.add(resume_record)
        db.commit()
        db.refresh(resume_record)
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save resume record to database: {str(err)}"
        )

    return {
        "id": resume_record.id,
        "user_id": resume_record.user_id,
        "raw_text": resume_record.raw_text,
        "parsed_json": resume_record.parsed_json,
        "uploaded_at": resume_record.uploaded_at
    }
