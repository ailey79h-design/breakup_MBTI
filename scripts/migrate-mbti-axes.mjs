import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, "..", "public", "breakup-mbti.html");

const CODE_MAP = {
  ERHC: "ENTP",
  ERHA: "ENTJ",
  ERLC: "ENFP",
  ERLA: "ENFJ",
  ESHC: "ESTP",
  ESHA: "ESTJ",
  ESLC: "ESFP",
  ESLA: "ESFJ",
  IRHC: "INTP",
  IRHA: "INTJ",
  IRLC: "INFP",
  IRLA: "INFJ",
  ISHC: "ISTP",
  ISHA: "ISTJ",
  ISLC: "ISFP",
  ISLA: "ISFJ",
};

let html = fs.readFileSync(filePath, "utf8");

const pairs = [
  ['type: "RS"', 'type: "NS"'],
  ['type: "SR"', 'type: "SN"'],
  ['type: "HL"', 'type: "TF"'],
  ['type: "LH"', 'type: "FT"'],
  ['type: "CA"', 'type: "PJ"'],
  ['type: "AC"', 'type: "JP"'],
];

for (const [from, to] of pairs) {
  html = html.split(from).join(to);
}

for (const [from, to] of Object.entries(CODE_MAP)) {
  html = html.split(from).join(to);
}

html = html.replace(
  "const SCORE_KEYS = ['E', 'I', 'R', 'S', 'H', 'L', 'C', 'A'];",
  "const SCORE_KEYS = ['E', 'I', 'N', 'S', 'T', 'F', 'P', 'J'];",
);

html = html.replace(
  'let s = { E: 0, I: 0, R: 0, S: 0, H: 0, L: 0, C: 0, A: 0 };',
  "let s = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, P: 0, J: 0 };",
);

html = html.replace(
  '(s.E >= s.I ? "E" : "I") + (s.R >= s.S ? "R" : "S") + (s.H >= s.L ? "H" : "L") + (s.C >= s.A ? "C" : "A")',
  '(s.E >= s.I ? "E" : "I") + (s.N >= s.S ? "N" : "S") + (s.T >= s.F ? "T" : "F") + (s.P >= s.J ? "P" : "J")',
);

html = html.replace(
  "{ l: 'R', r: 'S', label: '극복 방식', sl: '새로운 만남', sr: '혼자만의 시간' },",
  "{ l: 'N', r: 'S', label: '극복 방식', sl: '새로운 만남', sr: '혼자만의 시간' },",
);

html = html.replace(
  "{ l: 'H', r: 'L', label: '미련 온도', sl: '뜨거운 집착', sr: '차가운 해탈' },",
  "{ l: 'T', r: 'F', label: '미련 온도', sl: '뜨거운 집착', sr: '차가운 해탈' },",
);

html = html.replace(
  "{ l: 'C', r: 'A', label: '종결 스타일', sl: '확실한 대화', sr: '조용한 회피' }",
  "{ l: 'P', r: 'J', label: '종결 스타일', sl: '확실한 대화', sr: '조용한 회피' }",
);

fs.writeFileSync(filePath, html, "utf8");
console.log("Migrated breakup-mbti.html to E/I, N/S, T/F, P/J");
