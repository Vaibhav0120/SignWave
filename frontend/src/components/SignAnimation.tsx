import React from 'react';

interface SignAnimationProps {
  animationUrl: string;
}

const SignAnimation: React.FC<SignAnimationProps> = ({ animationUrl }) => {
  return (
    <div className="w-full max-w-md mx-auto">
      <video src={animationUrl} autoPlay loop className="w-full" />
    </div>
  );
};

export default SignAnimation;