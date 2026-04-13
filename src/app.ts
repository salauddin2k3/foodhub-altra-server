import express from 'express';
import cors from 'cors';
import router from './routes';
import { globalErrorHandler } from './middlewares/globalErrorHandler';
import { notFoundHandler } from './middlewares/notFound';

const app = express();

app.use(cors());
// app.use(
//   cors({
//     origin: ['http://localhost:3000', 'https://your-frontend-domain.vercel.app'],
//     credentials: true,
//   })
// );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
