const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.post('/signup', authCtrl.signup);
router.post('/signin', authCtrl.signin);

module.exports = router;
