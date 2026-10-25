# AdSense: corregir el rechazo y solicitar revisión

El aviso recibido señala anuncios en pantallas sin contenido del editor y contenido de poco valor.
Los cambios del sitio abordan ambos puntos, pero Google decide la aprobación.
No hay una cifra universal de palabras, páginas o visitas que garantice aceptarla.

## Qué cambia

- HTML completo en URLs normales para herramientas, categorías, guías y páginas informativas.
- Instrucciones, ejemplos y limitaciones específicas para las 36 herramientas.
- Cuatro guías sobre decisiones de formatos, exportación y comprobación de resultados.
- Información del proyecto, política editorial, privacidad y contacto.
- Sin anuncios en herramientas, editores, resultados, categorías, contacto, legal o errores.
- Sin script de Google ni espacios vacíos de publicidad durante la revisión.
- Meta de propiedad y ads.txt con el ID existente: ca-pub-2170099684772121.

Esto no demuestra por sí solo interés de los usuarios ni presencia continuada.
Mantén las herramientas, atiende errores reales y evita inventar reseñas, cifras de tráfico o credenciales.

## Antes de volver a enviar el sitio

1. Publica los cambios y verifica la versión desplegada siguiendo DEPLOY.md.
2. En AdSense → Anuncios → Por sitio, desactiva **Auto Ads** para toolnez.vercel.app.
   `autoAds: false` en nuestro archivo no cambia esa configuración de Google.
3. Comprueba /tools/convert-image y /guides/image-formats en móvil y escritorio,
   y prueba una exportación real con un archivo no sensible.
4. Comprueba el correo de contacto existente y la exactitud de los datos del editor.
5. Revisa /ads.txt, el meta google-adsense-account y /sitemap.xml.
6. Cuando el sitio publicado esté correcto, solicita revisión en AdSense → Sitios.

Puedes verificar la propiedad mediante el meta tag ya presente; no es necesario cargar código que sirva anuncios.
No solicites la revisión basándote solamente en que existe una rama o una pull request.

## Después de la aprobación

El diseño permite un bloque manual después del artículo completo de una guía.
No habilites anuncios automáticos ni añadas bloques cerca de cargas, copias o descargas.

En adsense.js:

```js
enabled: true,
autoAds: false,
guideSlot: 'ID_REAL_DE_TU_UNIDAD'
```

No cambies enabled hasta completar la integración de consentimiento requerida.
El cargador exige simultáneamente una guía existente, un slot válido y permiso de consentimiento.
No basta con cambiar enabled: no habrá peticiones sin ese permiso.

## Consentimiento

Integra una CMP que cumpla los requisitos de Google y de las regiones a las que sirvas anuncios,
incluida una CMP certificada por Google donde sea obligatoria.
Desde su evento de permiso, llama a `window.ToolNezAds.allowAfterConsent()` únicamente
cuando la CMP haya establecido que puede ejecutarse código publicitario.
Ante retirada del permiso llama a `window.ToolNezAds.revokeConsent()`.
La CMP debe manejar las señales y opciones de consentimiento pertinentes; estos hooks no sustituyen una CMP.
Un banner casero o detectar países por idioma no satisface ese requisito.

Prueba los estados de permiso, denegación y retirada antes de servir anuncios.
La biblioteca solo se carga en /guides/{id}; las demás páginas no pueden emitir unidades manuales.
La configuración actual no sirve anuncios y no necesita inventar un consentimiento.

## Fuentes del aviso

- https://support.google.com/publisherpolicies/answer/11112688
- https://support.google.com/publisherpolicies/answer/11036238
- https://support.google.com/adsense/answer/10015918
- https://support.google.com/adsense/answer/48182

Nunca pulses tus propios anuncios ni solicites clics para apoyar el sitio.

