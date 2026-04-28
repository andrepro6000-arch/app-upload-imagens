import React, { useState, useRef } from 'react';

export default function App() {
  const [images, setImages] = useState<any[]>([]);
  const [progress, setProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (e: any) => {
    let file = e.target?.files?.[0] || e.dataTransfer?.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Máx 5MB');
      return;
    }

    setProgress(10);

    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      });

      const data = await res.json();

      if (!data.success) {
        alert('Erro upload');
        return;
      }

      setImages(prev => [
        {
          url: data.data.url,
          name: file.name
        },
        ...prev
      ]);

      setProgress(100);
    };

    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Upload ImgBB</h2>

      <input type="file" ref={inputRef} onChange={upload} />

      {progress && <p>{progress}%</p>}

      {images.map((img, i) => (
        <div key={i}>
          <img src={img.url} width={200} />
          <p>{img.url}</p>
        </div>
      ))}
    </div>
  );
}