/* Features — 6-card grid with inline SVG icons (1.5px stroke per brand §6).
   Brand §7: "Every detail. Your way." Server component. */

export default function Features() {
  const features = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
          <path d="M3.74 15.5a9 9 0 0 1 16.52 0M9.74 15.5a5 5 0 0 1 4.52 0" />
          <rect x="14" y="18" width="4" height="4" rx="1" />
          <rect x="6" y="18" width="4" height="4" rx="1" />
        </svg>
      ),
      title: "Custom Colors & Fonts",
      description: "Full brand customization with unlimited color palettes and 30+ Google Fonts. Your page, your identity.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      ),
      title: "8 Handcrafted Templates",
      description: "Start with a designer-quality template, then make it yours. From minimal to bold, there\u2019s a look for every brand.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-5 5" />
        </svg>
      ),
      title: "Analytics That Help",
      description: "Track your page views over time. Free users get 7-day stats, Pro users get 90 days of data to understand what\u2019s working.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: "Fast by Default",
      description: "Built on Next.js and modern infrastructure so your pages load quickly. No bloat, no unnecessary scripts.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16M4 12h10M4 18h14" />
          <rect x="18" y="4" width="2" height="4" rx="0.5" />
          <rect x="12" y="16" width="2" height="4" rx="0.5" />
        </svg>
      ),
      title: "Rich Content Blocks",
      description: "Links, headings, text, images, and dividers\u2014build your page with flexible blocks that tell your story.",
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      ),
      title: "Mobile-First",
      description: "Looks perfect on every device. No pinch-to-zoom, no broken layouts, no compromises.",
    },
  ];

  return (
    <section id="features" className="bg-sand py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.15] tracking-[-0.01em] text-indigo">
            Every detail. Your way.
          </h2>
          <p className="mt-4 text-lg text-slate">
            The customization you need without the complexity you don&apos;t.
          </p>
        </div>

        {/* Features grid — brand §6 card style: 16px radius, shadow-sm, hover lift */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[16px] border border-[rgba(0,0,0,0.06)] bg-white p-8 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-coral/10 text-coral">
                {feature.icon}
              </div>
              <h3 className="mt-5 text-lg font-bold text-indigo">
                {feature.title}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
