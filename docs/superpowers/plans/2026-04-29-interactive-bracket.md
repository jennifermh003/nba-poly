# Interactive Scenario Bracket — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the bracket dynamic — R2+ matchups auto-compute from most-likely R1 outcomes, users can click any team to override the winner and see the bracket cascade.

**Architecture:** Extract R1-only config from the static bracket. Add a `useScenario` hook for override state. Refactor `usePolymarketData` to accept overrides and build R2+ dynamically via `buildDynamicBracket()`. Thread click handlers from page → Bracket → Round → Matchup → TeamRow. Add ScenarioBar for override chips.

**Tech Stack:** Next.js 16, React 19, TypeScript

---

### Task 1: Add `status` field to Matchup type

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add MatchupStatus type and status field**

In `src/lib/types.ts`, add a type alias and update the `Matchup` interface:

```typescript
// Add after the Conference type
export type MatchupStatus = 'confirmed' | 'projected' | 'overridden';
```

Add `status` to the `Matchup` interface:

```typescript
export interface Matchup {
  id: string;
  round: number;
  conference: Conference | 'finals';
  seriesScore: string;
  topTeam: MatchupTeam;
  bottomTeam: MatchupTeam;
  status: MatchupStatus;  // ← add this field
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add MatchupStatus type to Matchup interface"
```

---

### Task 2: Refactor bracket.ts — extract R1, add dynamic bracket builder

**Files:**
- Modify: `src/lib/bracket.ts`

- [ ] **Step 1: Create R1_MATCHUPS and remove R2+ from BRACKET_CONFIG**

Replace the entire file contents of `src/lib/bracket.ts` with:

