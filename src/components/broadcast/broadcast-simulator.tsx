"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

const channels = ["app", "sms", "whatsapp"] as const;
type Channel = (typeof channels)[number];

const channelLabels: Record<Channel, string> = {
  app: "App push",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

function AppPushPreview({ message }: { message: string }) {
  return (
    <div className="rounded-card bg-stone-100 p-4 sm:p-6">
      <div className="mx-auto max-w-md rounded-control bg-white p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-control bg-forest-900 text-sm font-black text-white">V</span>
          <div><p className="text-sm font-black text-forest-950">Vandi</p><p className="text-xs text-stone-500">now</p></div>
        </div>
        <p className="mt-3 text-sm leading-6 text-stone-700">{message}</p>
      </div>
    </div>
  );
}

function SmsPreview({ message }: { message: string }) {
  return (
    <div className="rounded-card bg-stone-100 p-4 sm:p-6">
      <div className="mx-auto max-w-sm rounded-[2rem] border-4 border-forest-950 bg-white p-5">
        <p className="text-center text-xs font-black uppercase tracking-wider text-stone-500">Messages · Vandi</p>
        <p className="mt-5 rounded-2xl rounded-bl-sm bg-stone-100 p-4 text-sm leading-6 text-forest-950">{message}</p>
      </div>
    </div>
  );
}

function WhatsAppPreview({ message }: { message: string }) {
  return (
    <div className="rounded-card bg-channel-wall p-4 sm:p-6">
      <div className="mx-auto max-w-md">
        <div className="rounded-t-control bg-forest-800 px-4 py-3 text-sm font-black text-white">Vandi community updates</div>
        <div className="ml-auto mt-5 max-w-sm rounded-control rounded-tr-sm bg-channel-bubble p-4 text-sm leading-6 text-forest-950 shadow-sm">
          {message}
          <span className="mt-2 block text-right text-[10px] text-stone-500">7:02 AM ✓✓</span>
        </div>
      </div>
    </div>
  );
}

export function BroadcastSimulator({ message }: { message: string }) {
  const [channel, setChannel] = useState<Channel>("app");

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-stone-100 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-forest-600">Today’s collection message</p>
        <h2 className="mt-2 text-2xl font-black text-forest-950">How you’ll be notified</h2>
        <div aria-label="Broadcast channel" className="mt-5 grid grid-cols-3 gap-2" role="group">
          {channels.map((candidate) => (
            <button
              aria-pressed={channel === candidate}
              className={`min-h-11 rounded-control px-2 py-2 text-xs font-black transition sm:text-sm ${channel === candidate ? "bg-forest-900 text-white" : "border border-stone-300 bg-white text-stone-700 hover:bg-forest-50"}`}
              key={candidate}
              onClick={() => setChannel(candidate)}
              type="button"
            >
              {channelLabels[candidate]}
            </button>
          ))}
        </div>
      </div>
      <div aria-live="polite">
        {channel === "app" ? <AppPushPreview message={message} /> : null}
        {channel === "sms" ? <SmsPreview message={message} /> : null}
        {channel === "whatsapp" ? <WhatsAppPreview message={message} /> : null}
      </div>
    </Card>
  );
}
