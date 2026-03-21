import { useState } from 'react';
import { img } from '../utils/image';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  optimizeWidth?: number;
}

export default function LazyImage({ className = '', wrapperClassName = '', src, optimizeWidth, ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);
  const optimizedSrc = src ? img(src, optimizeWidth) : src;

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-forest/5 via-gold/10 to-forest/5 animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`transition-all duration-700 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'} ${className}`}
        {...props}
      />
    </div>
  );
}
