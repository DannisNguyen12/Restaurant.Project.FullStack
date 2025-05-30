"use client";
import React, { useState } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  imageUrl: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  if (!imageUrl.trim()) {
    return (
      <div className="w-full h-[200px] bg-gray-200 rounded flex items-center justify-center">
        <p className="text-gray-500">No image URL provided</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[200px] bg-gray-100 rounded overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center p-4">
            <p className="text-red-500 font-medium">Unable to load image</p>
            <p className="text-sm text-gray-500 mt-1">Please check the URL and try again</p>
          </div>
        </div>
      ) : (
        <Image
          src={imageUrl.trim()}
          alt="Item preview"
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          style={{ objectFit: 'cover' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}
    </div>
  );
};

export default ImagePreview;
