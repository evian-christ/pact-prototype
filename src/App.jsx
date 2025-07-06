
import { useState, useMemo } from 'react';
import './App.css';

// --- Data Structures ---
const INITIAL_TECH_TREE = {
  improved_farming: {
    name: "Improved Farming",
    description: "All Farms produce +1 Food per turn.",
    cost: { Science: 20 },
    researched: false,
    effect: { type: 'BOOST_BUILDING', building: 'Farm', resource: 'Food', amount: 1 },
  },
};

const BUILDINGS = {
  Farm: { cost: { Food: 10 }, baseProduces: { Food: 3 } },
  Lab: { cost: { Food: 15 }, baseProduces: { Science: 4 } },
};

const BASE_INCOME = { Food: 2, Science: 1 };

// --- Helper Functions ---
const createInitialBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;

// --- Components ---

function Tile({ tileData, onTileClick }) {
  let content = "";
  let tileTypeClass = "";
  if (tileData) {
    content = tileData.type;
    tileTypeClass = tileData.type.toLowerCase();
  }
  return <div className={`tile ${tileTypeClass}`} onClick={onTileClick}>{content}</div>;
}

function Board({ board, onTileClick }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((tileData, colIndex) => (
          <Tile
            key={`${rowIndex}-${colIndex}`}
            tileData={tileData}
            onTileClick={() => onTileClick(rowIndex, colIndex)}
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
        {Object.keys(BUILDINGS).map(type => (
          <button 
            key={type}
            className={`build-button ${selectedBuilding === type ? 'selected' : ''}`}
            onClick={() => onSelectBuilding(type)}
          >
            {type} (Cost: {BUILDINGS[type].cost.Food} F)
          </button>
        ))}
      </div>
      <button onClick={onNextTurn} style={{ marginTop: '1rem' }}>
        End Turn
      </button>
    </div>
  );
}

function TechPanel({ techTree, science, onResearch }) {
  return (
    <div className="tech-panel">
      <h3>Technology</h3>
      <ul>
        {Object.entries(techTree).map(([techId, tech]) => {
          const canAfford = science >= tech.cost.Science;
          return (
            <li key={techId} className={tech.researched ? 'researched' : ''}>
              <strong>{tech.name}</strong>: {tech.description} (Cost: {tech.cost.Science} S)
              {!tech.researched && (
                <button onClick={() => onResearch(techId)} disabled={!canAfford}>
                  {canAfford ? 'Research' : 'No Funds'}
                </button>
              )}
            </li>
          );
        })}
      </ul>
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
  const [techTree, setTechTree] = useState(INITIAL_TECH_TREE);

  const buildingBonuses = useMemo(() => {
    const bonuses = {};
    for (const tech of Object.values(techTree)) {
      if (tech.researched && tech.effect.type === 'BOOST_BUILDING') {
        const { building, resource, amount } = tech.effect;
        if (!bonuses[building]) bonuses[building] = {};
        if (!bonuses[building][resource]) bonuses[building][resource] = 0;
        bonuses[building][resource] += amount;
      }
    }
    return bonuses;
  }, [techTree]);

  const handleSelectBuilding = (type) => setSelectedBuilding(prev => prev === type ? null : type);

  const handleTileClick = (rowIndex, colIndex) => {
    if (!selectedBuilding || board[rowIndex][colIndex]) return;

    const buildingInfo = BUILDINGS[selectedBuilding];
    if (food < buildingInfo.cost.Food) {
      alert(`Not enough food!`);
      return;
    }

    setFood(f => f - buildingInfo.cost.Food);
    const newBoard = board.map(r => [...r]);
    newBoard[rowIndex][colIndex] = { type: selectedBuilding };
    setBoard(newBoard);
  };

  const handleResearch = (techId) => {
    const tech = techTree[techId];
    if (!tech || tech.researched || science < tech.cost.Science) return;

    setScience(s => s - tech.cost.Science);
    setTechTree(prevTree => ({
      ...prevTree,
      [techId]: { ...prevTree[techId], researched: true },
    }));
  };

  const handleNextTurn = () => {
    let foodIncome = BASE_INCOME.Food;
    let scienceIncome = BASE_INCOME.Science;

    board.forEach(row => {
      row.forEach(tile => {
        if (!tile) return;
        const building = BUILDINGS[tile.type];
        const bonus = buildingBonuses[tile.type] || {};
        foodIncome += (building.baseProduces.Food || 0) + (bonus.Food || 0);
        scienceIncome += (building.baseProduces.Science || 0) + (bonus.Science || 0);
      });
    });

    setTurn(t => t + 1);
    setFood(f => f + foodIncome);
    setScience(s => s + scienceIncome);
  };

  return (
    <div className="game-container">
      <PlayerHUD 
        stats={{ turn, food, science, score }}
        onNextTurn={handleNextTurn}
        onSelectBuilding={handleSelectBuilding}
        selectedBuilding={selectedBuilding}
      />
      <TechPanel techTree={techTree} science={science} onResearch={handleResearch} />
      <Board board={board} onTileClick={handleTileClick} />
    </div>
  );
}

export default App;
