import { formatScheduleDate } from "@/lib/india-date";

type ScheduleMessageInput = {
  address: string;
  date: string;
  materialType?: string;
  timeWindow?: string;
};

export function createBroadcastService() {
  return {
    composeScheduleMessage(input: ScheduleMessageInput): string {
      const day = formatScheduleDate(input.date);
      if (!input.materialType || !input.timeWindow) {
        return `Vandi update for ${input.address}: No collection is scheduled for ${day}.`;
      }
      return `Vandi collection for ${input.address}: ${input.materialType} on ${day}, ${input.timeWindow}. Keep it ready within the collection window.`;
    },
  };
}

export type BroadcastService = ReturnType<typeof createBroadcastService>;
