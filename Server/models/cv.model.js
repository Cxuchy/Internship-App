const mongoose = require('mongoose');

const CvSchema = new mongoose.Schema({
}, { strict: false }); // 👈 allow dynamic fields

module.exports = mongoose.model('Resume', CvSchema);