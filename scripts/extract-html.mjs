/**
 * public/*.html 전체를 하나의 텍스트 파일로 묶어 외부 검토·백업용으로 둡니다.
 * 실행: node scripts/extract-html.mjs  또는  npm run extract:html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const files = ["public/breakup-mbti.html", "public/index.html"];

const header = `================================================================================
HTML 추출 번들 — 말랑 이별 MBTI (public 정적 페이지 전체)
--------------------------------------------------------------------------------
• 배포 시 동일 파일은 사이트 루트 기준 /breakup-mbti.html , /index.html 로 제공됩니다.
• 생성 시각: ${new Date().toISOString()}
================================================================================

`;

let out = header;
for (const rel of files) {
  const abs = path.join(root, rel);
  out += `\n\n========== ${rel} ==========\n\n`;
  out += fs.readFileSync(abs, "utf8");
}

const outPath = path.join(root, "HTML_EXTRACT.txt");
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote:", outPath, "bytes:", Buffer.byteLength(out, "utf8"));
