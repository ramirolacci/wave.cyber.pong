import React, { useEffect, useRef, useState } from 'react';
import { playPaddleHit, playWallHit, playScorePlayer, playScoreAI } from '../utils/synth';

const GameCanvas = ({ difficulty, isPlaying, onScoreUpdate, onGameOver }) => {
  const canvasRef = useRef(null);
  
  // Game states and configuration constants
  const targetWidth = 800;
  const targetHeight = 500;
  const paddleWidth = 15;
  const paddleHeight = 100;
  
  // Dynamic parameters based on difficulty
  const getDifficultyParams = () => {
    switch (difficulty) {
      case 'easy':
        return { initialSpeed: 4, aiSpeedRatio: 0.45, ballSpeedInc: 1.03 };
      case 'hard':
        return { initialSpeed: 7, aiSpeedRatio: 0.82, ballSpeedInc: 1.06 };
      case 'medium':
      default:
        return { initialSpeed: 5.5, aiSpeedRatio: 0.65, ballSpeedInc: 1.045 };
    }
  };

  // State refs to prevent closures in game loop
  const gameStateRef = useRef({
    isPlaying: false,
    playerScore: 0,
    aiScore: 0,
    currentRally: 0,
    shakeTime: 0,
    shakeIntensity: 0,
    playerPaddle: { y: 200, dy: 0 },
    aiPaddle: { y: 200, dy: 0 },
    ball: { x: 400, y: 250, dx: 0, dy: 0 },
    trail: [],
    particles: [],
    keysPressed: {}
  });

  // Track isPlaying prop change
  useEffect(() => {
    gameStateRef.current.isPlaying = isPlaying;
    if (isPlaying) {
      resetGame();
    }
  }, [isPlaying]);

  const resetGame = () => {
    const state = gameStateRef.current;
    state.playerScore = 0;
    state.aiScore = 0;
    state.currentRally = 0;
    state.playerPaddle.y = targetHeight / 2 - paddleHeight / 2;
    state.aiPaddle.y = targetHeight / 2 - paddleHeight / 2;
    resetBall(true);
    initializeParticles();
  };

  const initializeParticles = () => {
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * targetWidth,
        y: Math.random() * targetHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1
      });
    }
    gameStateRef.current.particles = particles;
  };

  const resetBall = (playerServed = true) => {
    const params = getDifficultyParams();
    const state = gameStateRef.current;
    state.ball.x = targetWidth / 2;
    state.ball.y = targetHeight / 2;
    
    // Set direction
    const direction = playerServed ? 1 : -1;
    state.ball.dx = direction * params.initialSpeed;
    
    // Random angle
    state.ball.dy = (Math.random() * 4 - 2) * (params.initialSpeed / 5);
    state.trail = [];
    state.currentRally = 0;
    onScoreUpdate(state.playerScore, state.aiScore, 0);
  };

  const triggerShake = (intensity, duration = 10) => {
    const state = gameStateRef.current;
    state.shakeIntensity = intensity;
    state.shakeTime = duration;
  };

  // Keyboard/Mouse handlers setup
  useEffect(() => {
    const handleKeyDown = (e) => {
      const state = gameStateRef.current;
      state.keysPressed[e.key] = true;
      
      // Update dy based on keys
      const paddleSpeed = 8;
      if (state.keysPressed['ArrowUp'] || state.keysPressed['w'] || state.keysPressed['W']) {
        state.playerPaddle.dy = -paddleSpeed;
      } else if (state.keysPressed['ArrowDown'] || state.keysPressed['s'] || state.keysPressed['S']) {
        state.playerPaddle.dy = paddleSpeed;
      }
    };

    const handleKeyUp = (e) => {
      const state = gameStateRef.current;
      state.keysPressed[e.key] = false;
      
      const upActive = state.keysPressed['ArrowUp'] || state.keysPressed['w'] || state.keysPressed['W'];
      const downActive = state.keysPressed['ArrowDown'] || state.keysPressed['s'] || state.keysPressed['S'];
      
      if (!upActive && !downActive) {
        state.playerPaddle.dy = 0;
      } else if (upActive) {
        state.playerPaddle.dy = -8;
      } else if (downActive) {
        state.playerPaddle.dy = 8;
      }
    };

    const handleMouseMove = (e) => {
      if (!canvasRef.current || !gameStateRef.current.isPlaying) return;
      
      const rect = canvasRef.current.getBoundingClientRect();
      // Calculate mouse Y coordinate relative to canvas internal scaling
      const scaleY = targetHeight / rect.height;
      const mouseY = (e.clientY - rect.top) * scaleY - paddleHeight / 2;
      
      const state = gameStateRef.current;
      if (mouseY >= 0 && mouseY <= targetHeight - paddleHeight) {
        state.playerPaddle.y = mouseY;
      } else if (mouseY < 0) {
        state.playerPaddle.y = 0;
      } else {
        state.playerPaddle.y = targetHeight - paddleHeight;
      }
    };

    const handleTouchMove = (e) => {
      if (!canvasRef.current || !gameStateRef.current.isPlaying) return;
      if (e.cancelable) {
        e.preventDefault();
      }
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleY = targetHeight / rect.height;
      const touchY = (e.touches[0].clientY - rect.top) * scaleY - paddleHeight / 2;
      
      const state = gameStateRef.current;
      if (touchY >= 0 && touchY <= targetHeight - paddleHeight) {
        state.playerPaddle.y = touchY;
      } else if (touchY < 0) {
        state.playerPaddle.y = 0;
      } else {
        state.playerPaddle.y = targetHeight - paddleHeight;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchstart', handleTouchMove);
      }
    };
  }, []);

  // Main game logic loop
  useEffect(() => {
    let animationFrameId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const updatePhysics = () => {
      const state = gameStateRef.current;
      if (!state.isPlaying) return;

      const params = getDifficultyParams();
      const paddleSpeed = 8;

      // Update player paddle
      state.playerPaddle.y += state.playerPaddle.dy;
      if (state.playerPaddle.y < 0) state.playerPaddle.y = 0;
      if (state.playerPaddle.y + paddleHeight > targetHeight) {
        state.playerPaddle.y = targetHeight - paddleHeight;
      }

      // AI Logic: tracking ball with delay/speed limit
      const aiPaddleCenter = state.aiPaddle.y + paddleHeight / 2;
      const ballCenter = state.ball.y + 6; // 6 is ballSize / 2
      const targetSpeed = paddleSpeed * params.aiSpeedRatio;

      // Simple prediction model for AI on high difficulties
      let trackTarget = ballCenter;
      if (difficulty === 'hard' && state.ball.dx > 0) {
        // Linear prediction of ball target y (without wall reflections for simplicity)
        const timeToReach = (770 - state.ball.x) / state.ball.dx; // 770 is AI paddle x
        trackTarget = state.ball.y + state.ball.dy * timeToReach;
        // Bound prediction within height
        if (trackTarget < 0 || trackTarget > targetHeight) {
          trackTarget = ballCenter; // Fallback
        }
      }

      if (aiPaddleCenter < trackTarget - 12) {
        state.aiPaddle.dy = targetSpeed;
      } else if (aiPaddleCenter > trackTarget + 12) {
        state.aiPaddle.dy = -targetSpeed;
      } else {
        state.aiPaddle.dy = 0;
      }

      state.aiPaddle.y += state.aiPaddle.dy;
      if (state.aiPaddle.y < 0) state.aiPaddle.y = 0;
      if (state.aiPaddle.y + paddleHeight > targetHeight) {
        state.aiPaddle.y = targetHeight - paddleHeight;
      }

      // Move ball
      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      // Add to trail
      state.trail.push({ x: state.ball.x + 6, y: state.ball.y + 6 });
      if (state.trail.length > 8) {
        state.trail.shift();
      }

      // Wall bounce
      if (state.ball.y < 0) {
        state.ball.y = 0;
        state.ball.dy = -state.ball.dy;
        playWallHit();
        triggerShake(2, 5);
      } else if (state.ball.y + 12 > targetHeight) {
        state.ball.y = targetHeight - 12;
        state.ball.dy = -state.ball.dy;
        playWallHit();
        triggerShake(2, 5);
      }

      // Collision with Player paddle
      const playerPaddleX = 30;
      if (
        state.ball.x < playerPaddleX + paddleWidth &&
        state.ball.x + 12 > playerPaddleX &&
        state.ball.y < state.playerPaddle.y + paddleHeight &&
        state.ball.y + 12 > state.playerPaddle.y
      ) {
        const hitPosition = (state.ball.y + 6) - (state.playerPaddle.y + paddleHeight / 2);
        const normalizedHit = hitPosition / (paddleHeight / 2);
        
        state.ball.dy = normalizedHit * 5.5;
        state.ball.dx = Math.abs(state.ball.dx); // Move right
        state.ball.dx *= params.ballSpeedInc; // Accelerate
        
        state.currentRally++;
        playPaddleHit();
        triggerShake(5, 8);
        
        // Add random bounce angle variation
        state.ball.dy += (Math.random() * 1.5 - 0.75);
        onScoreUpdate(state.playerScore, state.aiScore, state.currentRally);
      }

      // Collision with AI paddle
      const aiPaddleX = targetWidth - 30 - paddleWidth;
      if (
        state.ball.x < aiPaddleX + paddleWidth &&
        state.ball.x + 12 > aiPaddleX &&
        state.ball.y < state.aiPaddle.y + paddleHeight &&
        state.ball.y + 12 > state.aiPaddle.y
      ) {
        const hitPosition = (state.ball.y + 6) - (state.aiPaddle.y + paddleHeight / 2);
        const normalizedHit = hitPosition / (paddleHeight / 2);
        
        state.ball.dy = normalizedHit * 5.5;
        state.ball.dx = -Math.abs(state.ball.dx); // Move left
        state.ball.dx *= params.ballSpeedInc; // Accelerate
        
        state.currentRally++;
        playPaddleHit();
        triggerShake(5, 8);
        
        // Add random bounce angle variation
        state.ball.dy += (Math.random() * 1.5 - 0.75);
        onScoreUpdate(state.playerScore, state.aiScore, state.currentRally);
      }

      // AI Scoring Check
      if (state.ball.x < 0) {
        state.aiScore++;
        playScoreAI();
        triggerShake(12, 20);
        
        if (state.aiScore >= 5) {
          onGameOver(false, state.playerScore, state.aiScore);
        } else {
          resetBall(true); // Player serves next
        }
      }

      // Player Scoring Check
      if (state.ball.x > targetWidth) {
        state.playerScore++;
        playScorePlayer();
        triggerShake(12, 20);
        
        if (state.playerScore >= 5) {
          onGameOver(true, state.playerScore, state.aiScore);
        } else {
          resetBall(false); // AI serves next
        }
      }
    };

    const draw = () => {
      const state = gameStateRef.current;
      ctx.save();

      // Clear canvas
      ctx.fillStyle = '#050515';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Apply screen shake translation if active
      if (state.shakeTime > 0) {
        const dx = (Math.random() * 2 - 1) * state.shakeIntensity;
        const dy = (Math.random() * 2 - 1) * state.shakeIntensity;
        ctx.translate(dx, dy);
        state.shakeTime--;
      }

      // Draw background grid lines (cyberpunk style)
      ctx.strokeStyle = 'rgba(0, 255, 252, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 25;
      for (let x = 0; x < targetWidth; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, targetHeight);
        ctx.stroke();
      }
      for (let y = 0; y < targetHeight; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(targetWidth, y);
        ctx.stroke();
      }

      // Draw background particles (floating stars)
      state.particles.forEach((p) => {
        ctx.fillStyle = `rgba(0, 255, 252, ${p.alpha})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        
        // Idle motion even when game is paused or active
        p.y += p.speed * 0.5;
        if (p.y > targetHeight) {
          p.y = 0;
          p.x = Math.random() * targetWidth;
        }
      });

      // Draw dashed centerline
      ctx.strokeStyle = 'rgba(0, 255, 252, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 12]);
      ctx.beginPath();
      ctx.moveTo(targetWidth / 2, 0);
      ctx.lineTo(targetWidth / 2, targetHeight);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      if (state.isPlaying) {
        // Draw ball neon trail
        state.trail.forEach((pos, idx) => {
          const opacity = (idx + 1) / state.trail.length * 0.35;
          ctx.fillStyle = `rgba(255, 0, 247, ${opacity})`;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 6 * ((idx + 1) / state.trail.length), 0, Math.PI * 2);
          ctx.fill();
        });

        // Draw player paddle (Cyan glow)
        ctx.fillStyle = '#00fffc';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00fffc';
        ctx.fillRect(30, state.playerPaddle.y, paddleWidth, paddleHeight);

        // Draw AI paddle (Magenta glow)
        ctx.fillStyle = '#ff00f7';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff00f7';
        ctx.fillRect(targetWidth - 30 - paddleWidth, state.aiPaddle.y, paddleWidth, paddleHeight);

        // Draw ball (neon magenta core, white highlight)
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff00f7';
        ctx.beginPath();
        ctx.arc(state.ball.x + 6, state.ball.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadows
      } else {
        // Draw idle states for aesthetics
        ctx.fillStyle = 'rgba(0, 255, 252, 0.4)';
        ctx.fillRect(30, state.playerPaddle.y, paddleWidth, paddleHeight);
        ctx.fillStyle = 'rgba(255, 0, 247, 0.4)';
        ctx.fillRect(targetWidth - 30 - paddleWidth, state.aiPaddle.y, paddleWidth, paddleHeight);
      }

      ctx.restore();
    };

    const renderLoop = () => {
      updatePhysics();
      draw();
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [difficulty]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={targetWidth}
        height={targetHeight}
        className="game-canvas"
      />
    </div>
  );
};

export default GameCanvas;
