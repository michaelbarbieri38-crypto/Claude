"use client";

import { SCENARIOS } from "@/app/lib/scenarios";

interface Props {
  onSelect: (scenarioId: string) => void;
}

export default function ScenarioPicker({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-serif font-bold text-amber-200 mb-2 text-center tracking-wide">
          Historical Crisis Simulator
        </h1>
        <p className="text-stone-400 text-center mb-12 text-lg">
          AI agents play historical figures. Watch history unfold — or change.
        </p>

        <div className="grid gap-6">
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelect(scenario.id)}
              className="text-left bg-stone-900 border border-stone-700 hover:border-amber-600 hover:bg-stone-800 rounded-xl p-6 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-serif font-semibold text-amber-100 group-hover:text-amber-200">
                  {scenario.title}
                </h2>
                <span className="text-stone-500 text-sm font-mono ml-4 shrink-0">
                  {scenario.year}
                </span>
              </div>
              <p className="text-stone-400 text-sm leading-relaxed mb-4">
                {scenario.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {scenario.agents.map((agent) => (
                  <span
                    key={agent.id}
                    className="text-xs bg-stone-800 border border-stone-700 rounded px-2 py-1 text-stone-400"
                  >
                    {agent.name}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
