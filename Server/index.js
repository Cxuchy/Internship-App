// server/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const offerRoutes = require('./routes/offer.routes');
const cvRoutes = require('./routes/cv.routes');

const scraperRoutes = require('./routes/scraper'); 

const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const Tesseract = require('tesseract.js');


const botRoutes  = require('./routes/bot');


const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Example route
app.get('/', (req, res) => {
  res.send('Hello from Express yeee bro!');
});


app.use('/api', authRoutes);
app.use('/api', offerRoutes);
app.use('/api', scraperRoutes);
app.use('/api', cvRoutes);





// Connect to MongoDB mongodb://localhost:27017/Stage-App
mongoose.connect(`mongodb+srv://yassinecauchy:${process.env.DB_PW}@cluster0.vb3yir7.mongodb.net/Stage-App`, {
  
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  botRoutes.startBot(); 
}).catch(err => console.error(err));



const upload = multer({ dest: 'uploads/' }); // files will be stored in /uploads
