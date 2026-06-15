"use client";

import { useState } from "react";
import { SCENARIOS } from "@/app/lib/scenarios";
import { Round } from "@/app/lib/types";

interface Props {
  scenarioId: string;
  onReset: () => void;
}

const AGENT_COLORS = [
  "border-blue-600 bg-blue-950/30",
  "border-red-700 bg-red-950/30",
  "border-emerald-700 bg-emerald-950/30",
  "border-purple-700 bg-purple-950/30",
  "border-orange-700 bg-orange-950/30",
];

const AGENT_LABEL_COLORS = [
  "text-blue-300",
  "text-red-300",
  "text-emerald-300",
  "text-purple-300",
  "text-orange-300",
];

export default function SimulationView({ scenarioId, onReset }: Props) {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOver, setIsOver] = useState(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [expandedPrivate, setExpandedPrivate] = useState<
    Record<string, boolean>
  >({});

  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;

  const agentColorMap: Record<string, number> = {};
  scenario.agents.forEach((a, i) => {
    agentColorMap[a.id] = i;
  });

  const runNextRound = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, rounds }),
      });
      const data = await res.json();
      const round: Round = data.round;
      setRounds((prev) => [...prev, round]);
      if (round.isOver) {
        setIsOver(true);
        setOutcome(round.outcome ?? null);
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePrivate = (key: string) => {
    setExpandedPrivate((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-stone-950/95 backdrop-blur border-b border-stone-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-amber-200">
            {scenario.title}
          </h1>
          <p className="text-stone-500 text-xs">{scenario.year}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-500 text-sm">
            Round {rounds.length}
          </span>
          <button
            onClick={onReset}
            className="text-xs text-stone-500 hover:text-stone-300 border border-stone-700 hover:border-stone-500 px-3 py-1 rounded transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Starting context */}
        <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 mb-8">
          <p className="text-xs text-amber-600 font-mono uppercase tracking-widest mb-3">
            Situation
          </p>
          <p className="text-stone-300 text-sm leading-relaxed">
            {scenario.startingContext}
          </p>
        </div>

        {/* Rounds */}
        {rounds.map((round) => (
          <div key={round.roundNumber} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-stone-800" />
              <span className="text-xs text-stone-500 font-mono uppercase tracking-widest">
                Round {round.roundNumber}
              </span>
              <div className="h-px flex-1 bg-stone-800" />
            </div>

            {/* Agent moves */}
            <div className="space-y-4 mb-6">
              {round.moves.map((move) => {
                const colorIdx = agentColorMap[move.agentId] ?? 0;
                const borderBg = AGENT_COLORS[colorIdx % AGENT_COLORS.length];
                const labelColor =
                  AGENT_LABEL_COLORS[colorIdx % AGENT_LABEL_COLORS.length];
                const privateKey = `${round.roundNumber}-${move.agentId}`;
                const showPrivate = expandedPrivate[privateKey];

                return (
                  <div
                    key={move.agentId}
                    className={`border rounded-lg p-4 ${borderBg}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className={`font-semibold text-sm ${labelColor}`}>
                          {move.agentName}
                        </span>
                        <span className="text-stone-500 text-xs ml-2">
                          {move.role}
                        </span>
                      </div>
                      <span className="text-xs text-stone-500 italic">
                        {move.action}
                      </span>
                    </div>
                    <p className="text-stone-300 text-sm leading-relaxed mb-2">
                      &ldquo;{move.publicStatement}&rdquo;
                    </p>
                    <button
                      onClick={() => togglePrivate(privateKey)}
                      className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                    >
                      {showPrivate ? "▾ Hide" : "▸ Private thought"}
                    </button>
                    {showPrivate && (
                      <p className="mt-2 text-xs text-stone-500 italic leading-relaxed border-t border-stone-700 pt-2">
                        {move.privateThought}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Narrator */}
            <div className="bg-amber-950/20 border border-amber-900/40 rounded-lg p-4">
              <p className="text-xs text-amber-700 font-mono uppercase tracking-widest mb-2">
                Narrator
              </p>
              <p className="text-amber-100/80 text-sm leading-relaxed">
                {round.narratorSummary}
              </p>
            </div>
          </div>
        ))}

        {/* Outcome */}
        {isOver && outcome && (
          <div className="bg-stone-900 border border-amber-700 rounded-xl p-6 mb-8">
            <p className="text-xs text-amber-500 font-mono uppercase tracking-widest mb-3">
              Resolution
            </p>
            <p className="text-amber-100 leading-relaxed">{outcome}</p>
          </div>
        )}

        {/* Controls */}
        {!isOver && (
          <div className="flex justify-center">
            <button
              onClick={runNextRound}
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-600 disabled:bg-stone-800 disabled:text-stone-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              {loading
                ? "Agents deliberating…"
                : rounds.length === 0
                ? "Begin Simulation"
                : "Next Round →"}
            </button>
          </div>
        )}

        {isOver && (
          <div className="flex justify-center">
            <button
              onClick={onReset}
              className="border border-stone-600 hover:border-stone-400 text-stone-300 hover:text-stone-100 font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
            >
              Try Another Scenario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
