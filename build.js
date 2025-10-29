import fs from "fs";
import path from "path";

const srcDir = "src";
const distDir = "dist";

// создаём выходную папку
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

// === ЧТЕНИЕ ШАБЛОНОВ ===
const layoutPath = path.join(srcDir, "layouts", "layout.html");
const headerPath = path.join(srcDir, "partials", "header.html");
const footerPath = path.join(srcDir, "partials", "footer.html");
const seoPath = path.join(srcDir, "data", "seo.json");

const layout = fs.readFileSync(layoutPath, "utf-8");
const headerTemplate = fs.readFileSync(headerPath, "utf-8");
const footerTemplate = fs.readFileSync(footerPath, "utf-8");
const seoData = fs.existsSync(seoPath)
  ? JSON.parse(fs.readFileSync(seoPath, "utf-8"))
  : {};

// === ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ ===
const extraAssets = {
  about: {
    js: ["map.js"],
  },
  case: {
    css: ["cases.css"],
    js: ["cases.js"],
  },
  service: {
    css: ["services.css"],
    // js: ["services.js"],
  },
};

// === ФУНКЦИЯ ДЛЯ ВЫЧИСЛЕНИЯ ОТНОСИТЕЛЬНОГО ПУТИ ===
function getRelativePath(depth) {
  return depth === 0 ? "." : "../".repeat(depth).slice(0, -1);
}

// === УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ДЛЯ ГЕНЕРАЦИИ HTML ===
function generateHTML(options) {
  const {
    title,
    description,
    keywords,
    canonical,
    content,
    pageName,
    depth = 0,
  } = options;

  let cssLinks = "";
  let jsLinks = "";

  // префикс пути в зависимости от глубины
  const pathPrefix = getRelativePath(depth);

  // подставляем pathPrefix в header и footer
  const header = headerTemplate.replace(/\{\{pathPrefix\}\}/g, pathPrefix);
  const footer = footerTemplate.replace(/\{\{pathPrefix\}\}/g, pathPrefix);

  // базовые стили
  cssLinks += `<link rel="stylesheet" href="${pathPrefix}/css/style.css">\n`;
  cssLinks += `<link rel="stylesheet" href="${pathPrefix}/css/header-footer.css">\n`;
  cssLinks += `<link rel="stylesheet" href="${pathPrefix}/css/footer.css">\n`;

  // базовые скрипты
  jsLinks += `<script src="${pathPrefix}/js/header-footer.js"></script>\n`;

  // специфичные для страницы css/js
  const pageCss = path.join(srcDir, "css", `${pageName}.css`);
  const pageJs = path.join(srcDir, "js", `${pageName}.js`);

  if (fs.existsSync(pageCss))
    cssLinks += `<link rel="stylesheet" href="${pathPrefix}/css/${pageName}.css">\n`;

  if (fs.existsSync(pageJs))
    jsLinks += `<script src="${pathPrefix}/js/${pageName}.js"></script>\n`;

  // дополнительные css/js из extraAssets
  const extra = extraAssets[pageName];
  if (extra) {
    if (extra.css) {
      cssLinks +=
        extra.css
          .map((c) => `<link rel="stylesheet" href="${pathPrefix}/css/${c}">`)
          .join("\n") + "\n";
    }
    if (extra.js) {
      jsLinks +=
        extra.js
          .map((j) => `<script src="${pathPrefix}/js/${j}"></script>`)
          .join("\n") + "\n";
    }
  }

  return layout
    .replace("{{title}}", title)
    .replace("{{description}}", description)
    .replace("{{keywords}}", keywords || "КТЦ БелЖД, системы")
    .replace("{{canonical}}", canonical)
    .replace("{{header}}", header)
    .replace("{{footer}}", footer)
    .replace("{{content}}", content)
    .replace("{{styles}}", cssLinks)
    .replace("{{scripts}}", jsLinks);
}

