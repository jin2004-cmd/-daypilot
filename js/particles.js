/* DayPilot · 桌面端粒子背景（星座连线 + 鼠标引力）
 * 仅 ≥900px 渲染；尊重 prefers-reduced-motion；随深浅色自动调色
 */
(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ctx = canvas.getContext("2d");
  var W = 0, H = 0, parts = [];
  var mouse = { x: -9999, y: -9999 };
  var N = 72, LINK = 130, MAX_SPEED = 0.42;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function make() {
    parts = [];
    for (var i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * MAX_SPEED,
        vy: (Math.random() - 0.5) * MAX_SPEED,
        r: 1.2 + Math.random() * 1.9
      });
    }
  }

  function isDark() { return document.body.classList.contains("dark"); }

  function tick() {
    if (window.innerWidth >= 900) {
      ctx.clearRect(0, 0, W, H);
      var dark = isDark();
      var i, j, p, a, b, dx, dy, d;

      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        // 鼠标轻引力
        dx = mouse.x - p.x; dy = mouse.y - p.y;
        d = dx * dx + dy * dy;
        if (d < 25600 && d > 4) { p.vx += dx * 0.000012 * Math.sqrt(d); p.vy += dy * 0.000012 * Math.sqrt(d); }
        p.x += p.vx; p.y += p.vy;
        // 限速 & 保速（防止被鼠标吸停）
        var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > MAX_SPEED) { p.vx = p.vx / sp * MAX_SPEED; p.vy = p.vy / sp * MAX_SPEED; }
        else if (sp < 0.1) { var ang = Math.random() * 6.283; p.vx = Math.cos(ang) * 0.2; p.vy = Math.sin(ang) * 0.2; }
        // 环绕边界
        if (p.x < -24) p.x = W + 24; if (p.x > W + 24) p.x = -24;
        if (p.y < -24) p.y = H + 24; if (p.y > H + 24) p.y = -24;
      }

      // 连线
      for (i = 0; i < parts.length; i++) {
        for (j = i + 1; j < parts.length; j++) {
          a = parts[i]; b = parts[j];
          dx = a.x - b.x; dy = a.y - b.y;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            var alpha = (1 - d / LINK) * (dark ? 0.22 : 0.16);
            ctx.strokeStyle = dark ? "rgba(126,143,248," + alpha + ")" : "rgba(79,109,245," + alpha + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // 粒子点
      ctx.fillStyle = dark ? "rgba(126,143,248,.5)" : "rgba(79,109,245,.32)";
      for (i = 0; i < parts.length; i++) {
        p = parts[i];
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    }
    requestAnimationFrame(tick);
  }

  resize(); make();
  window.addEventListener("resize", function () { resize(); make(); });
  window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });
  requestAnimationFrame(tick);
})();
