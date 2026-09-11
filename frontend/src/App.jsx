
import { useState, useEffect } from 'react'; // 1. Added useEffect import
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import './App.css';

function App() {
  // 1. State Variables
  const [code, setCode] = useState('// Type or paste your code here\nfunction add(a, b) {\n  return a + b;\n}');
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // History state

  // 2. Initial render par DB se history fetch karein
  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/history');
      setHistory(response.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // 3. API Call Function
  const handleReview = async () => {
    if (!code.trim()) return alert('Please enter some code first!');
    
    setLoading(true);
    setReview('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/review', { code });
      setReview(response.data.review);
      fetchHistory(); // Naya review aane ke baad history list update karein
    } catch (err) {
      console.error(err);
      setReview('❌ Error fetching review. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // 4. History item par click karne par load karne ka logic
  const handleSelectHistoryItem = (item) => {
    setCode(item.code);
    setReview(item.review);
  };

  // 5. History item delete karna ka logic

  const handleDeleteHistoryItem = async (e, id) =>{
    e.stopPropagation(); // parent li click event ko triigr hone se rokne ke liye 
    try{
      await axios.delete(`http://localhost:5000/api/history/${id}`);
      // State se deleted item filter out karke UI refresh karein
      setHistory(history.filter((item) => item._id !==id));
    } catch (err){
      console.log('Error deleting history item:', err);
      alert('Failed to delete item');
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <h1>⚡ AI Code Reviewer</h1>
        <p>Instant code analysis, bug detection & performance fixes</p>
      </header>

      {/* Main Content (3 Split Columns: Sidebar + Editor + Feedback) */}
      <div className="main-content">
        
        {/* Left Column: History Sidebar */}
        <div className="history-sidebar">
          <h3>📜 History</h3>
          {history.length === 0 ? (
            <p className="no-history">No past reviews</p>
          ) : (

            <ul className="history-list">
              {history.map((item) => (
                <li 
                  key={item._id} 
                  onClick={() => handleSelectHistoryItem(item)}
                  className="history-item"
                >
                  <div className="history-item-header">
                    <span className="history-code-preview">
                      {item.code.slice(0, 22)}...
                    </span>
                    <button 
  className="button"
  onClick={(e) => handleDeleteHistoryItem(e, item._id)}
  title="Delete review"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 39 7"
    className="bin-top svgIcon"
  >
    <line strokeWidth="4" stroke="white" y2="5" x2="39" y1="5"></line>
    <line
      strokeWidth="3"
      stroke="white"
      y2="1.5"
      x2="26.0357"
      y1="1.5"
      x1="12"
    ></line>
  </svg>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 33 39"
    className="bin-bottom svgIcon"
  >
    <mask fill="white" id="path-1-inside-1_8_19">
      <path
        d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
      ></path>
    </mask>
    <path
      mask="url(#path-1-inside-1_8_19)"
      fill="white"
      d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
    ></path>
    <path strokeWidth="5" stroke="white" d="M12 6V29"></path>
    <path strokeWidth="5" stroke="white" d="M21 6V29"></path>
  </svg>
</button>
                  </div>
                  <span className="history-date">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Middle Column: Monaco Code Editor */}
        <div className="editor-container">
          <div className="panel-title">Source Code</div>
          <Editor
            height="65vh"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
          <button 
            className="review-btn" 
            onClick={handleReview} 
            disabled={loading}
          >
            {loading ? 'Analyzing Code...' : '🔍 Review Code'}
          </button>
        </div>

        {/* Right Column: AI Feedback Markdown Display */}
        <div className="review-container">
          <div className="panel-title">AI Feedback</div>
          <div className="review-content">
            {loading && <p className="loading-text">⏳ Gemini AI is analyzing your code for bugs and optimizations...</p>}
            {!loading && !review && <p className="placeholder-text">Click "Review Code" to get AI feedback here.</p>}
            {!loading && review && <ReactMarkdown>{review}</ReactMarkdown>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;