const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionRequestSchema = new Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['interested', 'ignored', 'accepted', 'rejected'],
            message: '{VALUE} is not supported'
        },
        required: true
    }
}, {
    timestamps: true
})

connectionRequestSchema.pre('save', async function (next) {
    const connectionRequest = this;
    const existingRequest = await mongoose.model('connectionRequest').findOne({
        $or: [
            { fromUserId: connectionRequest.fromUserId, toUserId: connectionRequest.toUserId },
            { fromUserId: connectionRequest.toUserId, toUserId: connectionRequest.fromUserId }
        ]
    })

    if (existingRequest) {
        throw new Error('Connection request already exists!')
    }

    next();
})



const ConnectionRequest = mongoose.model(
    'ConnectionRequest',
    connectionRequestSchema
);

module.exports = ConnectionRequest;
