import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

dns.setServers(['8.8.8.8', '8.8.4.4']);

import authRoutes from './routes/Route.js';
import SocketHandler from './SocketHandler.js';


// config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.use(bodyParser.json({limit: "30mb", extended: true}))
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());


app.use('', authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

io.on("connection", (socket) =>{
    console.log("User connected");

    SocketHandler(socket);
})


// mongoose setup

const PORT = process.env.PORT || 6001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('Missing MONGO_URI in environment. Create a .env file with MONGO_URI=your_mongodb_connection_string');
    process.exit(1);
}

mongoose.connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
).then(()=>{
        const conn = mongoose.connection;
        const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads',
        });

        app.get('/files/:id', async (req, res) => {
            try {
                let file;
                let downloadStream;
                const param = req.params.id;

                if (mongoose.Types.ObjectId.isValid(param)) {
                    const fileId = new mongoose.Types.ObjectId(param);
                    file = await conn.db.collection('uploads.files').findOne({ _id: fileId });
                    if (file) {
                        res.set('Content-Type', file.contentType || 'application/octet-stream');
                        downloadStream = gridfsBucket.openDownloadStream(fileId);
                    }
                }

                if (!file) {
                    file = await conn.db.collection('uploads.files').findOne({ filename: param });
                    if (!file) {
                        return res.status(404).json({ error: 'File not found' });
                    }
                    res.set('Content-Type', file.contentType || 'application/octet-stream');
                    downloadStream = gridfsBucket.openDownloadStreamByName(param);
                }

                downloadStream.pipe(res);
            } catch (error) {
                console.error('Error serving file', error);
                res.status(500).json({ error: 'Server error while serving file' });
            }
        });

        server.listen(PORT, ()=>{
            console.log(`Running @ ${PORT}`);
        });
    }
).catch((e)=> console.log(`Error in db connection ${e}`));
