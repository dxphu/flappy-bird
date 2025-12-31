
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface PipeData {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface BirdData {
  y: number;
  velocity: number;
  rotation: number;
}
