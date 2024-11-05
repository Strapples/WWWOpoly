const User = require('../models/user');

exports.registerUser = async (req, res) => {
    try {
        const user = new User({ username: req.body.username });
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error registering user' });
    }
};