/* Nav — Fixed glassmorphic navbar with brand logo, anchor links, and CTA.
   Server component. Mobile menu via <details>/<summary> (zero JS). */

import Link from "next/link";

export default function Nav() {
  return (
    <nav
      aria-label="Main navigation"
      className="glass fixed top-0 left-0 right-0 z-50 border-b border-[rgba(0,0,0,0.04)]"
    >
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo — coral circle with nested rings (brand mark) */}
          <Link href="/" className="flex items-center gap-2.5">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle cx="16" cy="16" r="14" fill="#E8614D" />
              <circle cx="16" cy="16" r="11" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
              <circle cx="16" cy="16" r="7" stroke="rgba(255,255,255,0.5)" strokeWidth="2" fill="none" />
            </svg>
            <span className="font-serif text-xl text-indigo">
              LinkNest
            </span>
          </Link>

          {/* Desktop nav links — 15px, 500 weight, 0.01em tracking per brand */}
          <div className="hidden items-center gap-7 md:flex">
            {["Features", "Templates", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-[15px] font-medium tracking-[0.01em] text-slate transition-colors duration-200 hover:text-indigo"
              >
                {item}
              </a>
            ))}
            <Link
              href="/login"
              className="text-[15px] font-medium tracking-[0.01em] text-slate transition-colors duration-200 hover:text-indigo"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-[10px] bg-coral px-7 py-2.5 text-[15px] font-bold tracking-[0.02em] text-white transition-all duration-200 hover:-translate-y-px hover:bg-coral-hover hover:shadow-[0_4px_16px_rgba(232,97,77,0.3)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger menu */}
          <details className="group relative md:hidden">
            <summary className="flex cursor-pointer items-center text-slate [&::-webkit-details-marker]:hidden list-none">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="sr-only">Menu</span>
            </summary>
            <div className="absolute right-0 top-12 w-56 rounded-[16px] border border-[rgba(0,0,0,0.06)] bg-white p-3 shadow-[var(--shadow-md)]">
              {["Features", "Templates", "Pricing", "FAQ"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block rounded-lg px-4 py-2.5 text-[15px] font-medium text-slate transition-colors hover:bg-cloud hover:text-indigo"
                >
                  {item}
                </a>
              ))}
              <div className="mt-2 border-t border-mist/40 pt-3 space-y-2">
                <Link
                  href="/login"
                  className="block rounded-lg px-4 py-2.5 text-center text-[15px] font-medium text-slate transition-colors hover:bg-cloud hover:text-indigo"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block rounded-[10px] bg-coral px-4 py-2.5 text-center text-[15px] font-bold tracking-[0.02em] text-white transition-colors hover:bg-coral-hover"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </nav>
  );
}
