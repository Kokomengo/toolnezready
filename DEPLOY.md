# Publicar ToolNez en Vercel

El sitio genera HTML completo para 56 páginas de contenido. Las herramientas mantienen su procesamiento local.

## Configuración

- Framework: Other.
- Comando de compilación: `node build-seo.js`.
- Directorio de salida: `public`.
- Node.js: 20 o posterior.
- Raíz del proyecto: la raíz de este repositorio.

Estos valores están en vercel.json. Si el panel de Vercel tiene una configuración antigua,
comprueba que no sustituya el comando o el directorio de salida.
No uses una reescritura global a index.html: ocultaría errores y duplicaría el contenido.

## Antes de publicar

Ejecuta `node --test` o `npm test`. La prueba también genera public/.
Comprueba que el cambio corresponde al repositorio y rama conectados a tu proyecto de Vercel.

## Después de publicar

Abre estas URLs y comprueba el contenido y la navegación:

- /
- /tools/convert-image
- /tools/percentage
- /guides/image-formats
- /p/about, /p/privacy y /p/contact
- /ads.txt y /sitemap.xml

Comprueba también una ruta inexistente: debe devolver 404, no la portada con código 200.
En el HTML recibido, cada herramienta debe incluir título, pasos, ejemplo y límites sin depender de JavaScript.
Con JavaScript activado, prueba el buscador, favoritos, una imagen y un PDF de ejemplo.
Los enlaces antiguos /#/t/{id} deben llevar a /tools/{id}.

La revisión local por navegador puede estar limitada por los permisos de la sesión;
las pruebas de código no sustituyen esta comprobación visual y funcional.

## AdSense

Los anuncios siguen apagados durante la revisión. Conserva el meta tag de verificación y ads.txt.
Desactiva Auto Ads también en el panel de AdSense. Consulta ADSENSE.md antes de solicitar una nueva revisión.

