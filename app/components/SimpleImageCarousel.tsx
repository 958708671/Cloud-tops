'use client';

import React, { useEffect, useRef } from 'react';

interface SimpleImageCarouselProps {
  currentImage?: number;
  onImageChange: (index: number) => void;
}

const SimpleImageCarousel = ({ currentImage = 0, onImageChange }: SimpleImageCarouselProps) => {
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  // 使用 ref 持有最新值，避免闭包陷阱导致 interval 不断重建
  const currentIndexRef = useRef(currentImage);
  const onImageChangeRef = useRef(onImageChange);

  // 始终保持 ref 与最新 props 同步，不触发 effect 重跑
  currentIndexRef.current = Math.max(0, Math.min(currentImage, 28));
  onImageChangeRef.current = onImageChange;

  // 生成29张图片
  const images = Array.from({ length: 29 }, (_, i) => ({
    id: i + 1,
    src: `/images/${i + 1}.webp`,
    alt: `宣传图 ${i + 1}`
  }));

  // 确保索引在有效范围内
  const validIndex = Math.max(0, Math.min(currentImage, images.length - 1));

  // 空依赖数组：interval 只在挂载时创建一次，通过 ref 读取最新值
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % 29;
      onImageChangeRef.current(nextIndex);
    }, 3000);
    
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, []);

  const currentImageData = images[validIndex];

  return (
    <div className="h-full flex flex-col">
      {/* 图片展示区域 */}
      <div className="flex-1 relative overflow-hidden rounded-lg">
        {currentImageData ? (
          <img 
            src={currentImageData.src} 
            alt={currentImageData.alt}
            className="w-full h-full object-cover transition-opacity duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-gray-800 flex items-center justify-center';
                fallback.innerHTML = '<span class="text-gray-400">图片加载失败</span>';
                parent.appendChild(fallback);
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-400">加载中...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleImageCarousel;