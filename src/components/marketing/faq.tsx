/* FAQ — 8-question accordion using native <details>/<summary> (zero JS).
   Accessible by default: keyboard-navigable, screen-reader friendly.
   Server component. */

export default function FAQ() {
  const faqs = [
    {
      question: "What is LinkNest?",
      answer:
        "LinkNest is a link-in-bio tool that helps creators, founders, and brands share all their important links in one beautiful page. Think of it as your professional homepage on the internet.",
    },
    {
      question: "Is LinkNest really free?",
      answer:
        "Yes! Our Free plan includes unlimited links, 6 gorgeous templates, basic analytics, and everything you need to get started. You can upgrade to Pro anytime for advanced features like extra templates, full color customization, and removing our badge.",
    },
    {
      question: "What can I put on my page?",
      answer:
        "Links, headings, text blocks, images, and dividers. You can add unlimited links on any plan and arrange your content however you like with our visual editor.",
    },
    {
      question: "How much customization do I get?",
      answer:
        "Full control. Choose from 8 templates, then customize colors, fonts, spacing, button styles, and more. Our visual editor gives you brand-level customization without touching code.",
    },
    {
      question: "Do you have analytics?",
      answer:
        "Yes! Free users get 7-day page view tracking. Pro users get 90 days of analytics so you can see how your page is performing over time.",
    },
    {
      question: 'Can I remove the "Made with LinkNest" badge?',
      answer:
        "Pro users can remove the badge completely. Free users keep the small badge at the bottom of their page\u2014it helps us grow while keeping the service free for everyone.",
    },
    {
      question: "How fast are LinkNest pages?",
      answer:
        "Really fast. LinkNest is built on Next.js with modern infrastructure, so your pages load quickly with no unnecessary bloat.",
    },
    {
      question: "Can I cancel Pro anytime?",
      answer:
        "Of course. No contracts, no commitments. If you cancel, you keep Pro features until the end of your billing period, then revert to the Free plan. Your page stays live either way.",
    },
  ];

  return (
    <section id="faq" className="bg-cloud py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[720px] px-5 sm:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-serif text-[clamp(28px,4vw,44px)] leading-[1.15] tracking-[-0.01em] text-indigo">
            Frequently asked questions
          </h2>
        </div>

        {/* FAQ items — <details> is natively accessible */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, index) => (
            <details
              key={index}
              className="group overflow-hidden rounded-[16px] border border-[rgba(0,0,0,0.06)] bg-white"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-indigo transition-colors [&::-webkit-details-marker]:hidden list-none hover:bg-sand/50">
                <span className="pr-4 font-medium">{faq.question}</span>
                <svg
                  className="h-5 w-5 shrink-0 text-slate transition-transform duration-200 group-open:rotate-45"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </summary>
              <div className="px-6 pb-6 pt-1">
                <p className="text-[15px] leading-relaxed text-slate">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
