
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cvController = require('../controllers/cv.controller');
const Cv = require('../models/cv.model');

router.post('/extract-data-resume', upload.single('file'), cvController.extractDataFromCv);


router.post('/add-cv', async (req, res) => {
  try {
    const cv = new Cv(req.body); 
    const savedCv = await cv.save();
    res.status(201).json(savedCv);
  } catch (err) {
    console.error('Error saving cv:', err);
    res.status(500).json({ error: 'Failed to cv offer' });
  }
});


router.get('/get-cv-by-userEmail', async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'Missing userEmail query parameter' });
    }

    // You can still include other optional filters here if needed
    const cv = await Cv.find({ userEmail });

    res.status(200).json(cv);
  } catch (error) {
    console.error('Error fetching cv by userEmail:', error);
    res.status(500).json({ error: 'Failed to fetch cv' });
  }
});

router.delete('/delete-cv/:id', async (req, res) => {
  const cvId = req.params.id;

  try {
    const deletedCv = await Cv.findByIdAndDelete(cvId);

    if (!deletedCv) {
      return res.status(404).json({ error: 'Cv not found' });
    }

    res.status(200).json({ message: 'CV deleted successfully', deletedCv });
  } catch (error) {
    console.error('Error deleting CV:', error);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
});



module.exports = router;