// Variables
const socket = io();
let isRecording = false;
let stream = null;
let audioInput;
let audioContext;
let processor;
let timerInterval;
let timerSeconds = 0;
let currentTranscript = "";
let lastFinalIndex = 0;

// Botones
const recordButton = document.getElementById("record-button");
const buttonCopy = document.getElementById("copy-button");
const buttonClear = document.getElementById("clear-button");

// Monitor
const transcriptElement = document.getElementById("transcript");
const timer = document.querySelector(".timer");

// Funciones
const updateStatus = () => {
  if (!isRecording) {
    recordButton.classList.add("recording");
  } else {
    recordButton.classList.remove("recording");
  }
  isRecording = !isRecording;
};

const startRecording = async () => {
  if (isRecording) return stopRecording();
  console.log("Start Button clicked");
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    audioContext = new AudioContext();
    audioInput = audioContext.createMediaStreamSource(stream);
    processor = audioContext.createScriptProcessor(1024, 1, 1);
    audioInput.connect(processor);
    processor.connect(audioContext.destination);
    processor.onaudioprocess = (e) => {
      const float32Array = e.inputBuffer.getChannelData(0);
      const int16Array = new Int16Array(float32Array.length);
      for (let i = 0; i < float32Array.length; i++) {
        int16Array[i] = Math.max(
          -32768,
          Math.min(32767, Math.floor(float32Array[i] * 32768))
        );
      }
      console.log(
        "Sending audio chunk to server, size:",
        int16Array.buffer.byteLength
      );
      socket.emit("audioData", int16Array.buffer);
    };
    startTimer();
    socket.emit("startTranscription");
    console.log("startTranscription event emitted");
    updateStatus();
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "TypeError") {
      alert(
        "Se ha denegado el acceso al micrófono. Por favor, habilítalo manualmente en la configuración de tu navegador."
      );
    } else if (err.name === "NotFoundError") {
      alert(
        "No se encontró ningún micrófono. Asegúrate de que esté conectado."
      );
    } else {
      alert("Error desconocido al intentar acceder al micrófono.");
    }
    // transcriptElement.innerText = err.message;
    console.error(new Error("No se pudo acceder al microfono ", err.message));
  }
};

const stopRecording = () => {
  console.log("Stop button clicked");
  if (processor) {
    processor.disconnect();
    processor.onaudioprocess = null;
  }
  if (audioInput) {
    audioInput.disconnect();
  }
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    console.log("Grabación detenida.");
  }
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }

  socket.emit("stopTranscription");
  console.log("evento stopTranscription emitido");
  localStorage.clear("lastTranscript");
  stopTimer();
  updateStatus();
};

const startTimer = () => {
  timerInterval = setInterval(() => {
    const date = new Date(timerSeconds * 1000);
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    timer.innerText = `${minutes}:${seconds}`;
    timerSeconds++;
  }, 1000);
};

const restartTimer = () => {
  timerSeconds = 0;
  timer.innerText = "00:00";
};

const stopTimer = () => {
  clearInterval(timerInterval);
};

// Eventos
socket.on("transcription", (data) => {
  console.log("transcripción", data);
  if (data.isFinal) {
    currentTranscript += data.text + " ";
    lastFinalIndex = currentTranscript.length;
  } else {
    const partialTranscript = currentTranscript + data.text;
    transcriptElement.textContent = partialTranscript;
  }

  // Mostramos la transcripción completa cuando es final
  if (data.isFinal) {
    transcriptElement.textContent = currentTranscript;
    localStorage.setItem("lastTranscript", currentTranscript);
  }
});

socket.on("error", (errorMessage) => {
  console.error("Server error:", errorMessage);
  transcript.innerHTML +=
    '\n<span class="error">Error: ' + errorMessage + "<span/>";
});

socket.on("connect_error", (err) => {
  console.error("Error de conexión: ", err.message);
  alert("No se puede conectar con el servidor.");
});

recordButton.addEventListener("click", () => {
  startRecording();
});

buttonCopy.addEventListener("click", () => {
  navigator.clipboard.writeText(transcript.innerText);
});

buttonClear.addEventListener("click", () => {
  transcript.innerText = "";
  restartTimer();
  localStorage.clear("lastTranscript");
});

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("lastTranscript")) {
    transcriptElement.innerText = localStorage.getItem("lastTranscript");
  }
});
