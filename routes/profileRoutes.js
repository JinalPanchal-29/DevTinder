const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')

const profileRouter = express.Router()

profileRouter.post('/getUserInfo', auth, async (req, res) => {
    const user = await User.findById(
        req.user.userId
    ).select('-password')
    
    res.status(200).json(user)
})

module.exports = profileRouter