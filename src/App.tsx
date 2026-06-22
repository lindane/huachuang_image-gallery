import { useState } from 'react';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import './index.css';

interface ImageItem {
  id: number;
  thumbUrl: string;
  fullUrl: string;
}

const generateImages = (count: number): ImageItem[] => {
  const images: ImageItem[] = [];
  for (let i = 1; i <= count; i++) {
    const seed = 100 + i;
    images.push({
      id: i,
      thumbUrl: `https://picsum.photos/seed/${seed}/400/400`,
      fullUrl: `https://picsum.photos/seed/${seed}/1200/800`,
    });
  }
  return images;
};

const IMAGES = generateImages(20);

function App() {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            🖼️ 图片画廊
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            点击任意图片查看大图
          </p>
        </div>
      </header>
      <main>
        <ImageGrid images={IMAGES} onImageClick={handleImageClick} />
      </main>
      <ImageModal image={selectedImage} onClose={handleClose} />
    </div>
  );
}

export default App;
