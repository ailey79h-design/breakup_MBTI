import { redirect } from "next/navigation";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

function firstParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const sp = await searchParams;
  const q = new URLSearchParams();
  const r = firstParam(sp, "r");
  const id = firstParam(sp, "id");
  if (r) q.set("r", r);
  if (id) q.set("id", id);
  const qs = q.toString();
  redirect(qs ? `/breakup-mbti.html?${qs}` : "/breakup-mbti.html");
}
