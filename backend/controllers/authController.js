const User = require('../models/User');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { username, email, password, role, gradeLevel, stream } = req.body;

        // Validate viewer-specific fields
        if (role === 'viewer' && (!gradeLevel || !stream)) {
            return res.status(400).json({ error: 'Grade level and stream are required for viewers' });
        }

        // Remove viewer-specific fields for collaborators
        const userData = role === 'collaborator'
            ? { username, email, password, role }
            : { username, email, password, role, gradeLevel, stream };

        const user = new User(userData);
        await user.save();

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('Invalid login credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid login credentials');
        }

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    res.json(req.user);
};

module.exports = { register, login, getProfile };