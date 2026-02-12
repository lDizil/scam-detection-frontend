import { useState, useEffect, useRef } from 'react';

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

export function LazyVideo({ 
  src, 
  className = '',
  ...props 
}: LazyVideoProps) {
  const [videoSrc, setVideoSrc] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setVideoSrc(src);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className={`${className} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      {...props}
    />
  );
}
