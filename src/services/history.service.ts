import { AppError } from "@/lib/app-error";
import { indiaIsoDate } from "@/lib/india-date";
import type { Session } from "@/lib/session";
import type { CollectionEventRepository } from "@/repositories/collection-event.repo";
import type { HandoverRepository } from "@/repositories/handover.repo";
import type { PaymentRepository } from "@/repositories/payment.repo";
import type { PropertyRepository } from "@/repositories/property.repo";
import { serializeHandover } from "@/services/handover.service";
import { serializePayment } from "@/services/payment.service";

type HistoryServiceDependencies = {
  collectionEvents: Pick<CollectionEventRepository, "listByProperty">;
  handovers: Pick<HandoverRepository, "listByOccupant">;
  payments: Pick<PaymentRepository, "listByOccupant">;
  properties: Pick<PropertyRepository, "findById">;
};

function requireRegisteredResident(session: Session): Extract<Session, { state: "registered" }> {
  if (session.state !== "registered") {
    throw new AppError("forbidden", "Join a property before viewing your proof pack.", 403);
  }
  return session;
}

function uniqueMonths(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => right.localeCompare(left));
}

export function createHistoryService(dependencies: HistoryServiceDependencies) {
  return {
    async getProofPack(session: Session, month?: string, now = new Date()) {
      const resident = requireRegisteredResident(session);
      const [property, events, logs, paymentRows] = await Promise.all([
        dependencies.properties.findById(resident.propertyId),
        dependencies.collectionEvents.listByProperty(resident.propertyId),
        dependencies.handovers.listByOccupant(resident.occupantId),
        dependencies.payments.listByOccupant(resident.occupantId),
      ]);
      if (!property) {
        throw new AppError("not_found", "Your registered property was not found.", 404);
      }

      const today = indiaIsoDate(now);
      const logsByEvent = new Map(logs.map((log) => [log.collectionEventId, log]));
      const relevantEvents = events.filter((event) => event.eventDate <= today);
      const months = uniqueMonths([
        ...relevantEvents.map((event) => event.eventDate.slice(0, 7)),
        ...paymentRows.map((payment) => payment.month),
      ]);
      const collections = relevantEvents
        .filter((event) => !month || event.eventDate.startsWith(month))
        .sort((left, right) => right.eventDate.localeCompare(left.eventDate))
        .map((event) => {
          const handover = logsByEvent.get(event.id);
          return {
            collectionEventId: event.id,
            eventDate: event.eventDate,
            materialType: event.materialType,
            timeWindow: event.timeWindow,
            handover: handover ? serializeHandover(handover) : null,
          };
        });
      const payments = paymentRows
        .filter((payment) => !month || payment.month === month)
        .sort((left, right) => right.month.localeCompare(left.month))
        .map(serializePayment);

      return {
        resident: { name: resident.name, phone: resident.phone },
        property: {
          id: property.id,
          addressLine: property.addressLine,
          ward: property.ward,
        },
        month: month ?? null,
        months,
        collections,
        payments,
      };
    },
  };
}

export type HistoryService = ReturnType<typeof createHistoryService>;
export type ProofPackView = Awaited<ReturnType<HistoryService["getProofPack"]>>;
export type ProofPackCollection = ProofPackView["collections"][number];
