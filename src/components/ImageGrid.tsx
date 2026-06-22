import React from 'react';

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
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-6 max-w-7xl mx-auto">
      {images.map((image) => (
        <div
          key={image.id}
          className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 aspect-square bg-gray-100"
          onClick={() => onImageClick(image)}
        >
          <img
            src={image.thumbUrl}
            alt={`Image ${image.id}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
      ))}
    </div>
  );
};

export default ImageGrid;
