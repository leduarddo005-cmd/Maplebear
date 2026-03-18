You are a senior real-time voice interface engineer.

Upgrade the current speech transcription system to support REAL-TIME transcription while the user is speaking.

The current system only transcribes after the recording stops.
This must be changed to streaming transcription so the text appears live while the user speaks.

GOAL

As the user speaks, the recognized text must appear progressively in the chat input field in real time.

Example:

User says:
"Hello how are you today"

The screen should update like this while speaking:

Hello
Hello how
Hello how are
Hello how are you
Hello how are you today

IMPLEMENTATION REQUIREMENTS

Use Deepgram real-time streaming API instead of the previous upload transcription.

Use a WebSocket connection to Deepgram.

Connection endpoint:

wss://api.deepgram.com/v1/listen

Headers must include:

Authorization: Token YOUR_DEEPGRAM_API_KEY

STREAMING FLOW

1. Request microphone access using navigator.mediaDevices.getUserMedia({ audio: true })

2. Create an audio stream using MediaRecorder or AudioWorklet.

3. Send audio chunks continuously to the Deepgram WebSocket connection.

4. Listen for transcription messages returned by Deepgram.

5. Extract the partial transcription from:

channel.alternatives[0].transcript

6. Update the chat input field with the current partial transcript.

REAL-TIME UI BEHAVIOR

While the user is speaking:

* show the partial transcription live
* continuously update the text field

When speech ends:

* finalize the transcript
* keep the final sentence in the input field

The user can then press SEND to send the message to the tutor.

CHAT FLOW

User speaks → text appears live → user presses SEND → tutor responds → ElevenLabs generates voice response.

IMPORTANT

Do NOT wait for the recording to stop before transcribing.

The transcription must update continuously as speech is detected.

DEVICE COMPATIBILITY

Ensure the streaming transcription works on:

Chrome desktop
Safari
Android browsers
iPhone browsers

ERROR HANDLING

Handle these situations:

* connection lost
* microphone permission denied
* no speech detected
* WebSocket disconnect

Reconnect automatically if the connection drops.

FINAL RESULT

When the user presses the microphone button and begins speaking, the recognized text should appear immediately and update live on screen while they talk, creating a natural real-time conversation experience.
