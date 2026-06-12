const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const bcrypt = require('bcrypt');

const profileRouter = express.Router()

profileRouter.get('/getUserInfo', auth, async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select('-password')

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json(user)
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
})

profileRouter.patch('/updateProfile', auth, async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName',
      'lastName',
      'age',
      'gender',
      'phoneNumber'
    ];

    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((field) => allowedUpdates.includes(field));
    if (!isValidOperation) {
      return res.status(400).json({
        message: 'Invalid update fields'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    updates.forEach((field) => {
      user[field] = req.body[field];
    });

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
})

profileRouter.patch('/changePassword', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Please provide current and new password'
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
})

module.exports = profileRouter