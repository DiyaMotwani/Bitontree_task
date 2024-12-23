
import React from 'react';

const ProcessingStatus = ({ isProcessing, onComplete }) => {
  return (
    <div>
      <h1>Processing Status</h1>
      {isProcessing ? (
        <p>Processing your request...</p>
      ) : (
        <div>
          <p>Processing Complete!</p>
          <button onClick={onComplete}>Go to Q&A</button>
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus;
