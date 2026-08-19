import { fireEvent, render, screen } from "@testing-library/react";
import { TodayDashboard } from "@/components/resident/today-dashboard";
import type { TodayView } from "@/services/today.service";

const today: TodayView = {
  date: "2026-08-19",
  resident: { name: "Anjali Nair" },
  property: {
    id: "20000000-0000-4000-8000-000000000001",
    addressLine: "Demo Lotus House, Lane 1",
    ward: "Elamkulam",
  },
  route: {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Demo Elamkulam North",
  },
  collection: {
    id: "40000000-0000-4000-8000-000000000001",
    materialType: "Food waste",
    timeWindow: "7:00–8:30 AM",
    status: "scheduled",
  },
  message: "Canonical Vandi collection message.",
};

describe("TodayDashboard", () => {
  it("shows the correct material, window, route, and mocked-delivery disclosure", () => {
    render(<TodayDashboard today={today} />);
    expect(screen.getByRole("heading", { name: "Food waste" })).toBeInTheDocument();
    expect(screen.getByText("7:00–8:30 AM")).toBeInTheDocument();
    expect(screen.getByText("Demo Elamkulam North")).toBeInTheDocument();
    expect(screen.getByText(/channel delivery is simulated/i)).toBeInTheDocument();
  });

  it("renders the same canonical message through all three channel previews", () => {
    render(<TodayDashboard today={today} />);
    expect(screen.getByText(today.message)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "SMS" }));
    expect(screen.getByText(today.message)).toBeInTheDocument();
    expect(screen.getByText(/Messages · Vandi/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "WhatsApp" }));
    expect(screen.getByText(today.message)).toBeInTheDocument();
    expect(screen.getByText("Vandi community updates")).toBeInTheDocument();
  });
});
