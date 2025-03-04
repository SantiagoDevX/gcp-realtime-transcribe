import express from "express";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import { config } from "./config.js";
import { SpeechClient } from "@google-cloud/speech";
import colors from "colors";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set("port", config.app.port);

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (!config.app.path_credentials) {
  console.error(
    "❌ ERROR: No se encontró la variable GOOGLE_APPLICATION_CREDENTIALS.".red
  );
}

// Configurar Google Cloud Speech-to-Text
const speechClient = new SpeechClient();
const requestConfig = config.requestConfig;

let recognizeStream = null;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

io.on("connection", (socket) => {
  console.log("Nuevo Usuario Conectado".blue);

  socket.on("startTranscription", () => {
    console.log("Iniciando transcripción...".green);
    recognizeStream = speechClient
      .streamingRecognize(requestConfig)
      .on("error", (err) =>
        console.error("Google Speech Error:".bgRed, err.message)
      )
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
    if (recognizeStream && !recognizeStream.destroyed) {
      console.log("Transcripción detenida".red);
      stopTranscription();
    }
  });

  socket.on("disconnect", () => {
    console.log("Usuario desconectado".yellow);
    if (recognizeStream) {
      stopTranscription();
    }
  });
});

const stopTranscription = () => {
  recognizeStream.end();
  recognizeStream.destroy(); // Liberamos los recursos
  recognizeStream = null; // Asignamos a null para evitar que se use más
  console.log("Stream cerrado correctamente.".green);
};

server.listen(app.get("port"), () =>
  console.log(`Servidor en http://localhost:${app.get("port")}`.bgGreen.bold)
);
