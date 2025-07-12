const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });
        console.log("user", user)

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

// const auth = async (req, res, next) => {
//     try {
//         // Check both headers and cookies for token
//         let token = req.header('Authorization')?.replace('Bearer ', '');

//         if (!token && req.cookies?.token) {
//             token = req.cookies.token;
//         }

//         if (!token) {
//             throw new Error('Authentication required');
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

//         if (!user) {
//             throw new Error('Authentication invalid');
//         }

//         req.token = token;
//         req.user = user;
//         next();
//     } catch (error) {
//         res.status(401).json({
//             error: 'Please authenticate',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

const isCollaborator = (req, res, next) => {
    if (req.user.role !== 'collaborator') {
        return res.status(403).send({ error: 'Access denied. Collaborators only.' });
    }
    next();
};

const isViewer = (req, res, next) => {
    if (req.user.role !== 'viewer') {
        return res.status(403).send({ error: 'Access denied. Viewers only.' });
    }
    next();
};

module.exports = { auth, isCollaborator, isViewer };