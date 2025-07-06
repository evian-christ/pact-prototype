
import { useState, useMemo, useCallback } from 'react';
import './App.css';

// --- Data Structures ---
const createInitialTechTree = () => ({}); // Simplified for now

const BUILDINGS = {
  Farm: { cost: { Food: 10 }, baseProduces: { Food: 3 }, points: 5 },
  Lab: { cost: { Food: 15 }, baseProduces: { Science: 4 }, points: 5 },
  Barracks: { cost: { Food: 20 }, baseProduces: {}, points: 5 },
};

const UNITS = {
  Warrior: { cost: { Food: 15 }, attack: 1, movePattern: 'straight' },
};

const BASE_INCOME = { Food: 2, Science: 1 };
const DESTROY_SCORE = 10;
const BREAKTHROUGH_SCORE = 5;

const createInitialPlayerState = () => ({
  food: 40,
  science: 10,
  score: 0,
  board: createInitialBoard(),
  techTree: createInitialTechTree(),
  units: { Warrior: 1 }, // Start with 1 warrior
  isReady: false,
  pendingAttacks: [], // Attacks planned by this player
});

// --- Helper Functions ---
const createInitialBoard = () => 
  Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));

// --- Constants ---
const BOARD_WIDTH = 7;
const BOARD_HEIGHT = 4;
const NUM_PLAYERS = 2;

// --- Components ---

function Tile({ tileData, onTileClick, isIncomingAttack, unitOnTile, isDeployTarget, activeAction }) {
  const tileTypeClass = tileData ? tileData.type.toLowerCase() : '';
  const incomingAttackClass = isIncomingAttack ? 'incoming-attack' : '';
  const deployTargetClass = isDeployTarget ? 'deploy-target' : '';

  let content = '';
  if (unitOnTile) {
    content = '⚔️'; // Show warrior icon if unit is on tile
  } else if (tileData) {
    content = tileData.type; // Show building type if no unit
  }

  return (
    <div 
      className={`tile ${tileTypeClass} ${incomingAttackClass} ${deployTargetClass}`}
      onClick={onTileClick}
      style={{ cursor: activeAction === 'deploy_Warrior' ? (isDeployTarget ? 'pointer' : 'not-allowed') : 'pointer' }}
    >
      {content}
      {isIncomingAttack && <div className="incoming-attack-marker">↓</div>}
    </div>
  );
}

function Board({ board, onTileClick, incomingAttacks, unitsOnBoard, isOpponentBoard, activeAction }) {
  return (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((tileData, colIndex) => {
          const isIncomingAttack = incomingAttacks.some(attack => attack.targetTile[0] === rowIndex && attack.targetTile[1] === colIndex);
          const unitOnTile = unitsOnBoard.find(unit => unit.currentPosition[0] === rowIndex && unit.currentPosition[1] === colIndex);
          const isDeployTarget = isOpponentBoard && activeAction === 'deploy_Warrior' && rowIndex === 0; // Only top row of opponent board

          return (
            <Tile
              key={`${rowIndex}-${colIndex}`}
              tileData={tileData}
              onTileClick={() => onTileClick(rowIndex, colIndex)}
              isIncomingAttack={isIncomingAttack}
              unitOnTile={unitOnTile}
              isDeployTarget={isDeployTarget}
              activeAction={activeAction}
            />
          );
        })
      )}
    </div>
  );
}

function MilitaryPanel({ player, onTrainUnit, onDeployUnit, activeAction }) {
  const hasBarracks = player.board.flat().some(tile => tile?.type === 'Barracks');
  const canTrainWarrior = hasBarracks && player.food >= UNITS.Warrior.cost.Food;
  const canDeployWarrior = player.units.Warrior > 0;

  return (
    <div className="military-panel">
      <h4>Military</h4>
      <div className="unit-display">
        <span>Warriors: {player.units.Warrior}</span>
        <button onClick={() => onTrainUnit('Warrior')} disabled={!canTrainWarrior}>
          Train ({UNITS.Warrior.cost.Food}F)
        </button>
      </div>
      <button 
        className={`deploy-button ${activeAction === 'deploy_Warrior' ? 'active' : ''}`}
        onClick={() => onDeployUnit('Warrior')}
        disabled={!canDeployWarrior}
      >
        DEPLOY WARRIOR
      </button>
    </div>
  );
}

