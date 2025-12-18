require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/history', historyRoutes);

// Serve static files from the client app
app.use(express.static(path.join(__dirname, '../client/dist')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Database Connection
if (!process.env.MONGODB_URI) {
    console.error('Error: MONGODB_URI is not defined in .env');
    // We don't exit process here so dev can see the error and fix .env without crashing loop
} else {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch(err => console.error('MongoDB connection error:', err));
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
