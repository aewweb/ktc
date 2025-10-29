let cases = [];
let currentIndex = 0;
let currentScreenshot = 0;

const selector = document.getElementById("casesSelector");
const card = document.getElementById("caseCard");

/* --- Плавная прокрутка до карточки (учёт фиксированного хэдера) --- */
function scrollToCaseCard() {
  const headerHeight =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--header-height"
      )
    ) || 70;
  const y =
    card.getBoundingClientRect().top + window.scrollY - headerHeight - 16; // -16 = небольшой зазор
  window.scrollTo({ top: y, behavior: "smooth" });
}

/* --- Плавное появление карточки --- */
function showCaseCard() {
  if (!card) return;
  card.classList.remove("visible");
  void card.offsetWidth; // сброс анимации
  card.classList.add("visible");
}

/* --- Загрузка кейсов --- */
async function loadCases() {
  try {
    const res = await fetch("data/cases.json");
    cases = await res.json();
    renderSelector();
    showCase(0);
  } catch (e) {
    console.error("Ошибка загрузки cases.json:", e);
  }
}

/* --- Кнопки выбора кейсов --- */
function renderSelector() {
  selector.innerHTML = "";
  cases.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.textContent = c.shortTitle || `Кейс ${i + 1}`;
    btn.addEventListener("click", () => {
      showCase(i);
      scrollToCaseCard();
    });
    selector.appendChild(btn);
  });
}

/* --- Показ конкретного кейса --- */
function showCase(index) {
  currentIndex = index;
  currentScreenshot = 0;
  const c = cases[index];

  const stackHTML = c.stack
    .map((src) => `<img src="${src}" alt="tech">`)
    .join("");

  const galleryHTML = `
    <div class="case-gallery">
      <button class="gallery-btn prev-btn" id="prevBtn" aria-label="Предыдущий">←</button>
      <img id="caseScreenshot" src="${c.screenshots[0]}" alt="Скриншот кейса">
      <button class="gallery-btn next-btn" id="nextBtn" aria-label="Следующий">→</button>
    </div>
  `;

  card.innerHTML = `
    <div class="case-main">
      <img src="${c.image}" class="case-image" alt="case image">
      <div class="case-content">
        <h2 class="case-title">${c.title}</h2>
        <p class="case-description">${c.text}</p>
        <div class="tech-stack">${stackHTML}</div>
      </div>
    </div>
    ${galleryHTML}
  `;

  showCaseCard();

  // Подсветка активной кнопки
  document.querySelectorAll(".cases-selector button").forEach((b, i) => {
    b.classList.toggle("active", i === index);
  });

  document.getElementById("prevBtn").addEventListener("click", prevScreenshot);
  document.getElementById("nextBtn").addEventListener("click", nextScreenshot);
}

/* --- Навигация по скриншотам --- */
function prevScreenshot() {
  const imgs = cases[currentIndex].screenshots;
  currentScreenshot = (currentScreenshot - 1 + imgs.length) % imgs.length;
  updateScreenshot(imgs[currentScreenshot]);
}

function nextScreenshot() {
  const imgs = cases[currentIndex].screenshots;
  currentScreenshot = (currentScreenshot + 1) % imgs.length;
  updateScreenshot(imgs[currentScreenshot]);
}

function updateScreenshot(src) {
  const img = document.getElementById("caseScreenshot");
  if (!img) return;
  img.style.opacity = 0;
  setTimeout(() => {
    img.src = src;
    img.style.opacity = 1;
  }, 200);
}

/* --- Инициализация --- */
window.addEventListener("load", loadCases);
