"use client";

import { useState } from 'react';
import { saveAs } from 'file-saver';

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string, prompt: string) => void;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [size, setSize] = useState('1024x1024');
  const [quality, setQuality] = useState('standard');
  const [style, setStyle] = useState('natural');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          size,
          quality,
          style,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      const imageUrl = data.data[0].url;
      
      const newImage: GeneratedImage = {
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: Date.now(),
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      
      // Callback to parent component
      if (onImageGenerated) {
        onImageGenerated(imageUrl, prompt.trim());
      }

      // Clear prompt after successful generation
      setPrompt('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const filename = `generated-image-${Date.now()}.png`;
      saveAs(blob, filename);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      // Could add a toast notification here
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-4">🎨 Image Generation</h3>
        
        {/* Generation Controls */}
        <div className="space-y-4">
          <div>
            <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Describe the image you want to create
            </label>
            <textarea
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A photorealistic portrait of a cat wearing a space helmet, with stars in the background..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows={3}
              maxLength={1000}
              disabled={isGenerating}
            />
            <div className="text-xs text-gray-500 mt-1">{prompt.length}/1000</div>
          </div>

          {/* Generation Options */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                disabled={isGenerating}
              >
                <option value="1024x1024">Square (1024×1024)</option>
                <option value="1024x1792">Portrait (1024×1792)</option>
                <option value="1792x1024">Landscape (1792×1024)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                disabled={isGenerating}
              >
                <option value="standard">Standard</option>
                <option value="hd">HD</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                disabled={isGenerating}
              >
                <option value="natural">Natural</option>
                <option value="vivid">Vivid</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-primary hover:bg-primary-light text-white font-medium px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Image...</span>
              </div>
            ) : (
              'Generate Image'
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium mb-3">Generated Images</h4>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {generatedImages.map((image, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 mb-2">{image.prompt}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      Generated {new Date(image.timestamp).toLocaleString()}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadImage(image.url, image.prompt)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => copyImageUrl(image.url)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                      >
                        Copy URL
                      </button>
                      <button
                        onClick={() => {
                          if (onImageGenerated) {
                            onImageGenerated(image.url, `Show me this image: ${image.prompt}`);
                          }
                        }}
                        className="text-xs bg-primary text-white hover:bg-primary-light px-2 py-1 rounded transition-colors"
                      >
                        Send to Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}