"use client";

import { useState } from "react";
import ScenarioPicker from "@/app/components/ScenarioPicker";
import SimulationView from "@/app/components/SimulationView";

export default function Home() {
  const [scenarioId, setScenarioId] = useState<string | null>(null);

  if (scenarioId) {
    return (
      <SimulationView
        scenarioId={scenarioId}
        onReset={() => setScenarioId(null)}
      />
    );
  }

  return <ScenarioPicker onSelect={setScenarioId} />;
}
