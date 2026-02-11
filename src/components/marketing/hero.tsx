/* Hero — Split layout: text left, phone mockup right.
   Follows brand-system.md §7 Hero Section spec.
   Server component — zero client JS. */

import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 lg:pt-40 lg:pb-24">
      {/* Subtle radial gradient background per brand */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(232,97,77,0.04) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(232,224,240,0.3) 0%, transparent 50%)",
        }}
      />

      <div className="relative mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ─── Left: Text Content ─── */}
          <div className="max-w-[600px]">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-lavender px-4 py-1.5 text-[13px] font-medium text-indigo">
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" aria-hidden="true" />
              Free to start
            </div>

            {/* H1 — DM Serif Display, -0.02em tracking, brand sizes */}
            <h1 className="mt-8 font-serif text-[clamp(40px,6vw,72px)] leading-[1.08] tracking-[-0.02em] text-indigo">
              Your links deserve a{" "}
              <span className="text-coral">home.</span>
            </h1>

            {/* Subtitle — 19px, Slate, relaxed leading */}
            <p className="mt-6 max-w-[480px] text-[19px] leading-relaxed text-slate">
              Create a beautiful, fast link-in-bio page in minutes. No code. No clutter. Just you, looking your best online.
            </p>

            {/* CTAs — brand button specs: 14px 32px padding, 10px radius */}
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-[10px] bg-coral px-8 py-3.5 text-[15px] font-bold tracking-[0.02em] text-white transition-all duration-200 hover:-translate-y-px hover:bg-coral-hover hover:shadow-[0_4px_16px_rgba(232,97,77,0.3)] active:translate-y-0 active:bg-coral-active"
              >
                Create Your LinkNest — Free
              </Link>
              <a
                href="#templates"
                className="inline-flex items-center justify-center rounded-[10px] border-[1.5px] border-mist px-8 py-3.5 text-[15px] font-medium text-indigo transition-all duration-200 hover:border-indigo hover:bg-[rgba(26,26,46,0.03)]"
              >
                See examples
              </a>
            </div>
          </div>

          {/* ─── Right: Phone Mockup ─── */}
          <div className="relative flex items-center justify-center">
            {/* Floating decoration circles */}
            <div
              className="pointer-events-none absolute -top-6 -right-6 h-[400px] w-[400px] rounded-full border border-coral/10 animate-float"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-6 -left-6 h-[500px] w-[500px] rounded-full border border-lavender/50 animate-float-reverse"
              aria-hidden="true"
            />

            {/* Phone frame — perspective + subtle rotation per showcase mock */}
            <div
              className="relative z-10 w-[300px] rounded-[32px] border border-[rgba(0,0,0,0.06)] bg-white p-5 transition-transform duration-[600ms] shadow-[0_8px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] hover:[transform:perspective(1000px)_rotateY(0deg)_rotateX(0deg)]"
              style={{
                transform: "perspective(1000px) rotateY(-5deg) rotateX(2deg)",
              }}
            >
              {/* Notch */}
              <div className="mx-auto mb-5 h-6 w-24 rounded-xl bg-cloud" />

              {/* Avatar */}
              <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-coral to-amber" />

              {/* Name & Bio */}
              <div className="mt-3 text-center">
                <p className="text-base font-bold text-indigo">@creativestudio</p>
                <p className="mt-0.5 text-[13px] text-slate">Design &amp; branding for modern brands</p>
              </div>

              {/* Link blocks — varied styles matching showcase */}
              <div className="mt-5 space-y-2.5 px-1">
                <div className="rounded-[10px] bg-indigo px-4 py-3.5 text-center text-[14px] font-medium text-white transition-transform duration-200 hover:-translate-y-px">
                  View Portfolio
                </div>
                <div className="rounded-[10px] bg-lavender px-4 py-3.5 text-center text-[14px] font-medium text-indigo transition-transform duration-200 hover:-translate-y-px">
                  Book a Call
                </div>
                <div className="rounded-[10px] border-[1.5px] border-mist px-4 py-3.5 text-center text-[14px] font-medium text-indigo transition-transform duration-200 hover:-translate-y-px">
                  Latest Project
                </div>
                <div className="rounded-[10px] bg-sand px-4 py-3.5 text-center text-[14px] font-medium text-indigo transition-transform duration-200 hover:-translate-y-px">
                  Shop Prints
                </div>
              </div>

              {/* Made with badge — matches real product */}
              <div className="mt-5 text-center">
                <span className="text-[11px] text-mist">Made with LinkNest</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
