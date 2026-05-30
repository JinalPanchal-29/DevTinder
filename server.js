const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();
const connectDB = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.post('/signup', async (req, res) => {
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

app.post('/login', async (req, res) => {
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

app.post('/getUserInfo', auth, async (req, res) => {
    const user = await User.findById(
        req.user.userId
    ).select('-password')
    
    res.status(200).json(user)
})

connectDB().then(() => {
    console.log("Databse connected successfully!")
    app.listen(process.env.PORT, () => {
        console.log(`Server running on ${process.env.PORT}`)
    })
}).catch(() => {
    console.log("Dabase connection failed!!")
})
