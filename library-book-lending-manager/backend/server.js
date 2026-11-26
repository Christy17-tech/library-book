const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const bookRoutes = require('./routes/bookRoutes');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Library Book Lending Manager API is running', data: null });
});

app.use('/api/books', bookRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found', data: null });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));