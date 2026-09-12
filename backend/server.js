// 1. Packages Import Karein
const express = require('express');
const cors = require('cors');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// 2. Database & Models Import Karein
const connectDB = require('./config/db');
const Review = require('./models/Review');

// 3. AI Service Import Karein
const generateReview = require('./services/ai.service');

// 4. Express App Create Karein
const app = express();

// 5. Middlewares Setup Karein
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// 6. Connect to MongoDB Database
connectDB();

// 7. Test Route
app.get('/', (req, res) => {
  res.send('AI Code Reviewer API is running live!');
});

// 8. Code Review Endpoint (POST Request - Review + Save to DB)
app.post('/api/review', async (req, res) => {
  const { code } = req.body;

  // Input Validation
  if (!code) {
    return res.status(400).json({ error: 'Code is required for review' });
  }

  try {
    // Gemini AI se Review generate karein
    const review = await generateReview(code);

    // MongoDB Database me entry save karein
    const savedReview = await Review.create({
      code,
      review,
    });

    res.json({ review: savedReview.review, id: savedReview._id });
  } catch (error) {
    console.error('Error generating review:', error);
    res.status(500).json({ error: 'Failed to generate review. Check API key or server logs.' });
  }
});

// 9. Fetch History Endpoint (GET Request - Recent First)
app.get('/api/history', async (req, res) => {
  try {
    const history = await Review.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch review history' });
  }
});

// 10. Delete Single History Item Endpoint (DELETE Request)
app.delete('/api/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Review.findByIdAndDelete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});



// 10. Server Port Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});