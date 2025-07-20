const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);

const adminRoutes = require('./routes/admin/adminRoutes');
const buyerRoutes = require('./routes/buyer/buyerRoutes');
const vendorRoutes = require('./routes/vendor/vendorRoutes');
const userRoutes = require('./routes/user');

app.use('/api/admin', adminRoutes);
app.use('/api/buyer', buyerRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/user', userRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
