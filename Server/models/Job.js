const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  description: String,
  skills: [String],
  postedDate: Date,
  source: String // e.g., 'LinkedIn'
});

module.exports = mongoose.model('Job', JobSchema);
