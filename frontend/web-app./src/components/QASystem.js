
import React, { useState } from 'react';
import axios from 'axios';

const QASystem = ({ context }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleAsk = async () => {
    try {
      console.log("Handle ask called.");
      const response = await axios.post('http://127.0.0.1:5000/qa', { question, context });
      console.log(response);
      const formattedAnswer = formatAnswer(response.data.answer);
      setAnswer(formattedAnswer);

    } catch (error) {
      console.error(error);
    }
  };

  const formatAnswer = (answerText) => {
    const sentences = answerText.split('.').map(sentence => sentence.trim()).filter(sentence => sentence);
    
    return (
      <ul>
        {sentences.map((sentence, index) => (
          <li key={index}>{sentence}</li>
        ))}
      </ul>
    );
  };
  
  
  return (
    <div>
      <h1>Q&A System</h1>
      <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
      <button onClick={handleAsk}>Get Answer</button>
      {answer && (
        <div>
          <h2>Answer:</h2>
          {answer}
        </div>
      )}
    </div>
  );
};

export default QASystem;
