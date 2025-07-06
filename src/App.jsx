import './App.css';

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;

// --- Components ---

// Tile Component: Represents a single square on the board
function Tile({ rowIndex, colIndex }) {
  return (
    <div className="tile">
      ({rowIndex}, {colIndex})
    </div>
  );
}

// Board Component: The 7x4 grid
function Board() {
  const tiles = [];
  for (let i = 0; i < BOARD_HEIGHT; i++) {
    for (let j = 0; j < BOARD_WIDTH; j++) {
      tiles.push(<Tile key={`${i}-${j}`} rowIndex={i} colIndex={j} />);
    }
  }
  return <div className="board">{tiles}</div>;
}

// PlayerHUD Component: Displays player's stats
function PlayerHUD() {
  // These are placeholder values for now
  const playerName = "Player 1";
  const turn = 1;
  const food = 10;
  const science = 5;
  const score = 0;

  return (
    <div className="player-hud">
      <h2>{playerName} (Turn: {turn})</h2>
      <div className="stats">
        <span>Food: {food}</span>
        <span>Science: {science}</span>
        <span>Score: {score}</span>
      </div>
    </div>
  );
}


// --- Main App Component ---

function App() {
  return (
    <div className="game-container">
      <h1>Pact Prototype</h1>
      <PlayerHUD />
      <Board />
    </div>
  );
}

export default App;