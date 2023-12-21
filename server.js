const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000; // Choose a port for your server

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// API routes or other backend logic
app.get('/api/data', (req, res) => {
  // Handle API requests here
  res.json({ message: 'This is a sample API endpoint' });
});

// Catch-all handler for React's client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});