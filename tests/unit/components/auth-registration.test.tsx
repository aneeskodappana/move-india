import { fireEvent, render, screen } from "@testing-library/react";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { JoinPropertyForm } from "@/components/registration/join-property-form";

describe("M2 authentication and registration UI", () => {
  it("labels the fixed OTP as DEV MODE", () => {
    render(<SignUpForm busy={false} devOtp="123456" name="Anjali Nair" onNameChange={vi.fn()} onOtpChange={vi.fn()} onPhoneChange={vi.fn()} onRequestOtp={vi.fn()} onReset={vi.fn()} onVerify={vi.fn()} otp="123456" phone="+91-00000-12345" requested />);
    expect(screen.getByText(/DEV MODE · Mock authentication/i)).toBeInTheDocument();
    expect(screen.getByText("123456")).toBeInTheDocument();
  });

  it("shows the selected address and its two existing residents", () => {
    const onSubmit = vi.fn((event: React.FormEvent<HTMLFormElement>) => event.preventDefault());
    render(<JoinPropertyForm busy={false} moveInDate="2026-08-01" onMoveInDateChange={vi.fn()} onPropertyChange={vi.fn()} onRoleChange={vi.fn()} onSubmit={onSubmit} properties={[{
      id: "20000000-0000-4000-8000-000000000001",
      addressLine: "Demo Mango Court, Lane 3",
      ward: "Kadavanthra",
      occupants: [
        { id: "1", name: "Meera Joseph", role: "tenant" },
        { id: "2", name: "Fathima Ali", role: "tenant" },
      ],
    }]} propertyId="20000000-0000-4000-8000-000000000001" role="tenant" />);
    expect(screen.getByRole("heading", { name: /You’re joining Demo Mango Court.*2 other residents/i })).toBeInTheDocument();
    fireEvent.submit(screen.getByRole("button", { name: "Join this property" }).closest("form")!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });
});
