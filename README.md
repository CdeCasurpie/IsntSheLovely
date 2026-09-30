# Isn't She Lovely — cinta de recuerdos ♥

Mini-proyecto para **GitHub Pages**: terminal estilo Digital Circus que
reproduce `Isn't She Lovely` y lanza las 49 fotos del zip como polaroids
con flash + sonido de cámara.

## Estructura

```
index.html                  → página principal (lista para Pages)
css/style.css               → UI terminal + polaroids + flash + CRT
js/app.js                   → boot, sonidos retro, timeline, slideshow
assets/audio/isnt-she-lovely.mp3   → canción (nombre seguro para web)
assets/photos/01.jpg … 49.jpg      → fotos optimizadas (orden del zip)
assets/photos.json          → manifiesto en el orden exacto del zip
assets/img/portada.jpg      → (opcional) la imagen de Pomni y Jax
Photos-1-001.zip            → original (no lo usa la página)
```

Fotos optimizadas de ~157 MB → ~7.6 MB (máx 1280 px, JPEG 78) para que
Pages cargue rápido. El orden `01…49` respeta el orden del zip.

## Guion de la experiencia

1. **Boot terminal**: typewriter + sonidos retro. Pregunta
   `> INICIAR RECUERDOS [ YES ] [ NO ]` (hover con blip; NO = error
   divertido que obliga a decir YES).
2. **YES** → dash blanco como foto + empieza la canción.
3. **0 → 7 s**: dedicatoria escribiéndose:
   *“para mi buba, la más guapa, la más querida, la más memorable... :D”*
4. **Desde el s 7, cada 4 s**: una foto lanzada como polaroid, con flash
   de cámara + obturador, contador `MEMORIA 07/49` y barra ligada a la
   canción (~200 s ≈ 49 fotos).
5. **Final**: *fin de la cinta ♥* + botón de revivir.

## La imagen de portada

Guarda la imagen del mensaje (Pomni y Jax bajo las estrellas) como:

```
assets/img/portada.jpg
```

Si existe se muestra en la terminal; si no, la página usa el fondo
índigo + luciérnagas animadas (no se rompe nada).

## Probar en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

## Publicar en GitHub Pages

```bash
git add -A && git commit -m "cinta de recuerdos ♥" && git push
```

Luego en GitHub: **Settings → Pages → Deploy from a branch → main / (root)**.
La página quedará en `https://TU_USUARIO.github.io/IsntSheLovely/`.

> Nota: los sonidos retro y el obturador están sintetizados con WebAudio,
> no necesitan archivos extra. El navegador exige un clic (YES) antes de
> reproducir audio: por eso la canción arranca justo ahí.
