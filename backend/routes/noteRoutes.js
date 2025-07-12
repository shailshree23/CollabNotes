const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const discussionController = require('../controllers/discussionController');
const { auth, isCollaborator, isViewer } = require('../middleware/auth');
const upload = require('../middleware/upload');

// router.get('/', noteController.getNotes);
// router.get('/:id', noteController.getNoteById);

// Note discussions route (accessible to both viewers and collaborators)
router.get('/:noteId/discussions', auth, noteController.getNoteDiscussions);
router.get('/file', noteController.getFile);

// Collaborator-only routes
router.post('/', auth, isCollaborator, upload.single('file'), noteController.uploadNote);
router.get('/my-notes', auth, isCollaborator, noteController.getUserNotes);
router.get('/stats', auth, isCollaborator, noteController.getStats);
router.put('/:noteId', auth, isCollaborator, upload.single('file'), noteController.updateNote);
router.delete('/:noteId', auth, isCollaborator, noteController.deleteNote);


// Viewer-only routes
router.get('/', auth, isViewer, noteController.getNotes);
router.get('/:id', auth, noteController.getNoteById);
router.get('/:noteId/download', auth, isViewer, noteController.downloadNote);
router.post('/:id/rate', auth, isViewer, noteController.rateNote);
router.post('/:id/review', auth, isViewer, noteController.addReview);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const noteController = require('../controllers/noteController');
// const { auth, isCollaborator } = require('../middleware/auth');
// const upload = require('../middleware/upload');

// // Public routes (read-only)
// router.get('/', noteController.getNotes);
// router.get('/:id', noteController.getNoteById);

// // Authenticated routes
// router.get('/:id/download', auth, noteController.downloadNote);
// router.post('/:id/rate', auth, noteController.rateNote);
// router.post('/:id/review', auth, noteController.addReview);

// // Collaborator-only routes
// router.post('/', auth, isCollaborator, upload.single('file'), noteController.uploadNote);
// router.get('/user/notes', auth, isCollaborator, noteController.getUserNotes);
// router.get('/user/stats', auth, isCollaborator, noteController.getStats);

// module.exports = router;