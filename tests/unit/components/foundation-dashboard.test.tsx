import { render, screen } from "@testing-library/react";
import { FoundationDashboard } from "@/components/landing/foundation-dashboard";
import { appFoundation } from "@/lib/app-foundation";

describe("FoundationDashboard", () => {
  it("labels the build honestly and previews the full primary journey", () => {
    render(<FoundationDashboard foundation={appFoundation} />);

    expect(screen.getByText("Independent hackathon prototype")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Know what is collected. Prove you handed it over." })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText("No live government systems, telecom delivery, payments, or personal data.")).toBeInTheDocument();
  });
});
