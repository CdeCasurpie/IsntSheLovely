/* ============================================================
   ISN'T SHE LOVELY — lógica de la cinta
   - boot de terminal con typewriter + sonidos retro (WebAudio)
   - flash blanco como foto al iniciar
   - dedicatoria 0→7 s, fotos desde s7 cada 4 s (orden del zip)
   ============================================================ */
(() => {
  "use strict";

  const DEDICATION = "para mi buba, la más guapa, la más querida, la más memorable... :D";
  const FIRST_PHOTO_AT = 7;   // segundos
  const PHOTO_EVERY = 4;      // segundos

  const $ = (id) => document.getElementById(id);
  const boot = $("boot"), stage = $("stage"), bootlog = $("bootlog"),
        prompt = $("prompt"), noMsg = $("noMsg"), flash = $("flash"),
        song = $("song"), pile = $("pile"), ded = $("dedication"),
        dedText = $("dedText"), counter = $("counter"), bar = $("bar"),
        caption = $("caption"), finale = $("finale"), photoCount = $("photoCount");

  let photos = [];
  let started = false, timers = [], startStamp = 0;

  /* ---------------- sonidos retro 100% sintetizados ---------------- */
  let AC = null;
  const audio = () => (AC ??= new (window.AudioContext || window.webkitAudioContext)());

  function beep(freq = 880, dur = 0.06, type = "square", vol = 0.05, when = 0) {
    try {
      const ctx = audio(), t = ctx.currentTime + when;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.02);
    } catch {}
  }
  const sndHover  = () => beep(660, 0.07, "square", 0.04);
  const sndTick   = () => beep(1200 + Math.random() * 300, 0.025, "square", 0.018);
  const sndYes    = () => { beep(523, .09, "square", .06); beep(659, .09, "square", .06, .09); beep(784, .16, "square", .07, .18); };
  const sndNo     = () => { beep(160, .22, "sawtooth", .07); beep(110, .3, "sawtooth", .07, .12); };
  // obturador: clic mecánico + destello agudo
  function sndShutter() {
    try {
      const ctx = audio(), t = ctx.currentTime;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
      const src = ctx.createBufferSource(); src.buffer = buf;
      const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = 2800; f.Q.value = 0.8;
      const g = ctx.createGain(); g.gain.value = 0.5;
      src.connect(f).connect(g).connect(ctx.destination); src.start(t);
      beep(3200, 0.05, "square", 0.05, 0.02);
    } catch {}
  }

  /* ---------------- luciérnagas (como la portada) ---------------- */
  const cv = $("fireflies"), cx = cv.getContext("2d");
  let bugs = [];
  function sky() {
    cv.width = innerWidth; cv.height = innerHeight;
    cv.style.opacity = ".45";
    // pocas y tenues: noche casi negra al inicio
    bugs = Array.from({ length: Math.min(36, Math.floor(innerWidth / 40)) }, () => ({
      x: Math.random() * cv.width, y: Math.random() * cv.height,
      r: 0.8 + Math.random() * 1.6, s: .15 + Math.random() * .4,
      p: Math.random() * Math.PI * 2, a: Math.random() * Math.PI * 2,
    }));
  }
  (function loop(t) {
    cx.clearRect(0, 0, cv.width, cv.height);
    const time = (t || 0) / 1000;
    for (const b of bugs) {
      b.x += Math.cos(b.a) * b.s; b.y += Math.sin(b.a * 1.3) * b.s * .6;
      if (b.x < 0) b.x = cv.width; if (b.x > cv.width) b.x = 0;
      if (b.y < 0) b.y = cv.height; if (b.y > cv.height) b.y = 0;
      const glow = .25 + .45 * Math.abs(Math.sin(time * 1.2 + b.p));
      const g = cx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 4);
      g.addColorStop(0, `rgba(255,230,109,${.5 * glow})`);
      g.addColorStop(1, "rgba(255,230,109,0)");
      cx.fillStyle = g;
      cx.beginPath(); cx.arc(b.x, b.y, b.r * 4, 0, 7); cx.fill();
      cx.fillStyle = `rgba(255,255,255,${.5 * glow})`;
      cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 7); cx.fill();
    }
    requestAnimationFrame(loop);
  })();
  addEventListener("resize", sky); sky();

  /* ---------------- boot de terminal ---------------- */
  const lines = [
    { t: "> CIRCUS_OS v2.0 — iniciando...", c: "" },
    { t: "> cargando estrellas y luciérnagas... OK", c: "ok" },
    { t: '> montando cinta: "isnt-she-lovely.mp3"... OK', c: "ok" },
    { t: "> revelando fotografías... OK", c: "ok" },
    { t: "> destinataria: MI BUBA ♥", c: "warn" },
  ];
  function typeLines(i = 0) {
    if (i >= lines.length) { prompt.classList.remove("hidden"); return; }
    const p = document.createElement("div");
    if (lines[i].c) p.className = lines[i].c;
    bootlog.appendChild(p);
    const txt = lines[i].t;
    let j = 0;
    (function ch() {
      p.textContent = txt.slice(0, ++j);
      if (j % 3 === 0) sndTick();
      if (j < txt.length) setTimeout(ch, 14);
      else setTimeout(() => typeLines(i + 1), 160);
    })();
  }
  setTimeout(typeLines, 400);

  /* ---------------- botones YES / NO ---------------- */
  $("btnYes").addEventListener("mouseenter", sndHover);
  $("btnNo").addEventListener("mouseenter", sndHover);
  $("btnYes").addEventListener("click", () => { audio(); sndYes(); startShow(); });
  $("btnNo").addEventListener("click", () => {
    audio(); sndNo();
    noMsg.classList.remove("hidden");
    noMsg.style.animation = "none"; void noMsg.offsetWidth;
    noMsg.style.animation = "";
  });
  $("btnAgain").addEventListener("click", () => location.reload());

  /* ---------------- cargar manifiesto (orden del zip) ---------------- */
  fetch("assets/photos.json")
    .then((r) => r.json())
    .then((list) => { photos = list; photoCount.textContent = String(list.length).padStart(2, "0"); })
    .catch(() => { photos = []; });

  /* ---------------- show ---------------- */
  function doFlash() {
    flash.classList.remove("go"); void flash.offsetWidth;
    flash.classList.add("go");
  }
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function startShow() {
    if (started) return;
    started = true;
    doFlash();                       // dash blanco como sacando una foto
    boot.classList.add("hidden");
    stage.classList.remove("hidden");
    startStamp = performance.now();

    song.volume = 0.9;
    song.play().catch(() => {
      caption.textContent = "dale play manually ♥ (el navegador bloqueó el autoplay)";
      caption.classList.remove("hidden");
    });

    // 1) dedicatoria 0 → 7 s con typewriter
    ded.classList.remove("hidden");
    let k = 0;
    const typeTimer = setInterval(() => {
      dedText.textContent = DEDICATION.slice(0, ++k);
      if (k % 2 === 0) sndTick();
      if (k >= DEDICATION.length) clearInterval(typeTimer);
    }, 45);
    timers.push(typeTimer);

    // 2) fotos desde el segundo 7, una cada 4 s, en orden del zip
    const total = () => (photos.length || 49);
    for (let i = 0; i < 200; i++) {
      later(() => {
        if (i >= total()) return;
        if (i === 0) ded.classList.add("hidden"); // la dedicatoria cede a la primera foto
        throwPhoto(i, total());
      }, (FIRST_PHOTO_AT + i * PHOTO_EVERY) * 1000);
    }

    // 3) progreso: barra + la noche se va encendiendo con la música
    const dawn = $("dawn");
    song.addEventListener("timeupdate", () => {
      if (!song.duration) return;
      const p = song.currentTime / song.duration;
      bar.style.width = (p * 100).toFixed(2) + "%";
      dawn.style.opacity = (p * 0.85).toFixed(3);       // de negro a cielo nocturno
      cv.style.opacity = (0.45 + p * 0.55).toFixed(3);  // luciérnagas despiertan
    });
    song.addEventListener("ended", showFinale);
    // por si la canción dura menos que las fotos: el final llega igual al acabarse la pila
    later(() => { if (pile.children.length >= total() && finale.classList.contains("hidden")) showFinale(); },
          (FIRST_PHOTO_AT + total() * PHOTO_EVERY + 2) * 1000);
  }

  function throwPhoto(i, total) {
    const item = photos[i] || { file: `assets/photos/${String(i + 1).padStart(2, "0")}.jpg`, original: "" };
    doFlash();
    sndShutter();

    // collage desordenado: posición aleatoria en zona segura (centrada,
    // sin salirse de la pantalla), rotación amplia y la nueva siempre arriba.
    // Se fija el transform final inline para que la foto QUEDE inclinada
    // donde termina la animación de aparición.
    const narrow = window.innerWidth < 640;
    const tilt = (Math.random() * 44 - 22).toFixed(1) + "deg";
    const left = narrow
      ? (30 + Math.random() * 40).toFixed(1) + "%"   // 30–70% en móvil
      : (22 + Math.random() * 56).toFixed(1) + "%";  // 22–78% en escritorio
    const top = narrow
      ? (15 + Math.random() * 55).toFixed(1) + "%"
      : (20 + Math.random() * 50).toFixed(1) + "%";  // 20–70%: lejos de HUD y bordes

    const fig = document.createElement("figure");
    fig.className = "polaroid";
    fig.style.setProperty("--tilt", tilt);
    fig.style.left = left;
    fig.style.top = top;
    fig.style.transform = `translate(-50%,-50%) rotate(${tilt})`;
    fig.style.zIndex = 10 + i;
    const n = String(i + 1).padStart(2, "0");
    fig.innerHTML = `<span class="tape"></span>
      <img src="${item.file}" alt="recuerdo ${n}" loading="${i < 4 ? "eager" : "lazy"}"/>
      <figcaption>♥ recuerdo ${n} / ${String(total).padStart(2, "0")}</figcaption>`;
    // las anteriores se hunden un poco, la nueva siempre arriba;
    // se conservan todas para formar el collage final
    [...pile.children].forEach((c, j) => { c.style.filter = "brightness(.86)"; c.style.zIndex = 10 + j; });
    pile.appendChild(fig);

    counter.textContent = `MEMORIA ${n}/${String(total).padStart(2, "0")}`;
    caption.textContent = `📸 ${item.original || ("foto " + n)}`;
    caption.classList.remove("hidden");

    // precargar la siguiente para que el flash no muestre hueco
    const nx = photos[i + 1];
    if (nx) { const im = new Image(); im.src = nx.file; }
  }

  function showFinale() {
    ded.classList.add("hidden");
    caption.classList.add("hidden");
    finale.classList.remove("hidden");
    counter.textContent = `MEMORIA ${String(photos.length || 49).padStart(2, "0")}/${String(photos.length || 49).padStart(2, "0")} ♥`;
    bar.style.width = "100%";
    $("dawn").style.opacity = "1";
    cv.style.opacity = "1";
    doFlash(); sndYes();
    finale.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
