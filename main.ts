// Leonida Trophy Atlas — the hand-in program (Node 22, standard library only).
// The guide itself is plain static files under app/ (index.html, style.css,
// app.js, data/trophies.json) plus 3 or 4 real screenshots under screenshots/.
// This program copies both folders into the output directory the grader
// hands it and writes dossier.json there, using the vendored make.fun
// library. The library file vendor/makefun-frontend.ts is the kit's copy and
// must stay byte for byte as handed out — the scorer rebuilds the dossier
// with its own copy and compares.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { buildDossier } from "./vendor/makefun-frontend.ts";
import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

// The repository root is the folder this file sits in.
const repoRoot = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

// Copy the guide, then the screenshots, then write the dossier from what
// was copied — so the dossier always describes the exact files handed in.
mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, "app"), join(outputDir, "app"), { recursive: true });

const shotsOut = join(outputDir, "screenshots");
mkdirSync(shotsOut, { recursive: true });
const shotsIn = join(repoRoot, "screenshots");
if (existsSync(shotsIn)) {
  cpSync(shotsIn, shotsOut, { recursive: true });
}

const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
