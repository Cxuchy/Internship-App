const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const jobLogSchema = new mongoose.Schema({
  title: String,
  JobsFound: Number,
  nextCheck: Date,
  checkedAt: Date
});


const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
    firstName: String,
    lastName: String,
    DatOfBirth: Date,
    profilePicture: String,
    createdAt: { type: Date, default: Date.now },

    // FOR SCHEDULING
    keyword: String,
    schedule: String, // e.g. "0 * * * *"
    jobLogs: [jobLogSchema]
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
