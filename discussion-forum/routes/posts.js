// routes/posts.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { body, param, validationResult } = require("express-validator");

// Validation Middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: "Validation failed", 
      errors: errors.array() 
    });
  }
  next();
};

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ timestamp: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts", error: err.message });
  }
});

// Get single post
router.get("/:id", 
  param("id").isMongoId().withMessage("Invalid post ID"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });
      res.json(post);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch post", error: err.message });
    }
  }
);

// Create post
router.post("/",
  [
    body("title")
      .trim()
      .notEmpty().withMessage("Title is required")
      .isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
    body("content")
      .trim()
      .notEmpty().withMessage("Content is required")
      .isLength({ min: 10, max: 5000 }).withMessage("Content must be between 10 and 5000 characters"),
    body("author")
      .trim()
      .notEmpty().withMessage("Author name is required")
      .isLength({ min: 2, max: 50 }).withMessage("Author name must be between 2 and 50 characters"),
  ],
  handleValidationErrors,
  async (req, res) => {
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
    });

    try {
      const newPost = await post.save();
      res.status(201).json(newPost);
    } catch (err) {
      res.status(400).json({ message: "Failed to create post", error: err.message });
    }
  }
);

// Update post (edit)
router.patch("/:id",
  [
    param("id").isMongoId().withMessage("Invalid post ID"),
    body("title")
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 }).withMessage("Title must be between 3 and 200 characters"),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 10, max: 5000 }).withMessage("Content must be between 10 and 5000 characters"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      if (req.body.title) post.title = req.body.title;
      if (req.body.content) post.content = req.body.content;

      const updatedPost = await post.save();
      res.json(updatedPost);
    } catch (err) {
      res.status(400).json({ message: "Failed to update post", error: err.message });
    }
  }
);

// Update post (like/unlike)
router.patch("/:id/like",
  param("id").isMongoId().withMessage("Invalid post ID"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      const userId = req.body.userId || "anonymous";

      if (post.likedBy.includes(userId)) {
        // Unlike
        post.likes -= 1;
        post.likedBy = post.likedBy.filter((id) => id !== userId);
      } else {
        // Like
        post.likes += 1;
        post.likedBy.push(userId);
      }

      const updatedPost = await post.save();
      res.json(updatedPost);
    } catch (err) {
      res.status(400).json({ message: "Failed to update like", error: err.message });
    }
  }
);

// Add comment to post
router.post("/:id/comments",
  [
    param("id").isMongoId().withMessage("Invalid post ID"),
    body("author")
      .trim()
      .notEmpty().withMessage("Author name is required")
      .isLength({ min: 2, max: 50 }).withMessage("Author name must be between 2 and 50 characters"),
    body("content")
      .trim()
      .notEmpty().withMessage("Comment content is required")
      .isLength({ min: 1, max: 1000 }).withMessage("Comment must be between 1 and 1000 characters"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      post.comments.push({
        author: req.body.author,
        content: req.body.content,
      });

      const updatedPost = await post.save();
      res.status(201).json(updatedPost);
    } catch (err) {
      res.status(400).json({ message: "Failed to add comment", error: err.message });
    }
  }
);

// Delete post
router.delete("/:id",
  param("id").isMongoId().withMessage("Invalid post ID"),
  handleValidationErrors,
  async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post) return res.status(404).json({ message: "Post not found" });

      await post.deleteOne();
      res.json({ message: "Post deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: "Failed to delete post", error: err.message });
    }
  }
);

module.exports = router;
