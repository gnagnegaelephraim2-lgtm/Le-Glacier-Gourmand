import { useState } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
}

export default function LazyImage({ className = '', wrapperClassName = '', ...props }: LazyImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-forest/5 via-gold/10 to-forest/5 animate-pulse" />
      )}
      <img
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`transition-all duration-700 ease-out ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.03]'} ${className}`}
        {...props}
      />
    </div>
  );
}
