
import { useState, useMemo } from 'react';
import './App.css';

// --- Data Structures ---
const createInitialTechTree = () => ({
  improved_farming: {
    name: "Improved Farming",
    description: "Farms +1 Food",
    cost: { Science: 20 },
    researched: false,
    effect: { type: 'BOOST_BUILDING', building: 'Farm', resource: 'Food', amount: 1 },
  },
});

const BUILDINGS = {
  Farm: { cost: { Food: 10 }, baseProduces: { Food: 3 } },
  Lab: { cost: { Food: 15 }, baseProduces: { Science: 4 } },
  Barracks: { cost: { Food: 20 }, baseProduces: {} },
};

const UNITS = {
  Warrior: { cost: { Food: 15 } },
};

const BASE_INCOME = { Food: 2, Science: 1 };

const createInitialPlayerState = () => ({
  food: 40,
  science: 10,
  score: 0,
  board: createInitialBoard(),
  techTree: createInitialTechTree(),
  units: { Warrior: 0 },
  isReady: false,
});

// --- Helper Functions ---
const createInitialBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;
const NUM_PLAYERS = 2;

// --- Components ---

function Tile({ tileData, onTileClick }) {
  const tileTypeClass = tileData ? tileData.type.toLowerCase() : '';
  return <div className={`tile ${tileTypeClass}`} onClick={onTileClick}>{tileData?.type || ''}</div>;
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

function MilitaryPanel({ player, onTrainUnit }) {
  const hasBarracks = player.board.flat().some(tile => tile?.type === 'Barracks');
  const canTrainWarrior = hasBarracks && player.food >= UNITS.Warrior.cost.Food;

  return (
    <div className="military-panel">
      <h4>Military</h4>
      <div className="unit-display">
        <span>Warriors: {player.units.Warrior}</span>
        <button onClick={() => onTrainUnit('Warrior')} disabled={!canTrainWarrior}>
          Train ({UNITS.Warrior.cost.Food}F)
        </button>
      </div>
    </div>
  );
}

function PlayerInterface({ player, playerName, onReady, onSelectBuilding, selectedBuilding, onTileClick, onResearch, onTrainUnit }) {
  return (
    <div className="player-interface">
      <div className="player-hud">
        <h2>{playerName}</h2>
        <div className="stats">
          <span>F: {player.food}</span>
          <span>S: {player.science}</span>
          <span>Pts: {player.score}</span>
        </div>
        <div className="build-controls">
          {Object.keys(BUILDINGS).map(type => (
            <button 
              key={type}
              className={`build-button ${selectedBuilding === type ? 'selected' : ''}`}
              onClick={() => onSelectBuilding(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <button onClick={onReady} className={`ready-button ${player.isReady ? 'ready' : ''}`}>
          {player.isReady ? 'Waiting...' : 'Ready'}
        </button>
      </div>
      <MilitaryPanel player={player} onTrainUnit={onTrainUnit} />
      <div className="tech-panel">
        <ul>
          {Object.entries(player.techTree).map(([techId, tech]) => {
            const canAfford = player.science >= tech.cost.Science;
            return (
              <li key={techId} className={tech.researched ? 'researched' : ''}>
                <span>{tech.name} ({tech.cost.Science}S)</span>
                {!tech.researched && (
                  <button onClick={() => onResearch(techId)} disabled={!canAfford}>R</button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <Board board={player.board} onTileClick={onTileClick} />
    </div>
  );
}

// --- Main App Component ---

function App() {
  const [turn, setTurn] = useState(1);
  const [players, setPlayers] = useState(() => Array(NUM_PLAYERS).fill(null).map(() => createInitialPlayerState()));
  const [selectedBuildings, setSelectedBuildings] = useState(Array(NUM_PLAYERS).fill(null));

  const updatePlayerState = (playerIndex, updates) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[playerIndex] = { ...newPlayers[playerIndex], ...updates };
      return newPlayers;
    });
  };

  const handleSelectBuilding = (playerIndex, buildingType) => {
    setSelectedBuildings(prev => {
      const newSelection = [...prev];
      newSelection[playerIndex] = newSelection[playerIndex] === buildingType ? null : buildingType;
      return newSelection;
    });
  };

  const handleTileClick = (playerIndex, rowIndex, colIndex) => {
    const selectedBuilding = selectedBuildings[playerIndex];
    if (!selectedBuilding) return;

    const player = players[playerIndex];
    if (player.board[rowIndex][colIndex]) return;

    const buildingInfo = BUILDINGS[selectedBuilding];
    if (player.food < buildingInfo.cost.Food) {
      alert('Not enough food!');
      return;
    }

    const newBoard = player.board.map(r => [...r]);
    newBoard[rowIndex][colIndex] = { type: selectedBuilding };
    
    updatePlayerState(playerIndex, {
      food: player.food - buildingInfo.cost.Food,
      board: newBoard,
    });
  };

  const handleResearch = (playerIndex, techId) => {
    const player = players[playerIndex];
    const tech = player.techTree[techId];
    if (!tech || tech.researched || player.science < tech.cost.Science) return;

    const newTechTree = { ...player.techTree, [techId]: { ...tech, researched: true } };
    updatePlayerState(playerIndex, {
      science: player.science - tech.cost.Science,
      techTree: newTechTree,
    });
  };

  const handleTrainUnit = (playerIndex, unitType) => {
    const player = players[playerIndex];
    const unitInfo = UNITS[unitType];
    const hasPrereq = player.board.flat().some(tile => tile?.type === 'Barracks');

    if (!hasPrereq) {
      alert("You need to build a Barracks first!");
      return;
    }
    if (player.food < unitInfo.cost.Food) {
      alert("Not enough food to train a Warrior!");
      return;
    }

    const newUnits = { ...player.units, [unitType]: player.units[unitType] + 1 };
    updatePlayerState(playerIndex, {
      food: player.food - unitInfo.cost.Food,
      units: newUnits,
    });
  };

  const handleReady = (playerIndex) => {
    const newPlayers = [...players];
    newPlayers[playerIndex].isReady = !newPlayers[playerIndex].isReady;
    setPlayers(newPlayers);

    if (newPlayers.every(p => p.isReady)) {
      processTurn();
    }
  };

  const processTurn = () => {
    console.log("--- Processing Turn", turn, "---");
    let newPlayers = players.map(player => {
      let foodIncome = BASE_INCOME.Food;
      let scienceIncome = BASE_INCOME.Science;

      player.board.forEach(row => {
        row.forEach(tile => {
          if (!tile) return;
          const buildingProduces = BUILDINGS[tile.type].baseProduces;
          foodIncome += buildingProduces.Food || 0;
          scienceIncome += buildingProduces.Science || 0;
        });
      });

      return {
        ...player,
        food: player.food + foodIncome,
        science: player.science + scienceIncome,
        isReady: false,
      };
    });

    setPlayers(newPlayers);
    setTurn(t => t + 1);
    setSelectedBuildings(Array(NUM_PLAYERS).fill(null));
  };

  return (
    <div className="game-container">
      <div className="turn-header"><h1>Global Turn: {turn}</h1></div>
      <div className="players-area">
        {players.map((player, index) => (
          <PlayerInterface 
            key={index}
            player={player}
            playerName={`Player ${index + 1}`}
            onReady={() => handleReady(index)}
            onSelectBuilding={(type) => handleSelectBuilding(index, type)}
            selectedBuilding={selectedBuildings[index]}
            onTileClick={(r, c) => handleTileClick(index, r, c)}
            onResearch={(techId) => handleResearch(index, techId)}
            onTrainUnit={(unitType) => handleTrainUnit(index, unitType)}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
