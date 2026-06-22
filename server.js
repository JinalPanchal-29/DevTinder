const dotenv = require('dotenv');
const connectDB = require('./config/database');
const app = require('./app');

dotenv.config();

connectDB().then(() => {
  console.log('Database connected successfully!');
  app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
  });
}).catch((error) => {
  console.error('Database connection failed!', error);
});
