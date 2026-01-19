import express from 'express'
import router from "./routes" //auto find index.ts file in routes folder
import bodyParser from 'body-parser';
const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded());

// parse application/json
app.use(bodyParser.json());

app.use('/api', router);

export default app;