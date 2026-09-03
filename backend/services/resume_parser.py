import os
import io
import json
import re
import pdfplumber
from groq import Groq


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract raw text from PDF file bytes using pdfplumber.
    """
    if not file_bytes:
        raise ValueError("Uploaded PDF file is empty.")

    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text_pages = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_pages.append(page_text)

            raw_text = "\n".join(text_pages).strip()
            if not raw_text:
                raise ValueError("No readable text found in the uploaded PDF file.")
            return raw_text
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Invalid or corrupted PDF file: {str(e)}")


def clean_and_parse_json(content: str) -> dict:
    """
    Safely parse JSON response from LLM, stripping backticks/markdown if present.
    """
    # Remove markdown code fences if LLM wrapped output
    cleaned = re.sub(r"^```(?:json)?\s*", "", content, flags=re.MULTILINE)
    cleaned = re.sub(r"\s*```$", "", cleaned, flags=re.MULTILINE).strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback regex to find substring between first { and last }
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
            except json.JSONDecodeError as err:
                raise ValueError(f"Failed to decode LLM response into valid JSON: {str(err)}")
        else:
            raise ValueError("LLM response did not contain a valid JSON object.")

    if not isinstance(data, dict):
        raise ValueError("Parsed JSON response is not a valid JSON object.")

    # Ensure expected keys are present with fallbacks
    return {
        "name": data.get("name"),
        "skills": data.get("skills") if isinstance(data.get("skills"), list) else [],
        "years_of_experience": data.get("years_of_experience", 0),
        "projects": data.get("projects") if isinstance(data.get("projects"), list) else []
    }


def parse_resume_with_llm(raw_text: str) -> dict:
    """
    Send extracted raw text to Groq API using openai/gpt-oss-120b model
    and return structured JSON resume data.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing or empty.")

    client = Groq(api_key=api_key)

    prompt = f"""You are an expert HR and resume parser. Analyze the following resume raw text and extract structured information.

Return ONLY a valid JSON object with the following fields:
- "name": candidate full name (string or null)
- "skills": array of strings (e.g. ["Python", "FastAPI"])
- "years_of_experience": estimated total years of experience as a number (integer or float)
- "projects": array of objects, where each object has:
  - "name": project name (string)
  - "description": brief summary (string)
  - "tech_stack": array of strings (e.g. ["React", "PostgreSQL"])

Resume Raw Text:
{raw_text}
"""

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise data extractor that returns strictly valid JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.1,
            response_format={"type": "json_object"}
        )

        content = response.choices[0].message.content.strip()
    except Exception as e:
        raise RuntimeError(f"Groq API error during resume parsing: {str(e)}")

    return clean_and_parse_json(content)
