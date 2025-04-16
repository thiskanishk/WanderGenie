require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
// Graceful error handling for imports
try {
  const aiRoutes = require('./routes/ai');
  app.use('/api', aiRoutes);
} catch (error) {
  console.error('Failed to load AI routes:', error.message);
}

try {
  const tripSuggestionsRoutes = require('./routes/tripSuggestions');
  app.use('', tripSuggestionsRoutes);
} catch (error) {
  console.error('Failed to load Trip Suggestions routes:', error.message);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Planner service running on port ${PORT}`);
});