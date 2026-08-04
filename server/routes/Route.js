import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { login, register } from '../controllers/Auth.js';
import { createPost } from '../controllers/createPost.js';
import { fetchAllPosts, fetchAllStories, fetchUserImg, fetchUserName } from '../controllers/Posts.js';

dotenv.config();

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', register);
router.post('/login', login);
router.post('/createPost', upload.single('postFile'), createPost);
router.post('/uploadFile', upload.single('file'), async (req, res) => {
  try {
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

    uploadStream.on('finish', () => {
      const fileUrl = `${req.protocol}://${req.get('host')}/files/${uploadStream.id}`;
      res.status(201).json({ fileUrl });
    });
  } catch (error) {
    console.error('uploadFile route error', error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/fetchAllPosts', fetchAllPosts);
router.get('/fetchUserName', fetchUserName);
router.get('/fetchUserImg', fetchUserImg);
router.get('/fetchAllStories', fetchAllStories);

export default router;