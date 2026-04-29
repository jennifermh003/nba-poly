'use client';

interface ConnectorsProps {
  pairs: number;
}

const CONNECTOR_WIDTH = 32;
const LINE_WIDTH = 1.5;
const BORDER_RADIUS = 3;

export function Connectors({ pairs }: ConnectorsProps) {
  if (pairs === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: `${CONNECTOR_WIDTH}px`,
          flex: `0 0 ${CONNECTOR_WIDTH}px`,
          minHeight: 0,
        }}
      >
        <div
          style={{
            height: `${LINE_WIDTH}px`,
            background: 'var(--bracket-line-color, #d0d3d8)',
            width: '100%',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        width: `${CONNECTOR_WIDTH}px`,
        flex: `0 0 ${CONNECTOR_WIDTH}px`,
        minHeight: 0,
      }}
    >
      {Array.from({ length: pairs }).map((_, i) => (
        <ConnectorPair key={i} />
      ))}
    </div>
  );
}

function ConnectorPair() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        height: '50%',
        minHeight: '80px',
      }}
    >
      {/* Right-angle bracket merging two lines into one */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Top arm */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            borderRight: `${LINE_WIDTH}px solid var(--bracket-line-color, #d0d3d8)`,
            borderTop: `${LINE_WIDTH}px solid var(--bracket-line-color, #d0d3d8)`,
            borderTopRightRadius: `${BORDER_RADIUS}px`,
          }}
        />
        {/* Bottom arm */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            borderRight: `${LINE_WIDTH}px solid var(--bracket-line-color, #d0d3d8)`,
            borderBottom: `${LINE_WIDTH}px solid var(--bracket-line-color, #d0d3d8)`,
            borderBottomRightRadius: `${BORDER_RADIUS}px`,
          }}
        />
      </div>
      {/* Horizontal line out to next round */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            height: `${LINE_WIDTH}px`,
            background: 'var(--bracket-line-color, #d0d3d8)',
            width: '100%',
          }}
        />
      </div>
    </div>
  );
}
