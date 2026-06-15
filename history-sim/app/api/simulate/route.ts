import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { SCENARIOS } from "@/app/lib/scenarios";
import { Round, AgentMove } from "@/app/lib/types";

const client = new Anthropic();

function buildWorldContext(
  scenario: (typeof SCENARIOS)[0],
  rounds: Round[]
): string {
  if (rounds.length === 0) return scenario.startingContext;

  const history = rounds
    .map((r) => {
      const moves = r.moves
        .map((m) => `${m.agentName} (${m.role}): ${m.publicStatement}`)
        .join("\n");
      return `--- Round ${r.roundNumber} ---\n${moves}\n\nNarrator: ${r.narratorSummary}`;
    })
    .join("\n\n");

  return `${scenario.startingContext}\n\n=== HISTORY SO FAR ===\n${history}`;
}

async function getAgentMove(
  scenario: (typeof SCENARIOS)[0],
  agent: (typeof SCENARIOS)[0]["agents"][0],
  worldContext: string,
  roundNumber: number
): Promise<AgentMove> {
  const prompt = `You are ${agent.name}, ${agent.role}.

PERSONALITY: ${agent.personality}

YOUR PRIVATE GOALS (known only to you): ${agent.privateGoals}

YOUR PRIVATE INFORMATION (known only to you): ${agent.privateInfo}

CURRENT SITUATION:
${worldContext}

It is now Round ${roundNumber}. You must decide your move.

Respond in this exact JSON format (no markdown, just raw JSON):
{
  "action": "A brief label for your action (e.g. 'Proposes naval blockade', 'Orders mobilization', 'Sends secret telegram')",
  "publicStatement": "What you say or do publicly — 2-4 sentences in first person, in character. This is visible to all other players.",
  "privateThought": "Your internal reasoning — what you are really thinking, what you fear, what you hope. 2-3 sentences. This is visible only to the reader, not to other players."
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "";
  const text = raw.replace(/^```(?:json)?\n?/m, "").replace(/```\s*$/m, "").trim();
  const parsed = JSON.parse(text);

  return {
    agentId: agent.id,
    agentName: agent.name,
    role: agent.role,
    action: parsed.action,
    publicStatement: parsed.publicStatement,
    privateThought: parsed.privateThought,
  };
}

async function getNarratorSummary(
  scenario: (typeof SCENARIOS)[0],
  moves: AgentMove[],
  worldContext: string,
  roundNumber: number
): Promise<{ summary: string; isOver: boolean; outcome?: string }> {
  const movesText = moves
    .map((m) => `${m.agentName}: [${m.action}] "${m.publicStatement}"`)
    .join("\n\n");

  const prompt = `You are a neutral historian narrating a historical simulation.

SCENARIO: ${scenario.title} (${scenario.year})

CONTEXT:
${worldContext}

ROUND ${roundNumber} MOVES:
${movesText}

Write a narrator summary for this round (3-5 sentences) that:
- Describes what just happened and how the situation has shifted
- Notes any significant escalations, de-escalations, or turning points
- Sets up the tension for the next round
- Reads like a tense historical account

Then assess: has the crisis reached a decisive resolution (war declared, deal struck, resignation delivered, etc.)?

Respond in this exact JSON format (no markdown):
{
  "summary": "Your narrator summary here.",
  "isOver": false,
  "outcome": null
}

If isOver is true, set outcome to a 2-3 sentence description of how history unfolded in this simulation.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const raw =
    response.content[0].type === "text" ? response.content[0].text : "";
  const text = raw.replace(/^```(?:json)?\n?/m, "").replace(/```\s*$/m, "").trim();
  const parsed = JSON.parse(text);

  return {
    summary: parsed.summary,
    isOver: parsed.isOver,
    outcome: parsed.outcome,
  };
}

export async function POST(req: NextRequest) {
  const { scenarioId, rounds } = await req.json();

  const scenario = SCENARIOS.find((s) => s.id === scenarioId);
  if (!scenario) {
    return NextResponse.json({ error: "Scenario not found" }, { status: 404 });
  }

  const roundNumber = rounds.length + 1;
  const worldContext = buildWorldContext(scenario, rounds);

  // Get all agent moves in parallel
  const moves = await Promise.all(
    scenario.agents.map((agent) =>
      getAgentMove(scenario, agent, worldContext, roundNumber)
    )
  );

  // Get narrator summary
  const { summary, isOver, outcome } = await getNarratorSummary(
    scenario,
    moves,
    worldContext,
    roundNumber
  );

  const round: Round = {
    roundNumber,
    worldState: worldContext,
    moves,
    narratorSummary: summary,
    isOver,
    outcome,
  };

  return NextResponse.json({ round });
}
