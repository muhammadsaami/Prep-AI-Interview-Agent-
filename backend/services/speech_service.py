import os
import requests


ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"


def synthesize_speech(text: str) -> bytes:
    """
    Converts text to speech audio bytes using the ElevenLabs API.
    Returns raw MP3 audio bytes, or raises an exception on failure.
    """
    api_key = os.getenv("ELEVENLABS_API_KEY")
    voice_id = os.getenv("ELEVENLABS_VOICE_ID")

    if not api_key or not voice_id:
        raise ValueError("ELEVENLABS_API_KEY or ELEVENLABS_VOICE_ID is missing in .env")

    url = f"{ELEVENLABS_API_URL}/{voice_id}"

    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg",
    }

    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
        },
    }

    response = requests.post(url, json=payload, headers=headers, timeout=30)

    if response.status_code != 200:
        raise RuntimeError(
            f"ElevenLabs TTS failed with status {response.status_code}: {response.text}"
        )

    return response.content  # raw MP3 bytes