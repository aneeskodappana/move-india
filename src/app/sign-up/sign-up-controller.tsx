"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SignUpForm } from "@/components/auth/sign-up-form";

type ApiError = { error?: { message?: string } };

export function SignUpController() {
  const router = useRouter();
  const [phone, setPhone] = useState("+91-00000-");
  const [name, setName] = useState("Anjali Nair");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string>();
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const body = await response.json() as ApiError & { devOtp?: string };
      if (!response.ok || !body.devOtp) throw new Error(body.error?.message ?? "Could not send the sign-in code.");
      setDevOtp(body.devOtp);
      setOtp(body.devOtp);
      setRequested(true);
      setMessage("Your sign-in code is ready. No SMS was sent.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send the sign-in code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(undefined);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone, name, otp }),
      });
      const body = await response.json() as ApiError & { next?: string };
      if (!response.ok || !body.next) throw new Error(body.error?.message ?? "Could not verify the sign-in code.");
      router.push(body.next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify the sign-in code.");
      setBusy(false);
    }
  }

  function resetPhone() {
    setRequested(false);
    setDevOtp(undefined);
    setOtp("");
    setMessage(undefined);
  }

  return <SignUpForm busy={busy} devOtp={devOtp} message={message} name={name} onNameChange={setName} onOtpChange={setOtp} onPhoneChange={setPhone} onRequestOtp={requestOtp} onReset={resetPhone} onVerify={verifyOtp} otp={otp} phone={phone} requested={requested} />;
}
