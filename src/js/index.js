// hero-grid.js — адаптивный скрипт сетки (desktop + mobile)
const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// базовые параметры (desktop)
let spacing = 20;
let amplitude = 6;
let rippleStrength = 120;
let timeStep = 0.012;

let time = 0;
let ripples = [];

const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

// если мобильное — уменьшаем базовую сетку
if (isTouchDevice) {
  spacing = 12;
  amplitude = 4;
  rippleStrength = 80;
  timeStep = 0.009;

  // tap → более активная волна
  document.addEventListener(
    "touchstart",
    (e) => {
      const t = e.changedTouches[0];
      ripples.push({
        x: t.clientX,
        y: t.clientY,
        start: time,
        amp: amplitude * 2.2, // 🔥 сильнее чем обычные
        strength: rippleStrength * 1.5, // шире зона отклика
      });
    },
    { passive: true }
  );
} else {
  // Desktop: реакция на мышь
  document.addEventListener("mousemove", (e) => {
    ripples.push({ x: e.clientX, y: e.clientY, start: time });
  });
}

// авто-волны (мягкие)
setInterval(() => {
  const rx = Math.random() * width;
  const ry = Math.random() * height;
  ripples.push({ x: rx, y: ry, start: time });
}, 4000);

function draw() {
  ctx.clearRect(0, 0, width, height);

  // фон — чисто белый
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // сетка
  const gridGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) / 1.2
  );
  gridGrad.addColorStop(0, "rgba(0,114,206,0.32)");
  gridGrad.addColorStop(1, "#fff");
  ctx.strokeStyle = gridGrad;
  ctx.lineWidth = 0.7;

  // горизонтальные линии
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += spacing) {
      let wave = Math.sin(x / 90 + time * 0.6) * 1.6;
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        const dx = x - r.x;
        const dy = y - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const amp = r.amp || amplitude;
        const str = r.strength || rippleStrength;
        wave +=
          Math.sin(dist / 25 - (time - r.start) * 2.2) *
          amp *
          Math.exp(-dist / str);
      }
      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // вертикальные линии
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath();
    for (let y = 0; y <= height; y += spacing) {
      let wave = Math.cos(y / 90 + time * 0.6) * 1.6;
      for (let i = 0; i < ripples.length; i++) {
        const r = ripples[i];
        const dx = x - r.x;
        const dy = y - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const amp = r.amp || amplitude;
        const str = r.strength || rippleStrength;
        wave +=
          Math.cos(dist / 25 - (time - r.start) * 2.2) *
          amp *
          Math.exp(-dist / str);
      }
      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  }

  ripples = ripples.filter((r) => time - r.start < 4);
}

function animate() {
  time += timeStep;
  draw();
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});


document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll(".count");
  const items = document.querySelectorAll(".number-item");
  let triggered = false;

  function animateNumbers() {
    counters.forEach(counter => {
      const start = +counter.getAttribute("data-start");
      const target = +counter.getAttribute("data-target");
      const duration = 1500;
      const frames = 60;
      const increment = (target - start) / frames;
      let current = start;
      let frame = 0;

      const updateCount = () => {
        frame++;
        current += increment;
        counter.innerText = Math.floor(current);
        if (frame < frames) {
          requestAnimationFrame(updateCount);
        } else {
          counter.innerText = target;
        }
      };
      updateCount();
    });
  }

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !triggered) {
      items.forEach(item => item.classList.add("visible"));
      animateNumbers();
      triggered = true;
    }
  }, { threshold: 0.4 });

  observer.observe(document.querySelector(".numbers"));
});