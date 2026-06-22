const authRouter = require('./authRoutes');
const profileRouter = require('./profileRoutes');
const userRouter = require('./userRoutes');
const requestRouter = require('./requestRoutes');

module.exports = (app) => {
  app.use('/', authRouter);
  app.use('/', profileRouter);
  app.use('/', userRouter);
  app.use('/', requestRouter);
};
