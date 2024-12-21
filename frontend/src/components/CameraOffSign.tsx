import React from 'react';
import { Camera } from 'lucide-react';

const CameraOffSign: React.FC = () => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
      <div className="text-white text-center">
        <Camera className="w-16 h-16 mx-auto mb-4" />
        <p className="text-xl">Camera is off</p>
      </div>
    </div>
  );
};

export default CameraOffSign;

