import type { FormEvent } from "react";
import { DevModeBanner } from "@/components/auth/dev-mode-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type SignUpFormProps = {
  phone: string;
  name: string;
  otp: string;
  devOtp?: string;
  requested: boolean;
  busy: boolean;
  message?: string;
  onPhoneChange(value: string): void;
  onNameChange(value: string): void;
  onOtpChange(value: string): void;
  onReset(): void;
  onRequestOtp(event: FormEvent<HTMLFormElement>): void;
  onVerify(event: FormEvent<HTMLFormElement>): void;
};

const inputClass = "mt-2 min-h-12 w-full rounded-control border border-stone-300 bg-white px-4 py-3 text-base text-forest-950 shadow-sm outline-none focus:border-forest-600";

export function SignUpForm(props: SignUpFormProps) {
  return (
    <Card className="p-5 sm:p-7">
      <DevModeBanner otp={props.devOtp} />
      {!props.requested ? (
        <form className="mt-6 space-y-5" onSubmit={props.onRequestOtp}>
          <label className="block text-sm font-bold text-forest-950">
            Mobile number
            <input aria-describedby="phone-help" className={inputClass} onChange={(event) => props.onPhoneChange(event.target.value)} placeholder="+91-00000-12345" required value={props.phone} />
          </label>
          <p className="text-xs leading-5 text-stone-700" id="phone-help">Use a number in the +91-00000-XXXXX range.</p>
          <Button className="w-full" disabled={props.busy} type="submit">{props.busy ? "Sending code…" : "Send sign-in code"}</Button>
        </form>
      ) : (
        <form className="mt-6 space-y-5" onSubmit={props.onVerify}>
          <label className="block text-sm font-bold text-forest-950">
            Your name
            <input autoComplete="name" className={inputClass} onChange={(event) => props.onNameChange(event.target.value)} required value={props.name} />
          </label>
          <label className="block text-sm font-bold text-forest-950">
            Six-digit code
            <input className={inputClass} inputMode="numeric" maxLength={6} onChange={(event) => props.onOtpChange(event.target.value)} required value={props.otp} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={props.busy} onClick={props.onReset} tone="secondary" type="button">Change number</Button>
            <Button disabled={props.busy} type="submit">{props.busy ? "Verifying…" : "Verify and continue"}</Button>
          </div>
        </form>
      )}
      {props.message ? <p aria-live="polite" className="mt-5 rounded-control bg-forest-50 p-3 text-sm font-bold text-forest-800">{props.message}</p> : null}
    </Card>
  );
}
