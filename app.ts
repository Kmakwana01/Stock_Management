import createError from 'http-errors'
import express,{ Request,Response,NextFunction,Errback } from 'express'
import path from 'path';
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import dotenv from 'dotenv'
import cors from 'cors'
import { mongodbConnection } from './database/db';

mongodbConnection()
dotenv.config()

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//router

import authRouter from './routes/authRoute';
import userRouter from './routes/userRoute';
import jobRouter from './routes/jobRoute';
import colorRouter from './routes/colorRoute';
import processRouter from './routes/processRoute';
import stockListRouter from './routes/stockListRoute';
import patternRouter from './routes/patternRoute';
import vendorRoute from './routes/vendorRoute'
import saleRoute from './routes/saleRoute'
import machineRoute from './routes/machineRoute'
import makingRoute from './routes/makingRoute'
import menuRoute from './routes/menuRoute'
import workerRoute from './routes/workerRoute'
import customerRoute from './routes/customerRoute'
import clientRoute from './routes/clientRoute'
import roleRoute from './routes/roleRoute'
import whatsappRoute from './routes/whatsappRoute'

app.use('/', authRouter);
app.use('/user', userRouter);
app.use('/job', jobRouter);
app.use('/color', colorRouter);
app.use('/process', processRouter);
app.use('/stockList', stockListRouter);
app.use('/pattern', patternRouter);
app.use('/vendor', vendorRoute);
app.use('/sale', saleRoute);
app.use('/machine', machineRoute);
app.use('/making', makingRoute);
app.use('/menu', menuRoute);
app.use('/worker', workerRoute);
app.use('/customer', customerRoute);
app.use('/client', clientRoute);
app.use('/role', roleRoute);
app.use('/whatsapp', whatsappRoute);

const buildPath = path.normalize(path.join(__dirname, "./out"));
app.use(express.static(buildPath));
const rootRouter = express.Router(); 
rootRouter.get('(/*)?', async (req : Request, res : Response, next : NextFunction) => {
  res.sendFile(path.join(buildPath, "index.html"));
});
app.use(rootRouter);

// catch 404 and forward to error handler
app.use(function(req : Request, res : Response, next : NextFunction) {
  next(createError(404));
});

// error handler
app.use(async (err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page

  res.status((err as any).status || 500);
  res.render('error');
});

export default app;
