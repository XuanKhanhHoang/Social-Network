import { useRef, useEffect, useCallback } from 'react';

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio('/sounds/notification.mp3');
      audioRef.current.volume = 0.5;
      audioRef.current.preload = 'auto';

      audioRef.current.addEventListener('canplaythrough', () => {
        isLoadedRef.current = true;
      });

      const interactionEvents = [
        'click',
        'keydown',
        'touchstart',
        'touchend',
        'pointerdown',
        'scroll',
        'wheel',
      ];

      const unlockAudio = () => {
        if (audioRef.current) {
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                audioRef.current?.pause();
                if (audioRef.current) audioRef.current.currentTime = 0;

                interactionEvents.forEach((event) =>
                  document.removeEventListener(event, unlockAudio)
                );
              })
              .catch((error) => {});
          }
        }
      };

      interactionEvents.forEach((event) =>
        document.addEventListener(event, unlockAudio, { passive: true })
      );

      return () => {
        interactionEvents.forEach((event) =>
          document.removeEventListener(event, unlockAudio)
        );

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, []);

  const playSound = useCallback(() => {
    if (audioRef.current && isLoadedRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        if (error.name !== 'NotAllowedError') {
          console.error('Error playing sound:', error);
        }
      });
    }
  }, []);

  return { playSound };
};
