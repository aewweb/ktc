// === СКРИПТ ДЛЯ ГАЛЕРЕИ КЕЙСОВ (case.js) ===

document.addEventListener("DOMContentLoaded", () => {
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const images = document.querySelectorAll(".gallery-img");

  if (images.length === 0) return; // Если нет картинок, выходим

  let currentIndex = 0;

  // Функция для показа конкретного слайда
  function showSlide(index) {
    // Убираем active у всех
    images.forEach((img) => img.classList.remove("active"));

    // Зацикливание индекса
    if (index >= images.length) {
      currentIndex = 0;
    } else if (index < 0) {
      currentIndex = images.length - 1;
    } else {
      currentIndex = index;
    }

    // Добавляем active к текущему
    images[currentIndex].classList.add("active");
  }

  // Обработчик кнопки "Следующий"
  nextBtn?.addEventListener("click", () => {
    showSlide(currentIndex + 1);
  });

  // Обработчик кнопки "Предыдущий"
  prevBtn?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
  });

  // Опционально: автопрокрутка каждые 5 секунд
  // setInterval(() => {
  //   showSlide(currentIndex + 1);
  // }, 5000);

  // Опционально: управление клавиатурой
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      showSlide(currentIndex - 1);
    } else if (e.key === "ArrowRight") {
      showSlide(currentIndex + 1);
    }
  });
});
