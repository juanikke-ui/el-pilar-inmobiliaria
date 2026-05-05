# Publicar Inmobiliaria El Pilar en Vercel

## 1. Subir proyecto a Vercel
1. Entra en https://vercel.com
2. Crea cuenta o inicia sesión.
3. Pulsa “Add New Project”.
4. Sube esta carpeta o conecta un repositorio GitHub con estos archivos.
5. Vercel detectará Vite automáticamente.
6. Pulsa “Deploy”.

Configuración esperada:
- Framework Preset: Vite
- Build Command: npm run build
- Output Directory: dist

## 2. Conectar dominio inmobiliariaelpilar.com
En Vercel:
1. Abre el proyecto.
2. Settings > Domains.
3. Añade:
   - inmobiliariaelpilar.com
   - www.inmobiliariaelpilar.com

En Arsys, zona DNS:
- Registro A:
  - Nombre: @
  - Valor: 76.76.21.21
- Registro CNAME:
  - Nombre: www
  - Valor: cname.vercel-dns.com

## 3. Enlaces ya incluidos
- WhatsApp: 665 56 90 57
- Idealista: https://www.idealista.com/pro/inmobiliaria-el-pilar/
- Facebook: https://www.facebook.com/Inmobiliariaelpilar
- Citas Google Calendar: https://calendar.app.google/otXJiiL9zJe5h1ut7

## 4. Pendientes recomendados
- Sustituir imágenes genéricas por fotos reales.
- Añadir política de privacidad y aviso legal.
- Configurar Google Analytics real.
- Preparar integración automática de Idealista mediante feed/exportación si está disponible.
