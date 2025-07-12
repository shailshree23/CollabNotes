// // const express = require('express');
// // const router = express.Router();
// // const discussionController = require('../controllers/discussionController');
// // const { auth } = require('../middleware/auth');

// // router.post('/:noteId', auth, discussionController.createDiscussion);
// // router.get('/:noteId', auth, discussionController.getNoteDiscussions);
// // router.post('/:discussionId/answer', auth, discussionController.addAnswer);
// // router.patch('/:discussionId/resolve', auth, discussionController.markAsResolved);

// // module.exports = router;


// const express = require('express');
// const router = express.Router();
// const { auth, isCollaborator } = require('../middleware/auth');
// const discussionController = require('../controllers/discussionController');

// // Public routes
// router.get('/', discussionController.getAllDiscussions);

// // Authenticated routes
// router.post('/', auth, discussionController.createDiscussion);
// router.post('/:id/answers', auth, discussionController.addAnswer);

// // Note-specific discussions
// router.get('/note/:noteId', auth, discussionController.getNoteDiscussions);

// // Collaborator-only routes
// router.patch('/:id/resolve', auth, isCollaborator, discussionController.markAsResolved);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { auth, isCollaborator } = require('../middleware/auth');
const discussionController = require('../controllers/discussionController');

// Public routes (read-only)
router.get('/', discussionController.getDiscussions);

// Note-specific discussions route
router.get('/notes/:noteId/discussions', auth, discussionController.getNoteDiscussions);

// Authenticated routes
router.post('/', auth, discussionController.createDiscussion);
router.post('/:id/answers', auth, discussionController.addAnswer);

// Collaborator-only routes
router.patch('/:id/resolve', auth, isCollaborator, discussionController.markAsResolved);

module.exports = router;