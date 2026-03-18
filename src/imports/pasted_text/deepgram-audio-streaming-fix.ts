You are a senior real-time audio streaming engineer.

The current Deepgram streaming transcription system is broken.

The UI shows "No speech detected" and the system does not capture or transcribe the user's speech.

Your task is to FIX the audio streaming pipeline so that the microphone audio is correctly sent to Deepgram and real-time transcription works reliably.

IMPORTANT CONTEXT

The application already captures the microphone and attempts to stream audio to the Deepgram WebSocket.

However the audio stream is not reaching Deepgram correctly.

GOAL

When the user speaks, the system must:

1. capture microphone audio
2. stream audio continuously to Deepgram
3. receive partial transcripts
4. display the text live in the input field

FIX THE AUDIO PIPELINE

Follow this correct architecture.

MICROPHONE CAPTURE

Use:

navigator.mediaDevices.getUserMedia({ audio: true })

Create an AudioContext.

Create a MediaStreamSource from the microphone stream.

Use a ScriptProcessorNode or AudioWorklet to extract raw audio data.

Convert the Float32 audio samples to 16-bit PCM.

STREAMING FORMAT

Deepgram expects:

Linear16 PCM audio
Sample rate: 16000 Hz

So resample the microphone audio to 16kHz before sending.

WEBSOCKET CONNECTION

Connect to:

wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&interim_results=true

Headers must include:

Authorization: Token YOUR_DEEPGRAM_API_KEY

STREAM AUDIO

Send the processed PCM audio chunks continuously to the WebSocket while the user is speaking.

Do NOT wait until recording ends.

TRANSCRIPTION HANDLING

Listen for WebSocket messages.

Extract the transcript from:

channel.alternatives[0].transcript

If the transcript is not empty:

update the input field immediately.

REAL-TIME BEHAVIOR

The transcription must update progressively while the user is speaking.

Example:

User says:
"Hello how are you"

Display:

Hello
Hello how
Hello how are
Hello how are you

END OF SPEECH

When the user stops speaking:

finalize the transcript and keep it in the text input.

The user can then press SEND.

SEND FLOW

When SEND is clicked:

send the text message to the tutor AI and generate the spoken response using ElevenLabs.

ERROR HANDLING

Prevent these issues:

"No speech detected"
Empty transcripts
WebSocket disconnect

If audio energy is detected but transcript is empty, continue streaming instead of stopping early.

FINAL RESULT

The microphone must capture speech correctly, stream audio to Deepgram, and display live transcription while the user speaks.
