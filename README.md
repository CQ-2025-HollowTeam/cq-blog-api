<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# BLOG API
API desarrollada con NestJS utilizando Prisma como ORM y soporte para autenticación con Discord.

1. Clonar proyecto
2. `npm install`
3. Clonar el archivo `.env.template` y renombrarlo a `.env`
4. Cambiar las variables de entorno:
```
# Define el entorno en el que se ejecuta la aplicación
NODE_ENV

# El puerto en el que se ejeuctará el servidor
PORT

# URL de conexión a la base de datos. El formato será el siguiente (MySQL):
mysql://DATABASE_UL=<usuario>:<contraseña>@<host>:<puerto>/<nombre_base_de_datos>

# Clave secreta utilizada para firmar y verificar los tokens JWT
JWT_SECRET

# Tiempo de expiración de los tokens JWT
JWT_EXPIRES_IN

# Habilita o deshabilita el inicio de sesión con Discord.
ENABLE_DISCORD_LOGIN

# ID del cliente proporcionado por Discord al registrar tu aplicación
DISCORD_CLIENT_ID

# Clave secreta proporcionada por Discord al registrar tu aplicación
DISCORD_CLIENT_SECRET

# URL de redirección configurada en Discord para manejar el flujo de autenticación.
DISCORD_CALLBACK_URL="https://myapp.com/api/auth/discord/callback"
```
5. Lanzar el comando de migración de la base de datos:

```
npx prisma migrate dev
```
6. Lanzar el comando de ejeución del script de semillas:

```
npx prisma db seed
```
7. Levantar:

```
nest start --watch

```