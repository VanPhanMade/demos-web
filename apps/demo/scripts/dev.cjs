const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const appRoot = path.resolve(__dirname, "..");
const distMain = path.join(appRoot, "dist-electron", "main.js");
const processes = [];

function startProcess(command, args, env = {}) {
  const child = spawn(command, args, {
    cwd: appRoot,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      ...env
    }
  });

  processes.push(child);
  child.on("exit", (code) => {
    if (code !== 0) {
      shutdown(code ?? 1);
    }
  });

  return child;
}

function shutdown(code = 0) {
  while (processes.length > 0) {
    const child = processes.pop();
    if (child && !child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

startProcess("npm", ["exec", "--", "vite"], {
  BROWSER: "none"
});
startProcess("npm", ["exec", "--", "tsc", "-p", "tsconfig.electron.json", "--watch", "--preserveWatchOutput"]);

const bootElectron = () => {
  if (!fs.existsSync(distMain)) {
    setTimeout(bootElectron, 500);
    return;
  }

  startProcess("npm", ["exec", "--", "electron", distMain], {
    VITE_DEV_SERVER_URL: "http://127.0.0.1:5173"
  });
};

bootElectron();

