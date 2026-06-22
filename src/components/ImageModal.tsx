import React, { useEffect, useState, useRef, useCallback } from 'react';

interface ImageItem {
  id: number;
  thumbUrl: string;
  fullUrl: string;
}

interface ImageModalProps {
  image: ImageItem | null;
  onClose: () => void;
  images: ImageItem[];
  onSelectImage: (image: ImageItem) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose, images, onSelectImage }) => {
  const [displayImage, setDisplayImage] = useState<ImageItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const currentIdRef = useRef<number | null>(null);

  const currentIndex = image ? images.findIndex((img) => img.id === image.id) : -1;
  const total = images.length;

  const goToPrev = useCallback(() => {
    if (currentIndex <= 0) return;
    onSelectImage(images[currentIndex - 1]);
  }, [currentIndex, images, onSelectImage]);

  const goToNext = useCallback(() => {
    if (currentIndex < 0 || currentIndex >= total - 1) return;
    onSelectImage(images[currentIndex + 1]);
  }, [currentIndex, images, onSelectImage, total]);

  useEffect(() => {
    if (!image) {
      setDisplayImage(null);
      setIsLoading(false);
      setHasError(false);
      currentIdRef.current = null;
      return;
    }

    currentIdRef.current = image.id;
    setIsLoading(true);
    setHasError(false);
  }, [image?.id]);

  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [image, onClose, goToPrev, goToNext]);

  const handleImageLoad = () => {
    if (image && image.id === currentIdRef.current) {
      setDisplayImage(image);
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleImageError = () => {
    if (image && image.id === currentIdRef.current) {
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    setRetryKey((prev) => prev + 1);
  };

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 text-white text-3xl transition-colors duration-200"
        onClick={onClose}
        aria-label="关闭"
      >
        ×
      </button>

      {currentIndex > 0 && (
        <button
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-colors duration-200 group"
          onClick={(e) => {
            e.stopPropagation();
            goToPrev();
          }}
          aria-label="上一张"
        >
          <span
            className="w-4 h-4 border-l-2 border-t-2 border-white -rotate-45 translate-x-0.5 group-hover:scale-110 transition-transform"
          />
        </button>
      )}

      {currentIndex >= 0 && currentIndex < total - 1 && (
        <button
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 transition-colors duration-200 group"
          onClick={(e) => {
            e.stopPropagation();
            goToNext();
          }}
          aria-label="下一张"
        >
          <span
            className="w-4 h-4 border-r-2 border-t-2 border-white rotate-45 -translate-x-0.5 group-hover:scale-110 transition-transform"
          />
        </button>
      )}

      <div
        className="relative flex flex-col items-center justify-center min-w-[300px] max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-center min-h-[200px]">
          {displayImage && (
            <img
              src={displayImage.fullUrl}
              alt={`Image ${displayImage.id}`}
              className={`max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300 ${
                isLoading || hasError ? 'opacity-50' : 'opacity-100'
              }`}
            />
          )}

          {(isLoading || hasError) && (
            <div className="absolute inset-0 flex items-center justify-center">
              {hasError ? (
                <div className="flex flex-col items-center gap-3 text-white">
                  <svg
                    className="w-14 h-14 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-base">图片加载失败</p>
                  <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm transition-colors"
                    onClick={handleRetry}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    重新加载
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white">
                  <svg
                    className="w-12 h-12 animate-spin text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <p className="text-sm text-gray-300">加载中...</p>
                </div>
              )}
            </div>
          )}

          {image && (
            <img
              key={`${image.id}-${retryKey}`}
              src={image.fullUrl}
              alt=""
              className="hidden"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>

        <div className="mt-4 text-white text-sm font-medium tracking-wide bg-black bg-opacity-40 px-4 py-1.5 rounded-full">
          {currentIndex + 1} / {total}
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
