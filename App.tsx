
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, BirdData, PipeData } from './types';
import { 
  GAME_WIDTH, GAME_HEIGHT, BIRD_SIZE, GRAVITY, JUMP_STRENGTH, 
  PIPE_WIDTH, PIPE_GAP, PIPE_SPEED, PIPE_SPAWN_RATE, GROUND_HEIGHT 
} from './constants';
import Bird from './components/Bird';
import Pipe from './components/Pipe';
import { getCommentary } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [bird, setBird] = useState<BirdData>({ y: 250, velocity: 0, rotation: 0 });
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Fix: Provide initial value for useRef to satisfy TypeScript requirement
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastPipeSpawnRef = useRef<number>(0);
  const scoreRef = useRef(0);

  const handleJump = useCallback((e?: React.MouseEvent | React.TouchEvent | KeyboardEvent) => {
    if (e) {
      // Ngăn chặn các hành vi mặc định (như scroll) khi chạm trên mobile
      if ('preventDefault' in e) e.preventDefault();
    }

    if (gameState === GameState.PLAYING) {
      setBird(prev => ({ ...prev, velocity: JUMP_STRENGTH }));
    } else if (gameState === GameState.START || gameState === GameState.GAME_OVER) {
      startGame();
    }
  }, [gameState]);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    scoreRef.current = 0;
    setBird({ y: 250, velocity: 0, rotation: 0 });
    setPipes([]);
    setAiMessage('');
    lastPipeSpawnRef.current = Date.now();
  };

  const gameOver = async () => {
    setGameState(GameState.GAME_OVER);
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
    }
    
    setIsLoadingAi(true);
    const msg = await getCommentary(scoreRef.current);
    setAiMessage(msg);
    setIsLoadingAi(false);
  };

  const updateGame = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;

    setBird(prev => {
      const nextY = prev.y + prev.velocity;
      const nextVel = prev.velocity + GRAVITY;
      const rotation = Math.min(Math.max(nextVel * 4, -20), 90);

      if (nextY + BIRD_SIZE >= GAME_HEIGHT - GROUND_HEIGHT || nextY <= 0) {
        gameOver();
      }
      return { y: nextY, velocity: nextVel, rotation };
    });

    setPipes(prevPipes => {
      const nextPipes = prevPipes
        .map(p => ({ ...p, x: p.x - PIPE_SPEED }))
        .filter(p => p.x > -PIPE_WIDTH);

      nextPipes.forEach(p => {
        if (!p.passed && p.x + PIPE_WIDTH < 50) {
          p.passed = true;
          setScore(s => {
            const newScore = s + 1;
            scoreRef.current = newScore;
            return newScore;
          });
        }
      });

      if (Date.now() - lastPipeSpawnRef.current > PIPE_SPAWN_RATE) {
        const minH = 50;
        const maxH = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - 50;
        const topHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;
        
        nextPipes.push({
          id: Date.now(),
          x: GAME_WIDTH,
          topHeight,
          passed: false,
        });
        lastPipeSpawnRef.current = Date.now();
      }

      const collision = nextPipes.some(p => {
        const birdRight = 50 + BIRD_SIZE - 5;
        const birdLeft = 50 + 5;
        const birdTop = bird.y + 5;
        const birdBottom = bird.y + BIRD_SIZE - 5;

        const inX = birdRight > p.x && birdLeft < p.x + PIPE_WIDTH;
        const inTopY = birdTop < p.topHeight;
        const inBottomY = birdBottom > p.topHeight + PIPE_GAP;

        return inX && (inTopY || inBottomY);
      });

      if (collision) {
        gameOver();
      }

      return nextPipes;
    });

    gameLoopRef.current = requestAnimationFrame(updateGame);
  }, [gameState, bird.y, highScore]);

  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      gameLoopRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, updateGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        handleJump(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 select-none overflow-hidden touch-none">
      {/* Game Container */}
      <div 
        className="relative overflow-hidden bg-sky-300 border-x-4 border-neutral-800 shadow-2xl cursor-pointer touch-none"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onMouseDown={(e) => handleJump(e)}
        onTouchStart={(e) => handleJump(e)}
      >
        {/* Sky / Background elements */}
        <div className="absolute bottom-[20%] w-full flex justify-around opacity-50">
           <i className="fa-solid fa-cloud text-white text-5xl translate-x-10"></i>
           <i className="fa-solid fa-cloud text-white text-4xl -translate-x-10 mt-10"></i>
        </div>

        {/* Pipes */}
        {pipes.map(p => (
          <Pipe key={p.id} data={p} />
        ))}

        {/* Bird */}
        <Bird data={bird} />

        {/* Ground */}
        <div 
          className="absolute bottom-0 w-full bg-[#ded895] border-t-4 border-[#73bf2e]"
          style={{ height: GROUND_HEIGHT }}
        >
          <div className="w-full h-4 bg-[#73bf2e] flex">
             {Array.from({length: 20}).map((_, i) => (
                <div key={i} className="flex-1 border-r border-black/10"></div>
             ))}
          </div>
          <div className="p-4 text-neutral-600 text-[10px] pixel-font opacity-40">
             GEMINI FLAPPY V1.1
          </div>
        </div>

        {/* Score Overlay */}
        <div className="absolute top-10 w-full text-center z-10 safe-top">
          <span className="text-white text-5xl pixel-font drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
            {score}
          </span>
        </div>

        {/* Start Screen */}
        {gameState === GameState.START && (
          <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white z-20 animate-pulse">
            <h1 className="text-3xl mb-8 pixel-font text-center drop-shadow-lg">GEMINI BIRD</h1>
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border-2 border-white/20 text-center">
                <p className="text-[10px] pixel-font mb-4">CHẠM ĐỂ BẮT ĐẦU</p>
                <i className="fa-solid fa-hand-pointer text-4xl animate-bounce"></i>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAME_OVER && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white z-30 p-6 text-center">
            <h2 className="text-2xl mb-4 pixel-font text-red-500 drop-shadow-md">GAME OVER</h2>
            
            <div className="bg-white text-neutral-900 p-6 rounded-lg shadow-xl w-full max-w-[300px] mb-6">
               <div className="flex justify-between mb-2 border-b border-neutral-200 pb-2">
                  <span className="text-[10px] pixel-font">SCORE:</span>
                  <span className="text-[14px] pixel-font">{score}</span>
               </div>
               <div className="flex justify-between">
                  <span className="text-[10px] pixel-font text-yellow-600">BEST:</span>
                  <span className="text-[14px] pixel-font">{highScore}</span>
               </div>
            </div>

            {/* AI Commentary */}
            <div className="bg-sky-100 text-sky-900 p-4 rounded-lg italic text-sm mb-6 w-full max-w-[320px] relative">
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-500 text-white text-[8px] px-2 py-1 rounded pixel-font">
                  GEMINI AI:
               </div>
               {isLoadingAi ? (
                 <div className="flex items-center justify-center gap-2">
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    <span>...</span>
                 </div>
               ) : (
                 <p className="font-sans leading-relaxed">"{aiMessage}"</p>
               )}
            </div>

            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg pixel-font text-xs transition-colors shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none"
              onClick={(e) => { e.stopPropagation(); startGame(); }}
            >
              THỬ LẠI
            </button>
          </div>
        )}
      </div>

      {/* Footer Info (Chỉ hiện khi màn hình rộng hơn) */}
      <div className="hidden sm:block mt-8 text-neutral-400 text-center max-w-md">
        <p className="text-[10px] opacity-50">Sử dụng Google Gemini AI để tạo lời bình.</p>
      </div>
    </div>
  );
};

export default App;
