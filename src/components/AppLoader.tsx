import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { BRAND_NAME } from '../lib/constants';

interface AppLoaderProps {
  isLoading: boolean;
}

export function AppLoader({ isLoading }: AppLoaderProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch('/car_animation.json')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch animation');
        }

        return response.json();
      })
      .then((data) => {
        if (mounted) {
          setAnimationData(data);
        }
      })
      .catch((error) => {
        console.error('Failed to load loader animation:', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let fadeTimeout: number;
    let removeTimeout: number;

    if (isLoading) {
      setIsVisible(true);
      setIsFadingOut(false);
      return;
    }

    fadeTimeout = window.setTimeout(() => {
      setIsFadingOut(true);
    }, 250);

    removeTimeout = window.setTimeout(() => {
      setIsVisible(false);
    }, 800);

    return () => {
      window.clearTimeout(fadeTimeout);
      window.clearTimeout(removeTimeout);
    };
  }, [isLoading]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#09090b',
      }}
      aria-live="polite"
      aria-busy={isLoading}
      role="status"
    >
      <div className="flex flex-col items-center gap-4 px-6">
        <div className="w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          {animationData ? (
            <Lottie
              animationData={animationData}
              loop
              autoplay
              className="w-full h-full"
              style={{
                background: 'transparent',
              }}
              rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet',
                clearCanvas: true,
              }}
            />
          ) : (
            <div className="w-full h-full bg-transparent" />
          )}
        </div>
      </div>
    </div>
  );
}