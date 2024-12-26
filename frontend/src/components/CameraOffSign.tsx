import React from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface CameraOffSignProps {
  isOn: boolean;
}

const CameraOffSign: React.FC<CameraOffSignProps> = ({ isOn }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
      <div className="text-white text-center">
        {isOn ? (
          <>
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl">Camera is on</p>
          </>
        ) : (
          <>
            <CameraOff className="w-16 h-16 mx-auto mb-4" />
            <p className="text-xl">Camera is off</p>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraOffSign;

