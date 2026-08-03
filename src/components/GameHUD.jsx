import React from 'react';

const GameHUD = ({ playerScore, aiScore, currentRally, maxRally, difficulty, isFullscreen, onToggleFullscreen }) => {
  return (
    <div className="hud-container">
      {/* Score panel */}
      <div className="score-panel">
        {/* Player Score */}
        <div className="score-box player">
          <span className="score-label">JUGADOR</span>
          <span className="score-num player">
            {playerScore}
          </span>
        </div>

        {/* VS indicator */}
        <span className="vs-divider">
          VS
        </span>

        {/* AI Score */}
        <div className="score-box ai">
          <span className="score-label">UNIDAD IA</span>
          <span className="score-num ai">
            {aiScore}
          </span>
        </div>
      </div>

      {/* Center Fullscreen Button */}
      <button 
        onClick={onToggleFullscreen} 
        className="fullscreen-btn"
        aria-label="Alternar Pantalla Completa"
      >
        {isFullscreen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <path d="M4 14h6v6m10-6h-6v6M4 10h6V4m10 6h-6V4"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
        )}
      </button>

      {/* Info panel */}
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">DIFICULTAD:</span>
          <span className={`stat-val ${
            difficulty === 'easy' ? 'green' :
            difficulty === 'medium' ? 'cyan' : 'red'
          }`}>
            {difficulty === 'easy' ? 'FÁCIL' : difficulty === 'medium' ? 'MEDIO' : 'DIFÍCIL'}
          </span>
        </div>

        <div className="stat-divider" />

        <div className="stat-item">
          <span className="stat-label">RALLY:</span>
          <span className="stat-val magenta" style={{ minWidth: '12px', textAlign: 'center' }}>
            {currentRally}
          </span>
          <span style={{ fontSize: '10px', color: '#64748b' }}>
            (MÁX: {maxRally})
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameHUD;
