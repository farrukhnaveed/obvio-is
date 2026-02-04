import React, { useState } from 'react';
const apiUrl = import.meta.env.VITE_API_URL;

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      setStatus('Uploading...');
      const response = await fetch(`${apiUrl}/api/ingest`, {
        method: 'POST',
        body: formData,
      });

      if (response.status === 202) {
        setStatus('Ingestion started successfully! (Asynchronous)'); 
      } else {
        const data = await response.json();
        setStatus(data.message || 'Upload failed.');
      }
    } catch (error) {
      setStatus('Error connecting to server.');
    }
  };

  return (
    <div className="card">
      <h3>Ingest Document</h3>
      <input 
        type="file" 
        accept=".txt" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
      />
      <button onClick={handleUpload} disabled={!file}>
        Upload .txt File
      </button>
      <p>{status}</p>
    </div>
  );
};

export default FileUpload;
