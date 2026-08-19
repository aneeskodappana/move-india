import { render, screen } from "@testing-library/react";
import { FoundationDashboard } from "@/components/landing/foundation-dashboard";
import { appFoundation } from "@/lib/app-foundation";

describe("FoundationDashboard", () => {
  it("labels the build honestly and previews the full primary journey", () => {
    render(<FoundationDashboard foundation={appFoundation} />);

    expect(screen.getByText("Kochi collection service")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Waste management done right." })).toBeInTheDocument();
    expect(screen.getByText("Kadavanthra")).toBeInTheDocument();
    expect(screen.getByText("Food waste")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cleaner streets start with a clearer doorstep." })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.getByText(/Not a government service/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign in as a resident" })).toHaveAttribute("href", "/sign-up");
  });
});
