export function DevModeBanner({ otp }: { otp?: string }) {
  return (
    <aside className="rounded-control border-2 border-marigold-500 bg-marigold-100 p-4 text-forest-950" role="note">
      <p className="text-xs font-black uppercase tracking-[0.2em]">DEV MODE · Mock authentication</p>
      <p className="mt-2 text-sm leading-6">
        No SMS will be sent. {otp ? <>Enter this code: <strong className="font-mono text-base">{otp}</strong>.</> : "Request a sign-in code to continue."}
      </p>
    </aside>
  );
}
