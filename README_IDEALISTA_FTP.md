# Integración Idealista /tools FTP

La web incorpora una función serverless en `api/listings.js` que lee cada día el fichero XML/JSON de Idealista desde FTP y lo muestra en la sección Propiedades.

## Variables que debes configurar en Vercel

En Vercel entra en:

`Project > Settings > Environment Variables`

Añade:

- `IDEALISTA_FTP_HOST`: `ftp.habitania.com`
- `IDEALISTA_FTP_USER`: usuario FTP facilitado por Idealista
- `IDEALISTA_FTP_PASSWORD`: contraseña FTP facilitada por Idealista
- `IDEALISTA_FTP_FILE`: ruta/nombre del fichero XML o JSON. Puede dejarse vacío si el FTP solo contiene un fichero XML/JSON.

Después pulsa `Redeploy`.

## Seguridad

No escribas la contraseña FTP en el código ni en GitHub. Debe estar solo en las variables de entorno de Vercel.

## Cómo funciona

- La web llama a `/api/listings`.
- La función se conecta al FTP.
- Lee el XML/JSON.
- Normaliza título, precio, zona, características, imagen y enlace.
- Si el feed falla, la web muestra la cartera destacada de reserva.

## Cuando Idealista te confirme el nombre exacto del fichero

Ponlo en `IDEALISTA_FTP_FILE`, por ejemplo:

`inmobiliaria_el_pilar.xml`

ó

`anuncios.json`
