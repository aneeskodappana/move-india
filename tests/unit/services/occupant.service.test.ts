import type { Occupant, Property } from "@/db/schema";
import type { Session } from "@/lib/session";
import { createOccupantService } from "@/services/occupant.service";

const session: Session = {
  version: 1,
  state: "verified",
  phone: "+91-00000-12345",
  name: "Anjali Nair",
  expiresAt: Date.now() + 60_000,
};
const property: Property = {
  id: "20000000-0000-4000-8000-000000000001",
  addressLine: "Demo Mango Court, Lane 3",
  ward: "Kadavanthra",
  mockQrId: "VN-EKM-02-1003",
  latitude: 9.96,
  longitude: 76.3,
  routeId: "10000000-0000-4000-8000-000000000001",
};
const occupant: Occupant = {
  id: "30000000-0000-4000-8000-000000000099",
  propertyId: property.id,
  name: session.name,
  phone: session.phone,
  role: "tenant",
  moveInDate: "2026-08-01",
  moveOutDate: null,
};

describe("OccupantService", () => {
  it("registers only the identity carried by the verified session", async () => {
    const create = vi.fn().mockResolvedValue(occupant);
    const service = createOccupantService({
      occupants: { create, findByPhone: vi.fn().mockResolvedValue(null) },
      properties: { findById: vi.fn().mockResolvedValue(property) },
    });
    await expect(service.register(session, { propertyId: property.id, role: "tenant", moveInDate: "2026-08-01" })).resolves.toEqual(occupant);
    expect(create).toHaveBeenCalledWith({
      propertyId: property.id,
      phone: session.phone,
      name: session.name,
      role: "tenant",
      moveInDate: "2026-08-01",
    });
  });

  it("rejects registration from an already-registered session", async () => {
    const service = createOccupantService({
      occupants: { create: vi.fn(), findByPhone: vi.fn() },
      properties: { findById: vi.fn() },
    });
    await expect(service.register({ ...session, state: "registered", occupantId: occupant.id, propertyId: property.id }, { propertyId: property.id, role: "tenant", moveInDate: "2026-08-01" })).rejects.toThrow("already joined");
  });
});
