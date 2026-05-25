'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ImagesPage() {
  const [images, setImages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          type: 'uploaded',
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();

      if (data.success && data.url) {
        setImages(prev => [...prev, {
          id: Math.random().toString(36).slice(2),
          src: data.url,
          name: `Generated: ${prompt.slice(0, 30)}`,
          size: 0,
          type: 'generated',
        }]);
        setPrompt('');
      } else {
        throw new Error(data.message || 'Failed to generate image.');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500/30">
      {/* Background effects */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0"></div>
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/15 blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">PiyRox</Link>
            <span className="text-gray-600 text-sm border-l border-gray-700 pl-3">Images</span>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back to Chat
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400">
            AI Image Studio
          </h1>
          <p className="text-xl text-gray-400 max-w-xl mx-auto">
            Generate stunning visuals from text prompts, or upload and manage your images.
          </p>
        </header>

        {/* AI Generation Input */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-[#111]/80 backdrop-blur-md rounded-3xl p-2 border border-white/[0.08] shadow-2xl shadow-purple-500/5 flex items-center gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe the image you want to create..."
              className="flex-1 bg-transparent px-5 py-4 text-white placeholder-gray-500 outline-none text-base"
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 flex items-center gap-2 whitespace-nowrap"
            >
              {generating ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating...</>
              ) : (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> Generate</>
              )}
            </button>
          </div>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </div>

        {/* Upload Area */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-16 p-16 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragging
              ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_60px_rgba(168,85,247,0.15)]'
              : 'border-gray-800 hover:border-gray-600 bg-[#0a0a0a]/50'
          }`}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Drop your images here</h3>
            <p className="text-gray-500 mb-6">or click below to browse</p>
            <label>
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              <span className="inline-block px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold cursor-pointer transition-colors">
                Browse Files
              </span>
            </label>
          </div>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <span>Your Gallery</span>
              <span className="text-sm font-normal text-gray-500 bg-gray-800 px-3 py-1 rounded-full">{images.length}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image) => (
                <div key={image.id} className="group relative bg-[#111] rounded-3xl overflow-hidden border border-white/[0.05] hover:border-white/[0.15] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/10">
                  <div className="relative aspect-square bg-gray-900">
                    <img src={image.src} alt={image.name} className="w-full h-full object-cover" />
                    {image.type === 'generated' && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-purple-500/80 backdrop-blur-sm text-xs font-bold">AI Generated</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-end">
                      <div>
                        <p className="text-sm font-semibold truncate">{image.name}</p>
                        {image.size > 0 && <p className="text-xs text-gray-400">{(image.size / 1024).toFixed(1)} KB</p>}
                      </div>
                      <button onClick={() => deleteImage(image.id)} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-600"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
            </div>
            <p className="text-gray-500 text-lg">No images yet. Generate one with AI or upload your own.</p>
          </div>
        )}
      </main>
    </div>
  );
}
