# Configuración de Neon Tech (PostgreSQL)

## Pasos para configurar tu base de datos Neon Tech

### 1. Crear una cuenta en Neon Tech
- Ve a [https://neon.tech](https://neon.tech)
- Regístrate y crea una nueva base de datos
- Copia la cadena de conexión de tu base de datos

### 2. Configurar las variables de entorno
En tu archivo `.env`, reemplaza la URL de ejemplo con tu URL de Neon Tech:

```env
# Reemplaza esta URL con tu URL de Neon Tech
# Formato: postgresql://username:password@host:5432/database?sslmode=require
DATABASE_URL=postgresql://tu-usuario:tu-password@tu-host.neon.tech:5432/tu-base-de-datos?sslmode=require
JWT_SECRET=your-secret-key-change-this-in-production
```

### 3. Instalar dependencias
Asegúrate de tener instalado el paquete de PostgreSQL:
```bash
npm install pg
```

### 4. Generar el cliente de Prisma
```bash
npx prisma generate
```

### 5. Sincronizar la base de datos
```bash
npx prisma db push
```

### 6. (Opcional) Crear un seed inicial
Si quieres poblar tu base de datos con datos iniciales:
```bash
npm run db:seed
```

## Notas importantes

- Neon Tech requiere conexión SSL, por eso se incluye `sslmode=require` en la URL
- El esquema actual es compatible con PostgreSQL sin cambios mayores
- Asegúrate de que tu cuenta de Neon Tech tenga los permisos necesarios
- La conexión puede tardar unos segundos la primera vez debido a la naturaleza serverless de Neon

## Troubleshooting

Si encuentras errores de conexión:
1. Verifica que tu URL de Neon Tech sea correcta
2. Asegúrate de que tu proyecto de Neon Tech esté activo
3. Revisa los permisos de tu usuario en Neon Tech
4. Confirma que la cadena de conexión incluya `sslmode=require`