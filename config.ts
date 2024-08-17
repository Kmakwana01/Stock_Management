import dotenv from 'dotenv';
dotenv.config()

const REFRESH_TOKEN_EXPIRE_IN_DAY = process.env.REFRESH_TOKEN_EXPIRE_IN_DAY;
const ACCESS_TOKEN_EXPIRE_IN_DAY = process.env.ACCESS_TOKEN_EXPIRE_IN_DAY;
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const NODEMAILER_PASSKEY = process.env.NODEMAILER_PASSKEY;
// const SOCKET_PORT = process.env.SOCKET_PORT;

const constantsObj : any = {
  REFRESH_TOKEN_EXPIRE_IN_DAY,
  ACCESS_TOKEN_EXPIRE_IN_DAY,
  PORT,
  MONGO_URL,
  NODEMAILER_PASSKEY
};

export const constants = Object.freeze(constantsObj);