const mongoose = require('mongoose')
const { Schema } = mongoose;
const validator = require('validator')

const userSchema = new Schema({
    firstName: String,
    lastName: String,
    userName: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: {
            values: ['Male', 'Female', 'Others'],
            message: '{VALUE} is not supported'
        }

    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: function (value) {
                return validator.isStrongPassword(value, {
                    minLength: 6,
                    minUppercase: 1,
                    minLowercase: 1,
                    minSymbols: 1,
                    minNumbers: 1
                })
            },
            message: "Password must contain uppercase, lowercase, number and symbol!"
        }
    },
    age: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: validator.isEmail,
            message: "Please provide valid email"
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (value) {
                return validator.isMobilePhone(value, 'en-IN')
            },
            message: "Invalid Phone Number"
        }
    }
}, {
    timestamps: true
})

userSchema.methods.getJWT = async function() {
    const user = this

    const token = await jwt.sign({
        userId: user._id,
        email: user.email
    }, process.env.JWT_SECRET, { expiresIn: '1d' })

    return token;
}

userSchema.methods.validatePassword = async function(passwordEnteredByUser) {
    const user = this
    const hashedPassword = this.password

    const isPasswordValid = await bcrypt.compare(
        passwordEnteredByUser,
        hashedPassword
    )

    return isPasswordValid;
}

const User = mongoose.model('User', userSchema)
module.exports = User