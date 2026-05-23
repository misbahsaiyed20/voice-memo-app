'use client'

import { useRef, useState } from 'react'

export default function Recorder() {

  const [recording, setRecording] = useState(false)

  const [transcript, setTranscript] = useState('')

  const [loading, setLoading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {

    let stream

    try {

      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      })

    } catch (error) {

      alert('Microphone permission denied')

      return
    }

    const mediaRecorder = new MediaRecorder(stream)

    mediaRecorderRef.current = mediaRecorder

    audioChunksRef.current = []

    mediaRecorder.ondataavailable = (event) => {

      audioChunksRef.current.push(event.data)
    }

    mediaRecorder.onstop = async () => {

      setLoading(true)

      const audioBlob = new Blob(
        audioChunksRef.current,
        {
          type: 'audio/webm',
        }
      )

      const formData = new FormData()

      formData.append(
        'file',
        audioBlob,
        'recording.webm'
      )

      try {

        const response = await fetch(
          'http://127.0.0.1:8000/transcribe',
          {
            method: 'POST',
            body: formData,
          }
        )

        const data = await response.json()

        console.log('BACKEND RESPONSE:', data)

        setTranscript(data.transcript)

      } catch (error) {

        console.error(error)

        alert('Something went wrong')

      } finally {

        setLoading(false)
      }
    }

    mediaRecorder.start()

    setRecording(true)
  }

  const stopRecording = () => {

    mediaRecorderRef.current?.stop()

    setRecording(false)
  }

  return (

    <div className="flex flex-col items-center gap-6 w-full max-w-4xl">

      <div className="flex gap-6">

        <button
          onClick={startRecording}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl text-2xl"
        >
          Start Recording
        </button>

        <button
          onClick={stopRecording}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-2xl"
        >
          Stop Recording
        </button>

      </div>

      <p className="text-3xl">
        {recording ? 'Recording...' : 'Idle'}
      </p>

      {loading && (
        <p className="text-xl">
          Transcribing audio...
        </p>
      )}

      <div className="w-full border border-gray-700 rounded-2xl p-8">

        <h2 className="font-bold text-4xl mb-6">
          Transcript
        </h2>

        <p className="text-2xl whitespace-pre-wrap leading-relaxed">
          {transcript || 'No transcript yet'}
        </p>

      </div>

    </div>
  )
}