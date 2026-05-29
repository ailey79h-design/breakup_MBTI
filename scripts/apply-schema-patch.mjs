#!/usr/bin/env node
/**
 * explore_profiles 누락 컬럼(age_range 등) 적용
 *
 * 방법 A — DB 비밀번호 (권장):
 *   Dashboard > Project Settings > Database > Database password
 *   .env.local 에 SUPABASE_DB_PASSWORD=... 추가 후
 *   npm run db:patch
 *
 * 방법 B — Management API:
 *   $env:SUPABASE_ACCESS_TOKEN="sbp_..."
 *   npm run db:patch
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const projectRef =
  process.env.SUPABASE_PROJECT_REF?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

const accessToken = process.env.SUPABASE_ACCESS_TOKEN?.trim();
const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim();

const migrationFiles = [
  "002_profiles_auth.sql",
  "20260528140000_profile_privacy_gps.sql",
];

function readSql(file) {
  return fs.readFileSync(path.join(root, "supabase", "migrations", file), "utf8");
}

async function runViaManagementApi() {
  if (!accessToken || !projectRef) return false;
  const api = (p, init = {}) =>
    fetch(`https://api.supabase.com/v1${p}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

  for (const file of migrationFiles) {
    const sql = readSql(file);
    const res = await api(`/projects/${projectRef}/database/query`, {
      method: "POST",
      body: JSON.stringify({ query: sql }),
    });
    const body = await res.text();
    if (!res.ok) {
      if (/already exists|duplicate/i.test(body)) {
        console.log(`  ✓ ${file} (이미 적용됨)`);
        continue;
      }
      throw new Error(`${file}: ${res.status} ${body}`);
    }
    console.log(`  ✓ ${file}`);
  }
  return true;
}

async function runViaPostgres() {
  if (!dbPassword || !projectRef) return false;
  const { default: pg } = await import("pg");
  const client = new pg.Client({
    host: `db.${projectRef}.supabase.co`,
    port: 5432,
    user: "postgres",
    password: dbPassword,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    for (const file of migrationFiles) {
      const sql = readSql(file);
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    }
  } finally {
    await client.end();
  }
  return true;
}

async function main() {
  if (!projectRef) {
    console.error("NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_PROJECT_REF 가 필요합니다.");
    process.exit(1);
  }

  console.log(`프로젝트: ${projectRef}`);
  console.log("→ SQL 마이그레이션 적용…");

  if (await runViaManagementApi()) {
    console.log("\n완료 (Management API). npm run dev 재시작 후 다시 시도하세요.");
    return;
  }

  if (await runViaPostgres()) {
    console.log("\n완료 (Postgres). npm run dev 재시작 후 다시 시도하세요.");
    return;
  }

  console.error(`
마이그레이션을 자동 실행할 수 없습니다.

다음 중 하나를 설정한 뒤 다시 실행하세요:

1) .env.local 에 DB 비밀번호 추가
   SUPABASE_DB_PASSWORD=대시보드에서_복사한_비밀번호
   npm run db:patch

2) Management API 토큰
   SUPABASE_ACCESS_TOKEN=sbp_...
   npm run db:patch

3) Supabase SQL Editor에서 수동 실행
   https://supabase.com/dashboard/project/${projectRef}/sql/new
   파일: supabase/migrations/20260528140000_profile_privacy_gps.sql
`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
