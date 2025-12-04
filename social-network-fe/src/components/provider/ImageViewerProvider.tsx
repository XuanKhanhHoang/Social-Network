'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import Image from 'next/image'; // Chúng ta sẽ dùng Next/Image
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

type ImageViewerData = {
  url: string;
  imgId: string;
  width?: number;
  height?: number;
};

type ImageViewerContextType = {
  open: (data: ImageViewerData) => void;
};

const ImageViewerContext = createContext<ImageViewerContextType | null>(null);

export function ImageViewerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<ImageViewerData | null>(null);

  const open = (data: ImageViewerData) => {
    setData(data);
    setIsOpen(true);
  };

  const hasDimensions = useMemo(
    () => typeof data?.width === 'number' && typeof data?.height === 'number',
    [data]
  );

  useEffect(() => {
    if (data) {
      console.log(data);
    }
  }, [data]);

  return (
    <ImageViewerContext.Provider value={{ open }}>
      {children}

      {isOpen &&
        createPortal(
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors fixed top-3 right-3 p-0 z-[99999] pointer-events-auto cursor-pointer bg-black/50 hover:bg-black/80"
          >
            <X size={24} strokeWidth={2.3} color="white" />
          </button>,
          document.body
        )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTitle></DialogTitle>
        <DialogContent
          className="sm:max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] p-0 border-0 bg-transparent shadow-none outline-none"
          showCloseButton={false}
        >
          {data &&
            (hasDimensions ? (
              <Image
                src={data.url}
                alt={data.imgId}
                width={data.width!}
                height={data.height!}
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-md mx-auto"
                sizes="(max-width: 1280px) 100vw, 95vw"
                priority
              />
            ) : (
              <img
                src={data.url}
                alt={data.imgId}
                className="w-full h-auto max-h-[90vh] object-contain rounded-md"
                sizes="(max-width: 1280px) 100vw, 95vw"
              />
            ))}
        </DialogContent>
      </Dialog>
    </ImageViewerContext.Provider>
  );
}

export function useImageViewer() {
  const context = useContext(ImageViewerContext);
  if (!context) {
    throw new Error(
      'useImageViewer must be used within an ImageViewerProvider'
    );
  }
  return context;
}
