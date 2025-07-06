require('dotenv').config();
console.log('FIREBASE_MODE: Firestore');

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', cors(), express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed!'), false);
    }
  }
});

// Firestore CRUD routes

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get();
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a post
app.post('/api/posts', upload.single('file'), async (req, res) => {
  try {
    const { title, content, category, author, link, hiddenUserId } = req.body;
    const token = Math.random().toString(36).substring(2);
    const postData = {
      title,
      content,
      category,
      author,
      link: link || '',
      hiddenUserId: hiddenUserId || '',
      token,
      mediaType: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'video') : 'none',
      mediaUrl: req.file ? `/uploads/${req.file.filename}` : null,
      likes: 0,
      comments: [],
      createdAt: new Date()
    };
    const docRef = await db.collection('posts').add(postData);
    const savedPost = { id: docRef.id, ...postData };
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get a single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const doc = await db.collection('posts').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a post
app.put('/api/posts/:id', upload.single('file'), async (req, res) => {
  try {
    const { title, content, category, token, link, hiddenUserId } = req.body;
    const docRef = db.collection('posts').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = doc.data();
    if (post.hiddenUserId !== hiddenUserId && post.token !== token) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const updateData = {
      title,
      content,
      category,
      link: link || '',
      hiddenUserId: hiddenUserId || post.hiddenUserId || '',
    };
    if (req.file) {
      updateData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      updateData.mediaUrl = `/uploads/${req.file.filename}`;
    }
    await docRef.update(updateData);
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a post
app.delete('/api/posts/:id', async (req, res) => {
  try {
    const { token, userId } = req.body;
    const docRef = db.collection('posts').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = doc.data();
    if (post.hiddenUserId !== userId && post.token !== token) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await docRef.delete();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Like a post
app.post('/api/posts/:id/like', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const docRef = db.collection('posts').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = doc.data();
    let likedUserIds = post.likedUserIds || [];
    let newLikes = post.likes || 0;
    if (likedUserIds.includes(userId)) {
      // 좋아요 취소
      likedUserIds = likedUserIds.filter(id => id !== userId);
      newLikes = Math.max(0, newLikes - 1);
    } else {
      // 좋아요 등록
      likedUserIds.push(userId);
      newLikes = newLikes + 1;
    }
    await docRef.update({ likes: newLikes, likedUserIds });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a comment to a post
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { content, author, userId, isAnonymous } = req.body;
    const docRef = db.collection('posts').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = doc.data();
    const newComment = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      content,
      author,
      userId,
      isAnonymous,
      createdAt: new Date()
    };
    const updatedComments = [...(post.comments || []), newComment];
    await docRef.update({ comments: updatedComments });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 댓글 수정
app.put('/api/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { content, author, isAnonymous, userId } = req.body;
    const docRef = db.collection('posts').doc(req.params.postId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = doc.data();
    const comments = post.comments || [];
    const idx = comments.findIndex(c => c.id === req.params.commentId);
    if (idx === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comments[idx].userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    comments[idx] = {
      ...comments[idx],
      content,
      author,
      isAnonymous,
      editedAt: new Date()
    };
    await docRef.update({ comments });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 댓글 삭제
app.delete('/api/posts/:postId/comments/:commentId', async (req, res) => {
  try {
    const { userId } = req.body;
    const docRef = db.collection('posts').doc(req.params.postId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const post = doc.data();
    const comments = post.comments || [];
    const idx = comments.findIndex(c => c.id === req.params.commentId);
    if (idx === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comments[idx].userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    comments.splice(idx, 1);
    await docRef.update({ comments });
    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 