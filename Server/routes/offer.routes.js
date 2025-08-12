const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const offerController = require('../controllers/offer.controller');
const Offer = require('../models/offer.model');

const generateCoverLetter = require('../services/ollamaService').generateCoverLetter;


router.post('/extract-offer-pdf', upload.single('file'), offerController.extractOfferFromPDF);
router.post('/extract-offer-img', upload.single('file'), offerController.extractOfferFromImage);


// POST /api/offers
router.post('/add-offer', async (req, res) => {
  try {
    const offer = new Offer(req.body); // Accepts dynamic fields
    const savedOffer = await offer.save();
    res.status(201).json(savedOffer);
  } catch (err) {
    console.error('Error saving offer:', err);
    res.status(500).json({ error: 'Failed to save offer' });
  }
});


router.get('/get-all-offers', async (req, res) => {
  try {
    const offers = await Offer.find(); // fetch all documents
    res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Failed to retrieve offers' });
  }
});


router.get('/get-offers-by-userEmail', async (req, res) => {
  try {
    const { userEmail } = req.query;

    if (!userEmail) {
      return res.status(400).json({ error: 'Missing userEmail query parameter' });
    }

    // You can still include other optional filters here if needed
    const offers = await Offer.find({ userEmail });

    res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching offers by userEmail:', error);
    res.status(500).json({ error: 'Failed to fetch offers' });
  }
});



router.delete('/delete-offer/:id', async (req, res) => {
  const offerId = req.params.id;

  try {
    const deletedOffer = await Offer.findByIdAndDelete(offerId);

    if (!deletedOffer) {
      return res.status(404).json({ error: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer deleted successfully', deletedOffer });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Failed to delete offer' });
  }
});


router.post('/generate-cover-letter', async (req, res) => {
  const { resume, offer } = req.body;
  if (!resume || !offer) {
    return res.status(400).json({ error: 'Missing resume or offer in request body' });
  }

  try {
    const coverLetter = await generateCoverLetter(resume, offer);
    if (!coverLetter) {
      return res.status(500).json({ error: 'Failed to generate cover letter' });
    }
    res.status(200).json({ coverLetter });
  } catch (err) {
    console.error('Error generating cover letter:', err);
    res.status(500).json({ error: 'Server error' });
  }
});




module.exports = router;