```typescript
export interface BracketMatchupConfig {
  id: string;
  round: number;
  conference: 'west' | 'east' | 'finals';
  position: number;
  topSeed: string;
  bottomSeed: string;
  topSeedNum: number;
  bottomSeedNum: number;
}

export const R1_MATCHUPS: BracketMatchupConfig[] = [
  // ── West Round 1 ──
  { id: 'W-R1-0', round: 1, conference: 'west', position: 0, topSeed: 'OKC', bottomSeed: 'DEN', topSeedNum: 1, bottomSeedNum: 8 },
  { id: 'W-R1-1', round: 1, conference: 'west', position: 1, topSeed: 'MIN', bottomSeed: 'LAL', topSeedNum: 4, bottomSeedNum: 5 },
  { id: 'W-R1-2', round: 1, conference: 'west', position: 2, topSeed: 'HOU', bottomSeed: 'GSW', topSeedNum: 3, bottomSeedNum: 6 },
  { id: 'W-R1-3', round: 1, conference: 'west', position: 3, topSeed: 'MEM', bottomSeed: 'SAC', topSeedNum: 2, bottomSeedNum: 7 },
  // ── East Round 1 ──
  { id: 'E-R1-0', round: 1, conference: 'east', position: 0, topSeed: 'CLE', bottomSeed: 'MIA', topSeedNum: 1, bottomSeedNum: 8 },
  { id: 'E-R1-1', round: 1, conference: 'east', position: 1, topSeed: 'BOS', bottomSeed: 'ORL', topSeedNum: 4, bottomSeedNum: 5 },
  { id: 'E-R1-2', round: 1, conference: 'east', position: 2, topSeed: 'NYK', bottomSeed: 'DET', topSeedNum: 2, bottomSeedNum: 7 },
  { id: 'E-R1-3', round: 1, conference: 'east', position: 3, topSeed: 'IND', bottomSeed: 'MIL', topSeedNum: 3, bottomSeedNum: 6 },
];

interface TeamSeed {
  abbreviation: string;
  seedNum: number;
}

function pickWinner(
  top: TeamSeed,
  bottom: TeamSeed,
  matchupId: string,
  overrides: Record<string, string>,
  confOdds: Record<string, number>,
): TeamSeed {
  if (overrides[matchupId]) {
    const winner = overrides[matchupId];
    return winner === top.abbreviation ? top : bottom;
  }
  const topOdds = confOdds[top.abbreviation] ?? 0;
  const bottomOdds = confOdds[bottom.abbreviation] ?? 0;
  return topOdds >= bottomOdds ? top : bottom;
}

export function buildDynamicBracket(
  overrides: Record<string, string>,
  westConfOdds: Record<string, number>,
  eastConfOdds: Record<string, number>,
  championshipOdds: Record<string, number>,
): BracketMatchupConfig[] {
  const all: BracketMatchupConfig[] = [...R1_MATCHUPS];

  // ── West R2 ──
  const wR1_0_winner = pickWinner(
    { abbreviation: 'OKC', seedNum: 1 }, { abbreviation: 'DEN', seedNum: 8 },
    'W-R1-0', overrides, westConfOdds,
  );
  const wR1_1_winner = pickWinner(
    { abbreviation: 'MIN', seedNum: 4 }, { abbreviation: 'LAL', seedNum: 5 },
    'W-R1-1', overrides, westConfOdds,
  );
  const wR1_2_winner = pickWinner(
    { abbreviation: 'HOU', seedNum: 3 }, { abbreviation: 'GSW', seedNum: 6 },
    'W-R1-2', overrides, westConfOdds,
  );
  const wR1_3_winner = pickWinner(
    { abbreviation: 'MEM', seedNum: 2 }, { abbreviation: 'SAC', seedNum: 7 },
    'W-R1-3', overrides, westConfOdds,
  );

  all.push({
    id: 'W-R2-0', round: 2, conference: 'west', position: 0,
    topSeed: wR1_0_winner.abbreviation, bottomSeed: wR1_1_winner.abbreviation,
    topSeedNum: wR1_0_winner.seedNum, bottomSeedNum: wR1_1_winner.seedNum,
  });
  all.push({
    id: 'W-R2-1', round: 2, conference: 'west', position: 1,
    topSeed: wR1_2_winner.abbreviation, bottomSeed: wR1_3_winner.abbreviation,
    topSeedNum: wR1_2_winner.seedNum, bottomSeedNum: wR1_3_winner.seedNum,
  });

  // ── West CF ──
  const wR2_0_winner = pickWinner(
    wR1_0_winner, wR1_1_winner, 'W-R2-0', overrides, westConfOdds,
  );
  const wR2_1_winner = pickWinner(
    wR1_2_winner, wR1_3_winner, 'W-R2-1', overrides, westConfOdds,
  );

  all.push({
    id: 'W-CF', round: 3, conference: 'west', position: 0,
    topSeed: wR2_0_winner.abbreviation, bottomSeed: wR2_1_winner.abbreviation,
    topSeedNum: wR2_0_winner.seedNum, bottomSeedNum: wR2_1_winner.seedNum,
  });

  // ── East R2 ──
  const eR1_0_winner = pickWinner(
    { abbreviation: 'CLE', seedNum: 1 }, { abbreviation: 'MIA', seedNum: 8 },
    'E-R1-0', overrides, eastConfOdds,
  );
  const eR1_1_winner = pickWinner(
    { abbreviation: 'BOS', seedNum: 4 }, { abbreviation: 'ORL', seedNum: 5 },
    'E-R1-1', overrides, eastConfOdds,
  );
  const eR1_2_winner = pickWinner(
    { abbreviation: 'NYK', seedNum: 2 }, { abbreviation: 'DET', seedNum: 7 },
    'E-R1-2', overrides, eastConfOdds,
  );
  const eR1_3_winner = pickWinner(
    { abbreviation: 'IND', seedNum: 3 }, { abbreviation: 'MIL', seedNum: 6 },
    'E-R1-3', overrides, eastConfOdds,
  );

  all.push({
    id: 'E-R2-0', round: 2, conference: 'east', position: 0,
    topSeed: eR1_0_winner.abbreviation, bottomSeed: eR1_1_winner.abbreviation,
    topSeedNum: eR1_0_winner.seedNum, bottomSeedNum: eR1_1_winner.seedNum,
  });
  all.push({
    id: 'E-R2-1', round: 2, conference: 'east', position: 1,
    topSeed: eR1_2_winner.abbreviation, bottomSeed: eR1_3_winner.abbreviation,
    topSeedNum: eR1_2_winner.seedNum, bottomSeedNum: eR1_3_winner.seedNum,
  });

  // ── East CF ──
  const eR2_0_winner = pickWinner(
    eR1_0_winner, eR1_1_winner, 'E-R2-0', overrides, eastConfOdds,
  );
  const eR2_1_winner = pickWinner(
    eR1_2_winner, eR1_3_winner, 'E-R2-1', overrides, eastConfOdds,
  );

  all.push({
    id: 'E-CF', round: 3, conference: 'east', position: 0,
    topSeed: eR2_0_winner.abbreviation, bottomSeed: eR2_1_winner.abbreviation,
    topSeedNum: eR2_0_winner.seedNum, bottomSeedNum: eR2_1_winner.seedNum,
  });

  // ── Finals ──
  const westChamp = pickWinner(
    wR2_0_winner, wR2_1_winner, 'W-CF', overrides, westConfOdds,
  );
  const eastChamp = pickWinner(
    eR2_0_winner, eR2_1_winner, 'E-CF', overrides, eastConfOdds,
  );

  all.push({
    id: 'FINALS', round: 4, conference: 'finals', position: 0,
    topSeed: westChamp.abbreviation, bottomSeed: eastChamp.abbreviation,
    topSeedNum: westChamp.seedNum, bottomSeedNum: eastChamp.seedNum,
  });

  return all;
}
```

