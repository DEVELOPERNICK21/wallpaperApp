"use client";

import { useState } from "react";

const useCases = [
  {
    label: "Grassroots Teams",
    headline: "Coordinate safely without outing your network.",
    description:
      "Organizers can schedule actions, share sensitive updates, and react in real time while the app presents as a harmless wallpaper gallery to anyone peeking over a shoulder.",
    highlights: [
      "Disguised notifications keep operations covert.",
      "Group invite rules stop unknown numbers from joining.",
      "Inactivity auto-lock protects devices if confiscated.",
    ],
  },
  {
    label: "Investigative Journalists",
    headline: "Protect sources and story leads on hostile ground.",
    description:
      "Reporters can share documents, route audio files, and pin critical intel without exposing their comms stack. Wallpaper-first UX is defensible at checkpoints.",
    highlights: [
      "Granular read receipts confirm delivery without tipping off others.",
      "Profile photo privacy hides identities in shared devices.",
      "Audit trail friendly—Firestore structure documented for legal review.",
    ],
  },
  {
    label: "Private Communities",
    headline: "Offer members a discreet channel with a luxury feel.",
    description:
      "From premium clubs to support circles, Wallpaper Chat upgrades privacy without sacrificing polish. Members enter through curated wallpaper drops before discovering exclusive chats.",
    highlights: [
      "Custom wallpaper packs reinforce your brand story.",
      "Seen-by indicators and pinned threads keep conversations organized.",
      "Disguised presence states mean members choose when to appear online.",
    ],
  },
];

export function UseCaseTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeCase = useCases[activeIndex];

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-800/60 bg-slate-900/40 backdrop-blur">
      <div className="flex flex-wrap gap-2 border-b border-slate-800/70 bg-slate-900/70 p-4">
        {useCases.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bg-sky-400 text-slate-900 shadow-lg shadow-sky-400/20"
                  : "bg-slate-900/60 text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-8 p-8 lg:grid-cols-[0.75fr_1fr] lg:items-center">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Use case
          </p>
          <h3 className="text-2xl font-semibold text-white lg:text-3xl">
            {activeCase.headline}
          </h3>
          <p className="text-sm leading-7 text-slate-300 lg:text-base">
            {activeCase.description}
          </p>
        </div>
        <ul className="grid gap-4 text-sm text-slate-300">
          {activeCase.highlights.map((highlight) => (
            <li
              key={highlight}
              className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-5"
            >
              <span className="block text-slate-200">{highlight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

