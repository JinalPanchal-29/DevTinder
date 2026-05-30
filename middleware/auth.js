const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({
                message: 'Please Login'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = decoded;
        next();
    }catch(error) {
        return res.status(400).json({
            message: 'Invalid Token'
        })
    }
}

module.exports = auth