const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
  },
  memberId: {
    type: String,
    required: [true, 'Member ID is required'],
    trim: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  fine: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Issued', 'Returned'],
    default: 'Issued',
  },
});

const bookSchema = new mongoose.Schema(
  {
    bookCode: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Fiction', 'Science', 'History', 'Technology', 'Biography', 'Other'],
    },
    totalCopies: {
      type: Number,
      required: true,
      min: [1, 'Total copies must be at least 1'],
      max: [20, 'Total copies cannot exceed 20'],
    },
    availableCopies: {
      type: Number,
      required: true,
      min: 0,
    },
    loans: [loanSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);