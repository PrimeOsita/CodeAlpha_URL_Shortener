require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./Database');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./Routes/authRoutes');
const urlRoutes = require('./Routes/urlRoutes');
const { redirectToOriginal } = require('./controllers/urlController.js');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', urlRoutes);

// Public redirect route (must stay below /api routes and static files)
app.get('/:code', redirectToOriginal);

app.use(notFound);
app.use(errorHandler);


mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Database connected successfully');

  app.listen(PORT, ()=> {
    console.log(`Server listening to Port: ${PORT}`);
})
    
})
.catch((error) => {
    console.log(error.message);
    
})
// app.listen(PORT, () => {
// async function connectDB() {
//   const uri = process.env.MONGODB_URI

//   try {
//     await mongoose.connect(uri);
//     console.log('MongoDB connected')
//     console.log(`Server running on port ${PORT}`);
//   console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
//   } catch (err) {
//     console.error('MongoDB connection error:', err.message);
//     process.exit(1);
//   }
// }
// });