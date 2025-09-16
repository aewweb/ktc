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
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
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

  const desktopOverlay = document.getElementById("desktop-overlay");

document.querySelectorAll(".has-mega").forEach(item => {
  const link = item.querySelector(".nav-link");
  const menu = item.querySelector(".mega-menu");
  if (!link || !menu) return;
  let hoverTimeout;

  item.addEventListener("mouseenter", () => {
    if (window.innerWidth <= 992) return;
    clearTimeout(hoverTimeout);

    document.querySelectorAll(".has-mega.open").forEach(h => {
      if (h !== item) h.classList.remove("open");
    });

    item.classList.add("open");
    menu.setAttribute("aria-hidden", "false");
    link.setAttribute("aria-expanded", "true");

    if (desktopOverlay) desktopOverlay.classList.add("visible");
  });

  item.addEventListener("mouseleave", () => {
    if (window.innerWidth <= 992) return;
    hoverTimeout = setTimeout(() => {
      item.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      link.setAttribute("aria-expanded", "false");

      const anyOpen = document.querySelector(".has-mega.open");
      if (!anyOpen && desktopOverlay) desktopOverlay.classList.remove("visible");
    }, 180);
  });
});

// Закрытие по клику на overlay
 if (desktopOverlay) {
  desktopOverlay.addEventListener("click", () => {
    document.querySelectorAll(".has-mega.open").forEach(h => {
      h.classList.remove("open");
      const l = h.querySelector(".nav-link");
      if (l) l.setAttribute("aria-expanded", "false");
      const m = h.querySelector(".mega-menu");
      if (m) m.setAttribute("aria-hidden", "true");
    });
    desktopOverlay.classList.remove("visible");
  });
 }


  if (!header || !burger || !mobileMenu || !overlay) {
    console.warn("initHeader: отсутствуют ключевые элементы header/menu/overlay");
    return;
  }

  // --- Открыть мобильное меню ---
  function openMobile() {
    mobileMenu.classList.add("open");
    overlay.classList.add("visible");
    burger.classList.add("open");
    burger.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    overlay.setAttribute("aria-hidden", "false");
    body.classList.add("no-scroll"); // блокируем скролл страницы
  }

  // --- Закрыть мобильное меню ---
  function closeMobile() {
    mobileMenu.classList.remove("open");
    overlay.classList.remove("visible");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-hidden", "true");
    body.classList.remove("no-scroll"); // возвращаем прокрутку
  }

  // --- Клик по бургеру ---
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenu.classList.contains("open") ? closeMobile() : openMobile();
  });

  // --- Клик по overlay — закрыть ---
  overlay.addEventListener("click", closeMobile);

  // --- ESC — закрыть ---
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobile();
  });

  // --- Resize: закрываем меню при переходе на десктоп ---
  window.addEventListener("resize", () => {
    if (window.innerWidth > 992 && mobileMenu.classList.contains("open")) {
      closeMobile();
    }
  });

  // --- Mobile accordion (подменю) ---
  document.querySelectorAll(".mobile-has-sub .mobile-sub-toggle").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const parent = btn.closest(".mobile-has-sub");
      if (!parent) return;
      const isOpen = parent.classList.contains("open");

      // Закрываем все остальные
      document.querySelectorAll(".mobile-has-sub.open").forEach(el => {
        if (el !== parent) {
          el.classList.remove("open");
          const tb = el.querySelector(".mobile-sub-toggle");
          if (tb) tb.setAttribute("aria-expanded", "false");
          const submenu = el.querySelector(".mobile-submenu");
          if (submenu) submenu.setAttribute("aria-hidden", "true");
        }
      });

      if (isOpen) {
        parent.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
        const submenu = parent.querySelector(".mobile-submenu");
        if (submenu) submenu.setAttribute("aria-hidden", "true");
      } else {
        parent.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        const submenu = parent.querySelector(".mobile-submenu");
        if (submenu) submenu.setAttribute("aria-hidden", "false");
      }
    });
  });

  // --- Desktop: mega menu hover ---
  document.querySelectorAll(".has-mega").forEach(item => {
    const link = item.querySelector(".nav-link");
    const menu = item.querySelector(".mega-menu");
    if (!link || !menu) return;
    let hoverTimeout;

    item.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 992) return;
      clearTimeout(hoverTimeout);
      document.querySelectorAll(".has-mega.open").forEach(h => { if (h !== item) h.classList.remove("open"); });
      item.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      link.setAttribute("aria-expanded", "true");
    });

    item.addEventListener("mouseleave", () => {
      if (window.innerWidth <= 992) return;
      hoverTimeout = setTimeout(() => {
        item.classList.remove("open");
        menu.setAttribute("aria-hidden", "true");
        link.setAttribute("aria-expanded", "false");
      }, 180);
    });
  });

  // --- Клик вне header — закрыть mobile и mega ---
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".site-header") && !e.target.closest("#mobile-menu")) {
      closeMobile();
      document.querySelectorAll(".has-mega.open").forEach(h => {
        h.classList.remove("open");
        const l = h.querySelector(".nav-link");
        if (l) l.setAttribute("aria-expanded", "false");
        const m = h.querySelector(".mega-menu");
        if (m) m.setAttribute("aria-hidden", "true");
      });
    }
  });

  // --- Тень шапки при скролле ---
  const scrollThreshold = 8;
  function checkScroll() { header.classList.toggle("scrolled", window.scrollY > scrollThreshold); }
  checkScroll();
  window.addEventListener("scroll", checkScroll);
}

