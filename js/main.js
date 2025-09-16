const canvas = document.getElementById("hero-canvas");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const spacing = 20; // шаг сетки
const amplitude = 6; // амплитуда волн
const rippleStrength = 120; // радиус реакции
let time = 0;

let mouse = { x: width / 2, y: height / 2 };
let ripples = [];

// реакция на мышь
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  ripples.push({ x: mouse.x, y: mouse.y, start: time });
});

// авто-волны (эффект "капель/ветра")
setInterval(() => {
  const rx = Math.random() * width;
  const ry = Math.random() * height;
  ripples.push({ x: rx, y: ry, start: time });
}, 4000);

function draw() {
  ctx.clearRect(0, 0, width, height);

  // чисто белый фон
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  // стиль сетки (затухание к краям)
  const gridGrad = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.2
  );
  gridGrad.addColorStop(0, "rgba(0,114,206,0.35)");
  gridGrad.addColorStop(1, "#fff");
  ctx.strokeStyle = gridGrad;
  ctx.lineWidth = 0.7;

  // горизонтальные линии
  for (let y = 0; y <= height; y += spacing) {
    ctx.beginPath();
    for (let x = 0; x <= width; x += spacing) {
      let wave = Math.sin(x / 90 + time * 0.6) * 2;

      ripples.forEach((r) => {
        const dx = x - r.x;
        const dy = y - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const localWave =
          Math.sin(dist / 25 - (time - r.start) * 2.5) *
          amplitude *
          Math.exp(-dist / rippleStrength);
        wave += localWave;
      });

      ctx.lineTo(x, y + wave);
    }
    ctx.stroke();
  }

  // вертикальные линии
  for (let x = 0; x <= width; x += spacing) {
    ctx.beginPath();
    for (let y = 0; y <= height; y += spacing) {
      let wave = Math.cos(y / 90 + time * 0.6) * 2;

      ripples.forEach((r) => {
        const dx = x - r.x;
        const dy = y - r.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const localWave =
          Math.cos(dist / 25 - (time - r.start) * 2.5) *
          amplitude *
          Math.exp(-dist / rippleStrength);
        wave += localWave;
      });

      ctx.lineTo(x + wave, y);
    }
    ctx.stroke();
  }

  // удаляем старые волны
  ripples = ripples.filter((r) => time - r.start < 4);
}

function animate() {
  time += 0.012; // плавное движение
  draw();
  requestAnimationFrame(animate);
}
animate();

// адаптивность
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});
