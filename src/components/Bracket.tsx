'use client';

import { Matchup as MatchupType } from '@/lib/types';
import { Round } from './Round';
import { Connectors } from './Connectors';
import { Matchup } from './Matchup';

interface BracketProps {
  matchups: MatchupType[];
  onTeamClick?: (matchupId: string, teamAbbr: string) => void;
  overrides?: Record<string, string>;
}

const roundLabels: Record<number, string> = {
  1: 'Round 1',
  2: 'Conf Semis',
  3: 'Conf Finals',
  4: 'Finals',
};

export function Bracket({ matchups, onTeamClick, overrides }: BracketProps) {
  // Filter matchups by round and conference
  const westR1 = matchups.filter((m) => m.round === 1 && m.conference === 'west');
  const westR2 = matchups.filter((m) => m.round === 2 && m.conference === 'west');
  const westCF = matchups.filter((m) => m.round === 3 && m.conference === 'west');
  const finals = matchups.filter((m) => m.round === 4 || m.conference === 'finals');
  const eastCF = matchups.filter((m) => m.round === 3 && m.conference === 'east');
  const eastR2 = matchups.filter((m) => m.round === 2 && m.conference === 'east');
  const eastR1 = matchups.filter((m) => m.round === 1 && m.conference === 'east');

  const finalsMatchup = finals[0] ?? null;

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      {/* Conference labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          minWidth: '1500px',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#6b7280',
            paddingBottom: '4px',
          }}
        >
          Western Conference
        </div>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#6b7280',
            paddingBottom: '4px',
          }}
        >
          Eastern Conference
        </div>
      </div>

      {/* Round labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          minWidth: '1500px',
          padding: '0 40px',
        }}
      >
        <RoundLabel label={roundLabels[1]} />
        <ConnectorSpacer />
        <RoundLabel label={roundLabels[2]} />
        <ConnectorSpacer />
        <RoundLabel label={roundLabels[3]} />
        <ConnectorSpacer />
        <RoundLabel label={roundLabels[4]} />
        <ConnectorSpacer />
        <RoundLabel label={roundLabels[3]} />
        <ConnectorSpacer />
        <RoundLabel label={roundLabels[2]} />
        <ConnectorSpacer />
        <RoundLabel label={roundLabels[1]} />
      </div>

      {/* Bracket body */}
      <div
        style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          minWidth: '1500px',
          padding: '4px 40px 0',
          minHeight: '620px',
        }}
      >
        {/* West R1 */}
        <Round matchups={westR1} isR1 onTeamClick={onTeamClick} overrides={overrides} />

        {/* Connectors R1 -> Semis (2 pairs: 4 matchups merge into 2) */}
        <Connectors pairs={2} />

        {/* West Semis */}
        <Round matchups={westR2} onTeamClick={onTeamClick} overrides={overrides} />

        {/* Connectors Semis -> CF (1 pair: 2 matchups merge into 1) */}
        <Connectors pairs={1} />

        {/* West Conf Finals */}
        <Round matchups={westCF} onTeamClick={onTeamClick} overrides={overrides} />

        {/* Connectors CF -> Finals (single line) */}
        <Connectors pairs={0} />

        {/* Finals */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '270px',
            flex: '0 0 270px',
            alignItems: 'center',
            minHeight: 0,
          }}
        >
          {finalsMatchup ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
              }}
            >
              {/* Trophy icon */}
              <div
                style={{
                  textAlign: 'center',
                  marginBottom: '6px',
                  fontSize: '24px',
                  lineHeight: 1,
                }}
              >
                <span role="img" aria-label="NBA Finals trophy">
                  🏆
                </span>
              </div>
              <Matchup matchup={finalsMatchup} onTeamClick={onTeamClick} overriddenWinner={overrides?.[finalsMatchup.id]} />
            </div>
          ) : (
            <div
              style={{
                color: '#9ca3af',
                fontSize: '13px',
                textAlign: 'center',
              }}
            >
              Finals TBD
            </div>
          )}
        </div>

        {/* Connectors Finals -> East CF (single line) */}
        <Connectors pairs={0} />

        {/* East Conf Finals */}
        <Round matchups={eastCF} onTeamClick={onTeamClick} overrides={overrides} />

        {/* Connectors CF -> Semis (1 pair) */}
        <Connectors pairs={1} />

        {/* East Semis */}
        <Round matchups={eastR2} onTeamClick={onTeamClick} overrides={overrides} />

        {/* Connectors Semis -> R1 (2 pairs) */}
        <Connectors pairs={2} />

        {/* East R1 */}
        <Round matchups={eastR1} isR1 onTeamClick={onTeamClick} overrides={overrides} />
      </div>
    </div>
  );
}

/** Renders a round label centered above a 250px column */
function RoundLabel({ label }: { label: string }) {
  return (
    <div
      style={{
        width: '250px',
        flex: '0 0 250px',
        textAlign: 'center',
        fontSize: '11px',
        fontWeight: 600,
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        paddingBottom: '6px',
      }}
    >
      {label}
    </div>
  );
}

/** Invisible spacer matching connector column width */
function ConnectorSpacer() {
  return (
    <div
      style={{
        width: '32px',
        flex: '0 0 32px',
      }}
    />
  );
}
