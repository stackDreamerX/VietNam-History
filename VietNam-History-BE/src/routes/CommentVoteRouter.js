const express = require('express');
const router = express.Router();
const CommentVoteController = require('../controllers/CommentVoteController');

router.post('/vote', CommentVoteController.createOrUpdateVote);
router.delete('/vote/:userId/:commentId', CommentVoteController.deleteVote);
router.get('/votes/:commentId', CommentVoteController.getVotesByComment);
router.get('/vote-status/:userId/:commentId', CommentVoteController.checkVoteStatus);
router.get('/vote-stats/:commentId', CommentVoteController.getVoteStats);

module.exports = router;
