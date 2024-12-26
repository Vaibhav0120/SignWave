import React from 'react';

interface SignAnimationProps {
  animationUrl: string;
}

const SignAnimation: React.FC<SignAnimationProps> = ({ animationUrl }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <video src={animationUrl} autoPlay loop controls className="w-full rounded-lg shadow-lg" />
    </div>
  );
};

export default SignAnimation;

