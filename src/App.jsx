
import { useState } from 'react';
import './App.css';

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;
const FARM_COST = 10;
const BASE_FOOD_INCOME = 2;
const FARM_FOOD_PRODUCTION = 3;

// --- Helper Functions ---
// Creates an empty board model
const createInitialBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// --- Components ---

// Tile Component: Represents a single square on the board
function Tile({ rowIndex, colIndex, tileData, onTileClick }) {
  let content = `(${rowIndex}, ${colIndex})`;
  if (tileData) {
    content = tileData.type;
  }

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
  const [food, setFood] = useState(25);
  const [science, setScience] = useState(5);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createInitialBoard());

  // Function to handle tile clicks for building
  const handleTileClick = (rowIndex, colIndex) => {
    if (board[rowIndex][colIndex]) {
      console.log("Tile is already occupied!");
      return;
    }

    if (food < FARM_COST) {
      alert(`Not enough food! A farm costs ${FARM_COST}.`);
      return;
    }

    setFood(prevFood => prevFood - FARM_COST);

    const newBoard = board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = { type: 'Farm' };
    setBoard(newBoard);
  };

  // Function to handle the "Next Turn" button click
  const handleNextTurn = () => {
    // 1. Calculate income from buildings
    let foodFromFarms = 0;
    board.forEach(row => {
      row.forEach(tile => {
        if (tile?.type === 'Farm') {
          foodFromFarms += FARM_FOOD_PRODUCTION;
        }
      });
    });

    // 2. Update state for the new turn
    setTurn(prevTurn => prevTurn + 1);
    setFood(prevFood => prevFood + BASE_FOOD_INCOME + foodFromFarms);
    console.log(`Turn ended. Base income: ${BASE_FOOD_INCOME}, Farm income: ${foodFromFarms}`);
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