// === РЕКУРСИВНАЯ ФУНКЦИЯ ДЛЯ ОБРАБОТКИ СТРАНИЦ ===
function buildPagesRecursive(sourceDir, outputDir, relativeDepth = 0) {
  if (!fs.existsSync(sourceDir)) return;

  const items = fs.readdirSync(sourceDir, { withFileTypes: true });

  items.forEach((item) => {
    const sourcePath = path.join(sourceDir, item.name);
    const outputPath = path.join(outputDir, item.name);

    if (item.isDirectory()) {
      fs.mkdirSync(outputPath, { recursive: true });
      buildPagesRecursive(sourcePath, outputPath, relativeDepth + 1);
    } else if (item.name.endsWith(".html")) {
      const pageName = path.parse(item.name).name;
      const pageContent = fs.readFileSync(sourcePath, "utf-8");

      // SEO из JSON
      const relativePath = path.relative(
        path.join(srcDir, "pages"),
        sourcePath
      );
      const seoKey =
        relativeDepth > 0
          ? `${path.dirname(relativePath).replace(path.sep, "_")}_${pageName}`
          : pageName;
      const seo = seoData[seoKey] || seoData[pageName] || {};

      const title = seo.title || `${pageName} — КТЦ БелЖД`;
      const description = seo.description || `Описание страницы ${pageName}`;
      const keywords = seo.keywords || "КТЦ БелЖД, системы";
      const canonical = seo.canonical || `/${relativePath.replace(/\\/g, "/")}`;

      const html = generateHTML({
        title,
        description,
        keywords,
        canonical,
        content: pageContent,
        pageName,
        depth: relativeDepth,
      });

      fs.writeFileSync(outputPath, html, "utf-8");
      console.log(
        `✅ Страница ${relativePath} собрана (глубина: ${relativeDepth})`
      );
    }
  });
}

// === ФУНКЦИЯ ДЛЯ ОБЫЧНЫХ СТРАНИЦ ===
function buildPages() {
  const pagesDir = path.join(srcDir, "pages");
  buildPagesRecursive(pagesDir, distDir, 0);
}

