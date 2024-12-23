
import React, { useState } from 'react';
import axios from 'axios';

const EnterURL = ({ onProcessing, onContentScraped }) => {
  const [url, setUrl] = useState('');

  const handleScrape = async () => {
    onProcessing(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/scrape', { url });
      const content = response.data.content;
      await axios.post('http://127.0.0.1:5000/process', { content });
      onProcessing(false);
      onContentScraped(content);
    } catch (error) {
      console.error(error);
      onProcessing(false);
    }
  };

  return (
    <div>
      <h1>Enter Website URL</h1>
      <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button onClick={handleScrape}>Scrape and Process</button>
    </div>
  );
};

export default EnterURL;
