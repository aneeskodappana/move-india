import { AppError } from "@/lib/app-error";
import type { CollectorSession } from "@/lib/collector-session";
import type { Session } from "@/lib/session";
import type { CollectionEventRepository } from "@/repositories/collection-event.repo";
import type { HandoverRepository } from "@/repositories/handover.repo";
import type {
  ConfirmCollectedInput,
  MarkKeptOutInput,
} from "@/schemas/handover.schema";

type HandoverServiceDependencies = {
  collectionEvents: Pick<CollectionEventRepository, "findById">;
  handovers: Pick<
    HandoverRepository,
    "confirmCollected" | "create" | "findById" | "findByOccupantAndEvent" | "listPendingByDate"
  >;
};

function requireRegisteredResident(session: Session): Extract<Session, { state: "registered" }> {
  if (session.state !== "registered") {
    throw new AppError("forbidden", "Join a property before recording a handover.", 403);
  }
  return session;
}

export function serializeHandover(log: {
  id: string;
  status: "kept_out" | "collected" | "missed" | "disputed";
  residentMarkedAt: Date;
  collectorMarkedAt: Date | null;
  photoUrl: string | null;
}) {
  return {
    id: log.id,
    status: log.status,
    residentMarkedAt: log.residentMarkedAt.toISOString(),
    collectorMarkedAt: log.collectorMarkedAt?.toISOString() ?? null,
    photoUrl: log.photoUrl,
  };
}

export type SerializedHandover = ReturnType<typeof serializeHandover>;

export function createHandoverService(dependencies: HandoverServiceDependencies) {
  return {
    async markKeptOut(session: Session, input: MarkKeptOutInput, now = new Date()) {
      const resident = requireRegisteredResident(session);
      const event = await dependencies.collectionEvents.findById(input.collectionEventId);
      if (!event) throw new AppError("not_found", "The collection event was not found.", 404);
      if (event.propertyId !== resident.propertyId) {
        throw new AppError(
          "forbidden",
          "You cannot mark a handover for a property you are not registered to.",
          403,
        );
      }

      const existing = await dependencies.handovers.findByOccupantAndEvent(
        resident.occupantId,
        event.id,
      );
      if (existing) return serializeHandover(existing);

      const created = await dependencies.handovers.create({
        occupantId: resident.occupantId,
        collectionEventId: event.id,
        residentMarkedAt: now,
        photoUrl: input.photoUrl,
        status: "kept_out",
      });
      return serializeHandover(created);
    },

    async confirmCollected(
      actor: CollectorSession,
      input: ConfirmCollectedInput,
      now = new Date(),
    ) {
      if (actor.role !== "collector") {
        throw new AppError("forbidden", "Collector access is required.", 403);
      }
      const existing = await dependencies.handovers.findById(input.handoverLogId);
      if (!existing) throw new AppError("not_found", "The handover log was not found.", 404);
      if (existing.status === "collected" && existing.collectorMarkedAt) {
        return serializeHandover(existing);
      }
      if (existing.status !== "kept_out") {
        throw new AppError("conflict", "Only a kept-out handover can be confirmed.", 409);
      }
      return serializeHandover(
        await dependencies.handovers.confirmCollected(existing.id, now),
      );
    },

    async listPendingCollector(actor: CollectorSession, date: string) {
      if (actor.role !== "collector") {
        throw new AppError("forbidden", "Collector access is required.", 403);
      }
      const rows = await dependencies.handovers.listPendingByDate(date);
      return rows.map((row) => ({
        ...row,
        residentMarkedAt: row.residentMarkedAt.toISOString(),
      }));
    },
  };
}

export type HandoverService = ReturnType<typeof createHandoverService>;
export type PendingCollectorView = Awaited<ReturnType<HandoverService["listPendingCollector"]>>[number];
