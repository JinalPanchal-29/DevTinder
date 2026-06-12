const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const authRouter = express.Router()

authRouter.post('/signup', async (req, res) => {
    try {
        const { email, userName, phoneNumber, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const existingUser = await User.findOne({
            $or: [
                { email },
                { userName },
                { phoneNumber }
            ]
        })

        if (existingUser) {

            if (existingUser.email === email) {
                return res.status(400).json({
                    message: 'Email already exists'
                })
            }

            if (existingUser.userName === userName) {
                return res.status(400).json({
                    message: 'Username already exists'
                })
            }

            if (existingUser.phoneNumber === phoneNumber) {
                return res.status(400).json({
                    message: 'Phone number already exists'
                })
            }
        }
        const user = new User({ ...req.body, password: hashedPassword })
        await user.save()
        res.status(201).json({
            message: "User created successfully!"
        })
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})

authRouter.post('/login', async (req, res) => {
    try {
        let user;
        const { userName, email, password } = req.body
        if (userName) {
            user = await User.findOne({ userName })
        } else if (email) {
            user = await User.findOne({ email })
        } else {
            res.status(400).json({
                message: "Please provide Username or Email to login"
            })
        }

        if (!user) {
            res.status(400).json({ message: 'User does not exist! Please Sign Up!' })
        }

        if (!user.validatePassword(password)) {
            return res.status(400).json({
                message: 'Invalid Credetials!'
            })
        }

        const token = await user.getJWT()

        res.cookie('token', token, {
            httpOnly: true,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: 'Login successful'
        })

    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }

})

authRouter.post('/logout', (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now())
    })

    res.status(200).json({
        message: 'Successfully logged out!'
    })
})

module.exports = authRouter;