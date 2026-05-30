const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config();
const connectDB = require('./config/database');
const cookieParser = require('cookie-parser')
const auth = require('./middleware/auth')

const app = express()

app.use(express.json())
app.use(cookieParser())

const authRouter = require('./routes/authRoutes')
const profileRouter = require('./routes/profileRoutes')

app.use('/', authRouter)
app.use('/', profileRouter)

connectDB().then(() => {
    console.log("Databse connected successfully!")
    app.listen(process.env.PORT, () => {
        console.log(`Server running on ${process.env.PORT}`)
    })
}).catch(() => {
    console.log("Dabase connection failed!!")
})
