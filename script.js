const startBtn =
document.getElementById("start-btn");

const stopBtn =
document.getElementById("stop-btn");

const saveBtn =
document.getElementById("save-btn");

const output =
document.getElementById("output");

const statusDiv =
document.getElementById("status");

const languageSelect =
document.getElementById("language-select");

/* Variables */

let isRecording = false;

let finalTranscript = "";

let interimTranscript = "";

/* Demo Text */

let demoText =
"This is a demo transcript.";

/* Speech Recognition */

const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;

let recognition = null;

/* Initialize */

if (SpeechRecognition) {

    recognition =
    new SpeechRecognition();

    /* Settings */

    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.maxAlternatives = 3;

} else {

    alert(
        "Speech Recognition not supported."
    );
}

/* Start Recording */

startBtn.addEventListener(
    "click",
    async () => {

        try {

            isRecording = true;

            /* Clear Only Current */

            finalTranscript = "";

interimTranscript = "";

output.value = "";

            /* Language */

            recognition.lang =
            languageSelect.options[
                languageSelect.selectedIndex
            ].value;

            statusDiv.textContent =
            "🎙️ Listening...";

            startBtn.disabled = true;

            stopBtn.disabled = false;

            /* Microphone Permission */

            const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            stream.getTracks().forEach(track =>
                track.stop()
            );

            recognition.start();

        }

        catch (err) {

            console.error(err);

            useDemo();
        }
    }
);

/* Demo Mode */

function useDemo() {

    statusDiv.textContent =
    "📋 Demo Mode";

    let index = 0;

    const interval =
    setInterval(() => {

        if (
            !isRecording ||
            index >= demoText.length
        ) {

            clearInterval(interval);

            return;
        }

        output.value =
        demoText.substring(
            0,
            index + 1
        );

        index++;

    }, 30);
}

/* Stop Recording */

stopBtn.addEventListener(
    "click",
    () => {

        isRecording = false;

        recognition.stop();

        statusDiv.textContent =
        "⏹️ Recording Stopped";

        startBtn.disabled = false;

        stopBtn.disabled = true;
    }
);

/* Results */

if (recognition) {

    recognition.onresult =
    (event) => {

        interimTranscript = "";

        for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
        ) {

            let transcript =
            event.results[i][0]
            .transcript;

            /* Final */

            if (
                event.results[i]
                .isFinal
            ) {

                finalTranscript +=
                transcript + " ";
            }

            /* Interim */

            else {

                interimTranscript +=
                transcript;
            }
        }

        /* Show Combined */

        output.value =
        finalTranscript +
        interimTranscript;

        /* Auto Scroll */

        output.scrollTop =
        output.scrollHeight;

        statusDiv.textContent =
        "🎙️ Listening..."    
    };

    /* Errors */

    recognition.onerror =
    (event) => {

        console.log(event.error);

        statusDiv.textContent =
        "❌ " + event.error;
    };

    /* Auto Restart */

    recognition.onend = () => {

        if (isRecording) {

            recognition.start();

        } else {

            statusDiv.textContent =
            "✅ Recognition Complete";
        }
    };
}

/* Save Transcript */

saveBtn.addEventListener(
    "click",
    async () => {

        try {

            const text =
            output.value.trim();

            if (!text) {

                alert(
                    "Please record speech first!"
                );

                return;
            }

            statusDiv.textContent =
            "💾 Saving...";

            const response =
            await fetch(
                "http://localhost:5000/save",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                        "application/json"
                    },

                    body: JSON.stringify({
                        text
                    })
                }
            );

            const data =
            await response.json();

            if (response.ok) {

                statusDiv.textContent =
                "✅ Saved Successfully";

                alert(
                    "✅ " + data.message
                );

            } else {

                alert(
                    "❌ " + data.message
                );
            }

        }


        catch (error) {

            console.error(error);

            statusDiv.textContent =
            "❌ Save Failed";

            alert(
                "Backend server not running!"
            );
        }

    }
);


/* PDF Download Feature */

const pdfBtn =
document.getElementById("pdf-btn");

pdfBtn.addEventListener(
    "click",
    () => {

        if (!output.value.trim()) {

            alert(
                "Please record some speech first!"
            );

            return;
        }

        const element =
        document.createElement("div");

        element.style.padding =
        "20px";

        element.style.fontSize =
        "16px";

        element.style.fontFamily =
        "Arial, sans-serif";

        element.innerHTML =

        `<h2>Speech To Text Transcript</h2>
         <p>${output.value}</p>`;

        html2pdf()
        .set({
            margin: 10,
            filename: "Transcript.pdf",
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait"
            }
        })
        .from(element)
        .save();

        statusDiv.textContent =
        "📄 PDF Downloaded Successfully";
    }
);

const speakBtn =
document.getElementById("speak-btn");

speakBtn.addEventListener(
    "click",
    () => {

        const text =
        output.value.trim();

        if (!text) {

            alert(
                "No text available!"
            );

            return;
        }

        speechSynthesis.cancel();

        const speech =
        new SpeechSynthesisUtterance(
            text
        );

        speech.lang =
        languageSelect.value;

        speech.rate = 1;

        speech.pitch = 1;

        speech.volume = 1;

        speechSynthesis.speak(
            speech
        );

        statusDiv.textContent =
        "🔊 Speaking...";
    }
);



const stopSpeakBtn =
document.getElementById(
    "stop-speak-btn"
);

stopSpeakBtn.addEventListener(
    "click",
    () => {

        if (currentAudio) {

            currentAudio.pause();

            currentAudio.currentTime = 0;
        }

        statusDiv.textContent =
        "⏹ Voice Stopped";
    }
);

