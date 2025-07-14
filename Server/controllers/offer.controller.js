const fs = require('fs');
const pdfParse = require('pdf-parse');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { askOllama } = require('../services/ollamaService');


exports.extractOfferFromPDF = async (req, res) => {
  try {
    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    fs.unlinkSync(filePath); // delete temp file


    const summary = await askOllama(pdfData.text);

    
    res.json({ summary });

  } catch (err) {
    console.error('PDF processing failed:', err);
    res.status(500).json({ error: 'Failed to process PDF file.' });
  }
};


exports.extractOfferFromImage = async (req, res) => {
  try {
    const filePath = req.file.path;

    const {
      data: { text }
    } = await Tesseract.recognize(filePath, 'eng+fra'); // or 'eng+fra' for multilingual

    fs.unlinkSync(filePath); // clean up temp file

    const summary = await askOllama(text);

    res.json({ summary });
    //res.json({ text });

  } catch (err) {
    console.error('OCR failed:', err);
    res.status(500).json({ error: 'Failed to extract text from image.' });
  }
};