import chokidar from "chokidar";
import { exec } from "child_process";

console.log("👀 Watching src/ for changes...");
console.log("💡 Use Live Server extension to preview changes\n");

const watcher = chokidar.watch("src", {
  ignored: /(^|[\/\\])\../,
  persistent: true,
  ignoreInitial: false,
});

let isBuilding = false;
let buildQueued = false;

function rebuild() {
  if (isBuilding) {
    buildQueued = true;
    return;
  }

  isBuilding = true;
  const startTime = Date.now();

  exec("node build.js", (error, stdout, stderr) => {
    const duration = Date.now() - startTime;

    if (error) {
      console.error(`\n❌ Build failed (${duration}ms):`);
      console.error(error.message);
      isBuilding = false;
      return;
    }

    if (stderr) {
      console.error(`⚠️ ${stderr}`);
    }

    console.log(stdout);
    console.log(`⚡ Rebuilt in ${duration}ms\n`);

    isBuilding = false;

    // Если были изменения во время сборки, пересобираем
    if (buildQueued) {
      buildQueued = false;
      setTimeout(rebuild, 100);
    }
  });
}

watcher.on("ready", () => {
  console.log("✅ Initial build complete. Watching for changes...\n");
});

watcher.on("all", (event, filePath) => {
  if (event === "add" || event === "change" || event === "unlink") {
    console.log(`📝 ${event}: ${filePath}`);
    rebuild();
  }
});
