# Discussion Forum

A modern, full-stack discussion forum application built with Node.js, Express, MongoDB, and vanilla JavaScript. Features a beautiful gradient UI with glassmorphism effects, real-time interactions, and comprehensive security measures.

## ✨ Features

- **Create, Edit, and Delete Posts** - Full CRUD operations for discussion posts
- **Like System** - Like/unlike posts with user tracking
- **Comments** - Add comments to posts with author attribution
- **Real-time Search** - Filter posts by title, content, or author
- **Statistics Dashboard** - View total posts, likes, and comments
- **Toast Notifications** - User-friendly feedback for all actions
- **Loading States** - Visual feedback during API calls
- **Input Validation** - Server-side validation with express-validator
- **Security Features** - Helmet, rate limiting, NoSQL injection protection
- **Responsive Design** - Works beautifully on all devices
- **Modern UI** - Gradient backgrounds, smooth animations, and glassmorphism

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or remote connection)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd discussion-forum
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/discussionForum
   PORT=5000
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On Windows (if installed as service)
   net start MongoDB
   
   # On macOS/Linux
   mongod
   ```

5. **Run the application**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:5000`

## 📁 Project Structure

```
discussion-forum/
├── models/
│   └── Post.js              # Mongoose schema for posts and comments
├── routes/
│   └── posts.js             # API routes with validation
├── public/
│   ├── index.html           # Frontend HTML
│   ├── app.js               # Frontend JavaScript
│   └── style.css            # Styles with modern design
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── server.js                # Express server setup
└── package.json             # Dependencies and scripts
```

## 🔒 Security Features

- **Helmet** - Sets security HTTP headers
- **Rate Limiting** - Prevents abuse (100 requests per 15 minutes)
- **NoSQL Injection Protection** - Sanitizes MongoDB queries
- **Input Validation** - Server-side validation for all inputs
- **XSS Prevention** - HTML escaping on frontend
- **CORS Configuration** - Controlled cross-origin requests

## 📡 API Endpoints

### Posts

- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PATCH /api/posts/:id` - Edit post
- `DELETE /api/posts/:id` - Delete post
- `PATCH /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/comments` - Add comment to post

### Request Examples

**Create Post:**
```json
POST /api/posts
{
  "title": "My First Post",
  "content": "This is the content of my post...",
  "author": "John Doe"
}
```

**Edit Post:**
```json
PATCH /api/posts/:id
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

**Add Comment:**
```json
POST /api/posts/:id/comments
{
  "author": "Jane Smith",
  "content": "Great post!"
}
```

## 🎨 UI Features

- **Gradient Background** - Beautiful purple gradient
- **Glassmorphism** - Modern frosted glass effect
- **Smooth Animations** - Fade-in, slide, and hover effects
- **Toast Notifications** - Success/error feedback
- **Loading Spinner** - Visual feedback during operations
- **Responsive Design** - Mobile-friendly layout
- **Modern Typography** - Inter font family

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **dotenv** - Environment configuration
- **express-validator** - Input validation
- **helmet** - Security headers
- **express-mongo-sanitize** - NoSQL injection protection
- **express-rate-limit** - Rate limiting
- **cors** - Cross-origin resource sharing

### Frontend
- **Vanilla JavaScript** - No frameworks
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with variables
- **Google Fonts** - Inter font family

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check service status
- Verify connection string in `.env` file
- Check if port 27017 is available

### Port Already in Use
- Change PORT in `.env` file
- Or stop the process using port 5000

### Dependencies Not Installing
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📝 License

ISC

## 👤 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if you like this project!
