import { useState } from 'react';
import './App.css';

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;

const BUILDINGS = {
  Farm: { cost: { Food: 10 }, produces: { Food: 3 } },
  Lab: { cost: { Food: 15 }, produces: { Science: 4 } },
};

const BASE_INCOME = { Food: 2, Science: 1 };

// --- Helper Functions ---
const createInitialBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// --- Components ---

function Tile({ rowIndex, colIndex, tileData, onTileClick }) {
  let content = "";
  let tileTypeClass = "";
  if (tileData) {
    content = tileData.type;
    tileTypeClass = tileData.type.toLowerCase(); // farm or lab
  }

  const tileClassName = `tile ${tileTypeClass}`;

  return (
    <div className={tileClassName} onClick={() => onTileClick(rowIndex, colIndex)}>
      {content}
    </div>
  );
}

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

function PlayerHUD({ stats, onNextTurn, onSelectBuilding, selectedBuilding }) {
  return (
    <div className="player-hud">
      <h2>Player 1 (Turn: {stats.turn})</h2>
      <div className="stats">
        <span>Food: {stats.food}</span>
        <span>Science: {stats.science}</span>
        <span>Score: {stats.score}</span>
      </div>
      <div className="build-controls">
        <h4>Select Building:</h4>
        {Object.keys(BUILDINGS).map(buildingType => (
          <button 
            key={buildingType}
            className={`build-button ${selectedBuilding === buildingType ? 'selected' : ''}`}
            onClick={() => onSelectBuilding(buildingType)}
          >
            {buildingType} (Cost: {BUILDINGS[buildingType].cost.Food} F)
          </button>
        ))}
      </div>
      <button onClick={onNextTurn} style={{ marginTop: '1rem' }}>
        End Turn
      </button>
    </div>
  );
}

// --- Main App Component ---

function App() {
  const [turn, setTurn] = useState(1);
  const [food, setFood] = useState(30);
  const [science, setScience] = useState(10);
  const [score, setScore] = useState(0);
  const [board, setBoard] = useState(createInitialBoard());
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  const handleSelectBuilding = (buildingType) => {
    setSelectedBuilding(prev => prev === buildingType ? null : buildingType);
  };

  const handleTileClick = (rowIndex, colIndex) => {
    if (!selectedBuilding) {
      console.log("Please select a building first.");
      return;
    }
    if (board[rowIndex][colIndex]) {
      console.log("Tile is already occupied!");
      return;
    }

    const buildingInfo = BUILDINGS[selectedBuilding];
    if (food < buildingInfo.cost.Food) {
      alert(`Not enough food! A ${selectedBuilding} costs ${buildingInfo.cost.Food}.`);
      return;
    }

    setFood(prevFood => prevFood - buildingInfo.cost.Food);

    const newBoard = board.map(row => [...row]);
    newBoard[rowIndex][colIndex] = { type: selectedBuilding };
    setBoard(newBoard);
  };

  const handleNextTurn = () => {
    let foodIncome = BASE_INCOME.Food;
    let scienceIncome = BASE_INCOME.Science;

    board.forEach(row => {
      row.forEach(tile => {
        if (tile) {
          const buildingProduces = BUILDINGS[tile.type].produces;
          foodIncome += buildingProduces.Food || 0;
          scienceIncome += buildingProduces.Science || 0;
        }
      });
    });

    setTurn(prevTurn => prevTurn + 1);
    setFood(prevFood => prevFood + foodIncome);
    setScience(prevScience => prevScience + scienceIncome);
    console.log(`Turn ended. Food income: ${foodIncome}, Science income: ${scienceIncome}`);
  };

  return (
    <div className="game-container">
      <h1>Pact Prototype</h1>
      <PlayerHUD 
        stats={{ turn, food, science, score }}
        onNextTurn={handleNextTurn}
        onSelectBuilding={handleSelectBuilding}
        selectedBuilding={selectedBuilding}
      />
      <Board board={board} onTileClick={handleTileClick} />
    </div>
  );
}

export default App;