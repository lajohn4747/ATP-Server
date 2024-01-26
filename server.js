const express = require('express');
const path = require('path');
const { createCSV, createSalesCSV, sendFile } = require('./fetch');

const app = express();
const PORT = 8000; // Choose a port for your server

global.creatingCSV = false;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// API routes or other backend logic
app.get('/api/create_data', async (req, res) => {
  createCSV(res, req.query.startDate, req.query.endDate);
  console.log(`Creating CSV is: ${global.creatingCSV}`);
  res.status(200).json({ status: 'success', message: `${req.query.startDate}-${req.query.endDate}.csv` });
});

// API routes or other backend logic
app.get('/api/get_sales_mix_data', async (req, res) => {
  createSalesCSV(res, req.query.startDate, req.query.endDate);
  console.log(`Creating CSV is: ${global.creatingCSV}`);
  res.status(200).json({ status: 'success', message: `${req.query.startDate}-${req.query.endDate}.csv` });
});

// API routes or other backend logic
app.get('/api/get_file', async (req, res) => {
  console.log(`Checking CSV is: ${global.creatingCSV}`);
  if (global.creatingCSV) {
    console.log(`Filename is: ${req.query.fileName}`);
    await sendFile(res, req.query.fileName);
    global.creatingCSV = false;
  } else {
    console.log("Not Ready")
    res.status(503).json({status: 'error', message: 'Still waiting on file creation'  });
  }
});


// Catch-all handler for React's client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});