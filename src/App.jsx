
import { useState } from 'react';
import './App.css';

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;

// --- Components ---

// Tile Component: Represents a single square on the board
function Tile({ rowIndex, colIndex }) {
  // When a tile is clicked, log its coordinates to the browser console
  const handleClick = () => {
    console.log(`Tile clicked: (${rowIndex}, ${colIndex})`);
  };

  return (
    <div className="tile" onClick={handleClick}>
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

// PlayerHUD Component: Displays player's stats and actions
function PlayerHUD({ turn, food, science, score, onNextTurn }) {
  const playerName = "Player 1";

  return (
    <div className="player-hud">
      <h2>{playerName} (Turn: {turn})</h2>
      <div className="stats">
        <span>Food: {food}</span>
        <span>Science: {science}</span>
        <span>Score: {score}</span>
      </div>
      <button onClick={onNextTurn} style={{ marginTop: '1rem' }}>
        Next Turn
      </button>
    </div>
  );
}


// --- Main App Component ---

function App() {
  // Game State Management
  const [turn, setTurn] = useState(1);
  const [food, setFood] = useState(10);
  const [science, setScience] = useState(5);
  const [score, setScore] = useState(0);

  // Function to handle the "Next Turn" button click
  const handleNextTurn = () => {
    setTurn(prevTurn => prevTurn + 1);
    setFood(prevFood => prevFood + 5); // Gain 5 food per turn for now
    // We can add more logic here later (e.g., science gain)
  };

  return (
    <div className="game-container">
      <h1>Pact Prototype</h1>
      <PlayerHUD 
        turn={turn} 
        food={food} 
        science={science} 
        score={score} 
        onNextTurn={handleNextTurn}
      />
      <Board />
    </div>
  );
}

export default App;
