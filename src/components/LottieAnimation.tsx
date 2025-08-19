import { useEffect, useRef } from 'react';
import '@lottiefiles/dotlottie-wc';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        background?: string;
        speed?: number;
        loop?: boolean;
        autoplay?: boolean;
      };
    }
  }
}

interface LottieAnimationProps {
  src: string;
  width: string;
  height: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  background?: string;
  speed?: number;
}

const LottieAnimation = ({
  src,
  width,
  height,
  className = '',
  loop = true,
  autoplay = true,
  background = 'transparent',
  speed = 1
}: LottieAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Set dimensions
      containerRef.current.style.width = width;
      containerRef.current.style.height = height;
    }
  }, [width, height]);

  return (
    <dotlottie-player
      ref={containerRef as any}
      src={src}
      background={background}
      speed={speed}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  );
};

export default LottieAnimation; 
