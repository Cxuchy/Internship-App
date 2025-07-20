const fs = require('fs');
const pdfParse = require('pdf-parse');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { askOllama,analyzeCVDetailed } = require('../services/ollamaService');
const { fromPath } = require('pdf2pic');



exports.extractDataFromCv = async (req, res) => {
  try {
    const filePath = req.file.path;

    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    fs.unlinkSync(filePath); // delete temp file


    console.log('Cv text extracted:', pdfData.text);
    const summary = await analyzeCVDetailed(pdfData.text);
    console.log('Olama text extracted:', summary);

    
    res.json({ summary });

  } catch (err) {
    console.error('Cv processing failed:', err);
    res.status(500).json({ error: 'Failed to process Cv file.' });
  }
};