import express from 'express';
import routes from './routes';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', routes);

app.listen(3000, () => {
  console.log('server start!');
});
