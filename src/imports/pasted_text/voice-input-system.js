You are a senior JavaScript engineer specialized in voice interfaces.

Your task is to FIX and REBUILD the voice input system of this English tutor application.

The current implementation enters a "listening" state but does not capture or transcribe the user's speech correctly. This must be corrected completely.

GOAL

The user must be able to:

1. Press the microphone button
2. Speak normally
3. Stop recording
4. See the transcribed text appear in the message input field
5. Click "Send"
6. Receive the tutor response
7. Hear the response spoken using ElevenLabs

VOICE SYSTEM REQUIREMENTS

The voice system MUST use this architecture:

Microphone → MediaRecorder → Audio Blob → Deepgram API → Transcription → Insert text into chat input

Do NOT use:

* SpeechRecognition
* webkitSpeechRecognition
* Web Speech API

Use MediaRecorder only.

MICROPHONE CAPTURE

Use navigator.mediaDevices.getUserMedia({ audio: true })

When the user presses the microphone button:

start recording audio using MediaRecorder.

Store audio chunks during recording.

Example structure:

let chunks = []

recorder.ondataavailable = event => {
chunks.push(event.data)
}

When the user stops recording:

combine chunks into a Blob.

Example:

const audioBlob = new Blob(chunks, { type: "audio/webm" })

Then immediately send the blob to the Deepgram transcription API.

DEEPGRAM TRANSCRIPTION

Send the audio blob to:

https://api.deepgram.com/v1/listen

Headers must include:

Authorization: Token YOUR_DEEPGRAM_API_KEY
Content-Type: audio/webm

Body must be the audio blob.

Wait for the response JSON and extract the transcription text from:

results.channels[0].alternatives[0].transcript

When the transcription is received:

automatically insert the text into the message input field.

Example result:

User says:
"How do I say good morning in English?"

The text input should now contain that exact sentence.

CHAT MESSAGE FLOW

The user can now edit the text if needed.

When the user clicks SEND:

Send the message to the tutor AI.

Receive the AI response text.

VOICE RESPONSE

Send the AI response text to ElevenLabs API to generate speech.

Play the returned audio automatically.

The tutor should speak the answer out loud.

ERROR HANDLING

Handle these cases gracefully:

* microphone permission denied
* no audio recorded
* Deepgram transcription error
* network delay

Display helpful UI states such as:

Listening...
Processing speech...
Transcribing...
Tutor responding...

MULTIPLE RECORDINGS

The user must be able to record multiple voice messages without refreshing the page.

After each recording:

* clear previous chunks
* reinitialize MediaRecorder
* prepare for the next recording

Avoid the common bug where only the first recording works.

DEVICE COMPATIBILITY

The voice system must work on:

Chrome desktop
Safari
Android browsers
iPhone browsers

Use both mouse and touch events for the microphone button:

mousedown
mouseup
touchstart
touchend

FINAL RESULT

The user presses the microphone button, speaks naturally, sees the transcribed text appear in the chat input, clicks send, and receives a spoken response from the tutor.

The system must be stable and work consistently across all devices.
