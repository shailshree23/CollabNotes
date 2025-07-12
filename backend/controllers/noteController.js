// const Note = require('../models/Note');
// const User = require('../models/User');
// const fs = require('fs');
// const path = require('path');


// // const uploadNote = async (req, res) => {
// //     try {
// //         if (!req.file) {
// //             return res.status(400).json({ error: 'No file uploaded' });
// //         }

// //         // Validate required fields
// //         const requiredFields = ['title', 'subject', 'category', 'gradeLevel', 'stream'];
// //         for (const field of requiredFields) {
// //             if (!req.body[field]) {
// //                 // Clean up uploaded file if validation fails
// //                 if (req.file.path) {
// //                     fs.unlink(req.file.path, () => { });
// //                 }
// //                 return res.status(400).json({ error: `${field} is required` });
// //             }
// //         }

// //         const note = new Note({
// //             title: req.body.title,
// //             description: req.body.description || '',
// //             fileUrl: req.file.path,
// //             subject: req.body.subject,
// //             category: req.body.category,
// //             gradeLevel: req.body.gradeLevel,
// //             stream: req.body.stream,
// //             uploadedBy: req.user._id,
// //         });

// //         await note.save();

// //         // Return success response with file URL
// //         res.status(201).json({
// //             ...note.toObject(),
// //             fileUrl: `${req.protocol}://${req.get('host')}/uploads/${path.basename(req.file.path)}`
// //         });
// //     } catch (error) {
// //         // Clean up file if error occurs
// //         if (req.file?.path) {
// //             fs.unlink(req.file.path, () => { });
// //         }

// //         console.error('Upload error:', error);
// //         res.status(500).json({
// //             error: 'Failed to upload note',
// //             details: process.env.NODE_ENV === 'development' ? error.message : undefined
// //         });
// //     }
// // };

// const uploadNote = async (req, res) => {
//     try {

//         // Check if user is a collaborator
//         if (req.user.role !== 'collaborator') {
//             return res.status(403).json({ error: 'Only collaborators can upload notes' });
//         }


//         if (!req.file) {
//             return res.status(400).json({ error: 'No file uploaded' });
//         }

//         const { title, description, subject, category, gradeLevel, stream } = req.body;

//         const note = new Note({
//             title,
//             description,
//             fileUrl: req.file.path,
//             subject,
//             category,
//             gradeLevel,
//             stream,
//             uploadedBy: req.user._id,
//         });

//         await note.save();
//         res.status(201).json(note);
//     } catch (error) {
//         res.status(400).json({ error: error.message });
//     }
// };

// const getNotes = async (req, res) => {
//     try {
//         const { subject, category, gradeLevel, stream, sortBy } = req.query;
//         const query = {};

//         if (subject) query.subject = subject;
//         if (category) query.category = category;
//         if (gradeLevel) query.gradeLevel = gradeLevel;
//         if (stream) query.stream = stream;

//         let sortOption = {};
//         if (sortBy === 'rating') {
//             sortOption = { averageRating: -1 };
//         } else if (sortBy === 'downloads') {
//             sortOption = { downloads: -1 };
//         } else if (sortBy === 'views') {
//             sortOption = { views: -1 };
//         } else {
//             sortOption = { createdAt: -1 };
//         }

//         const notes = await Note.find(query)
//             .sort(sortOption)
//             .populate('uploadedBy', 'username');

//         res.json(notes);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const getNoteById = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.id)
//             .populate('uploadedBy', 'username')
//             .populate('ratings.user', 'username')
//             .populate('reviews.user', 'username');

//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Increment view count
//         note.views += 1;
//         await note.save();

//         res.json(note);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const downloadNote = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.id);

//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Increment download count
//         note.downloads += 1;
//         await note.save();

//         const filePath = path.join(__dirname, '..', note.fileUrl);
//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ error: 'File not found' });
//         }

//         res.download(filePath);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const rateNote = async (req, res) => {
//     try {
//         const { rating } = req.body;
//         const note = await Note.findById(req.params.id);

//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Check if user already rated
//         const existingRatingIndex = note.ratings.findIndex(
//             r => r.user.toString() === req.user._id.toString()
//         );

//         if (existingRatingIndex !== -1) {
//             note.ratings[existingRatingIndex].rating = rating;
//         } else {
//             note.ratings.push({ user: req.user._id, rating });
//         }

//         await note.save();
//         res.json(note);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const addReview = async (req, res) => {
//     try {
//         const { text } = req.body;
//         const note = await Note.findById(req.params.id);

//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         note.reviews.push({ user: req.user._id, text });
//         await note.save();

//         res.json(note);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const getUserNotes = async (req, res) => {
//     try {
//         const notes = await Note.find({ uploadedBy: req.user._id })
//             .sort({ createdAt: -1 });

//         res.json(notes);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// const getStats = async (req, res) => {
//     try {
//         const notes = await Note.find({ uploadedBy: req.user._id });

//         const totalNotes = notes.length;
//         const totalDownloads = notes.reduce((sum, note) => sum + note.downloads, 0);
//         const averageRating = notes.length > 0
//             ? notes.reduce((sum, note) => sum + note.averageRating, 0) / notes.length
//             : 0;

