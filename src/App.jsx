import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import GameOverScreen from './components/GameOverScreen';
import GameHUD from './components/GameHUD';
import GameCanvas from './components/GameCanvas';
import { playGameWin, playGameLose } from './utils/synth';

function App() {
  const [gameState, setGameState] = useState('START_SCREEN'); // 'START_SCREEN' | 'PLAYING' | 'GAME_OVER'
  const [difficulty, setDifficulty] = useState('medium');
  const [scores, setScores] = useState({ player: 0, ai: 0 });
  const [currentRally, setCurrentRally] = useState(0);
  const [maxRally, setMaxRally] = useState(0);
  const [won, setWon] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Monitor browser fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error entering fullscreen:", err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error("Error exiting fullscreen:", err);
      });
    }
  };

  const handleStartGame = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScores({ player: 0, ai: 0 });
    setCurrentRally(0);
    setMaxRally(0);
    setGameState('PLAYING');
  };

  const handleScoreUpdate = (playerScore, aiScore, rally) => {
    setScores({ player: playerScore, ai: aiScore });
    setCurrentRally(rally);
    if (rally > maxRally) {
      setMaxRally(rally);
    }
  };

  const handleGameOver = (playerWon, playerScore, aiScore) => {
    setWon(playerWon);
    setScores({ player: playerScore, ai: aiScore });
    setGameState('GAME_OVER');
    
    // Play ending theme
    if (playerWon) {
      playGameWin();
    } else {
      playGameLose();
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      
      {/* Rotation Warning for Mobile Portrait */}
      <div className="rotate-warning">
        <div className="rotate-warning-icon">🔄</div>
        <div className="rotate-warning-text">
          MODO TÁCTICO INCOMPATIBLE
          <br />
          <span style={{ color: '#ff00f7', fontWeight: 'bold' }}>GIRA TU DISPOSITIVO A HORIZONTAL</span>
          <br />
          PARA INICIAR LA SIMULACIÓN
        </div>
      </div>

      {/* Background decoration elements */}
      <div className="radial-glow" />
      <div className="crt-overlay" />


      {/* Outer game border frame */}
      <div className="app-container">
        
        {/* Neon Title Bar */}
        <div style={{ width: '100%', textAlign: 'center', marginBottom: '1.5rem', userSelect: 'none' }}>
          <div style={{ fontSize: '10px', color: '#ff00f7', letterSpacing: '0.4em', opacity: 0.8, textTransform: 'uppercase', marginBottom: '4px', textShadow: '0 0 5px #ff00f7' }}>
            SISTEMA TÁCTICO CIBERNÉTICO
          </div>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', letterSpacing: '0.1em' }}>
            ESTADO DEL SISTEMA: SEGURO // EN LÍNEA
          </div>
        </div>

        {/* HUD Display */}
        <GameHUD
          playerScore={scores.player}
          aiScore={scores.ai}
          currentRally={currentRally}
          maxRally={maxRally}
          difficulty={difficulty}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Core Game Arena Container */}
        <div style={{ width: '100%', maxWidth: '800px', position: 'relative' }}>
          
          <GameCanvas
            difficulty={difficulty}
            isPlaying={gameState === 'PLAYING'}
            onScoreUpdate={handleScoreUpdate}
            onGameOver={handleGameOver}
          />

          {/* Overlays */}
          {gameState === 'START_SCREEN' && (
            <StartScreen onStart={handleStartGame} />
          )}

          {gameState === 'GAME_OVER' && (
            <GameOverScreen
              won={won}
              playerScore={scores.player}
              aiScore={scores.ai}
              maxRally={maxRally}
              onRestart={() => setGameState('START_SCREEN')}
            />
          )}
        </div>

        {/* Subtle footer */}
        <div className="footer-text" style={{ fontSize: '10px', color: '#475569', marginTop: '1.5rem', letterSpacing: '0.1em' }}>
          DESARROLLADO POR <a href="https://waveframe.com.ar" target="_blank" rel="noopener noreferrer" style={{ color: '#00fffc', textDecoration: 'none', borderBottom: '1px dashed rgba(0, 255, 252, 0.4)', paddingBottom: '2px', transition: 'all 0.3s' }}>WAVEFRAME.COM.AR</a> // SISTEMA OPERATIVO v1.0.0
        </div>
      </div>
    </div>
  );
}

export default App;
