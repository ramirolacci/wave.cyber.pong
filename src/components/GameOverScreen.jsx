import React from 'react';

const GameOverScreen = ({ won, playerScore, aiScore, maxRally, onRestart }) => {
  return (
    <div className="overlay-screen">
      {/* Visual result header */}
      <h1 className={`result-text ${won ? 'win' : 'lose'}`}>
        {won ? '¡SISTEMA HACKEADO!' : 'ACCESO DENEGADO'}
      </h1>

      {/* Detail dashboard */}
      <div className="cyber-panel game-over">
        <h2 style={{ fontSize: '11px', color: '#8f9cae', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '16px' }}>
          DIAGNÓSTICO DE LA CONEXIÓN
        </h2>
        
        <div className="diag-list">
          <div className="diag-item">
            <span className="diag-label">PUNTUACIÓN FINAL</span>
            <span className="diag-value" style={{ color: '#00fffc' }}>
              {playerScore} - {aiScore}
            </span>
          </div>

          <div className="diag-item">
            <span className="diag-label">RALLY MÁS LARGO</span>
            <span className="diag-value" style={{ color: '#ff00f7', textShadow: '0 0 5px #ff00f7' }}>
              {maxRally} TOQUES
            </span>
          </div>

          <div className="diag-item">
            <span className="diag-label">RESOLUCIÓN</span>
            <span className="diag-value" style={{ color: won ? '#00ff66' : '#ff3b30' }}>
              {won ? 'VICTORIA' : 'DESCONECTADO'}
            </span>
          </div>
        </div>
      </div>

      {/* Button */}
      <button
        onClick={onRestart}
        className={`cyber-btn ${won ? 'win' : 'lose'}`}
      >
        REINICIALIZAR
      </button>
    </div>
  );
};

export default GameOverScreen;
