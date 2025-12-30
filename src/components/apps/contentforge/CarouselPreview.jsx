import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../ui/button';

const gradients = [
  'from-blue-500 via-blue-600 to-indigo-600',
  'from-purple-500 via-purple-600 to-pink-600',
  'from-emerald-500 via-teal-600 to-cyan-600',
  'from-orange-500 via-red-500 to-pink-600',
  'from-indigo-500 via-purple-600 to-pink-600',
  'from-teal-500 via-emerald-600 to-green-600',
];

function CarouselPreview({ slides }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="space-y-5">
      {/* Main Carousel Display */}
      <div className="relative">
        <div
          className={`relative bg-gradient-to-br ${
            gradients[currentSlide % gradients.length]
          } rounded-2xl aspect-square max-w-md mx-auto p-10 flex items-center justify-center shadow-2xl overflow-hidden`}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-20 translate-y-20"></div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.3 }}
              className="text-white text-center relative z-10"
            >
              <p className="whitespace-pre-wrap text-lg leading-relaxed">{slides[currentSlide]}</p>
            </motion.div>
          </AnimatePresence>

          {slides.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full shadow-lg hover:scale-110 transition-transform h-10 w-10"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full shadow-lg hover:scale-110 transition-transform h-10 w-10"
                onClick={nextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Slide number indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm">
            {currentSlide + 1} / {slides.length}
          </div>
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex items-center justify-center gap-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide ? 'w-8 bg-blue-600' : 'w-2 bg-gray-300 hover:bg-gray-400'
            }`}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-gray-50 rounded-xl border border-gray-200">
        {slides.map((slide, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`relative p-4 text-xs text-left rounded-lg border-2 transition-all overflow-hidden group ${
              index === currentSlide
                ? 'border-blue-500 bg-white shadow-md'
                : 'border-gray-200 bg-white/50 hover:border-blue-300 hover:bg-white'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Mini gradient preview */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${
                gradients[index % gradients.length]
              } opacity-10 group-hover:opacity-20 transition-opacity`}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs ${index === currentSlide ? 'text-blue-600' : 'text-gray-500'}`}
                >
                  Slide {index + 1}
                </span>
                {index === currentSlide && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-1.5 w-1.5 rounded-full bg-blue-600"
                  ></motion.div>
                )}
              </div>
              <div
                className={`line-clamp-2 ${
                  index === currentSlide ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                {slide}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default CarouselPreview;