//         res.json({ totalNotes, totalDownloads, averageRating });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = {
//     uploadNote,
//     getNotes,
//     getNoteById,
//     downloadNote,
//     rateNote,
//     addReview,
//     getUserNotes,
//     getStats
// };

const path = require('path');
const fs = require('fs');
const Note = require('../models/Note');

// Helper function to calculate average rating
const calculateAverageRating = (ratings) => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
    return sum / ratings.length;
};

const uploadNote = async (req, res) => {
    try {
        // Check if user is a collaborator
        if (req.user.role !== 'collaborator') {
            return res.status(403).json({ error: 'Only collaborators can upload notes' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description, subject, category, gradeLevel, stream } = req.body;

        const note = new Note({
            title,
            description,
            fileUrl: req.file.filename,
            originalFileName: req.file.originalname, // Store origina
            subject,
            category,
            gradeLevel,
            stream,
            uploadedBy: req.user._id,
        });

        await note.save();

        // Populate uploadedBy before returning
        const populatedNote = await Note.populate(note, {
            path: 'uploadedBy',
            select: 'username'
        });

        res.status(201).json(populatedNote);
    } catch (error) {
        res.status(400).json({
            error: 'Failed to upload note',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getNotes = async (req, res) => {
    try {
        const { subject, category, gradeLevel, stream, sortBy, search } = req.query;
        const query = {};

        if (subject) query.subject = new RegExp(subject, 'i');
        if (category) query.category = new RegExp(category, 'i');
        if (gradeLevel) query.gradeLevel = gradeLevel;
        if (stream) query.stream = stream;
        if (search) {
            query.$or = [
                { title: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') },
                { subject: new RegExp(search, 'i') }
            ];
        }

        let sortOption = { createdAt: -1 }; // Default sort
        if (sortBy === 'rating') {
            sortOption = { averageRating: -1 };
        } else if (sortBy === 'downloads') {
            sortOption = { downloads: -1 };
        } else if (sortBy === 'views') {
            sortOption = { views: -1 };
        }

        const notes = await Note.find(query)
            .sort(sortOption)
            .populate('uploadedBy', 'username');

        res.json(notes);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch notes',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id)
            .populate('uploadedBy', 'username')
            .populate('ratings.user', 'username')
            .populate('reviews.user', 'username');

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

        // Increment view count
        note.views += 1;
        await note.save();

        res.json(note);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch note',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// controllers/noteController.js
// const getNoteById = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.noteId)
//             .populate('uploadedBy', 'username')
//             .populate('ratings.user', 'username')
//             .populate('reviews.user', 'username');

//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Check access based on role
//         if (req.user.role === 'collaborator' && !note.uploadedBy.equals(req.user._id)) {
//             return res.status(403).json({ error: 'Access denied' });
//         }

//         // Viewers can access any note that matches their grade/stream
//         if (req.user.role === 'viewer') {
//             if (note.gradeLevel !== req.user.gradeLevel || note.stream !== req.user.stream) {
//                 return res.status(403).json({ error: 'Access denied' });
//             }
//         }

//         res.json(note);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };


// const downloadNote = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.id);

//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Increment download count
//         note.downloads += 1;
//         await note.save();

//         const filePath = path.join(__dirname, '..', note.fileUrl);
//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ error: 'File not found' });
//         }

//         res.download(filePath);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to download note',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// const downloadNote = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.noteId);
//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Construct full path from filename
//         const filePath = path.join(__dirname, '../uploads', note.fileUrl);
//         console.log(filePath);

//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ error: 'File not found' });
//         }

//         // Increment download count
//         note.downloads += 1;
//         await note.save();

//         // Set proper headers
//         res.setHeader('Content-Type', 'application/pdf');
//         res.setHeader('Content-Disposition', `attachment; filename=${note.title}.pdf`);

//         // Stream the file
//         const fileStream = fs.createReadStream(filePath);
//         fileStream.pipe(res);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to download note',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

const downloadNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Get the uploads directory path (more reliable than relative paths)
        const uploadsDir = path.join(process.cwd(), 'uploads');
        // const filePath = path.join(uploadsDir, note.fileUrl);
        const filePath = path.join(__dirname, '../uploads', note.fileUrl);
        console.log(filePath);

        console.log('Attempting to download from:', filePath);

        console.log('Current working directory:', process.cwd());
        console.log('Uploads directory path:', uploadsDir);
        console.log('Full file path:', filePath);
        console.log('File URL from DB:', note.fileUrl);

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('File not found at:', filePath, uploadsDir);
            return res.status(404).json({
                error: 'File not found',
                details: `The requested file ${note.fileUrl} doesn't exist in the server's uploads directory`
            });
        }

        // Get the actual file extension
        const fileExt = path.extname(note.fileUrl).toLowerCase(); // .txt, .pdf, etc
        const fileName = `${note.title}${fileExt}`;
        console.log('File Extension:', fileExt);
        console.log('File Name:', fileName);


        // Increment download count
        note.downloads += 1;
        await note.save();

        const contentType = {
            '.pdf': 'application/pdf',
            '.txt': 'text/plain',
            '.doc': 'application/msword',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }[fileExt] || 'application/octet-stream';

        // Set proper headers
        res.setHeader('Content-Type', contentType);;
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Length', fs.statSync(filePath).size);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(note.title)}.pdf"`);

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        fileStream.on('error', (err) => {
            console.error('File stream error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error streaming file' });
            }
        });

        fileStream.pipe(res);
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            error: 'Failed to download note',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// const downloadNote = async (req, res) => { file-1747477971414-104710150
//     try {
//         const note = await Note.findById(req.params.id);
//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Construct full path from filename
//         const filePath = path.join(__dirname, '../uploads', note.fileUrl);

//         if (!fs.existsSync(filePath)) {
//             return res.status(404).json({ error: 'File not found' });
//         }

//         // Increment download count
//         note.downloads += 1;
//         await note.save();

//         res.download(filePath);
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to download note',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

const getNoteDiscussions = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId); // Changed from req.params.id
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
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

const rateNote = async (req, res) => {
    try {
        const { rating } = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        // Check if user already rated
        const existingRatingIndex = note.ratings.findIndex(
            r => r.user.toString() === req.user._id.toString()
        );

        if (existingRatingIndex !== -1) {
            note.ratings[existingRatingIndex].rating = rating;
        } else {
            note.ratings.push({ user: req.user._id, rating });
        }

        // Update average rating
        note.averageRating = calculateAverageRating(note.ratings);
        await note.save();

        res.json(note);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to rate note',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const addReview = async (req, res) => {
    try {
        const { text } = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (!text || text.trim().length < 10) {
            return res.status(400).json({ error: 'Review must be at least 10 characters' });
        }

        note.reviews.push({ user: req.user._id, text });
        await note.save();

        // Populate the new review's user data
        const populatedNote = await Note.populate(note, {
            path: 'reviews.user',
            match: { _id: req.user._id },
            select: 'username'
        });

        res.json(populatedNote);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to add review',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getUserNotes = async (req, res) => {
    try {
        const notes = await Note.find({ uploadedBy: req.user._id })
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'username');

        res.json(notes);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch user notes',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getStats = async (req, res) => {
    try {
        const notes = await Note.find({ uploadedBy: req.user._id });

        const totalNotes = notes.length;
        const totalDownloads = notes.reduce((sum, note) => sum + note.downloads, 0);
        const totalViews = notes.reduce((sum, note) => sum + note.views, 0);
        const averageRating = calculateAverageRating(
            notes.flatMap(note => note.ratings)
        );

        res.json({
            totalNotes,
            totalDownloads,
            totalViews,
            averageRating: parseFloat(averageRating.toFixed(2))
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch stats',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, subject, category, gradeLevel, stream } = req.body;

        const note = await Note.findById(id);
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        // Check if user is the uploader
        if (note.uploadedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this note' });
        }

        // Update fields
        note.title = title || note.title;
        note.description = description || note.description;
        note.subject = subject || note.subject;
        note.category = category || note.category;
        note.gradeLevel = gradeLevel || note.gradeLevel;
        note.stream = stream || note.stream;

        // Handle file update if new file was uploaded
        if (req.file) {
            // Delete old file
            if (note.fileUrl) {
                fs.unlink(path.join(__dirname, '..', note.fileUrl), (err) => {
                    if (err) console.error('Error deleting old file:', err);
                });
            }
            note.fileUrl = req.file.path;
        }

        await note.save();
        res.json(note);
    } catch (error) {
        res.status(400).json({
            error: 'Failed to update note',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.noteId);

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        if (!note.uploadedBy.equals(req.user._id)) {
            return res.status(403).json({ error: 'Unauthorized to delete this note' });
        }

        await note.deleteOne();
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Server error while deleting note' });
    }
};

// const deleteNote = async (req, res) => {
//     try {
//         const note = await Note.findById(req.params.id);
//         if (!note) {
//             return res.status(404).json({ error: 'Note not found' });
//         }

//         // Check if user is the uploader
//         if (note.uploadedBy.toString() !== req.user._id.toString()) {
//             return res.status(403).json({ error: 'Not authorized to delete this note' });
//         }

//         // Delete associated file
//         if (note.fileUrl) {
//             fs.unlink(path.join(__dirname, '..', note.fileUrl), (err) => {
//                 if (err) console.error('Error deleting file:', err);
//             });
//         }

//         // Delete note
//         await note.remove();

//         // Delete associated discussions
//         await Discussion.deleteMany({ note: note._id });

//         res.json({ message: 'Note deleted successfully' });
//     } catch (error) {
//         res.status(500).json({
//             error: 'Failed to delete note',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

const getFile = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) {
            return res.status(400).json({ error: 'File URL is required' });
        }

        const filePath = path.join(__dirname, '..', url);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to fetch file',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    uploadNote,
    getNotes,
    getNoteById,
    downloadNote,
    rateNote,
    addReview,
    getUserNotes,
    getStats,
    updateNote,
    deleteNote,
    getFile,
    getNoteDiscussions
};