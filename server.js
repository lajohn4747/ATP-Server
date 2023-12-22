const express = require('express');
const path = require('path');
const { createCSV } = require('./fetch');

const app = express();
const PORT = 8000; // Choose a port for your server

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// API routes or other backend logic
app.get('/api/data', async (req, res) => {
  await createCSV(res, req.query.startDate, req.query.endDate);
});


// Catch-all handler for React's client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});