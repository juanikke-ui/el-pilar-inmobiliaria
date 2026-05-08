# Integración Idealista /tools por FTP

Esta versión incluye una API interna de Vercel en `api/listings.js`.

La web llama a:

```txt
/api/listings
```

y esa función lee el XML diario de Idealista desde el FTP, transforma los anuncios y los muestra dentro de la sección **Propiedades**.

## Variables de entorno en Vercel

En Vercel → Project → Settings → Environment Variables deben existir estas variables:

```txt
IDEALISTA_FTP_HOST=ftp.habitania.com
IDEALISTA_FTP_USER=es83012081
IDEALISTA_FTP_PASSWORD=********
IDEALISTA_FTP_FILE=cilc46aca4afa26e9f1161f1bcda2b0d526c4ec2c99.xml
```

Activa las variables para **Production and Preview** y marca la contraseña como **Sensitive**.

Después de cambiarlas, pulsa **Redeploy**.

## Qué se muestra

La integración muestra automáticamente:

- foto principal,
- precio,
- tipo de operación,
- zona,
- habitaciones,
- baños,
- metros,
- extracto de descripción en español,
- botón “Ver ficha”.

## Seguridad

No subas nunca la contraseña FTP al código ni a GitHub. Solo debe estar en Environment Variables de Vercel.
