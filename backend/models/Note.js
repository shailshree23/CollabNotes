// const mongoose = require('mongoose');

// const noteSchema = new mongoose.Schema({
//     title: {
//         type: String,
//         required: true,
//         trim: true,
//     },
//     description: {
//         type: String,
//         trim: true,
//     },
//     fileUrl: {
//         type: String,
//         required: true,
//     },
//     subject: {
//         type: String,
//         required: true,
//     },
//     category: {
//         type: String,
//         required: true,
//     },
//     gradeLevel: {
//         type: String,
//         required: true,
//     },
//     stream: {
//         type: String,
//         enum: ['Engineering', 'Medical', 'Arts'],
//         required: true,
//     },
//     uploadedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     ratings: [{
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//         },
//         rating: {
//             type: Number,
//             min: 1,
//             max: 5,
//         },
//     }],
//     averageRating: {
//         type: Number,
//         default: 0,
//         min: 0,
//         max: 5,
//     },
//     reviews: [{
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'User',
//         },
//         text: {
//             type: String,
//             required: true,
//         },
//         createdAt: {
//             type: Date,
//             default: Date.now,
//         },
//     }],
//     downloads: {
//         type: Number,
//         default: 0,
//     },
//     views: {
//         type: Number,
//         default: 0,
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now,
//     },
// });

// // Calculate average rating before saving
// noteSchema.pre('save', function (next) {
//     if (this.ratings.length > 0) {
//         const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
//         this.averageRating = sum / this.ratings.length;
//     } else {
//         this.averageRating = 0;
//     }
//     next();
// });

// module.exports = mongoose.model('Note', noteSchema);

// const mongoose = require('mongoose');

// const ratingSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     rating: { type: Number, min: 1, max: 5, required: true }
// }, { _id: false });

// const reviewSchema = new mongoose.Schema({
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     text: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// }, { _id: false });

// const noteSchema = new mongoose.Schema({
//     title: { type: String, required: true, trim: true },
//     description: { type: String, trim: true },
//     fileUrl: { type: String, required: true },
//     subject: { type: String, required: true },
//     category: { type: String, required: true },
//     gradeLevel: { type: String, required: true },
//     stream: { type: String, enum: ['Engineering', 'Medical', 'Arts'], required: true },
//     uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     ratings: [ratingSchema],
//     averageRating: { type: Number, default: 0, min: 0, max: 5 },
//     reviews: [reviewSchema],
//     downloads: { type: Number, default: 0 },
//     views: { type: Number, default: 0 }
// }, { timestamps: true });

// // Auto-calculate average rating before saving
// noteSchema.pre('save', function (next) {
//     if (this.ratings.length > 0) {
//         const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
//         this.averageRating = sum / this.ratings.length;
//     } else {
//         this.averageRating = 0;
//     }
//     next();
// });

// module.exports = mongoose.model('Note', noteSchema);

const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true }
}, { _id: false });

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const discussionRefSchema = new mongoose.Schema({
    discussionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion', required: true },
    question: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    answerCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { _id: false });

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    originalFileName: { type: String, required: true },
    subject: { type: String, required: true },
    category: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    stream: { type: String, enum: ['Engineering', 'Medical', 'Arts'], required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: [ratingSchema],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviews: [reviewSchema],
    discussions: [discussionRefSchema],  // Added reference to discussions
    downloads: { type: Number, default: 0 },
    views: { type: Number, default: 0 }
}, { timestamps: true });

// Auto-calculate average rating before saving
noteSchema.pre('save', function (next) {
    if (this.ratings.length > 0) {
        const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
        this.averageRating = sum / this.ratings.length;
    } else {
        this.averageRating = 0;
    }
    next();
});

// Update discussion references when a discussion is added
noteSchema.methods.addDiscussionRef = function (discussion) {
    this.discussions.push({
        discussionId: discussion._id,
        question: discussion.question,
        resolved: discussion.resolved,
        answerCount: discussion.answers.length
    });
    return this.save();
};

// Update discussion references when a discussion is updated
noteSchema.methods.updateDiscussionRef = function (discussion) {
    const index = this.discussions.findIndex(d => d.discussionId.equals(discussion._id));
    if (index !== -1) {
        this.discussions[index].resolved = discussion.resolved;
        this.discussions[index].answerCount = discussion.answers.length;
    }
    return this.save();
};

module.exports = mongoose.model('Note', noteSchema);