function PlayerInterface({
  playerIndex,
  player,
  playerName,
  onReady,
  onSelectBuilding,
  activeAction,
  onTrainUnit,
  onDeployUnit,
  onBoardClick,
  opponentPlayerIndex,
  playersData,
}) {
  const ownBoardData = player.board;
  const opponentBoardData = playersData[opponentPlayerIndex].board;

  const incomingAttacksForOwnBoard = playersData[opponentPlayerIndex].pendingAttacks.filter(a => a.targetPlayerIndex === playerIndex);
  const unitsOnOwnBoard = playersData[playerIndex].pendingAttacks.filter(a => a.targetPlayerIndex === playerIndex);

  const incomingAttacksForOpponentBoard = playersData[playerIndex].pendingAttacks.filter(a => a.targetPlayerIndex === opponentPlayerIndex);
  const unitsOnOpponentBoard = playersData[playerIndex].pendingAttacks.filter(a => a.targetPlayerIndex === opponentPlayerIndex);

  return (
    <div className={`player-interface ${activeAction === 'deploy_Warrior' ? 'deploy-mode-active' : ''}`}>
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
              className={`build-button ${activeAction === `build_${type}` ? 'selected' : ''}`}
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
      <MilitaryPanel player={player} onTrainUnit={onTrainUnit} onDeployUnit={onDeployUnit} activeAction={activeAction} />
      
      <div className="player-boards-container">
        <div className="own-board-section">
          <h3>Your Board</h3>
          <Board
            board={ownBoardData}
            onTileClick={(r, c) => onBoardClick(playerIndex, playerIndex, r, c)}
            incomingAttacks={incomingAttacksForOwnBoard}
            unitsOnBoard={unitsOnOwnBoard}
            isOpponentBoard={false}
            activeAction={activeAction}
          />
        </div>
        <div className="opponent-board-section">
          <h3>Opponent's Board</h3>
          <Board
            board={opponentBoardData}
            onTileClick={(r, c) => onBoardClick(playerIndex, opponentPlayerIndex, r, c)}
            incomingAttacks={incomingAttacksForOpponentBoard}
            unitsOnBoard={unitsOnOpponentBoard}
            isOpponentBoard={true}
            activeAction={activeAction}
          />
        </div>
      </div>
    </div>
  );
}

// --- Main App Component ---

