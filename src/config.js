export const config = {
  app: {
    port: process.env.PORT || 8080,
    path_credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS || "",
  },
  requestConfig: {
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: 44100,
      languageCode: "es-ES",
    },
    interimResults: true,
  },
};
