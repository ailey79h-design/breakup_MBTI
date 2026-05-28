export function LandingHero() {
  return (
    <section className="flex flex-col items-center text-center fade-in">
      <div className="relative mb-10">
        <div className="w-32 h-32 bg-white rounded-[3rem] shadow-xl flex items-center justify-center rotate-6 dark:bg-slate-800">
          <span className="text-6xl" role="img" aria-hidden>
            🎀
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center home-icon-bounce dark:bg-rose-900/40">
          <span className="text-xl" role="img" aria-hidden>
            💌
          </span>
        </div>
      </div>

      <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-4 leading-tight">
        우리 헤어지던 날,
        <br />
        <span className="text-rose-500">당신의 온도는?</span>
      </h1>

      <p className="text-slate-400 text-sm mb-10 leading-relaxed">
        나만 진심이었을까? 아님 우리 둘 다?
        <br />
        12문항으로 알아보는 말랑말랑 이별 성향 테스트
      </p>
    </section>
  );
}
