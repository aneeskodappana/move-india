import { FoundationDashboard } from "@/components/landing/foundation-dashboard";
import { appFoundation } from "@/lib/app-foundation";

export default function HomePage() {
  return <FoundationDashboard foundation={appFoundation} />;
}
