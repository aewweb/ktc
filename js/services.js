document.addEventListener("DOMContentLoaded", async () => {
  // Извлекаем ID из URL, например ?id=web-dev
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    // Загружаем JSON с данными услуг
    const res = await fetch("data/services.json");
    const data = await res.json();

    const service = data[id];
    if (!service) {
      console.error("Нет такой услуги:", id);
      return;
    }

    // Подставляем контент
    document.title = `${service.subtitle} — Услуги`;
    document.getElementById("serviceTitle").textContent = service.title;
    document.getElementById("serviceSubtitle").textContent = service.subtitle;
    document.getElementById("serviceImage").src = service.image;
    document.getElementById("serviceImage").alt = service.subtitle;
    document.getElementById("serviceSummary").textContent = service.summary;

    // Рендерим подпункты
    const container = document.getElementById("serviceSubitems");
    container.innerHTML = "";

    (service.subitems || []).forEach((item) => {
      const block = document.createElement("div");
      block.className = "subitem";

      block.innerHTML = `
        <img src="${item.image}" alt="${item.title}">
        <h3>${item.title}</h3>
        <p>${item.text}</p>
        <div class="tech">
          ${item.tech.map((t) => `<img src="${t}" alt="">`).join("")}
        </div>
      `;

      container.appendChild(block);
    });
  } catch (err) {
    console.error("Ошибка загрузки данных:", err);
  }
});
