

const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  phone: {
    type: String,
  },
  countryCode: {
    type: String,
  },
  avatar: {
    type: String,
  },
  address: {
    type: Array,
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', ProfileSchema);
