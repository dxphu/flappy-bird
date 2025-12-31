
import React from 'react';
import { BIRD_SIZE } from '../constants';
import { BirdData } from '../types';

interface BirdProps {
  data: BirdData;
}

const Bird: React.FC<BirdProps> = ({ data }) => {
  return (
    <div
      className="absolute flex items-center justify-center transition-transform duration-75"
      style={{
        width: BIRD_SIZE,
        height: BIRD_SIZE,
        left: 50,
        top: data.y,
        transform: `rotate(${data.rotation}deg)`,
      }}
    >
      <div className="relative w-full h-full bg-yellow-400 border-4 border-black rounded-lg shadow-inner overflow-hidden">
        {/* Eye */}
        <div className="absolute top-1 right-2 w-3 h-3 bg-white border-2 border-black rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-black rounded-full"></div>
        </div>
        {/* Beak */}
        <div className="absolute bottom-2 -right-1 w-4 h-3 bg-orange-500 border-2 border-black rounded-sm"></div>
        {/* Wing */}
        <div className="absolute top-4 left-1 w-4 h-3 bg-white border-2 border-black rounded-full opacity-80"></div>
      </div>
    </div>
  );
};

export default Bird;
