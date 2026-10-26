# Probar Quokka en una laptop Debian

Esta prueba usa `compose.laptop.yml` y una base de datos propia. El `docker-compose.yml` existente y las variables de Vercel, Render y Neon no participan.

## 1. Preparar Debian

Instalá Docker Engine y el plugin Docker Compose siguiendo la [guía oficial para Debian](https://docs.docker.com/engine/install/debian/). No hace falta Docker Desktop. La primera construcción necesita acceso a npm y Google Fonts, porque Next.js descarga las fuentes durante `next build`.

Cloná el repositorio en la laptop y, desde la carpeta `Quokka` que contiene `compose.laptop.yml`, creá el archivo local de variables:

```bash
cp .env.laptop.example .env.laptop
openssl rand -hex 32
openssl rand -hex 32
```

Pegá cada valor generado en `POSTGRES_PASSWORD` y `JWT_SECRET` respectivamente. `.env.laptop` está ignorado por Git. La base de datos de esta prueba empieza vacía; no conectes `DATABASE_URL` de Neon ni copies los secretos de producción.

## 2. Levantar y comprobar localmente

```bash
docker compose -f compose.laptop.yml --env-file .env.laptop up -d --build
docker compose -f compose.laptop.yml --env-file .env.laptop ps
curl http://localhost:8080/api/status
```

Abrí `http://localhost:8080` en la laptop. Si querés probar desde otro equipo en la misma red, usá el túnel temporal del paso siguiente; el puerto 8080 solo escucha en `127.0.0.1`.

La compilación de Next.js puede ser lo que más memoria consuma. Si falla en la laptop por falta de RAM, se puede construir la imagen en otra máquina de la misma arquitectura y transferirla; eso no implica que la aplicación no pueda funcionar una vez iniciada. Para observar el uso durante la prueba:

```bash
docker stats
free -h
```

## 3. Probar desde Internet sin comprar un dominio

```bash
docker compose -f compose.laptop.yml --env-file .env.laptop --profile tunnel up -d
docker compose -f compose.laptop.yml --env-file .env.laptop logs -f tunnel
```

Buscá en los registros la URL `https://…trycloudflare.com` y abrila desde el celular con datos móviles. El enlace es público y cambia al reiniciar el túnel. Cloudflare indica que los [Quick Tunnels son para pruebas](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/), no para uso estable. El registro y el panel de la aplicación estarán expuestos a quien conozca esa URL. El inicio de sesión con Google requiere registrar ese origen en Google Cloud; con una URL temporal cambiante es mejor probar primero las demás funciones.

## 4. Apagar la prueba

```bash
docker compose -f compose.laptop.yml --env-file .env.laptop --profile tunnel down
```

El volumen de PostgreSQL queda guardado para la próxima prueba. No agregues `-v` al comando si querés conservar esos datos. El despliegue existente en Vercel, Render y Neon no cambia.

## Si algo falla

```bash
docker compose -f compose.laptop.yml --env-file .env.laptop ps
docker compose -f compose.laptop.yml --env-file .env.laptop logs --tail=100 backend frontend db proxy
```

Si `curl /api/status` responde con error, revisá los registros de `db` y `backend`. Si la portada carga pero el formulario o el panel fallan, comprobá que el navegador esté llamando a `/api/...` en el mismo host que la página. Los correos no llegarán a una bandeja real hasta configurar SMTP en `.env.laptop`.
