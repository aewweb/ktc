document.addEventListener("DOMContentLoaded", () => {
  loadPartial("header", "partials/header.html", initHeader);
  loadPartial("footer", "partials/footer.html");
});

function loadPartial(id, file, callback) {
  fetch(file)
    .then(resp => {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.text();
    })
    .then(html => {
      document.getElementById(id).innerHTML = html;
      if (typeof callback === "function") callback();
    })
    .catch(err => {
      console.error("Ошибка загрузки partial:", file, err);
    });
}

function initHeader() {
  const header = document.querySelector(".site-header");
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobile-menu");
  const overlay = document.getElementById("menu-overlay");
  const body = document.body;

  // === Создаём overlay для mega-menu ===
  let megaOverlay = document.getElementById("mega-overlay");
  if (!megaOverlay) {
    megaOverlay = document.createElement("div");
    megaOverlay.id = "mega-overlay";
    megaOverlay.className = "mega-overlay";
    document.body.appendChild(megaOverlay);
  }

  // === Mobile menu ===
  function openMobile() {
    mobileMenu?.classList.add("open");
    overlay?.classList.add("visible");
    burger?.setAttribute("aria-expanded", "true");
    mobileMenu?.setAttribute("aria-hidden", "false");
    overlay?.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll");
  }

  function closeMobile() {
    mobileMenu?.classList.remove("open");
    overlay?.classList.remove("visible");
    burger?.setAttribute("aria-expanded", "false");
    mobileMenu?.setAttribute("aria-hidden", "true");
    overlay?.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll");
  }

  burger?.addEventListener("click", () => {
    mobileMenu?.classList.contains("open") ? closeMobile() : openMobile();
  });

  overlay?.addEventListener("click", closeMobile);

  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && mobileMenu?.classList.contains("open")) {
      closeMobile();
    }
  });

  // === Mega-menu logic (hover-like via JS) ===
  function updateMegaOverlayState() {
    const anyOpen = document.querySelector(".has-mega.open");
    if (anyOpen) {
      megaOverlay.classList.add("visible");
    } else {
      megaOverlay.classList.remove("visible");
    }
  }

  function closeAllMega() {
    document.querySelectorAll(".has-mega.open").forEach(item => {
      item.classList.remove("open");
      item.querySelector(".nav-link")?.setAttribute("aria-expanded", "false");
    });
    updateMegaOverlayState();
  }

  document.querySelectorAll(".has-mega").forEach(item => {
    const link = item.querySelector(".nav-link");
    const menu = item.querySelector(".mega-menu");
    if (!link || !menu) return;

    let hoverTimeout;

    item.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 992) return;
      clearTimeout(hoverTimeout);
      closeAllMega();
      item.classList.add("open");
      link.setAttribute("aria-expanded", "true");
      updateMegaOverlayState();
    });

    item.addEventListener("mouseleave", () => {
      if (window.innerWidth <= 992) return;
      hoverTimeout = setTimeout(() => {
        item.classList.remove("open");
        link.setAttribute("aria-expanded", "false");
        updateMegaOverlayState();
      }, 200);
    });

    menu.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimeout);
    });

    menu.addEventListener("mouseleave", () => {
      hoverTimeout = setTimeout(() => {
        item.classList.remove("open");
        link.setAttribute("aria-expanded", "false");
        updateMegaOverlayState();
      }, 200);
    });
  });

  // Закрытие по клику вне меню
  document.addEventListener("click", e => {
    if (!e.target.closest(".has-mega") && !e.target.closest(".mega-menu")) {
      closeAllMega();
    }
  });

  // Закрытие по Esc
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeMobile();
      closeAllMega();
    }
  });

  // === Header shadow on scroll ===
  const scrollThreshold = 8;
  function checkScroll() {
    header?.classList.toggle("scrolled", window.scrollY > scrollThreshold);
  }
  checkScroll();
  window.addEventListener("scroll", checkScroll);
}
