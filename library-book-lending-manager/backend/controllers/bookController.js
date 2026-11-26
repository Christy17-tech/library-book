const Book = require('../models/Book');

const VALID_CATEGORIES = ['Fiction', 'Science', 'History', 'Technology', 'Biography', 'Other'];

// Helper to normalize dates to midnight UTC for accurate day comparisons
const normalizeDate = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

// @desc    Get statistics
// @route   GET /api/books/stats
const getStats = async (req, res) => {
  try {
    const books = await Book.find();
    const today = normalizeDate(new Date());

    let totalTitles = books.length;
    let totalCopies = 0;
    let copiesIssued = 0;
    let overdueLoans = 0;
    let totalFineCollected = 0;

    books.forEach((book) => {
      totalCopies += book.totalCopies;
      copiesIssued += book.totalCopies - book.availableCopies;

      book.loans.forEach((loan) => {
        if (loan.status === 'Issued' && normalizeDate(loan.dueDate) < today) {
          overdueLoans += 1;
        }
        if (loan.status === 'Returned') {
          totalFineCollected += loan.fine || 0;
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Statistics fetched successfully',
      data: {
        totalTitles,
        totalCopies,
        copiesIssued,
        overdueLoans,
        totalFineCollected,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Get all books with filter, search, and pagination
// @route   GET /api/books
const getBooks = async (req, res) => {
  try {
    const { category, availableOnly, search, page = 1 } = req.query;
    const limit = 5;
    const currentPage = Math.max(1, parseInt(page, 10) || 1);

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (availableOnly === 'true') {
      query.availableCopies = { $gt: 0 };
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { author: regex }];
    }

    const totalBooks = await Book.countDocuments(query);
    const totalPages = Math.max(1, Math.ceil(totalBooks / limit));
    const skip = (currentPage - 1) * limit;

    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: {
        books,
        currentPage,
        totalPages,
        totalBooks,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Get single book with loan history and isOverdue flag
// @route   GET /api/books/:id
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found', data: null });
    }

    const today = normalizeDate(new Date());
    const bookObj = book.toObject();

    bookObj.loans = bookObj.loans
      .map((loan) => {
        const isOverdue = loan.status === 'Issued' && normalizeDate(loan.dueDate) < today;
        return { ...loan, isOverdue };
      })
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    return res.status(200).json({
      success: true,
      message: 'Book details fetched successfully',
      data: bookObj,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Add a new book
// @route   POST /api/books
const addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;

    if (!title || !author || !isbn || !category || totalCopies === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (title, author, isbn, category, totalCopies) are required',
        data: null,
      });
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category selected',
        data: null,
      });
    }

    const cleanIsbn = String(isbn).trim();
    if (!/^\d{10}$|^\d{13}$/.test(cleanIsbn)) {
      return res.status(400).json({
        success: false,
        message: 'ISBN must contain exactly 10 or 13 digits',
        data: null,
      });
    }

    const copies = Number(totalCopies);
    if (!Number.isInteger(copies) || copies < 1 || copies > 20) {
      return res.status(400).json({
        success: false,
        message: 'Total copies must be a whole number between 1 and 20',
        data: null,
      });
    }

    // Duplicate ISBN check -> 409 Conflict
    const existingBook = await Book.findOne({ isbn: cleanIsbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: `A book with ISBN ${cleanIsbn} already exists`,
        data: null,
      });
    }

    // Auto-generate Book Code: LB-<CAT>-<001>
    const prefix = `LB-${category.slice(0, 3).toUpperCase()}-`;
    const lastCategoryBook = await Book.findOne({ bookCode: new RegExp(`^${prefix}`) })
      .sort({ bookCode: -1 });

    let nextSeq = 1;
    if (lastCategoryBook) {
      const parts = lastCategoryBook.bookCode.split('-');
      const lastNum = parseInt(parts[2], 10);
      if (!isNaN(lastNum)) {
        nextSeq = lastNum + 1;
      }
    }
    const bookCode = `${prefix}${String(nextSeq).padStart(3, '0')}`;

    const newBook = await Book.create({
      bookCode,
      title: title.trim(),
      author: author.trim(),
      isbn: cleanIsbn,
      category,
      totalCopies: copies,
      availableCopies: copies,
      loans: [],
    });

    return res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: newBook,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Edit book (Title, Author, Total Copies only)
// @route   PUT /api/books/:id
const updateBook = async (req, res) => {
  try {
    const { title, author, totalCopies } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found', data: null });
    }

    if (!title || !title.trim() || !author || !author.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title and Author are required',
        data: null,
      });
    }

    const newTotal = Number(totalCopies);
    if (!Number.isInteger(newTotal) || newTotal < 1 || newTotal > 20) {
      return res.status(400).json({
        success: false,
        message: 'Total copies must be between 1 and 20',
        data: null,
      });
    }

    const currentlyIssued = book.totalCopies - book.availableCopies;
    if (newTotal < currentlyIssued) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce Total Copies below currently issued copies (${currentlyIssued})`,
        data: null,
      });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.totalCopies = newTotal;
    book.availableCopies = newTotal - currentlyIssued;

    await book.save();

    return res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: book,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Delete book (only if no copies are currently issued)
// @route   DELETE /api/books/:id
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found', data: null });
    }

    const hasUnreturned =
      book.availableCopies < book.totalCopies ||
      book.loans.some((loan) => loan.status === 'Issued');

    if (hasUnreturned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete book while copies are still issued to members',
        data: null,
      });
    }

    await Book.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Issue a book to a member
// @route   POST /api/books/:id/issue
const issueBook = async (req, res) => {
  try {
    const { memberName, memberId, issueDate } = req.body;

    if (!memberName || !memberName.trim() || !memberId || !memberId.trim() || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'Member Name, Member ID, and Issue Date are required',
        data: null,
      });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found', data: null });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No copies available to issue',
        data: null,
      });
    }

    const cleanMemberId = memberId.trim();
    const alreadyIssued = book.loans.some(
      (loan) => loan.memberId.toLowerCase() === cleanMemberId.toLowerCase() && loan.status === 'Issued'
    );

    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: `Member ${cleanMemberId} already holds an unreturned copy of this book`,
        data: null,
      });
    }

    const parsedIssueDate = normalizeDate(issueDate);
    const today = normalizeDate(new Date());

    if (isNaN(parsedIssueDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid Issue Date', data: null });
    }

    if (parsedIssueDate > today) {
      return res.status(400).json({
        success: false,
        message: 'Issue Date cannot be in the future',
        data: null,
      });
    }

    const dueDate = new Date(parsedIssueDate);
    dueDate.setUTCDate(dueDate.getUTCDate() + 14);

    book.loans.push({
      memberName: memberName.trim(),
      memberId: cleanMemberId,
      issueDate: parsedIssueDate,
      dueDate,
      returnDate: null,
      fine: 0,
      status: 'Issued',
    });

    book.availableCopies -= 1;
    await book.save();

    return res.status(200).json({
      success: true,
      message: 'Book issued successfully',
      data: book,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

// @desc    Return an issued book
// @route   POST /api/books/:id/return/:loanId
const returnBook = async (req, res) => {
  try {
    const { id, loanId } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found', data: null });
    }

    const loan = book.loans.id(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan record not found', data: null });
    }

    if (loan.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'This loan has already been returned',
        data: null,
      });
    }

    const today = normalizeDate(new Date());
    const dueDate = normalizeDate(loan.dueDate);

    let fine = 0;
    if (today > dueDate) {
      const diffTime = today.getTime() - dueDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 5;
    }

    loan.returnDate = today;
    loan.fine = fine;
    loan.status = 'Returned';

    if (book.availableCopies < book.totalCopies) {
      book.availableCopies += 1;
    }

    await book.save();

    return res.status(200).json({
      success: true,
      message: fine > 0 ? `Book returned with a late fine of ₹${fine}` : 'Book returned on time (₹0 fine)',
      data: book,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = {
  getStats,
  getBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  issueBook,
  returnBook,
};