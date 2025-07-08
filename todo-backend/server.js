require('dotenv').config(); // Load .env file
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json()); // Untuk parsing body JSON
app.use(cors()); // Aktifkan CORS untuk semua permintaan

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});