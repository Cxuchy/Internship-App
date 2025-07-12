const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  duration: String,
  startDate: String,
  responsibilities: [String],
  profile: [String],
  requiredDocuments: [String],
  notes: String,
  website: String,
  contactEmail: String
}, { strict: false }); // 👈 allow dynamic fields

module.exports = mongoose.model('Offer', OfferSchema);