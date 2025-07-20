
const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const cvController = require('../controllers/cv.controller');

router.post('/extract-data-resume', upload.single('file'), cvController.extractDataFromCv);






module.exports = router;