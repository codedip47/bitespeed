import express from 'express';
import dotenv from 'dotenv';
import identifyRoutes from './src/routes/identify.routes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.get('/', (_, res) => {
  res.send('All ok');
});

app.use('/api/identify', identifyRoutes);

app.listen(PORT, () => {
  console.log(`Server is Running on PORT ${PORT}`);
});
