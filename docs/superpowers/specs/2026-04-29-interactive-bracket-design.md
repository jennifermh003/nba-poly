# Interactive Scenario Bracket — Design Spec

## Problem

The bracket hardcodes R2+ matchups in `bracket.ts` with static team assignments (e.g., "OKC vs MIN in R2"). In reality, R2 opponents depend on who wins R1. The current display shows a single predetermined path with no way to explore alternatives, and no visual distinction between confirmed and projected matchups.

## Solution: Dynamic Bracket with Click-to-Override

### Default State

On load, the bracket auto-computes the most-likely path through all 4 rounds:

1. R1 matchups are fixed (actual playoff seeding) — these are the only static config
2. For each R1 series, the team with higher conference champion odds is projected as the winner
3. R2 matchups are built from those projected R1 winners
4. R3 matchups from projected R2 winners, Finals from projected R3 winners
5. Odds in each projected matchup are derived by normalizing conference champion odds between the two participants: `P(A) = confOdds(A) / (confOdds(A) + confOdds(B))`

All projected matchups display with **dashed borders and reduced opacity (0.75)** to visually distinguish them from confirmed/in-progress series.

### Click-to-Override Interaction

Users can click any team in any matchup to force them as the series winner:

1. **Clicked team is locked** — shown with green checkmark, the opponent is dimmed
2. **Cascade recalculation** — the override propagates downstream through all subsequent rounds
3. **Downstream odds re-normalize** — using the same Polymarket conference odds between the new pair of participants
4. **Changed matchups highlight** — matchups affected by an override get an amber dashed border to show they differ from the default projection

### Scenario Bar

A bar appears below the header when any overrides are active:

- Shows each override as a removable chip: `"DEN wins R1 ×"`
- Clicking × removes that single override and recalculates downstream
- "Reset to market odds" link clears all overrides
- Hidden when no overrides are set

### Matchup States

Each matchup has one of three visual states:

| State | Border | Opacity | When |
|-------|--------|---------|------|
| `confirmed` | Solid #d0d3d8 | 1.0 | Series is active or completed (R1 during playoffs) |
| `projected` | Dashed #c0c2c5 | 0.75 | Future round, populated by most-likely-path calculation |
| `overridden` | Dashed #f59e0b (amber) | 0.85 | Future round, changed by a user override |

### Team Row Click Behavior

- On hover, team row gets a subtle blue background highlight to signal clickability
- Clicking sets that team as the matchup winner
- Clicking the already-selected winner deselects (removes that override)
- R1 matchups: teams are always clickable (override the most-likely winner)
- R2+ matchups: teams are also clickable — this locks the winner for that round and recalculates further downstream. Both participants must already be determined (by earlier overrides or most-likely projection) for the click to work.
- Clicking a team in R2 does NOT automatically override R1 — it only overrides that specific matchup's outcome

## Architecture Changes

### Files Modified

**`src/lib/bracket.ts`** — Strip R2+ matchups from `BRACKET_CONFIG`. Keep only R1 matchups (8 total). Add:
- `R1_MATCHUPS: BracketMatchupConfig[]` — the 8 first-round matchups only
- `buildDynamicBracket(r1Results: Record<string, string>, odds: ConferenceOdds): BracketMatchupConfig[]` — given a map of R1 matchup IDs → winner abbreviations, generate the full R2-4 matchup tree with correct opponents and seeding

**`src/hooks/usePolymarketData.ts`** — Refactor `buildMatchups()`:
- Accept `overrides: Record<string, string>` parameter
- For each R1 matchup: use override winner if set, else pick the team with higher conference odds
- Call `buildDynamicBracket()` to generate R2+ matchups from R1 outcomes
- Compute odds for each generated matchup via `deriveSeriesOdds()`
- Tag each matchup with `status: 'confirmed' | 'projected' | 'overridden'`

**`src/hooks/useScenario.ts`** — New hook:
- State: `overrides: Record<string, string>` — maps matchup ID → forced winner abbreviation
- `setWinner(matchupId: string, teamAbbr: string): void` — add/toggle an override
- `removeOverride(matchupId: string): void` — remove a single override
- `resetAll(): void` — clear all overrides
- `overrideCount: number` — for conditional rendering of scenario bar

**`src/components/ScenarioBar.tsx`** — New component:
- Props: `overrides`, `onRemove`, `onReset`
- Renders chips for each override, reset link
- Hidden when no overrides

**`src/components/Matchup.tsx`** — Add:
- `status` prop: `'confirmed' | 'projected' | 'overridden'`
- `onTeamClick(teamAbbr: string)` callback prop
- Dashed border + opacity for projected/overridden states
- Amber border for overridden

**`src/components/TeamRow.tsx`** — Add:
- `onClick` callback prop
- `isSelected` prop (green checkmark when overridden as winner)
- Hover state: subtle blue background
- Cursor: pointer

**`src/app/page.tsx`** — Wire up:
- `useScenario()` hook
- Pass `overrides` to `usePolymarketData()`
- Render `ScenarioBar` between Header and bracket
- Thread `onTeamClick` through Bracket → Round → Matchup → TeamRow

### Files Unchanged

- `src/lib/polymarket.ts` — API fetching stays the same
- `src/lib/websocket.ts` — WebSocket stays the same
- `src/lib/teams.ts` — static team data unchanged
- `src/app/api/odds/route.ts` — API route unchanged
- `src/components/Header.tsx` — unchanged
- `src/components/ThemeToggle.tsx` — unchanged
- `src/components/Connectors.tsx` — unchanged
- `src/app/globals.css` — unchanged (all new styles are inline)

## Data Flow

```
User clicks team → useScenario.setWinner(matchupId, team)
  → overrides state updates
  → usePolymarketData rebuilds bracket with new overrides
    → R1: pick override winner or most-likely
    → R2: buildDynamicBracket() from R1 winners
    → R3: from R2 winners
    → Finals: from R3 winners
    → Each matchup tagged with status
  → React re-renders with new matchups + statuses
  → ScenarioBar shows active overrides
```

## Verification

1. Load dashboard — bracket shows most-likely path with dashed borders on R2+
2. Click DEN in the OKC/DEN R1 matchup — DEN gets checkmark, R2 updates to show DEN vs projected R1-2 winner, odds recalculate, scenario bar appears with "DEN wins R1" chip
3. Click × on the chip — override removed, bracket reverts to most-likely path
4. Set multiple overrides across both conferences — Finals matchup updates correctly
5. Click "Reset to market odds" — all overrides clear, bracket returns to default
6. Verify dark mode still works with new dashed/amber border styles
7. Verify WebSocket price updates still propagate and recalculate the bracket correctly
