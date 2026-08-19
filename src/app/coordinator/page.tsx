import { CollectorQueueController } from "@/app/coordinator/collector-queue-controller";
import { CoordinatorLoginController } from "@/app/coordinator/coordinator-login-controller";
import { getCurrentCollector } from "@/lib/current-collector";
import { formatScheduleDate, indiaIsoDate } from "@/lib/india-date";
import { createApplicationServices } from "@/services/dependencies";

export default async function CoordinatorPage() {
  const services = createApplicationServices();
  const collector = await getCurrentCollector();
  if (!collector) return <CoordinatorLoginController devCode={services.authConfig.devCollectorCode} />;
  const date = indiaIsoDate();
  const pending = await services.handovers.listPendingCollector(collector, date);
  return <CollectorQueueController dateLabel={formatScheduleDate(date)} initialItems={pending} />;
}
