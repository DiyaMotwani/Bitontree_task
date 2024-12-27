import React, { useState } from 'react';
import EnterURL from './components/EnterURL';
import ProcessingStatus from './components/ProcessingStatus';
import QASystem from './components/QASystem';

const App = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('EnterURL');

  const [content, setContent] = useState(''); 

  const handleContentScraped = (scrapedContent) => {
    setContent(scrapedContent); 
  };

  const handleProcessingStart = (status) => {
    setIsProcessing(status);
    if (status) {
      setCurrentScreen('ProcessingStatus');
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setCurrentScreen('QASystem');
  };

  return (
    <div>
      {currentScreen === 'EnterURL' && (
        <EnterURL onProcessing={handleProcessingStart} onContentScraped={handleContentScraped} />
      )}
      {currentScreen === 'ProcessingStatus' && (
        <ProcessingStatus
          isProcessing={isProcessing}
          onComplete={handleProcessingComplete}
        />
      )}
      {currentScreen === 'QASystem' && content && <QASystem context={content}/>}
    </div>
  );
};

export default App;
