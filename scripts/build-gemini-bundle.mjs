import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const header = `================================================================================
[Gemini에게 붙여 넣기] 말랑 이별 MBTI — 코드 번들 (전체 추출)
--------------------------------------------------------------------------------
• 배포: Vercel (예: https://breakup-mbti.vercel.app)
• 메인 화면·로직: public/breakup-mbti.html (정적 HTML + Tailwind CDN + ES Module)
• Next의 "/" 는 src/app/page.tsx 에서 ?r= ?id= 쿼리를 유지한 채 /breakup-mbti.html 로 redirect
• 결과 공유: ?r=Base64URL(JSON) 또는 (Firebase 설정 시) ?id=
• Gemini에게 물을 때 예시: "아래 웹앱 코드를 보고 UX·구조·공유·OG·성능·유지보수 개선안을 제안해줘."
================================================================================

`;

function section(title, relPath) {
  const abs = path.join(root, relPath);
  const body = fs.readFileSync(abs, "utf8");
  return `\n\n========== ${relPath} ==========\n\n${body}`;
}

const out =
  header +
  section("layout", "src/app/layout.tsx") +
  section("page", "src/app/page.tsx") +
  section("next.config", "next.config.ts") +
  section("메인 HTML 전체", "public/breakup-mbti.html");

const outPath = path.join(root, "GEMINI_REVIEW_BUNDLE.txt");
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote:", outPath, "bytes:", Buffer.byteLength(out, "utf8"));
