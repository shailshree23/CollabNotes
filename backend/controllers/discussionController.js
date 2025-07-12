// // const Discussion = require('../models/Discussion');
// // const Note = require('../models/Note');

// // const createDiscussion = async (req, res) => {
// //     try {
// //         const { question } = req.body;
// //         const note = await Note.findById(req.params.noteId);

// //         if (!note) {
// //             return res.status(404).json({ error: 'Note not found' });
// //         }

// //         const discussion = new Discussion({
// //             note: note._id,
// //             user: req.user._id,
// //             question,
// //         });

// //         await discussion.save();
// //         res.status(201).json(discussion);
// //     } catch (error) {
// //         res.status(400).json({ error: error.message });
// //     }
// // };

// // const getNoteDiscussions = async (req, res) => {
// //     try {
// //         const discussions = await Discussion.find({ note: req.params.noteId })
// //             .populate('user', 'username')
// //             .populate('answers.user', 'username')
// //             .sort({ createdAt: -1 });

// //         res.json(discussions);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // const addAnswer = async (req, res) => {
// //     try {
// //         const { text } = req.body;
// //         const discussion = await Discussion.findById(req.params.discussionId);

// //         if (!discussion) {
// //             return res.status(404).json({ error: 'Discussion not found' });
// //         }

// //         discussion.answers.push({
// //             user: req.user._id,
// //             text,
// //         });

// //         await discussion.save();
// //         res.json(discussion);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // const markAsResolved = async (req, res) => {
// //     try {
// //         const discussion = await Discussion.findById(req.params.discussionId);

// //         if (!discussion) {
// //             return res.status(404).json({ error: 'Discussion not found' });
// //         }

// //         // Check if the user is the one who asked the question or the note uploader
// //         const note = await Note.findById(discussion.note);
// //         if (discussion.user.toString() !== req.user._id.toString() &&
// //             note.uploadedBy.toString() !== req.user._id.toString()) {
// //             return res.status(403).json({ error: 'Not authorized' });
// //         }

// //         discussion.resolved = true;
// //         await discussion.save();

// //         res.json(discussion);
// //     } catch (error) {
// //         res.status(500).json({ error: error.message });
// //     }
// // };

// // module.exports = {
// //     createDiscussion,
// //     getNoteDiscussions,
// //     addAnswer,
// //     markAsResolved,
// // };


// const Discussion = require('../models/Discussion');
// const Note = require('../models/Note');
// const User = require('../models/User');

// // Get all discussions
// const getAllDiscussions = async (req, res) => {
//     try {
//         const discussions = await Discussion.find()
//             .populate('user', 'username')
//             .populate('answers.user', 'username')
//             .sort({ createdAt: -1 });

//         res.json(discussions);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to fetch discussions',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Create new discussion
// const createDiscussion = async (req, res) => {
//     try {
//         const { question, noteId } = req.body;

//         if (!question) {
//             return res.status(400).json({ error: 'Question is required' });
//         }

//         const discussion = new Discussion({
//             question,
//             user: req.user._id,
//             ...(noteId && { note: noteId })
//         });

//         await discussion.save();

//         // Populate user data before returning
//         const populatedDiscussion = await Discussion.populate(discussion, {
//             path: 'user',
//             select: 'username'
//         });

//         res.status(201).json(populatedDiscussion);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to create discussion',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Add answer to discussion
// const addAnswer = async (req, res) => {
//     try {
//         const { text } = req.body;
//         const { id } = req.params;

//         if (!text) {
//             return res.status(400).json({ error: 'Answer text is required' });
//         }

//         const discussion = await Discussion.findById(id);
//         if (!discussion) {
//             return res.status(404).json({ error: 'Discussion not found' });
//         }

//         discussion.answers.push({
//             text,
//             user: req.user._id
//         });

//         await discussion.save();

//         // Populate answer user data
//         const populatedDiscussion = await Discussion.populate(discussion, {
//             path: 'answers.user',
//             select: 'username'
//         });

//         res.json(populatedDiscussion);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to add answer',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Get discussions for specific note
// const getNoteDiscussions = async (req, res) => {
//     try {
//         const { noteId } = req.params;

//         const discussions = await Discussion.find({ note: noteId })
//             .populate('user', 'username')
//             .populate('answers.user', 'username')
//             .sort({ createdAt: -1 });

//         res.json(discussions);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to fetch note discussions',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// // Mark discussion as resolved (for collaborators)
// const markAsResolved = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const discussion = await Discussion.findById(id);
//         if (!discussion) {
//             return res.status(404).json({ error: 'Discussion not found' });
//         }

//         // Verify user is note owner or discussion creator
//         if (discussion.note) {
//             const note = await Note.findById(discussion.note);
//             if (note.uploadedBy.toString() !== req.user._id.toString()) {
//                 return res.status(403).json({ error: 'Not authorized' });
//             }
//         }

//         discussion.resolved = true;
//         await discussion.save();

//         res.json(discussion);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to mark as resolved',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// module.exports = {
//     getAllDiscussions,
//     createDiscussion,
//     addAnswer,
//     getNoteDiscussions,
//     markAsResolved
// };

