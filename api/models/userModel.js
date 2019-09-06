const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  hash: {
    type: String,
    required: true,
    select: false,
  },
  salt: {
    type: String,
    required: true,
    select: false,
  },
  emailVerified: {
    type: Boolean,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  role: {
    type: Array,
  },
  accountActive: {
    type: Boolean,
  },
}, { timestamps: true });

UserSchema.methods.comparePassword = function comparePassword(hash) {
  return hash === this.hash;
};

module.exports = mongoose.model('User', UserSchema);
