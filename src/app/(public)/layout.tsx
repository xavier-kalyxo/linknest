import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { LinkClickTracker } from "@/components/analytics/link-click-tracker";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PostHogProvider>
      {children}
      <LinkClickTracker />
    </PostHogProvider>
  );
}