// === ФУНКЦИЯ ДЛЯ КЕЙСОВ ===
function buildCases() {
  const casesJsonPath = path.join(srcDir, "data", "cases.json");
  if (!fs.existsSync(casesJsonPath)) {
    console.log("⚠️ Файл cases.json не найден, пропускаем сборку кейсов");
    return;
  }

  const data = JSON.parse(fs.readFileSync(casesJsonPath, "utf-8"));
  const outDir = path.join(distDir, "cases");
  fs.mkdirSync(outDir, { recursive: true });

  for (const [key, c] of Object.entries(data)) {
    const seo = seoData[`case_${key}`] || {};
    const title = seo.title || `${c.shortTitle} — КТЦ БелЖД`;
    const description = seo.description || c.text;
    const keywords = seo.keywords || `${c.shortTitle}, кейс, КТЦ БелЖД`;
    const canonical = seo.canonical || `/cases/${key}.html`;

    const content = `
      <section class="case-card">
        <h1>${c.shortTitle}</h1>
        <div class="case-main">
          <img src="../${c.image}" alt="${c.shortTitle}">
          <div class="case-content">
            <h2 class="case-title">${c.title}</h2>
            <p class="case-description">${c.text}</p>
            <div class="tech-stack">${c.stack
              .map((s) => `<img src="../${s}" alt="">`)
              .join("")}</div>
          </div>
        </div>
        <div class="case-gallery">
          <button class="gallery-btn prev-btn" id="prevBtn" aria-label="Предыдущий">←</button>
          ${c.screenshots
            .map(
              (s, index) =>
                `<img class="gallery-img${
                  index === 0 ? " active" : ""
                }" src="../${s}" alt="">`
            )
            .join("")}
          <button class="gallery-btn next-btn" id="nextBtn" aria-label="Следующий">→</button>
        </div>
      </section>
    `;

    const html = generateHTML({
      title,
      description,
      keywords,
      canonical,
      content,
      pageName: "case",
      depth: 1,
    });

    fs.writeFileSync(path.join(outDir, `${key}.html`), html, "utf-8");
    console.log(`📄 Страница кейса ${c.title} создана (глубина: 1)`);
  }
}

// === ФУНКЦИЯ ДЛЯ УСЛУГ ===
function buildServices() {
  const servicesJsonPath = path.join(srcDir, "data", "services.json");
  if (!fs.existsSync(servicesJsonPath)) {
    console.log("⚠️ Файл services.json не найден, пропускаем сборку услуг");
    return;
  }

  const data = JSON.parse(fs.readFileSync(servicesJsonPath, "utf-8"));
  const outDir = path.join(distDir, "services");
  fs.mkdirSync(outDir, { recursive: true });

  for (const [key, service] of Object.entries(data)) {
    const seo = seoData[`service_${key}`] || {};
    const title = seo.title || `${service.subtitle} — КТЦ БелЖД`;
    const description = seo.description || service.summary;
    const keywords = seo.keywords || `${service.subtitle}, услуги, КТЦ БелЖД`;
    const canonical = seo.canonical || `/services/${key}.html`;

    const content = `
      <section class="service-layout">
        <section class="service-hero">
          <h1>${service.title}</h1>
        
          <div class="service-content">
            <img src="../${service.image}" alt="${service.subtitle}">
            <div class="service-content-text">
              <h2>${service.subtitle}</h2>
              <p>${service.summary}</p>
            </div>
          </div>
        </section>

        <section class="service-subitems">
          ${service.subitems
            .map(
              (item) => `
            <div class="subitem">
              <img src="../${item.image}" alt="${item.title}">
              <h3>${item.title}</h3>
              <p>${item.text}</p>
              <div class="tech">
                ${item.tech.map((t) => `<img src="../${t}" alt="">`).join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </section>
      </section>
    `;

    const html = generateHTML({
      title,
      description,
      keywords,
      canonical,
      content,
      pageName: "service",
      depth: 1,
    });

    fs.writeFileSync(path.join(outDir, `${key}.html`), html, "utf-8");
    console.log(`🛠️ Страница услуги ${service.subtitle} создана (глубина: 1)`);
  }
}

// === КОПИРОВАНИЕ СТАТИЧЕСКИХ РЕСУРСОВ ===
function copyStaticAssets() {
  const assetFolders = ["css", "js", "assets"];

  assetFolders.forEach((folder) => {
    const srcPath = path.join(srcDir, folder);
    const distPath = path.join(distDir, folder);

    if (fs.existsSync(srcPath)) {
      copyRecursive(srcPath, distPath, folder);
      console.log(`📁 Папка ${folder} скопирована`);
    }
  });
}

function copyRecursive(src, dest, folderType) {
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  entries.forEach((entry) => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath, folderType);
    } else {
      // Обработка CSS и JS файлов с заменой {{pathPrefix}}
      const needsProcessing =
        (folderType === "css" && entry.name.endsWith(".css")) ||
        (folderType === "js" && entry.name.endsWith(".js"));

      if (needsProcessing) {
        let fileContent = fs.readFileSync(srcPath, "utf-8");

        // Для CSS и JS всегда используем ".." (они в dist/css и dist/js)
        const pathPrefix = "..";

        // Заменяем все {{pathPrefix}} на актуальный путь
        fileContent = fileContent.replace(/\{\{pathPrefix\}\}/g, pathPrefix);

        fs.writeFileSync(destPath, fileContent, "utf-8");
      } else {
        // Просто копируем остальные файлы
        fs.copyFileSync(srcPath, destPath);
      }
    }
  });
}

// === ЗАПУСК ВСЕХ СБОРЩИКОВ ===
console.log("🚀 Начинаем сборку...\n");

copyStaticAssets();
console.log("");

buildPages();
buildCases();
buildServices();

console.log("\n✨ Сборка завершена!");