- [ ] **Step 2: Verify build passes**

Run: `npx next build 2>&1 | tail -5`
Expected: Build errors in `usePolymarketData.ts` (it still imports `BRACKET_CONFIG`). That's expected — we fix it in Task 4.

- [ ] **Step 3: Commit**

```bash
git add src/lib/bracket.ts
git commit -m "feat: replace static bracket config with dynamic builder"
```

---

### Task 3: Create useScenario hook

**Files:**
- Create: `src/hooks/useScenario.ts`

- [ ] **Step 1: Write the hook**

Create `src/hooks/useScenario.ts`:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { TEAMS } from '@/lib/teams';

interface UseScenarioReturn {
  overrides: Record<string, string>;
  setWinner: (matchupId: string, teamAbbr: string) => void;
  removeOverride: (matchupId: string) => void;
  resetAll: () => void;
  overrideCount: number;
  overrideLabels: { matchupId: string; label: string }[];
}

export function useScenario(): UseScenarioReturn {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const setWinner = useCallback((matchupId: string, teamAbbr: string) => {
    setOverrides((prev) => {
      if (prev[matchupId] === teamAbbr) {
        const next = { ...prev };
        delete next[matchupId];
        return next;
      }
      return { ...prev, [matchupId]: teamAbbr };
    });
  }, []);

  const removeOverride = useCallback((matchupId: string) => {
    setOverrides((prev) => {
      const next = { ...prev };
      delete next[matchupId];
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setOverrides({});
  }, []);

  const overrideCount = Object.keys(overrides).length;

  const overrideLabels = Object.entries(overrides).map(([matchupId, teamAbbr]) => {
    const teamName = TEAMS[teamAbbr]?.name ?? teamAbbr;
    return { matchupId, label: `${teamName} wins ${matchupId}` };
  });

  return { overrides, setWinner, removeOverride, resetAll, overrideCount, overrideLabels };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useScenario.ts
git commit -m "feat: add useScenario hook for bracket overrides"
```

---

### Task 4: Refactor usePolymarketData to accept overrides and build dynamic bracket

**Files:**
- Modify: `src/hooks/usePolymarketData.ts`

- [ ] **Step 1: Update imports and buildMatchups signature**

Replace the import of `BRACKET_CONFIG` and update `buildMatchups`:

Change line 5 from:
```typescript
import { BRACKET_CONFIG } from '@/lib/bracket';
```
to:
```typescript
import { buildDynamicBracket } from '@/lib/bracket';
```

Add import of `MatchupStatus`:
```typescript
import { BracketData, Matchup, MatchupTeam, MatchupStatus } from '@/lib/types';
```

- [ ] **Step 2: Rewrite buildMatchups to use dynamic bracket builder**

Replace the `buildMatchups` function with:

```typescript
function buildMatchups(odds: OddsResponse, overrides: Record<string, string>): Matchup[] {
  const configs = buildDynamicBracket(
    overrides,
    odds.westConf,
    odds.eastConf,
    odds.championship,
  );

  return configs.map((config) => {
    const topOdds = getConferenceOdds(config.topSeed, config.conference, odds);
    const bottomOdds = getConferenceOdds(config.bottomSeed, config.conference, odds);
    const derived = deriveSeriesOdds(topOdds, bottomOdds);

    let status: MatchupStatus;
    if (config.round === 1) {
      status = overrides[config.id] ? 'overridden' : 'confirmed';
    } else if (overrides[config.id]) {
      status = 'overridden';
    } else if (Object.keys(overrides).length > 0) {
      status = 'overridden';
    } else {
      status = 'projected';
    }

    const topTeam: MatchupTeam = {
      abbreviation: config.topSeed,
      seed: config.topSeedNum,
      odds: derived.teamA,
      trend: 0,
      price: Math.round(derived.teamA * 100),
    };

    const bottomTeam: MatchupTeam = {
      abbreviation: config.bottomSeed,
      seed: config.bottomSeedNum,
      odds: derived.teamB,
      trend: 0,
      price: Math.round(derived.teamB * 100),
    };

    return {
      id: config.id,
      round: config.round,
      conference: config.conference,
      seriesScore: config.round === 1 ? 'Projected' : status === 'overridden' ? 'Scenario' : 'Projected',
      topTeam,
      bottomTeam,
      status,
    } satisfies Matchup;
  });
}
```

- [ ] **Step 3: Update the hook to accept overrides parameter**

Change the hook signature and internal calls:

```typescript
export function usePolymarketData(overrides: Record<string, string> = {}): UsePolymarketDataReturn {
```

Update `rebuildData` to use overrides:

```typescript
  const rebuildData = useCallback(
    (status: BracketData['connectionStatus']) => {
      if (!oddsRef.current) return;
      const matchups = buildMatchups(oddsRef.current, overrides);
      setData({
        matchups,
        lastUpdated: new Date().toISOString(),
        connectionStatus: status,
      });
    },
    [overrides],
  );
```

Update the `init()` function inside the effect to also pass overrides:

Change:
```typescript
const matchups = buildMatchups(odds);
```
to:
```typescript
const matchups = buildMatchups(odds, overrides);
```

Add `overrides` to the `useEffect` dependency array (it's already there implicitly via `rebuildData`).

Also add a separate effect to rebuild when overrides change without re-fetching:

```typescript
  useEffect(() => {
    if (oddsRef.current) {
      rebuildData(connectionStatus);
    }
  }, [overrides, rebuildData, connectionStatus]);
```

- [ ] **Step 4: Verify build passes**

Run: `npx next build 2>&1 | tail -10`
Expected: Compiles successfully.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/usePolymarketData.ts
git commit -m "feat: usePolymarketData accepts overrides, builds dynamic bracket"
```

---

### Task 5: Update TeamRow with click handling and selected state

**Files:**
- Modify: `src/components/TeamRow.tsx`

- [ ] **Step 1: Add onClick and isSelected props**

Update the interface and component:

```typescript
interface TeamRowProps {
  team: MatchupTeam;
  isLeading: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}

export function TeamRow({ team, isLeading, onClick, isSelected }: TeamRowProps) {
```

- [ ] **Step 2: Add hover state and click behavior**

Add a `hovered` state and wrap the row div:

```typescript
  const [hovered, setHovered] = useState(false);
```

Add the import at the top:
```typescript
import { useState } from 'react';
```

Update the root div:

```typescript
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onClick && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        height: 36,
        padding: '0 10px 0 0',
        borderBottom: '1px solid rgba(0,0,0,0.03)',
        position: 'relative',
        background: isSelected
          ? 'rgba(13,131,15,0.08)'
          : isLeading
            ? 'rgba(13,131,15,0.04)'
            : hovered
              ? 'rgba(48,91,200,0.06)'
              : undefined,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'background 0.1s',
      }}
    >
```

- [ ] **Step 3: Add green checkmark for selected team**

Update the team name span to show a checkmark when selected:

```typescript
      {/* Name */}
      <span
        style={{
          flex: 1,
          fontSize: 13,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          color: isSelected ? '#0d830f' : isLeading ? undefined : mutedColor,
        }}
      >
        {isSelected && '✓ '}{teamInfo?.name ?? team.abbreviation}
      </span>
```

- [ ] **Step 4: Commit**

```bash
git add src/components/TeamRow.tsx
git commit -m "feat: TeamRow supports click, hover, and selected state"
```

---

### Task 6: Update Matchup with status styling and click handler threading

**Files:**
- Modify: `src/components/Matchup.tsx`

- [ ] **Step 1: Update MatchupProps**

```typescript
import { Matchup as MatchupType, MatchupStatus } from '@/lib/types';

interface MatchupProps {
  matchup: MatchupType;
  isFinals?: boolean;
  onTeamClick?: (matchupId: string, teamAbbr: string) => void;
  overriddenWinner?: string;
}
```

- [ ] **Step 2: Update card styling based on status**

Replace the `cardStyle` logic in the component body:

```typescript
export function Matchup({ matchup, isFinals = false, onTeamClick, overriddenWinner }: MatchupProps) {
  const [hovered, setHovered] = useState(false);
  const tag = getMatchupTag(matchup);
  const status = matchup.status;

  const borderStyle = status === 'projected'
    ? '1.5px dashed #c0c2c5'
    : status === 'overridden'
      ? '1.5px dashed #f59e0b'
      : '1px solid rgba(0,0,0,0.06)';

  const opacity = status === 'projected' ? 0.75 : status === 'overridden' ? 0.85 : 1;

  const cardStyle: React.CSSProperties = isFinals
    ? {
        width: 250,
        background: 'var(--card-bg, #fff)',
        borderRadius: 4,
        border: status !== 'confirmed' ? borderStyle : '2px solid rgba(48,91,200,0.15)',
        boxShadow: hovered
          ? '0 0 0 2px #305bc8, 0 2px 8px rgba(0,0,0,0.1)'
          : '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        opacity,
        transition: 'opacity 0.15s, border-color 0.15s',
      }
    : {
        width: 250,
        background: 'var(--card-bg, #fff)',
        borderRadius: 4,
        border: borderStyle,
        boxShadow: hovered
          ? '0 0 0 2px #305bc8, 0 2px 8px rgba(0,0,0,0.1)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        overflow: 'hidden',
        opacity,
        transition: 'opacity 0.15s, border-color 0.15s',
      };
```

- [ ] **Step 3: Thread onTeamClick to TeamRow components**

Update the TeamRow rendering at the bottom of the component:

```typescript
      <TeamRow
        team={matchup.topTeam}
        isLeading={matchup.topTeam.odds > matchup.bottomTeam.odds}
        onClick={onTeamClick ? () => onTeamClick(matchup.id, matchup.topTeam.abbreviation) : undefined}
        isSelected={overriddenWinner === matchup.topTeam.abbreviation}
      />
      <TeamRow
        team={matchup.bottomTeam}
        isLeading={matchup.bottomTeam.odds > matchup.topTeam.odds}
        onClick={onTeamClick ? () => onTeamClick(matchup.id, matchup.bottomTeam.abbreviation) : undefined}
        isSelected={overriddenWinner === matchup.bottomTeam.abbreviation}
      />
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Matchup.tsx
git commit -m "feat: Matchup supports status styling and click handler"
```

---

### Task 7: Update Round and Bracket to thread click handlers

**Files:**
- Modify: `src/components/Round.tsx`
- Modify: `src/components/Bracket.tsx`

- [ ] **Step 1: Update Round to accept and pass onTeamClick and overrides**

```typescript
'use client';

import { Matchup as MatchupType } from '@/lib/types';
import { Matchup } from './Matchup';

interface RoundProps {
  matchups: MatchupType[];
  isR1?: boolean;
  onTeamClick?: (matchupId: string, teamAbbr: string) => void;
  overrides?: Record<string, string>;
}

export function Round({ matchups, isR1, onTeamClick, overrides = {} }: RoundProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: isR1 ? 'center' : 'space-around',
        width: 250,
        flexShrink: 0,
        gap: isR1 ? 20 : undefined,
      }}
    >
      {matchups.map((m) => (
        <Matchup
          key={m.id}
          matchup={m}
          onTeamClick={onTeamClick}
          overriddenWinner={overrides[m.id]}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Update Bracket props and pass through**

Update `BracketProps` in `src/components/Bracket.tsx`:

```typescript
interface BracketProps {
  matchups: MatchupType[];
  onTeamClick?: (matchupId: string, teamAbbr: string) => void;
  overrides?: Record<string, string>;
}

export function Bracket({ matchups, onTeamClick, overrides = {} }: BracketProps) {
```

Update every `<Round>` to pass through the props:

```typescript
<Round matchups={westR1} isR1 onTeamClick={onTeamClick} overrides={overrides} />
```

Do the same for all 6 `<Round>` instances and the Finals `<Matchup>`:

```typescript
<Matchup matchup={finalsMatchup} onTeamClick={onTeamClick} overriddenWinner={overrides[finalsMatchup.id]} />
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Round.tsx src/components/Bracket.tsx
git commit -m "feat: thread onTeamClick and overrides through Bracket and Round"
```

---

### Task 8: Create ScenarioBar component

**Files:**
- Create: `src/components/ScenarioBar.tsx`

- [ ] **Step 1: Write ScenarioBar**

Create `src/components/ScenarioBar.tsx`:

```typescript
'use client';

interface ScenarioBarProps {
  overrideLabels: { matchupId: string; label: string }[];
  onRemove: (matchupId: string) => void;
  onReset: () => void;
}

export function ScenarioBar({ overrideLabels, onRemove, onReset }: ScenarioBarProps) {
  if (overrideLabels.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        margin: '0 40px 12px',
        background: 'var(--card-bg, #fff)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 6,
        fontSize: 11,
        flexWrap: 'wrap',
      }}
    >
      <span style={{ color: 'var(--text-secondary, #6c6e6f)', fontWeight: 600 }}>
        What if:
      </span>
      {overrideLabels.map(({ matchupId, label }) => (
        <span
          key={matchupId}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            background: 'rgba(48,91,200,0.08)',
            border: '1px solid rgba(48,91,200,0.3)',
            borderRadius: 12,
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--accent-blue, #305bc8)',
          }}
        >
          {label}
          <span
            onClick={() => onRemove(matchupId)}
            style={{ cursor: 'pointer', color: 'var(--text-muted, #9d9e9f)', fontSize: 12 }}
          >
            ×
          </span>
        </span>
      ))}
      <span
        onClick={onReset}
        style={{
          marginLeft: 'auto',
          fontSize: 10,
          fontWeight: 600,
          color: 'var(--accent-blue, #305bc8)',
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        Reset to market odds
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ScenarioBar.tsx
git commit -m "feat: add ScenarioBar component for override chips"
```

---

### Task 9: Wire everything together in page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Add imports and hook usage**

Add the new imports:

```typescript
import { useScenario } from '@/hooks/useScenario';
import { ScenarioBar } from '@/components/ScenarioBar';
```

Update hook usage inside `Home()`:

```typescript
  const { overrides, setWinner, removeOverride, resetAll, overrideLabels } = useScenario();
  const { data, error } = usePolymarketData(overrides);
```

- [ ] **Step 2: Add ScenarioBar between Header and conference labels**

After the `<Header>` line, add:

```typescript
      <ScenarioBar
        overrideLabels={overrideLabels}
        onRemove={removeOverride}
        onReset={resetAll}
      />
```

- [ ] **Step 3: Update Bracket to pass onTeamClick and overrides**

Change:
```typescript
      <Bracket matchups={data.matchups} />
```
to:
```typescript
      <Bracket matchups={data.matchups} onTeamClick={setWinner} overrides={overrides} />
```

- [ ] **Step 4: Verify build passes**

Run: `npx next build 2>&1 | tail -10`
Expected: Compiles successfully with no type errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: wire scenario overrides into page"
```

---

### Task 10: End-to-end verification

- [ ] **Step 1: Start dev server and test**

Run: `npx next dev --port 3000`

Open http://localhost:3000 and verify:

1. Bracket loads with most-likely path — R2+ matchups have dashed borders
2. Click DEN in OKC/DEN R1 matchup — DEN gets ✓, R2 updates with DEN as participant, scenario bar shows "Nuggets wins W-R1-0"
3. Click × on the chip — override removed, bracket reverts
4. Set overrides in both conferences — Finals matchup updates correctly
5. Click "Reset to market odds" — all overrides clear
6. Toggle dark mode — dashed/amber borders render correctly
7. WebSocket updates still work (odds change live)

- [ ] **Step 2: Deploy**

```bash
git push origin main
vercel --prod --yes
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: interactive scenario bracket complete"
```
