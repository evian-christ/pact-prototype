import { useState } from 'react';
import './App.css';

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;
const FARM_COST = 10; // The cost to build a farm

// --- Helper Functions ---
// Creates an empty board model
const createInitialBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// --- Components ---

// Tile Component: Represents a single square on the board
function Tile({ rowIndex, colIndex, tileData, onTileClick }) {
  // The content to display inside the tile
  let content = `(${rowIndex}, ${colIndex})`;
  if (tileData) {
    content = tileData.type; // e.g., "Farm"
  }

  // Add a specific class if the tile is occupied by a building
  const tileClassName = `tile ${tileData ? 'occupied' : ''}`;

  return (
    <div className={tileClassName} onClick={() => onTileClick(rowIndex, colIndex)}>
      {content}
    </div>
  );
}

// Board Component: The 7x4 grid
function Board({ board, onTileClick }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((tileData, colIndex) => (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            rowIndex={rowIndex}
            colIndex={colIndex}
            tileData={tileData}
            onTileClick={onTileClick}
          />
        ))
      )}
    </div>
  );
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
  const [food, setFood] = useState(25); // Start with more food
  const [science, setScience] = useState(5);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createInitialBoard());

  // Function to handle tile clicks for building
  const handleTileClick = (rowIndex, colIndex) => {
    // Check if the tile is already occupied
    if (board[rowIndex][colIndex]) {
      console.log("Tile is already occupied!");
      return; // Exit if building already exists
    }

    // Check if the player has enough food
    if (food < FARM_COST) {
      alert(`Not enough food! A farm costs ${FARM_COST}.`);
      return; // Exit if not enough resources
    }

    // All checks passed, proceed with building
    console.log(`Building a Farm at (${rowIndex}, ${colIndex})`);

    // 1. Deduct the cost
    setFood(prevFood => prevFood - FARM_COST);

    // 2. Update the board state (important: create a new copy)
    const newBoard = board.map(row => [...row]); // Deep copy
    newBoard[rowIndex][colIndex] = { type: 'Farm' };
    setBoard(newBoard);
  };

  // Function to handle the "Next Turn" button click
  const handleNextTurn = () => {
    setTurn(prevTurn => prevTurn + 1);
    setFood(prevFood => prevFood + 5); // Base food income
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
      <Board board={board} onTileClick={handleTileClick} />
    </div>
  );
}

export default App;