(function () {
  var $ = function (s) { return document.querySelector(s); };
  var cover = $('#cover'), scene = $('#scene'), body = document.body, bgm = $('#bgm');

  // 1. Open: doors slide, curtains gather, names appear
  function open() {
    $('#seal').removeEventListener('click', open);
    cover.classList.add('go');
    if (bgm.querySelector('source')) bgm.play().catch(function () {});
    setTimeout(function () { scene.classList.add('play'); }, 900);
    setTimeout(function () { cover.classList.add('gone'); body.classList.remove('locked'); }, 1800);
  }
  $('#seal').addEventListener('click', open);

  // Scroll reveal
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .15 });
  function watch() { document.querySelectorAll('.reveal:not(.in)').forEach(function (e) { io.observe(e); }); }
  watch();

  // 2. Scratch-to-reveal heart
  var cv = $('#scr'), cx = cv.getContext('2d'), W, H, done = false, drawing = false, moves = 0;
  function paint() {
    var r = cv.getBoundingClientRect(), d = window.devicePixelRatio || 1;
    W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0);
    cx.globalCompositeOperation = 'source-over';
    heart(); var g = cx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#b4c297'); g.addColorStop(.5, '#7f9566'); g.addColorStop(1, '#a3b386');
    cx.fillStyle = g; cx.fill();
    cx.fillStyle = 'rgba(255,255,255,.55)'; cx.font = '600 ' + W * .055 + 'px Cinzel, serif'; cx.textAlign = 'center';
    cx.fillText('SCRATCH HERE', W / 2, H * .5);
  }
  function heart() {
    cx.beginPath(); cx.moveTo(W * .5, H * .92);
    cx.bezierCurveTo(W * .02, H * .55, W * .05, H * .05, W * .5, H * .28);
    cx.bezierCurveTo(W * .95, H * .05, W * .98, H * .55, W * .5, H * .92); cx.closePath();
  }
  paint(); addEventListener('load', paint);
  function pos(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  function scratch(e) {
    if (!drawing || done) return;
    var p = pos(e); cx.globalCompositeOperation = 'destination-out';
    cx.beginPath(); cx.arc(p[0], p[1], W * .075, 0, 6.3); cx.fill();
    if (++moves % 12 === 0) check();
  }
  function check() {
    var d = cx.getImageData(0, 0, cv.width, cv.height).data, c = 0, t = 0;
    for (var i = 3; i < d.length; i += 64) { t++; if (d[i] < 20) c++; }
    // heart covers ~55% of canvas box; clear threshold relative to that
    if (c / t > .38) finish();
  }
  function finish() {
    if (done) return; done = true;
    cv.style.transition = 'opacity .8s'; cv.style.opacity = 0; cv.style.pointerEvents = 'none';
    confetti();
    var b = $('#openMore'); b.hidden = false;
    setTimeout(function () { b.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 600);
  }
  cv.addEventListener('pointerdown', function (e) { drawing = true; cv.setPointerCapture(e.pointerId); scratch(e); });
  cv.addEventListener('pointermove', scratch);
  cv.addEventListener('pointerup', function () { drawing = false; if (!done) check(); });
  cv.addEventListener('pointercancel', function () { drawing = false; });

  $('#openMore').addEventListener('click', function () {
    var r = $('#rest'); r.hidden = false; watch();
    setTimeout(function () { r.firstElementChild.scrollIntoView({ behavior: 'smooth' }); }, 60);
  });

  // Confetti / sparkles
  var fx = $('#fx'), fc = fx.getContext('2d'), parts = [], running = false;
  function fit() { fx.width = innerWidth; fx.height = innerHeight; } fit(); addEventListener('resize', fit);
  function confetti() {
    var cols = ['#b98f4a', '#d9b36a', '#7f9566', '#f1dfc2', '#e8a0a8'];
    for (var i = 0; i < 110; i++) parts.push({ x: innerWidth / 2, y: innerHeight * .55, vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 3,
      s: 4 + Math.random() * 5, r: Math.random() * 6, vr: (Math.random() - .5) * .3, c: cols[i % 5], life: 1 });
    if (!running) { running = true; loop(); }
  }
  function loop() {
    fc.clearRect(0, 0, fx.width, fx.height);
    parts = parts.filter(function (p) { return p.life > 0; });
    parts.forEach(function (p) {
      p.vy += .25; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr; p.life -= .008;
      fc.save(); fc.globalAlpha = Math.max(p.life, 0); fc.translate(p.x, p.y); fc.rotate(p.r);
      fc.fillStyle = p.c; fc.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); fc.restore();
    });
    if (parts.length) requestAnimationFrame(loop); else running = false;
  }

  // Countdown to 3 Dec (mehndi)
  var target = new Date(2026, 11, 3, 18, 0, 0).getTime();
  function tick() {
    var d = Math.max(0, target - Date.now());
    $('#dd').textContent = Math.floor(d / 864e5); $('#hh').textContent = Math.floor(d / 36e5) % 24;
    $('#mm').textContent = Math.floor(d / 6e4) % 60; $('#ss').textContent = Math.floor(d / 1e3) % 60;
  }
  tick(); setInterval(tick, 1000);
})();
