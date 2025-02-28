# Configuración y ejecución del proyecto Speech to Text

Este proyecto permite la transmisión en tiempo real de audio y su transcripción automática utilizando Google Cloud Platform y tecnología de reconocimiento de voz. A través de una aplicación web, los usuarios pueden enviar audio en vivo que se procesa y transcribe en tiempo real para su análisis o uso posterior.

**Es necesario tener una versión de Node.js 20 o superior.**

Para poner en marcha este proyecto, es necesario ejecutar los siguientes comandos en la terminal:

## 1. Instalar dependencias

Asegúrate de tener instaladas todas las dependencias necesarias ejecutando:

```bash
npm install  # Para instalar paquetes en Node.js
```

## 2. Configuración del entorno

Para que el proyecto funcione correctamente, es necesario configurar el entorno siguiendo estos pasos:

### 2.1. Configurar credenciales de GCP y puerto del servidor

Asegúrate de que las credenciales de Google Cloud Platform (GCP) estén correctamente configuradas. Para ello:

1. Accede a la consola de GCP y genera una clave de autenticación en formato JSON.
2. Guarda el archivo en `src/config/credentials/`.
3. Define la variable de entorno en el archivo `.env` (quitar extension ".template") para que el sistema lo detecte:

```bash
GOOGLE_APPLICATION_CREDENTIALS="./src/config/credentials/nombre-de-su-archivo.json"
PORT=3000 # define el puerto del servidor
```

# 3. Poner en ejecución el proyecto

Una vez completada la configuración, puedes iniciar el proyecto según el entorno en el que vayas a trabajar.

## En producción

Para ejecutar el proyecto completo (frontend y backend) en modo producción, utiliza el siguiente comando:

```bash
npm start
```

### En desarrollo

Si deseas ejecutar el proyecto en modo desarrollo, utiliza:

```bash
npm run dev
```

# 4. Funcionalidad y uso

1. **Empezar a transcribir**:  
   Haga clic en el botón con el ícono de micrófono y otorgue permisos para usar el micrófono. Verá cómo todo lo que dice se transcribe en tiempo real.

2. **Terminar transcripción**:  
   Una vez iniciada la transcripción y si desea detenerla, haga clic nuevamente en el botón. Esto terminará la grabación de audio y detendrá la transcripción.

3. **Si necesita copiar lo transcrito**:  
   Si desea copiar el texto transcrito, haga clic en el botón de la izquierda con el ícono de copiar. Esto copiará todo el contenido transcrito al portapapeles.

4. **Si necesita limpiar la transcripción**:  
   Si desea borrar todo el texto transcrito y empezar de nuevo, haga clic en el botón con el ícono de "limpiar" o "borrar". Esto eliminará la transcripción actual de la pantalla.

---

Con estas opciones, podrá controlar fácilmente el proceso de transcripción, copiar el texto generado y limpiarlo cuando sea necesario.
