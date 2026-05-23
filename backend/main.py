import os
import whisper
import subprocess

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

print("Loading Whisper model...")

model = whisper.load_model("small")

print("Whisper model loaded")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {
        "message": "Backend is working"
    }

@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...)
):

    try:

        webm_path = f"temp_{file.filename}"

        wav_path = "converted.wav"

        with open(webm_path, "wb") as buffer:

            buffer.write(await file.read())

        print("Audio saved")

        subprocess.run([
            "ffmpeg",
            "-i",
            webm_path,
            wav_path,
            "-y"
        ])

        print("Audio converted")

        result = model.transcribe(wav_path)

        print("TRANSCRIPT:", result["text"])

        os.remove(webm_path)
        os.remove(wav_path)

        return {
            "transcript": result["text"]
        }

    except Exception as e:

        print("ERROR:", str(e))

        return {
            "error": str(e)
        }