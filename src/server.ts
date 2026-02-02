import express from 'express';
import authRoutes from './routes/auth.routes';
import productsRoutes from './routes/products.routes';

const app = express();

app.use('/auth', authRoutes);
app.use('/products', productsRoutes);

export default app;