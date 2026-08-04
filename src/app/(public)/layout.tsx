/**
 * Public pages deliberately mount no analytics provider.
 *
 * posthog-js used to wrap this layout, costing ~50 KB brotli of client JS on the
 * product's most performance-sensitive route — nearly all of it session replay,
 * surveys, autocapture and the toolbar, none of which this product uses.
 * Tracking now runs through <PageBeacon>, mounted by the page itself so it knows
 * which slug it is reporting for.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
