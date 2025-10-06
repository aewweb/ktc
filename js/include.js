document.addEventListener("DOMContentLoaded", () => {
  loadPartial("header", "partials/header.html", initHeader);
  loadPartial("footer", "partials/footer.html");
});

function loadPartial(id, file, callback) {
  fetch(file)
    .then((resp) => {
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      return resp.text();
    })
    .then((html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
      if (typeof callback === "function") callback();
    })
    .catch((err) => {
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

  // === DESKTOP: Mega menu hover ===
  document.querySelectorAll(".has-mega").forEach((item) => {
    const link = item.querySelector(".nav-link");
    const menu = item.querySelector(".mega-menu");
    if (!link || !menu) return;

    let hoverTimeout;

    item.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 992) return;
      clearTimeout(hoverTimeout);

      // Закрываем другие открытые меню
      document.querySelectorAll(".has-mega.open").forEach((h) => {
        if (h !== item) {
          h.classList.remove("open");
          const l = h.querySelector(".nav-link");
          if (l) l.setAttribute("aria-expanded", "false");
          const m = h.querySelector(".mega-menu");
          if (m) m.setAttribute("aria-hidden", "true");
        }
      });

      // Открываем текущее меню
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

        if (!anyOpen && desktopOverlay)
          desktopOverlay.classList.remove("visible");
      }, 180);
    });
  });

  // === DESKTOP: Submenu hover (второй уровень, улучшенный) ===
  document.querySelectorAll(".mega-links .has-sub").forEach((item) => {
    const submenuId = item.getAttribute("data-submenu");
    if (!submenuId) return;

    const megaMenu = item.closest(".mega-menu");
    if (!megaMenu) return;
    const submenuArea = megaMenu.querySelector(".mega-submenu-area");
    if (!submenuArea) return;

    let showTimeout, hideTimeout;
    const hoverDelay = 200;

    function showSubmenu() {
      clearTimeout(hideTimeout);
      clearTimeout(showTimeout);

      showTimeout = setTimeout(() => {
        // скрываем все
        submenuArea
          .querySelectorAll(".submenu-content")
          .forEach((c) => c.classList.remove("active"));
        megaMenu
          .querySelectorAll(".has-sub")
          .forEach((sub) => sub.classList.remove("active"));

        // активируем текущий
        const targetContent = submenuArea.querySelector(
          `[data-submenu-id="${submenuId}"]`
        );
        if (targetContent) targetContent.classList.add("active");
        item.classList.add("active");
      }, hoverDelay);
    }

    function hideSubmenu() {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);

      hideTimeout = setTimeout(() => {
        if (!item.matches(":hover") && !submenuArea.matches(":hover")) {
          item.classList.remove("active");
          submenuArea
            .querySelectorAll(".submenu-content")
            .forEach((c) => c.classList.remove("active"));
        }
      }, hoverDelay);
    }

    item.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 992) return;
      showSubmenu();
    });

    item.addEventListener("mouseleave", () => {
      if (window.innerWidth <= 992) return;
      hideSubmenu();
    });

    submenuArea.addEventListener("mouseenter", () => {
      if (window.innerWidth <= 992) return;
      clearTimeout(hideTimeout);
    });

    submenuArea.addEventListener("mouseleave", () => {
      if (window.innerWidth <= 992) return;
      hideSubmenu();
    });
  });

  // Закрытие по клику на overlay
  if (desktopOverlay) {
    desktopOverlay.addEventListener("click", () => {
      document.querySelectorAll(".has-mega.open").forEach((h) => {
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
    console.warn(
      "initHeader: отсутствуют ключевые элементы header/menu/overlay"
    );
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

  function directChild(parent, selector) {
    for (let i = 0; i < parent.children.length; i++) {
      const c = parent.children[i];
      if (c.matches && c.matches(selector)) return c;
    }
    return null;
  }

  function directChildren(parent, selector) {
    const res = [];
    for (let i = 0; i < parent.children.length; i++) {
      const c = parent.children[i];
      if (c.matches && c.matches(selector)) res.push(c);
    }
    return res;
  }

  // --- Mobile accordion (подменю) ---
  document
    .querySelectorAll(".mobile-has-sub > .mobile-sub-toggle")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const parent = btn.closest(".mobile-has-sub");
        if (!parent) return;
        const submenu = directChild(parent, ".mobile-submenu");
        const isOpen = parent.classList.contains("open");

        if (isOpen) {
          parent.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
          if (submenu) submenu.setAttribute("aria-hidden", "true");

          parent.querySelectorAll(".mobile-has-sub.open").forEach((desc) => {
            desc.classList.remove("open");
            const tb = directChild(desc, ".mobile-sub-toggle");
            if (tb) tb.setAttribute("aria-expanded", "false");
            const ss = directChild(desc, ".mobile-submenu");
            if (ss) ss.setAttribute("aria-hidden", "true");
          });
        } else {
          const container = parent.parentElement;
          if (container) {
            directChildren(container, ".mobile-has-sub.open").forEach((sib) => {
              if (sib !== parent) {
                sib.classList.remove("open");
                const tb = directChild(sib, ".mobile-sub-toggle");
                if (tb) tb.setAttribute("aria-expanded", "false");
                const ss = directChild(sib, ".mobile-submenu");
                if (ss) ss.setAttribute("aria-hidden", "true");

                sib.querySelectorAll(".mobile-has-sub.open").forEach((ch) => {
                  ch.classList.remove("open");
                  const t2 = directChild(ch, ".mobile-sub-toggle");
                  if (t2) t2.setAttribute("aria-expanded", "false");
                  const s2 = directChild(ch, ".mobile-submenu");
                  if (s2) s2.setAttribute("aria-hidden", "true");
                });
              }
            });
          }
          parent.classList.add("open");
          btn.setAttribute("aria-expanded", "true");
          if (submenu) submenu.setAttribute("aria-hidden", "false");
        }
      });
    });

  // --- Клик вне header — закрыть mobile и mega ---
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".site-header") &&
      !e.target.closest("#mobile-menu")
    ) {
      closeMobile();
      document.querySelectorAll(".has-mega.open").forEach((h) => {
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
  function checkScroll() {
    header.classList.toggle("scrolled", window.scrollY > scrollThreshold);
  }
  checkScroll();
  window.addEventListener("scroll", checkScroll);
}
