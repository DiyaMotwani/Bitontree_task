
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/common.css';

const QASystem = ({ context }) => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question) {
      alert('Please enter a question');
      return;
    }
    
    setIsLoading(true);
   
    setMessages(prev => [...prev, { type: 'question', content: question }]);
    
    try {
      const response = await axios.post('http://127.0.0.1:5000/qa', { question, context });
      const answer = response.data.answer;
      

      setMessages(prev => [...prev, { type: 'answer', content: answer }]);
      setQuestion(''); 
    } catch (error) {
      console.error(error);
      alert('Error getting answer. Please try again.');
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const formatContent = (content) => {
   
    const lines = content.split('\n');
    const listItems = [];
  
    lines.forEach(line => {

      if (line.startsWith('*')) {
        listItems.push(<li>{line.replace('*', '').trim()}</li>);  
      } else {
        listItems.push(<p>{line}</p>); 
      }
    });
  
    return <ul>{listItems}</ul>;  
  };
  

  return (
    <div className="container">
      <h1 className="page-title">Ask Questions About the Content</h1>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={message.type === 'question' ? 'question-bubble' : 'answer-bubble'}
            >
            {message.type === 'answer' ? formatContent(message.content) : message.content}
            </div>
          ))}
          {isLoading && <div className="loading-spinner" />}
        </div>
        
        <div className="chat-input-container">
          <input
            type="text"
            className="input-field"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your question here..."
          />
          <button 
            className="button"
            onClick={handleAsk}
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Ask'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QASystem;