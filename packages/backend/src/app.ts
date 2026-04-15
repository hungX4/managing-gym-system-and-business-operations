import express from 'express'
import router from "./routes" //auto find index.ts file in routes folder
import bodyParser from 'body-parser';
import { AppDataSource } from "./models/data-source";
import { User } from "./models/entity/User";
import { errorMiddleware } from './middleware/error.middleware';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
AppDataSource.initialize()
    .then(async () => {
        console.log("🔥 Kết nối Database thành công!");
    })
    .catch((error) => console.log("❌ Lỗi kết nối Database:", error));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());

//api route
app.use('/api', router);


app.use(errorMiddleware)
export default app;