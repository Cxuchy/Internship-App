// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jobsRouter = require('./routes/jobs');
const authRoutes = require('./routes/auth.routes');
const offerRoutes = require('./routes/offer.routes');

const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const Tesseract = require('tesseract.js');


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello from Express yeee bro!');
});

// Use the jobs router
app.use('/', jobsRouter);

app.use('/api', authRoutes);
app.use('/api', offerRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Stage-App', {
  
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}).catch(err => console.error(err));



const upload = multer({ dest: 'uploads/' }); // files will be stored in /uploads
/*
app.post('/api/extract-offer-pdf', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read the file into a buffer
    const dataBuffer = fs.readFileSync(filePath);

    // Parse PDF and extract text
    const pdfData = await pdfParse(dataBuffer);

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    res.json({
      text: pdfData.text,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process PDF file.' });
  }
});
*/

/*
app.post('/api/extract-offer-img', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Run OCR with Tesseract
    const { data: { text } } = await Tesseract.recognize(
      filePath,
      'eng', // You can change this to other languages if needed
      'fr'
    );

    // Delete the file after processing
    fs.unlinkSync(filePath);

    res.json({ text });
  } catch (err) {
    console.error('OCR failed:', err);
    res.status(500).json({ error: 'Failed to extract text from image.' });
  }
});
*/