import { ExploreApp } from "@/components/explore/ExploreApp";

type SearchParamsInput = Promise<Record<string, string | string[] | undefined>>;

function firstParam(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | undefined {
  const v = sp[key];
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParamsInput;
}) {
  const sp = await searchParams;
  const step = firstParam(sp, "step");
  const mbti = firstParam(sp, "mbti")?.toUpperCase();

  return (
    <ExploreApp
      wantsMatches={step === "matches"}
      mbtiFromQuery={mbti}
    />
  );
}
