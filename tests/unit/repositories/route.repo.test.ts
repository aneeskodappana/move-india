import type { NewRoute, Route } from "@/db/schema";
import { createRouteRepository } from "@/repositories/route.repo";
import { createInsertHarness, createSelectOneHarness } from "../../helpers/mock-database";

describe("RouteRepository", () => {
  it("inserts and returns a route", async () => {
    const input: NewRoute = {
      ward: "Elamkulam",
      name: "Demo Elamkulam North",
      weeklyMaterialCalendar: {},
    };
    const expected: Route = {
      id: "10000000-0000-4000-8000-000000000001",
      ...input,
    };
    const harness = createInsertHarness(expected);

    await expect(createRouteRepository(harness.database).create(input)).resolves.toEqual(expected);
    expect(harness.values).toHaveBeenCalledWith(input);
  });

  it("finds a route by id", async () => {
    const expected: Route = {
      id: "10000000-0000-4000-8000-000000000001",
      ward: "Elamkulam",
      name: "Demo Elamkulam North",
      weeklyMaterialCalendar: {},
    };
    const harness = createSelectOneHarness([expected]);

    await expect(createRouteRepository(harness.database).findById(expected.id)).resolves.toEqual(expected);
    expect(harness.limit).toHaveBeenCalledWith(1);
  });
});
