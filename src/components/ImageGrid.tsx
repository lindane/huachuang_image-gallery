import React, { useState } from 'react';

interface ImageItem {
  id: number;
  thumbUrl: string;
  fullUrl: string;
}

interface ImageGridProps {
  images: ImageItem[];
  onImageClick: (image: ImageItem) => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ images, onImageClick }) => {
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({});
  const [retryKeys, setRetryKeys] = useState<Record<number, number>>({});

  const handleImageError = (id: number) => {
    setErrorStates((prev) => ({ ...prev, [id]: true }));
  };

  const handleImageLoad = (id: number) => {
    setErrorStates((prev) => ({ ...prev, [id]: false }));
  };

  const handleRetry = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setErrorStates((prev) => ({ ...prev, [id]: false }));
    setRetryKeys((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 max-w-7xl mx-auto">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 aspect-square bg-gray-200"
          onClick={() => onImageClick(image)}
        >
          {!errorStates[image.id] ? (
            <img
              key={`${image.id}-${retryKeys[image.id] || 0}`}
              src={image.thumbUrl}
              alt={`Image ${image.id}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              loading="lazy"
              onError={() => handleImageError(image.id)}
              onLoad={() => handleImageLoad(image.id)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gray-100 text-gray-500">
              <svg
                className="w-10 h-10 text-gray-400"
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
              <p className="text-xs">加载失败</p>
              <button
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium transition-colors"
                onClick={(e) => handleRetry(e, image.id)}
              >
                <svg
                  className="w-3 h-3"
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
                重试
              </button>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 pointer-events-none" />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
