import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/routes';
import { corsOptions } from './lib/cors/cors';

const app = express();
// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api", routes);


app.get('/health', (req, res) => {
    return res.json({ msg: 'Server is running' });
})

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
});