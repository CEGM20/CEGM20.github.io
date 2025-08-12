# CEGM - Webtoon/Manhwa Reading Platform

## 🚀 Despliegue en Vercel

### Prerrequisitos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Neon Tech](https://neon.tech) (PostgreSQL)
- Repositorio en GitHub

### 1. Configuración de Variables de Entorno en Vercel

En tu dashboard de Vercel, ve a la configuración de tu proyecto y añade las siguientes variables de entorno:

#### Variables Requeridas

```bash
# Base de Datos (Neon Tech)
DATABASE_URL=postgresql://tu-usuario:tu-password@tu-host.neon.tech:5432/tu-base-de-datos?sslmode=require

# Seguridad
JWT_SECRET=un-segredo-muy-seguro-y-unico
NEXTAUTH_SECRET=otro-segredo-muy-seguro-y-unico
NEXTAUTH_URL=https://tu-app.vercel.app

# Configuración de la Aplicación
NEXT_PUBLIC_APP_URL=https://tu-app.vercel.app
NODE_ENV=production

# Socket.IO
SOCKET_IO_PATH=/api/socketio

# Uploads (recomendado usar un servicio externo)
UPLOAD_PROVIDER=vercel # o cloudinary, s3
```

#### Variables Opcionales (según proveedor de uploads)

**Para Vercel Blob:**
```bash
VERCEL_BLOB_TOKEN=tu-token-de-vercel-blob
```

**Para Cloudinary:**
```bash
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

**Para AWS S3:**
```bash
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_REGION=tu-region
AWS_S3_BUCKET=tu-bucket-name
```

### 2. Configuración de Build Command en Vercel

En la configuración de tu proyecto en Vercel:

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Pasos para el Despliegue

#### Opción A: Conectando tu repositorio de GitHub

1. **Conecta tu repositorio** a Vercel
2. **Configura las variables de entorno** como se indicó arriba
3. **Despliega automáticamente** al hacer push a la rama principal

#### Opción B: Despliegue Manual

1. **Haz push de tus cambios** a GitHub
2. **Importa tu proyecto** en Vercel
3. **Configura las variables de entorno**
4. **Inicia el despliegue**

### 4. Configuración Post-Despliegue

#### Base de Datos

Después del despliegue, necesitas sincronizar tu base de datos:

1. **Genera el cliente Prisma**:
   ```bash
   npx prisma generate
   ```

2. **Sincroniza el esquema**:
   ```bash
   npx prisma db push
   ```

3. **(Opcional) Pobla la base de datos**:
   ```bash
   npm run db:seed
   ```

#### Verificación

1. **Accede a tu aplicación** en la URL proporcionada por Vercel
2. **Verifica que todas las rutas funcionen** correctamente
3. **Prueba el panel de administración** con tus credenciales
4. **Verifica la carga de imágenes** y el funcionamiento de Socket.IO

### 5. Solución de Problemas Comunes

#### Problema: Error de conexión a la base de datos
**Solución**: Verifica que tu `DATABASE_URL` sea correcta y que tu base de datos Neon Tech esté activa.

#### Problema: Las imágenes no se cargan
**Solución**: En Vercel, el sistema de archivos es temporal. Configura un proveedor de uploads externo como Vercel Blob, Cloudinary o AWS S3.

#### Problema: Socket.IO no funciona
**Solución**: Vercel no soporta WebSockets en el plan gratuito. Considera usar un servicio externo o deshabilitar Socket.IO.

#### Problema: Build falla
**Solución**: Verifica los logs de build en Vercel. Asegúrate de que todas las dependencias estén correctamente instaladas.

### 6. Optimizaciones Recomendadas

#### Para Producción

1. **Habilita la compresión** (ya configurada en next.config.ts)
2. **Configura un CDN** para imágenes estáticas
3. **Monitorea el rendimiento** con Vercel Analytics
4. **Configura backups automáticos** de tu base de datos

#### Seguridad

1. **Usa HTTPS** (Vercel lo proporciona por defecto)
2. **Configura CORS** adecuadamente
3. **Usa variables de entorno** para datos sensibles
4. **Mantén tus dependencias** actualizadas

### 7. Dominio Personalizado

1. **Configura tu dominio** en la configuración de Vercel
2. **Actualiza las variables de entorno**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://tu-dominio.com
   NEXTAUTH_URL=https://tu-dominio.com
   ```
3. **Configura SSL** (Vercel lo maneja automáticamente)

### 8. Monitoreo y Mantenimiento

- **Vercel Analytics**: Para monitorear el rendimiento
- **Vercel Logs**: Para depurar errores
- **Neon Tech Console**: Para monitorear la base de datos
- **GitHub Actions**: Para automatizar despliegues y tests

---

## 📝 Notas Importantes

- **Socket.IO**: En el plan gratuito de Vercel, los WebSockets tienen limitaciones. Considera alternativas para producción.
- **Uploads de archivos**: Vercel tiene un sistema de archivos temporal, por lo que se recomienda usar servicios externos para almacenamiento permanente.
- **Base de datos**: Neon Tech es una excelente opción para PostgreSQL serverless, pero asegúrate de configurar correctamente la conexión SSL.
- **Variables de entorno**: Nunca subas tu archivo `.env` a GitHub. Usa la configuración de Vercel para gestionarlas.

## 🆘 Soporte

Si encuentras problemas durante el despliegue:
1. Revisa los logs de Vercel
2. Verifica la configuración de variables de entorno
3. Consulta la documentación oficial de [Vercel](https://vercel.com/docs)
4. Revisa la documentación de [Neon Tech](https://neon.tech/docs)