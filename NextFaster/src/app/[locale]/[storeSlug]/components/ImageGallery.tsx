'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  name: string;
  isOutOfStock?: boolean;
  isAr: boolean;
}

export default function ImageGallery({ images, name, isOutOfStock = false, isAr }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square flex w-full items-center justify-center rounded-3xl bg-neutral-50 border border-neutral-100">
        <Package className="h-20 w-20 text-neutral-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image View */}
      <div 
        ref={containerRef}
        className="relative aspect-square overflow-hidden rounded-[2rem] bg-neutral-50 shadow-inner group cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="h-full w-full"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentIndex]}
              alt={`${name} - ${currentIndex + 1}`}
              className={`h-full w-full object-cover transition-all duration-300 ${isOutOfStock ? 'opacity-40 grayscale' : ''} ${isZoomed ? 'scale-150' : 'scale-100'}`}
              style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
            />
          </motion.div>
        </AnimatePresence>

        {/* Controls Overlay */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className={`absolute top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur-md text-neutral-900 shadow-xl transition-all hover:bg-emerald-500 hover:text-white active:scale-90 opacity-0 group-hover:opacity-100 ${isAr ? 'right-4' : 'left-4'}`}
            >
              <ChevronLeft className={`h-5 w-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className={`absolute top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/80 backdrop-blur-md text-neutral-900 shadow-xl transition-all hover:bg-emerald-500 hover:text-white active:scale-90 opacity-0 group-hover:opacity-100 ${isAr ? 'left-4' : 'right-4'}`}
            >
              <ChevronRight className={`h-5 w-5 ${isAr ? 'rotate-180' : ''}`} />
            </button>
          </>
        )}

        <div className="absolute bottom-6 right-6 p-2 rounded-xl bg-black/20 backdrop-blur-md border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
           <Maximize2 className="h-4 w-4" />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 transition-all ${
                currentIndex === i 
                  ? 'border-emerald-500 scale-95 shadow-lg shadow-emerald-500/20' 
                  : 'border-transparent hover:border-neutral-200'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Thumbnail ${i}`} className="h-full w-full object-cover" />
              {currentIndex === i && (
                <div className="absolute inset-0 bg-emerald-500/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
