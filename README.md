# Library Book Lending Manager

A full-stack **MERN** (MongoDB Atlas, Express.js, React.js, Node.js) web application built for librarians to manage book inventory, issue books to members, track loan histories, and process book returns with automated overdue fine calculation.

---

## Tech Stack

- **Frontend:** React.js (Vite), Tailwind CSS, Axios, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas (Mongoose ODM)

---

## Project Structure

```text
library-book-lending-manager/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB Atlas connection setup
│   ├── controllers/
│   │   └── bookController.js   # Business logic, validations, fine & stats calculations
│   ├── models/
│   │   └── Book.js             # Mongoose schemas for Books and embedded Loans
│   ├── routes/
│   │   └── bookRoutes.js       # RESTful API route definitions
│   ├── .env                    # Environment configuration (PORT, MONGO_URI)
│   ├── package.json
│   └── server.js               # Express app entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddBookModal.jsx
│   │   │   ├── BookDetailsModal.jsx
│   │   │   ├── EditBookModal.jsx
│   │   │   ├── IssueBookModal.jsx
│   │   │   └── StatsBar.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── screenshots/
│   ├── dashboard.png
│   └── loan-history.png
└── README.md# library-book
test
