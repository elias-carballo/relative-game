import { useEffect, useRef } from 'react';
import { Game } from './game/Game';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef   = useRef<Game | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = new Game(canvas);
    gameRef.current = game;
    game.init();

    return () => {
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="game-shell">
      <canvas ref={canvasRef} />
    </div>
  );
}
