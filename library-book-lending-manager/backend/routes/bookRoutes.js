const express = require('express');
const router = express.Router();
const {
  getStats,
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
} = require('../controllers/bookController');

// Important: /stats must come before /:id
router.get('/stats', getStats);

router.route('/').get(getBooks).post(addBook);
router.route('/:id').get(getBookById).put(updateBook).delete(deleteBook);

router.post('/:id/issue', issueBook);
router.post('/:id/return/:loanId', returnBook);

module.exports = router;