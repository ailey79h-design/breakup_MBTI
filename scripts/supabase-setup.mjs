#!/usr/bin/env node
/**
 * Supabase 원클릭 설정 (Management API)
 *
 * 1) https://supabase.com/dashboard/account/tokens 에서 Access Token 발급
 * 2) 프로젝트 URL의 ref 확인 (예: abcdefghijklmnop)
 *
 * 실행:
 *   set SUPABASE_ACCESS_TOKEN=sbp_...
 *   set SUPABASE_PROJECT_REF=your-ref
 *   node scripts/supabase-setup.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();

if (!token || !projectRef) {
  console.error(`
[필요] 환경 변수:
  SUPABASE_ACCESS_TOKEN  — Dashboard > Account > Access Tokens
  SUPABASE_PROJECT_REF   — 프로젝트 URL: https://supabase.com/dashboard/project/<REF>

예 (PowerShell):
  $env:SUPABASE_ACCESS_TOKEN="sbp_xxxx"
  $env:SUPABASE_PROJECT_REF="abcdefghijklmnop"
  node scripts/supabase-setup.mjs
`);
  process.exit(1);
}

const api = (p, init = {}) =>
  fetch(`https://api.supabase.com/v1${p}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

async function main() {
  console.log("→ 프로젝트 정보 조회…");
  const projRes = await api(`/projects/${projectRef}`);
  if (!projRes.ok) {
    throw new Error(`프로젝트 조회 실패: ${projRes.status} ${await projRes.text()}`);
  }
  const project = await projRes.json();

  console.log("→ API 키 조회…");
  const keysRes = await api(`/projects/${projectRef}/api-keys`);
  if (!keysRes.ok) {
    throw new Error(`API 키 조회 실패: ${keysRes.status} ${await keysRes.text()}`);
  }
  const keys = await keysRes.json();
  const anon = keys.find((k) => k.name === "anon" || k.name === "anon key")?.api_key;
  const service = keys.find((k) => k.name === "service_role" || k.name === "service_role key")?.api_key;
  if (!anon || !service) {
    throw new Error("anon 또는 service_role 키를 찾지 못했습니다.");
  }

  const supabaseUrl = `https://${projectRef}.supabase.co`;

  console.log("→ Auth 설정 (익명 + 이메일, redirect URL)…");
  const authPatch = await api(`/projects/${projectRef}/config/auth`, {
    method: "PATCH",
    body: JSON.stringify({
      site_url: "http://localhost:3000",
      additional_redirect_urls: [
        "http://localhost:3000/auth/callback",
        "https://breakup-mbti.vercel.app/auth/callback",
        "http://localhost:3000/explore",
        "https://breakup-mbti.vercel.app/explore",
      ],
      external_anonymous_users_enabled: true,
      mailer_autoconfirm: true,
    }),
  });
  if (!authPatch.ok) {
    console.warn("Auth PATCH 경고:", authPatch.status, await authPatch.text());
    console.warn("대시보드에서 수동 설정: Anonymous + Email OTP + Redirect URLs");
  }

  console.log("→ SQL 마이그레이션 실행…");
  const migrationFiles = [
    "20260528120000_explore_profiles.sql",
    "20260528140000_profile_privacy_gps.sql",
  ];
  for (const file of migrationFiles) {
    const sqlPath = path.join(root, "supabase", "migrations", file);
    const sql = fs.readFileSync(sqlPath, "utf8");
    const queryRes = await api(`/projects/${projectRef}/database/query`, {
      method: "POST",
      body: JSON.stringify({ query: sql }),
    });
    if (!queryRes.ok) {
      const body = await queryRes.text();
      if (body.includes("already exists") || body.includes("duplicate")) {
        console.warn(`  ${file}: 이미 적용됨 (건너뜀)`);
        continue;
      }
      throw new Error(`SQL 실행 실패 (${file}): ${queryRes.status} ${body}`);
    }
    console.log(`  ✓ ${file}`);
  }

  console.log("→ .env.local 업데이트…");
  const envPath = path.join(root, ".env.local");
  let env = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const lines = {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
  };
  for (const [key, val] of Object.entries(lines)) {
    const re = new RegExp(`^${key}=.*$`, "m");
    const line = `${key}=${val}`;
    env = re.test(env) ? env.replace(re, line) : `${env.trimEnd()}\n${line}\n`;
  }
  if (!env.includes("KAKAO_JAVASCRIPT_KEY") && fs.existsSync(envPath)) {
    /* keep existing */
  }
  fs.writeFileSync(envPath, env.endsWith("\n") ? env : env + "\n", "utf8");

  console.log(`
완료: ${project.name ?? projectRef}
  URL: ${supabaseUrl}
  .env.local 저장됨

다음:
  1) npm run dev 재시작
  2) http://localhost:3000/explore
  3) Vercel에도 동일 3개 env + SUPABASE_SERVICE_ROLE_KEY 설정 후 Redeploy
`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
