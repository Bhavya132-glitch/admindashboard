require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);

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
