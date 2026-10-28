// Génère dist/ : le client seul, à déposer sur un hébergement statique (ex. OVH /www/undercover/),
// relié au serveur de jeu Node hébergé ailleurs.
// Usage : node scripts/build-static.js https://mon-serveur-undercover.onrender.com
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const SOCKET_IO_CDN = "https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.min.js";

const server = (process.argv[2] || "").replace(/\/+$/, "");
if (!/^https?:\/\/[^/]+$/.test(server)) {
  console.error("Usage : node scripts/build-static.js https://adresse-du-serveur");
  process.exit(1);
}

rmSync("dist", { recursive: true, force: true });
cpSync("public", "dist", { recursive: true });
const html = readFileSync("dist/index.html", "utf8");
const local = '<script src="socket.io/socket.io.js"></script>';
if (!html.includes(local)) throw new Error("Balise socket.io introuvable dans public/index.html");
writeFileSync(
  "dist/index.html",
  html.replace(local, `<script src="${SOCKET_IO_CDN}"></script>\n  <script>window.UNDERCOVER_SERVER = ${JSON.stringify(server)};</script>`),
);
console.log(`dist/ prêt, relié à ${server}`);
