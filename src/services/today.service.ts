import { AppError } from "@/lib/app-error";
import type { Session } from "@/lib/session";
import type { CollectionEventRepository } from "@/repositories/collection-event.repo";
import type { HandoverRepository } from "@/repositories/handover.repo";
import type { PropertyRepository } from "@/repositories/property.repo";
import type { RouteRepository } from "@/repositories/route.repo";
import type { BroadcastService } from "@/services/broadcast.service";
import { serializeHandover } from "@/services/handover.service";

type TodayServiceDependencies = {
  broadcasts: Pick<BroadcastService, "composeScheduleMessage">;
  collectionEvents: Pick<CollectionEventRepository, "findByPropertyAndDate">;
  handovers: Pick<HandoverRepository, "findByOccupantAndEvent">;
  properties: Pick<PropertyRepository, "findById">;
  routes: Pick<RouteRepository, "findById">;
};

export function createTodayService(dependencies: TodayServiceDependencies) {
  return {
    async getForResident(session: Session, date: string) {
      if (session.state !== "registered") {
        throw new AppError("forbidden", "Join a property before viewing its schedule.", 403);
      }

      const [property, collectionEvent] = await Promise.all([
        dependencies.properties.findById(session.propertyId),
        dependencies.collectionEvents.findByPropertyAndDate(session.propertyId, date),
      ]);
      if (!property) throw new AppError("not_found", "Your registered property was not found.", 404);

      const route = await dependencies.routes.findById(property.routeId);
      if (!route) throw new AppError("not_found", "The collection route was not found.", 404);

      const collection = collectionEvent
        ? {
            id: collectionEvent.id,
            materialType: collectionEvent.materialType,
            timeWindow: collectionEvent.timeWindow,
            status: collectionEvent.status,
          }
        : null;
      const handover = collectionEvent
        ? await dependencies.handovers.findByOccupantAndEvent(
            session.occupantId,
            collectionEvent.id,
          )
        : null;
      const message = dependencies.broadcasts.composeScheduleMessage({
        address: property.addressLine,
        date,
        materialType: collection?.materialType,
        timeWindow: collection?.timeWindow,
      });

      return {
        date,
        resident: { name: session.name },
        property: {
          id: property.id,
          addressLine: property.addressLine,
          ward: property.ward,
        },
        route: { id: route.id, name: route.name },
        collection,
        handover: handover ? serializeHandover(handover) : null,
        message,
      };
    },
  };
}

export type TodayService = ReturnType<typeof createTodayService>;
export type TodayView = Awaited<ReturnType<TodayService["getForResident"]>>;
