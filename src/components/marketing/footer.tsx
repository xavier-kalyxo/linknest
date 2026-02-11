/* Footer — Deep indigo background, brand logo, link columns, copyright.
   Server component. */

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-indigo pt-16 pb-8">
      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        {/* Main footer content */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              {/* Logo — coral circle with white stroke rings (matches nav) */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="16" cy="16" r="14" fill="white" />
                <circle cx="16" cy="16" r="10" fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
                <circle cx="16" cy="16" r="6" fill="none" stroke="white" strokeWidth="1.5" opacity="0.3" />
              </svg>
              <span className="font-serif text-xl text-white">
                LinkNest
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Made for creators who care.
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-[13px] font-bold tracking-[0.04em] uppercase text-white/90">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Features", href: "#features" },
                { label: "Templates", href: "#templates" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="text-[13px] font-bold tracking-[0.04em] uppercase text-white/90">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "About", href: "/about" },
                { label: "Blog", href: "/blog" },
                { label: "Support", href: "/support" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-[13px] font-bold tracking-[0.04em] uppercase text-white/90">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/60 transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-white/50">
              &copy; {new Date().getFullYear()} LinkNest. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-white/50 transition-colors duration-200 hover:text-white"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-white/50 transition-colors duration-200 hover:text-white"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
