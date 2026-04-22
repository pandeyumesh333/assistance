import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initScheduler } from './jobs/scheduler';

import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import meetingRoutes from './routes/meetings';
import transactionRoutes from './routes/transactions';
import accountRoutes from './routes/accounts';
import notificationRoutes from './routes/notifications';

dotenv.config();

connectDB();
initScheduler();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Life Assistant API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
