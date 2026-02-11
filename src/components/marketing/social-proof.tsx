/* SocialProof — Thin proof bar highlighting who LinkNest is built for.
   Server component. */

export default function SocialProof() {
  const audiences = [
    { label: "Creators", gradient: "from-coral to-amber" },
    { label: "Founders", gradient: "from-teal to-indigo" },
    { label: "Freelancers", gradient: "from-lavender to-slate" },
    { label: "Artists", gradient: "from-amber to-coral" },
    { label: "Small Brands", gradient: "from-indigo to-teal" },
  ];

  return (
    <section className="border-y border-[rgba(0,0,0,0.04)] bg-cloud py-8 sm:py-10">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
          <p className="text-[14px] font-medium tracking-[0.02em] text-slate">
            Built for people who care about how they show up online
          </p>

          {/* Audience pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {audiences.map((a) => (
              <div
                key={a.label}
                className="flex items-center gap-2 rounded-full border border-[rgba(0,0,0,0.06)] bg-white px-3 py-1.5 transition-all duration-200 hover:-translate-y-px hover:shadow-[var(--shadow-sm)]"
              >
                <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${a.gradient}`} />
                <span className="text-[13px] font-medium text-charcoal">
                  {a.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
