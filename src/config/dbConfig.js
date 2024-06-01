import mongoose from "mongoose"
import config from "./config.js";
import logger from "../logger.js";
import { __dirname } from "../utils.js";

const mongoURL = config.mongoURL;

const URI= mongoURL

const connectToDB = () => {
    try {
        mongoose.connect(URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        logger.info('Base de datos ecommerce conectada')
    } catch (error) {
        logger.error(error);
    }
};

export default connectToDB