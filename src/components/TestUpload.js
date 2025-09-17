// components/TestUpload.js
import React, { useState } from 'react';

const TestUpload = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testUpload = async () => {
    setLoading(true);
    setResult('Creating test image...');
    
    // Create a simple PNG image
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(0, 0, 100, 100);
    
    canvas.toBlob(async (blob) => {
      const testFile = new File([blob], 'test.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('image', testFile);

      const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('File type:', testFile.type);
      console.log('File size:', testFile.size, 'bytes');

      try {
        setResult('Uploading...');
        const response = await fetch('http://localhost:8000/api/upload-image', {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('Full response:', data);
        
        if (data.success) {
          setResult(`✅ SUCCESS!\nImage URL: ${data.image_url}`);
        } else {
          setResult(`❌ FAILED: ${data.error}\nValidation errors: ${JSON.stringify(data.messages, null, 2)}`);
        }
      } catch (error) {
        console.error('Upload error:', error);
        setResult('Error: ' + error.message);
      } finally {
        setLoading(false);
      }
    }, 'image/png');
  };

  const testWithRealImage = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setResult('Checking file...');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setResult('❌ Please select an image file');
      setLoading(false);
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setResult('❌ Image must be less than 5MB');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');

    fetch('http://localhost:8000/api/upload-image', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
    .then(response => response.json())
    .then(data => {
      console.log('Real image upload result:', data);
      if (data.success) {
        setResult(`✅ SUCCESS!\nImage URL: ${data.image_url}`);
      } else {
        setResult(`❌ FAILED: ${data.error}\nErrors: ${JSON.stringify(data.messages, null, 2)}`);
      }
    })
    .catch(error => {
      console.error('Upload error:', error);
      setResult('Error: ' + error.message);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-2">🛠️ Upload Test</h3>
      <p className="text-sm text-yellow-700 mb-3">Use this to test image uploads</p>
      
      <div className="space-y-3">
        <button 
          onClick={testUpload}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 w-full"
        >
          {loading ? 'Testing...' : 'Test with Generated Image'}
        </button>

        <label className="block bg-green-500 text-white px-4 py-2 rounded cursor-pointer text-center hover:bg-green-600">
          📁 Test with Real Image
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={testWithRealImage}
            className="hidden"
          />
        </label>
      </div>

      {result && (
        <div className="mt-4 p-3 bg-white rounded border">
          <h4 className="font-semibold">Result:</h4>
          <pre className="text-xs overflow-auto mt-2 p-2 bg-gray-100 rounded whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestUpload;