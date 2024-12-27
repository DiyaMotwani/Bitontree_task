
import React from 'react';
import '../styles/common.css';

const ProcessingStatus = ({ isProcessing, onComplete }) => {
  return (
    <div className="container">
      <h1 className="page-title">Processing Status</h1>
      {isProcessing ? (
        <div>
          <div className="loading-spinner"></div>
          <p style={{ textAlign: 'center' }}>Analyzing content, please wait...</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#27ae60', fontSize: '1.2rem' }}>
            Analysis Complete!
          </p>
          <button className="button" onClick={onComplete}>
            Continue to Q&A
          </button>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
