import mongoose from 'mongoose';
import Post from '../models/Post.js';

export const createPost = async (req, res) =>{
    try{
        console.log('createPost body', req.body);
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const conn = mongoose.connection;
        if (!conn || !conn.db) {
            return res.status(500).json({ error: 'Database not connected' });
        }

        const bucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });
        const uploadStream = bucket.openUploadStream(`${Date.now()}-${req.file.originalname}`, {
            contentType: req.file.mimetype,
            metadata: { originalName: req.file.originalname },
        });

        uploadStream.end(req.file.buffer);

        uploadStream.on('error', (err) => {
            console.error('GridFS upload error', err);
            return res.status(500).json({ error: 'File upload failed' });
        });

        uploadStream.on('finish', async () => {
            const fileUrl = `${req.protocol}://${req.get('host')}/files/${uploadStream.id}`;
            const newPost = new Post({
                userId: req.body.userId,
                userName: req.body.userName,
                userPic: req.body.userPic,
                fileType: req.body.fileType,
                file: fileUrl,
                description: req.body.description,
                location: req.body.location,
                likes: [],
                comments: [],
            });

            const post = await newPost.save();
            console.log('createPost saved', post._id);
            res.status(201).json(post);
        });
    }catch(e){
        console.error('createPost failed', e);
        res.status(500).json({error:e.message});
    }
}