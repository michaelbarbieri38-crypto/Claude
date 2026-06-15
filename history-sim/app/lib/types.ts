export interface AgentMove {
  agentId: string;
  agentName: string;
  role: string;
  action: string;
  publicStatement: string;
  privateThought: string;
}

export interface Round {
  roundNumber: number;
  worldState: string;
  moves: AgentMove[];
  narratorSummary: string;
  isOver: boolean;
  outcome?: string;
}

export interface SimulationState {
  scenarioId: string;
  rounds: Round[];
  currentRound: number;
  isRunning: boolean;
  isOver: boolean;
  outcome?: string;
}

export interface SimulateRequest {
  scenarioId: string;
  rounds: Round[];
}

export interface SimulateResponse {
  round: Round;
}
