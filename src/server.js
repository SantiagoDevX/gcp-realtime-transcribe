const express = require("express");
const http = require("http");
const path = require("path");
const socketIo = require("socket.io");
const { SpeechClient } = require("@google-cloud/speech");
const colors = require("colors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "❌ ERROR: No se encontró la variable GOOGLE_APPLICATION_CREDENTIALS.".red
  );
  process.exit(1);
}

// Configurar Google Cloud Speech-to-Text
const speechClient = new SpeechClient();
const requestConfig = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 44100,
    languageCode: "es-ES",
    interimResults: true,
  },
  interimResults: true,
};

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("Nuevo Usuario Conectado".blue);
  let recognizeStream = null;

  socket.on("startTranscription", () => {
    console.log("Iniciando transcripción...".green);
    recognizeStream = speechClient
      .streamingRecognize(requestConfig)
      .on("error", (err) => console.error("Google Speech Error:".red, err))
      .on("data", (data) => {
        if (data.results[0] && data.results[0].alternatives[0]) {
          const transcript = data.results[0].alternatives[0].transcript;
          const isFinal = data.results[0].isFinal;
          console.log("Transcripción:".cyan, transcript);
          socket.emit("transcription", { text: transcript, isFinal });
        }
      });
  });

  socket.on("audioData", (data) => {
    if (recognizeStream && !recognizeStream.destroyed) {
      recognizeStream.write(data);
    } else {
      console.warn("Intento de escribir en un stream cerrado.".red);
    }
  });
  socket.on("stopTranscription", () => {
    console.log("Transcripción detenida".red);
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.destroy(); // Liberamos los recursos
      recognizeStream = null; // Asignamos a null para evitar que se use más
      console.log("Stream cerrado correctamente.".green);
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado".yellow);
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.destroy();
      recognizeStream = null; // Liberar memoria
      console.log("Stream cerrado correctamente.".green);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Servidor en http://localhost:${PORT}`.bgGreen.bold)
);
