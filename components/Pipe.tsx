
import React from 'react';
import { PIPE_WIDTH, PIPE_GAP, GAME_HEIGHT, GROUND_HEIGHT } from '../constants';
import { PipeData } from '../types';

interface PipeProps {
  data: PipeData;
}

const Pipe: React.FC<PipeProps> = ({ data }) => {
  const bottomPipeY = data.topHeight + PIPE_GAP;
  const bottomHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomPipeY;

  return (
    <div className="absolute top-0" style={{ left: data.x }}>
      {/* Top Pipe */}
      <div
        className="absolute bg-green-500 border-x-4 border-b-4 border-black"
        style={{
          width: PIPE_WIDTH,
          height: data.topHeight,
          top: 0,
        }}
      >
        <div className="absolute bottom-0 left-[-4px] w-[68px] h-8 bg-green-400 border-4 border-black"></div>
        <div className="w-full h-full opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>

      {/* Bottom Pipe */}
      <div
        className="absolute bg-green-500 border-x-4 border-t-4 border-black"
        style={{
          width: PIPE_WIDTH,
          height: bottomHeight,
          top: bottomPipeY,
        }}
      >
        <div className="absolute top-0 left-[-4px] w-[68px] h-8 bg-green-400 border-4 border-black"></div>
        <div className="w-full h-full opacity-20 bg-gradient-to-r from-transparent via-white to-transparent"></div>
      </div>
    </div>
  );
};

export default Pipe;
