declare namespace JSX {
  interface IntrinsicElements {
    'dotlottie-player': {
      src?: string;
      background?: string;
      speed?: string;
      style?: React.CSSProperties;
      loop?: boolean;
      autoplay?: boolean;
      direction?: string;
      mode?: string;
    };
  }
}