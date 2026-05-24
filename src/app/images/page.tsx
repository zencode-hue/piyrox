'use client';

import React, { useState } from 'react';

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          id: Math.random().toString(36).slice(2),
          src: e.target?.result,
          name: file.name,
          size: file.size,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0d0d]">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Image Generation</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Generate, edit, and explore images with AI
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-12 p-12 rounded-lg border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="text-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="mx-auto text-gray-400 dark:text-gray-600 mb-4"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Upload or drag images here
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Supported formats: JPG, PNG, GIF, WebP
            </p>
            <label className="inline-block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <span className="px-6 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-medium cursor-pointer transition-colors inline-block">
                Choose Files
              </span>
            </label>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Uploaded Images ({images.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-gray-900/50 transition-shadow"
                >
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => deleteImage(image.id)}
                      className="absolute top-2 right-2 p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate mb-1">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {(image.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              No images uploaded yet. Start by uploading an image above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
