const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: function() {
      // Password required only for email/password auth
      return this.provider === 'email';
    },
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in query results by default
  },
  provider: {
    type: String,
    required: true,
    enum: ['email', 'google', 'apple'],
    default: 'email'
  },
  socialId: {
    type: String,
    sparse: true // Only indexed if it exists
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  resetTokenHash: String,
  resetTokenExpires: Date,
  phone: { type: String },
  country: { type: String },
  language: { type: String },
  avatarUrl: { type: String },
  isPremium: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  preferences: {
    budget: { type: String },
    tripType: { type: String },
    currency: { type: String },
    distanceUnit: { type: String },
    interests: [{ type: String }],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add a method to validate the reset token
userSchema.methods.isValidResetToken = function (token) {
  return (
    this.resetTokenHash === crypto.createHash('sha256').update(token).digest('hex') &&
    this.resetTokenExpires > Date.now()
  );
};

const User = mongoose.model('User', userSchema);

module.exports = User;