function App() {
  const [turn, setTurn] = useState(1);
  const [players, setPlayers] = useState(() => Array(NUM_PLAYERS).fill(null).map(() => createInitialPlayerState()));
  const [activeAction, setActiveAction] = useState(Array(NUM_PLAYERS).fill(null)); // e.g., null, 'build_Farm', 'deploy_Warrior'

  const updatePlayerState = (playerIndex, updatesFn) => {
    setPlayers(prev => {
      const newPlayers = [...prev];
      newPlayers[playerIndex] = updatesFn(newPlayers[playerIndex]);
      return newPlayers;
    });
  };

  const handleSelectBuilding = (playerIndex, buildingType) => {
    setActiveAction(prev => {
      const newActions = [...prev];
      newActions[playerIndex] = newActions[playerIndex] === `build_${buildingType}` ? null : `build_${buildingType}`;
      return newActions;
    });
  };

  const handleDeployUnit = (playerIndex, unitType) => {
    const player = players[playerIndex];
    if (player.units[unitType] <= 0) {
      alert(`No ${unitType}s to deploy!`);
      return;
    }
    setActiveAction(prev => {
      const newActions = [...prev];
      newActions[playerIndex] = newActions[playerIndex] === `deploy_${unitType}` ? null : `deploy_${unitType}`;
      return newActions;
    });
  };

  const handleBoardClick = useCallback((callerPlayerIndex, clickedBoardPlayerIndex, rowIndex, colIndex) => {
    console.log(`--- handleBoardClick called ---`);
    console.log(`Caller Player Index: ${callerPlayerIndex + 1}`);
    console.log(`Clicked Board Player Index: ${clickedBoardPlayerIndex + 1}`);
    console.log(`Clicked Tile: (${rowIndex}, ${colIndex})`);
    console.log(`Active Action for Caller (${callerPlayerIndex + 1}): ${activeAction[callerPlayerIndex]}`);

    const currentActiveAction = activeAction[callerPlayerIndex];
    const player = players[callerPlayerIndex];

    // Find the player who has an active 'deploy_Warrior' action
    const deployingPlayerIndex = activeAction.findIndex(action => action === 'deploy_Warrior');

    let playerToActIndex = callerPlayerIndex;
    let activeActionToProcess = currentActiveAction;
    let playerToAct = player;

    if (deployingPlayerIndex !== -1) {
      playerToActIndex = deployingPlayerIndex;
      activeActionToProcess = activeAction[deployingPlayerIndex];
      playerToAct = players[deployingPlayerIndex];
    }

    if (activeActionToProcess && activeActionToProcess.startsWith('build_')) {
      const buildingType = activeActionToProcess.substring(6);
      if (playerToActIndex !== clickedBoardPlayerIndex) {
        alert("You can only build on your own board!");
        return;
      }
      if (playerToAct.board[rowIndex][colIndex]) {
        console.log("Tile is already occupied for building.");
        return;
      }
      const buildingInfo = BUILDINGS[buildingType];
      if (playerToAct.food < buildingInfo.cost.Food) {
        alert('Not enough food!');
        console.log("Not enough food for building.");
        return;
      }
      const newBoard = playerToAct.board.map(r => [...r]);
      newBoard[rowIndex][colIndex] = { type: buildingType };
      updatePlayerState(playerToActIndex, p => ({
        ...p,
        food: p.food - buildingInfo.cost.Food,
        board: newBoard,
      }));
      console.log(`Building ${buildingType} built by Player ${playerToActIndex + 1} at (${rowIndex}, ${colIndex})`);
      setActiveAction(prev => { const newActions = [...prev]; newActions[playerToActIndex] = null; return newActions; });

    } else if (activeActionToProcess === 'deploy_Warrior') {
      if (playerToActIndex === clickedBoardPlayerIndex) {
        alert("You can only deploy warriors to the opponent's board!");
        return;
      }
      if (rowIndex !== 0) {
        alert("You can only deploy warriors to the top row of the enemy board!");
        console.log("Attempted to deploy to wrong row.");
        return;
      }
      if (playerToAct.units.Warrior <= 0) {
        alert("No warriors to deploy!");
        console.log("Attempted to deploy with no warriors.");
        return;
      }

      updatePlayerState(playerToActIndex, p => ({
        ...p,
        units: { ...p.units, Warrior: p.units.Warrior - 1 },
        pendingAttacks: [...p.pendingAttacks, {
          unitType: 'Warrior',
          targetPlayerIndex: clickedBoardPlayerIndex,
          targetTile: [rowIndex, colIndex],
          currentPosition: [rowIndex, colIndex],
        }],
      }));
      setActiveAction(prev => { const newActions = [...prev]; newActions[playerToActIndex] = null; return newActions; });
      console.log(`Warrior deployed by Player ${playerToActIndex + 1} to Player ${clickedBoardPlayerIndex + 1}'s board at (${rowIndex}, ${colIndex})`);

    } else {
      console.log("No active action for this click.");
    }
  }, [players, activeAction]); // Dependencies for useCallback

  const handleTrainUnit = (playerIndex, unitType) => {
    const player = players[playerIndex];
    const unitInfo = UNITS[unitType];
    if (!player.board.flat().some(t => t?.type === 'Barracks')) {
      alert("You need a Barracks to train units.");
      return;
    }
    if (player.food < unitInfo.cost.Food) {
      alert("Not enough food!");
      return;
    }
    updatePlayerState(playerIndex, p => ({
      ...p,
      food: p.food - unitInfo.cost.Food,
      units: { ...p.units, [unitType]: p.units[unitType] + 1 },
    }));
    console.log(`Player ${playerIndex + 1} trained a ${unitType}.`);
  };

  const handleReady = (playerIndex) => {
    updatePlayerState(playerIndex, p => ({ ...p, isReady: !p.isReady }));
    setTimeout(() => setPlayers(currentPlayers => {
      if (currentPlayers.every(p => p.isReady)) {
        processTurn(currentPlayers);
      }
      return currentPlayers;
    }), 0);
  };

  const processTurn = (currentPlayers) => {
    console.log("--- Processing Turn", turn, "---");
    let newPlayersState = JSON.parse(JSON.stringify(currentPlayers)); // Deep copy for mutable operations

    // 1. Process Warrior Movement and Attacks
    const allPendingAttacks = newPlayersState.flatMap(p => p.pendingAttacks.map(attack => ({ ...attack, fromPlayerIndex: newPlayersState.indexOf(p) })));
    const newPendingAttacks = [];

    allPendingAttacks.forEach(attack => {
      const { fromPlayerIndex, targetPlayerIndex, currentPosition, unitType } = attack;
      const [currentRow, currentCol] = currentPosition;

      // Check for combat at current position (before moving to next row)
      const targetTileData = newPlayersState[targetPlayerIndex].board[currentRow][currentCol]; // Corrected typo here
      if (targetTileData) {
        // Combat occurs: destroy building and award score
        newPlayersState[targetPlayerIndex].board[currentRow][currentCol] = null; // Destroy building
        newPlayersState[fromPlayerIndex].score += DESTROY_SCORE;
        console.log(`Player ${fromPlayerIndex + 1} Warrior destroyed Player ${targetPlayerIndex + 1}'s ${targetTileData.type} at (${currentRow}, ${currentCol})`);
        // This attack is consumed in combat, so it's not pushed to newPendingAttacks
      } else {
        // No combat, move unit down one row
        const nextRow = currentRow + 1;
        if (nextRow < BOARD_HEIGHT) {
          newPendingAttacks.push({ ...attack, currentPosition: [nextRow, currentCol] });
        } else {
          // Unit moved off the board (breakthrough)
          newPlayersState[fromPlayerIndex].score += BREAKTHROUGH_SCORE;
          console.log(`Player ${fromPlayerIndex + 1} Warrior breakthrough!`);
        }
      }
    });

    // Update pending attacks for each player
    newPlayersState.forEach(player => player.pendingAttacks = []); // Clear all old attacks
    newPendingAttacks.forEach(attack => {
      newPlayersState[attack.fromPlayerIndex].pendingAttacks.push(attack);
    });

    // 2. Calculate Income
    newPlayersState = newPlayersState.map(player => {
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
      player.food += foodIncome;
      player.science += scienceIncome;
      player.isReady = false; // Reset for next turn
      return player;
    });

    setPlayers(newPlayersState);
    setTurn(t => t + 1);
    setActiveAction(Array(NUM_PLAYERS).fill(null)); // Reset active actions
  };

  return (
    <div className="game-container">
      <div className="turn-header"><h1>Global Turn: {turn}</h1></div>
      <div className="players-area">
        {players.map((player, index) => (
          <PlayerInterface 
            key={index}
            playerIndex={index} // Pass player's own index
            player={player}
            playerName={`Player ${index + 1}`}
            onReady={() => handleReady(index)}
            onSelectBuilding={(type) => handleSelectBuilding(index, type)}
            activeAction={activeAction[index]} // Pass activeAction
            onTrainUnit={(unitType) => handleTrainUnit(index, unitType)}
            onDeployUnit={(unitType) => handleDeployUnit(index, unitType)}
            onBoardClick={handleBoardClick} // Pass the generic handler
            opponentPlayerIndex={(index + 1) % NUM_PLAYERS} // Pass opponent's index
            playersData={players} // Pass all players data
          />
        ))}
      </div>
    </div>
  );
}

export default App;
