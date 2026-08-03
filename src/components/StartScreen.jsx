import React, { useState } from 'react';

const StartScreen = ({ onStart }) => {
  const [difficulty, setDifficulty] = useState('medium');

  const difficulties = [
    { id: 'easy', label: 'FÁCIL', desc: 'Pelota y rastreo de IA lentos' },
    { id: 'medium', label: 'MEDIO', desc: 'Velocidad arcade original' },
    { id: 'hard', label: 'DIFÍCIL', desc: 'Rastreo ultra-veloz de IA predictiva' }
  ];

  return (
    <div className="overlay-screen select-none">
      {/* Title */}
      <h1 className="cyber-title">
        CYBER PONG
      </h1>
      <p className="cyber-subtitle">
        ARENA VIRTUAL v1.0
      </p>

      {/* Difficulty Panel */}
      <div className="cyber-panel">
        <h2 style={{ fontSize: '12px', fontWeight: 600, tracking: '0.1em', textAlign: 'center', color: '#00fffc', marginBottom: '12px' }}>
          SELECCIONAR DIFICULTAD
        </h2>
        <div className="diff-grid">
          {difficulties.map((diff) => (
            <button
              key={diff.id}
              onClick={() => setDifficulty(diff.id)}
              className={`diff-btn ${difficulty === diff.id ? 'active' : ''}`}
            >
              {diff.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '10px', textAlign: 'center', color: '#8f9cae', minHeight: '16px', marginTop: '8px' }}>
          {difficulties.find((d) => d.id === difficulty)?.desc}
        </p>
      </div>

      {/* Play Button */}
      <button
        onClick={() => onStart(difficulty)}
        className="cyber-btn"
      >
        INICIAR SIMULACIÓN
      </button>

      {/* Instructions */}
      <div className="instructions-panel">
        <div className="instructions-text">
          🎮 RATÓN: Mueve el cursor // 📱 TÁCTIL: Desliza el dedo en la arena
          <br />
          ⌨️ TECLADO: Flechas Arriba/Abajo o teclas W/S
        </div>
        <div className="instructions-warning">
          * EL PRIMER SENSOR EN ANOTAR 5 PUNTOS LOGRA LA DOMINACIÓN *
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
