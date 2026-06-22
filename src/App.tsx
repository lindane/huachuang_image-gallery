import { useState, useEffect } from 'react';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import './index.css';

interface ImageItem {
  id: number;
  thumbUrl: string;
  fullUrl: string;
}

const STORAGE_KEY = 'gallery_favorites';

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

const loadFavorites = (): Set<number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as number[];
      return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set();
};

function App() {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => loadFavorites());
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favoriteIds)));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  const handleToggleFavorite = (id: number) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleView = () => {
    setShowFavorites((prev) => !prev);
  };

  const displayImages = showFavorites
    ? IMAGES.filter((img) => favoriteIds.has(img.id))
    : IMAGES;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              🖼️ 图片画廊
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              点击任意图片查看大图
            </p>
          </div>
          <button
            onClick={toggleView}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border ${
              showFavorites
                ? 'bg-rose-500 text-white border-rose-500 hover:bg-rose-600 shadow-md'
                : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50'
            }`}
          >
            <span className="relative w-4 h-4 flex-shrink-0">
              <span
                className={`absolute left-0 rounded-t-full -rotate-45 origin-bottom-left transition-colors duration-200 ${
                  showFavorites ? 'bg-current' : 'bg-slate-400'
                }`}
                style={{ top: '4px', width: '8px', height: '12px' }}
              />
              <span
                className={`absolute right-0 rounded-t-full rotate-45 origin-bottom-right transition-colors duration-200 ${
                  showFavorites ? 'bg-current' : 'bg-slate-400'
                }`}
                style={{ top: '4px', width: '8px', height: '12px' }}
              />
              <span
                className={`absolute left-1/2 -translate-x-1/2 rotate-45 transition-colors duration-200 ${
                  showFavorites ? 'bg-current' : 'bg-slate-400'
                }`}
                style={{ bottom: '0px', width: '9px', height: '9px' }}
              />
            </span>
            {showFavorites ? '返回全部' : `我的收藏 (${favoriteIds.size})`}
          </button>
        </div>
      </header>
      <main>
        {showFavorites && displayImages.length === 0 ? (
          <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
            <div className="relative w-20 h-20 mb-5">
              <span
                className="absolute left-0 rounded-t-full -rotate-45 origin-bottom-left bg-slate-200"
                style={{ top: '20px', left: '10px', width: '30px', height: '45px' }}
              />
              <span
                className="absolute right-0 rounded-t-full rotate-45 origin-bottom-right bg-slate-200"
                style={{ top: '20px', right: '10px', width: '30px', height: '45px' }}
              />
              <span
                className="absolute left-1/2 -translate-x-1/2 rotate-45 bg-slate-200"
                style={{ bottom: '8px', width: '35px', height: '35px' }}
              />
            </div>
            <p className="text-xl font-semibold text-slate-700 mb-2">
              还没有收藏任何图片
            </p>
            <p className="text-slate-500 text-sm max-w-sm">
              浏览图片时，点击模态框里的爱心按钮，
              <br />
              把喜欢的图片加入收藏吧~
            </p>
          </div>
        ) : (
          <ImageGrid
            images={displayImages}
            onImageClick={handleImageClick}
            favoriteIds={favoriteIds}
          />
        )}
      </main>
      <ImageModal
        image={selectedImage}
        onClose={handleClose}
        images={IMAGES}
        onSelectImage={handleImageClick}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  );
}

export default App;
