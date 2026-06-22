const express = require('express');
const auth = require('../middleware/auth');
const userRouter = express.Router();
const ConnectionRequest = require('../models/ConnectionRequest')
const User = require('../models/User')

// Get all Pending connection requests for logged In user
userRouter.get('/user/requests/recieved', auth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: 'interested'
        }).populate('fromUserId', ['firstName', 'lastName', 'userName', 'age', 'gender', 'about', 'skills', 'imageUrl'])

        res.status(200).json({ message: 'Requests fetched successfully!!', data: connectionRequests })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
});

userRouter.get('/user/connections', auth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connections = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: 'accepted' },
                { fromUserId: loggedInUser._id, status: 'accepted' }
            ]
        }).populate('fromUserId', ['firstName', 'lastName', 'userName', 'age', 'gender', 'about', 'skills', 'imageUrl', 'phoneNumber'])
          .populate('toUserId', ['firstName', 'lastName', 'userName', 'age', 'gender', 'about', 'skills', 'imageUrl', 'phoneNumber']);

        const matchedUsers = connections.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId
            }
            return row.fromUserId
        })

        res.status(200).json({ data: matchedUsers })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

userRouter.get('/feed', auth, async (req, res) => {
    try {
        const loggedInUserId = req.user.userId || req.user._id;
        if (!loggedInUserId) {
            return res.status(401).json({ message: 'Invalid user credentials' });
        }

        const currentUserId = loggedInUserId.toString();
        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { fromUserId: currentUserId },
                { toUserId: currentUserId },
            ]
        }).select('fromUserId toUserId').lean();

        const hideUsers = new Set([currentUserId]);
        connectionRequests.forEach((row) => {
            hideUsers.add(row.fromUserId.toString());
            hideUsers.add(row.toUserId.toString());
        });

        const users = await User.find({
            _id: { $nin: Array.from(hideUsers) }
        }).select('firstName lastName userName age gender about skills imageUrl');

        res.status(200).json({ data: users });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = userRouter