const Discussion = require('../models/Discussion');
const Note = require('../models/Note');
const User = require('../models/User');

// const getNoteDiscussions = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.id);
//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         const discussions = await Discussion.find({ note: req.params.id })
//             .populate('user', 'username role')
//             .populate('answers.user', 'username role')
//             .sort({ createdAt: -1 });

//         res.json({
//             note: {
//                 _id: note._id,
//                 title: note.title,
//                 subject: note.subject,
//                 description: note.description,
//                 averageRating: note.averageRating,
//                 downloads: note.downloads,
//                 views: note.views
//             },
//             discussions
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to fetch discussions',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// discussionController.js
// Get discussions (general or note-specific)
const getDiscussions = async (req, res) => {
    try {
        const { noteId, general } = req.query;
        let query = {};

        if (noteId) {
            query.note = noteId;
        } else if (general === 'true') {
            query.note = { $exists: false };
        }

        const discussions = await Discussion.find(query)
            .populate('user', 'username role')
            .populate('note', 'title subject')
            .populate('answers.user', 'username role')
            .sort({ createdAt: -1 });

        res.json(discussions);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch discussions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// const getDiscussions = async (req, res) => {
//     try {
//         const { noteId } = req.query;
//         const query = noteId ? { note: noteId } : {};

//         const discussions = await Discussion.find(query)
//             .populate('user', 'username role')
//             .populate('note', 'title subject')
//             .populate('answers.user', 'username role')
//             .sort({ createdAt: -1 });

//         res.json(discussions);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to fetch discussions',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// Get discussions for a specific note with note details
const getNoteDiscussions = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId); // Changed from req.params.id
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (req.user.role === 'collaborator' && !note.uploadedBy.equals(req.user._id)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        // Optional: viewer restrictions
        if (req.user.role === 'viewer') {
            if (note.gradeLevel !== req.user.gradeLevel || note.stream !== req.user.stream) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const discussions = await Discussion.find({ note: req.params.noteId })
            .populate('user', 'username role')
            .populate('answers.user', 'username role')
            .sort({ createdAt: -1 });

        res.json({
            note: {
                _id: note._id,
                title: note.title,
                subject: note.subject,
                description: note.description,
                fileUrl: note.fileUrl,
                averageRating: note.averageRating,
                downloads: note.downloads,
                views: note.views
            },
            discussions
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch discussions',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// const getNoteDiscussions = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.id);
//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         const discussions = await Discussion.find({ note: req.params.id })
//             .populate('user', 'username role')
//             .populate('answers.user', 'username role')
//             .sort({ createdAt: -1 });

//         res.json({
//             note: {
//                 _id: note._id,
//                 title: note.title,
//                 subject: note.subject,
//                 description: note.description,
//                 fileUrl: note.fileUrl,
//                 averageRating: note.averageRating,
//                 downloads: note.downloads,
//                 views: note.views
//             },
//             discussions
//         });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to fetch discussions',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// Create new discussion
const createDiscussion = async (req, res) => {
    try {
        const { question, noteId } = req.body;

        // Validation
        if (!question) {
            return res.status(400).json({ error: 'Question is required' });
        }

        // Verify note exists if noteId is provided
        if (noteId) {
            const note = await Note.findById(noteId);
            if (!note) {
                return res.status(404).json({ error: 'Note not found' });
            }
        }

        const discussion = new Discussion({
            question,
            user: req.user._id,
            ...(noteId && { note: noteId }),
            userRole: req.user.role // Track the role of the user who created the discussion
        });

        await discussion.save();

        // Populate user and note data before returning
        const populatedDiscussion = await Discussion.populate(discussion, [
            { path: 'user', select: 'username role' },
            { path: 'note', select: 'title subject' }
        ]);

        res.status(201).json(populatedDiscussion);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create discussion',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add answer to discussion
const addAnswer = async (req, res) => {
    try {
        const { text } = req.body;
        const { id } = req.params;

        if (!text) {
            return res.status(400).json({ error: 'Answer text is required' });
        }

        const discussion = await Discussion.findById(id);
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        // Check if the discussion is resolved
        if (discussion.resolved) {
            return res.status(400).json({ error: 'This discussion is already marked as resolved' });
        }

        discussion.answers.push({
            text,
            user: req.user._id,
            userRole: req.user.role // Track the role of the user who answered
        });

        await discussion.save();

        // Populate answer user data
        const populatedDiscussion = await Discussion.populate(discussion, {
            path: 'answers.user',
            select: 'username role'
        });

        res.json(populatedDiscussion);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to add answer',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mark discussion as resolved (for collaborators)
const markAsResolved = async (req, res) => {
    try {
        const { id } = req.params;

        const discussion = await Discussion.findById(id);
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        // Verify user is note owner or admin
        if (discussion.note) {
            const note = await Note.findById(discussion.note);
            if (note.uploadedBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to resolve this discussion' });
            }
        } else {
            // For general discussions, only admins can mark as resolved
            if (req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        discussion.resolved = true;
        await discussion.save();

        res.json(discussion);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to mark as resolved',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


module.exports = {
    getDiscussions,
    createDiscussion,
    addAnswer,
    markAsResolved,
    getNoteDiscussions
};