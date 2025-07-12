// const mongoose = require('mongoose');

// const discussionSchema = new mongoose.Schema({
//     note: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Note',
//         required: true,
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     question: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     answers: [{
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//         },
//         text: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now,
//         },
//     }],
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
//     resolved: {
//         type: Boolean,
//         default: false,
//     },
// });

// module.exports = mongoose.model('Discussion', discussionSchema);

// const mongoose = require('mongoose');

// const answerSchema = new mongoose.Schema({
//     text: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// }, { _id: true });

// const discussionSchema = new mongoose.Schema({
//     question: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     user: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     note: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Note'
//     },
//     answers: [answerSchema],
//     resolved: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// });

// // Add text index for search functionality
// discussionSchema.index({ question: 'text', 'answers.text': 'text' });

// const Discussion = mongoose.model('Discussion', discussionSchema);

// module.exports = Discussion;

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        enum: ['viewer', 'collaborator', 'admin'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const discussionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userRole: {
        type: String,
        enum: ['viewer', 'collaborator', 'admin'],
        required: true
    },
    note: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: false // Changed to optional
    },
    answers: [answerSchema],
    resolved: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add text index for search functionality
discussionSchema.index({ question: 'text', 'answers.text': 'text' });

// Update note's discussion references when a discussion is saved
discussionSchema.post('save', async function (doc) {
    if (doc.note) {
        const Note = mongoose.model('Note');
        const note = await Note.findById(doc.note);
        if (note) {
            const existingIndex = note.discussions.findIndex(d => d.discussionId.equals(doc._id));
            if (existingIndex === -1) {
                await note.addDiscussionRef(doc);
            } else {
                await note.updateDiscussionRef(doc);
            }
        }
    }
});

// discussionSchema.post('save', async function (doc) {
//     const Note = mongoose.model('Note');
//     const note = await Note.findById(doc.note);
//     if (note) {
//         const existingIndex = note.discussions.findIndex(d => d.discussionId.equals(doc._id));
//         if (existingIndex === -1) {
//             await note.addDiscussionRef(doc);
//         } else {
//             await note.updateDiscussionRef(doc);
//         }
//     }
// });

// Update note's discussion references when a discussion is updated
discussionSchema.post('findOneAndUpdate', async function (doc) {
    const Note = mongoose.model('Note');
    const note = await Note.findById(doc.note);
    if (note) {
        await note.updateDiscussionRef(doc);
    }
});

// Remove reference from note when discussion is deleted
discussionSchema.post('remove', async function (doc) {
    const Note = mongoose.model('Note');
    await Note.updateOne(
        { _id: doc.note },
        { $pull: { discussions: { discussionId: doc._id } } }
    );
});

const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;