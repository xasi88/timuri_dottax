// Искры от углей на первом экране. Рисуются на canvas, пока экран виден.

(function () {
  const canvas = document.getElementById("embers");
  if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, sparks = [], running = true;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spark(fromBottom) {
    return {
      x: Math.random() * w,
      y: fromBottom ? h + 10 : Math.random() * h,
      r: 0.6 + Math.random() * 2.2,
      vy: 0.4 + Math.random() * 1.3,
      sway: Math.random() * Math.PI * 2,
      life: 0.5 + Math.random() * 0.5,
    };
  }

  function frame() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (const s of sparks) {
      s.y -= s.vy;
      s.sway += 0.03;
      s.x += Math.sin(s.sway) * 0.5;
      const fade = Math.max(0, Math.min(1, s.y / h)) * s.life;
      const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
      g.addColorStop(0, `rgba(255,190,90,${fade})`);
      g.addColorStop(0.4, `rgba(255,106,43,${fade * 0.6})`);
      g.addColorStop(1, "rgba(255,60,20,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
      ctx.fill();
      if (s.y < -10) Object.assign(s, spark(true));
    }
    requestAnimationFrame(frame);
  }

  resize();
  const count = Math.round(Math.min(90, w / 9));
  sparks = Array.from({ length: count }, () => spark(false));
  addEventListener("resize", resize);
  new IntersectionObserver(([e]) => {
    const was = running;
    running = e.isIntersecting;
    if (running && !was) frame();
  }).observe(canvas);
  frame();
})();
