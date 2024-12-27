

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/common.css';

const EnterURL = ({ onProcessing, onContentScraped }) => {
  const [url, setUrl] = useState('');

  const handleScrape = async () => {
    if (!url) {
      alert('Please enter a URL');
      return;
    }
    onProcessing(true);
    try {
     
      const response = await axios.post('http://127.0.0.1:5000/scrape', { url });
      console.log('Scrape response:', response.data);
      
      const content = response.data.content;
      if (!content) {
        throw new Error('No content received from scraping');
      }
  
     
      const processResponse = await axios.post('http://127.0.0.1:5000/process', { content });
      console.log('Process response:', processResponse.data);
      
      onProcessing(false);
      onContentScraped(content);
    } catch (error) {
      console.error('Detailed error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Error processing URL: ${error.response?.data?.error || error.message}`);
      onProcessing(false);
    }
  };

  return (
    <div className="container">
      <h1 className="page-title">Website Content Analyzer</h1>
      <div>
        <input
          type="text"
          className="input-field"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL here..."
        />
        <button className="button" onClick={handleScrape}>
          Scrape and Analyze 
        </button>
      </div>
    </div>
  );
};

export default EnterURL;
