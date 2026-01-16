// app.js
const API_URL = "http://localhost:5000/api/posts";
let currentUserId =
  localStorage.getItem("userId") ||
  "user_" + Math.random().toString(36).substr(2, 9);
localStorage.setItem("userId", currentUserId);

// DOM Elements
const newPostBtn = document.getElementById("newPostBtn");
const newPostModal = document.getElementById("newPostModal");
const cancelBtn = document.getElementById("cancelBtn");
const newPostForm = document.getElementById("newPostForm");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");

// Load posts on page load
document.addEventListener("DOMContentLoaded", loadPosts);

// Event Listeners
newPostBtn.addEventListener("click", () => {
  newPostModal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
  newPostModal.style.display = "none";
  newPostForm.reset();
});

newPostModal.addEventListener("click", (e) => {
  if (e.target === newPostModal) {
    newPostModal.style.display = "none";
    newPostForm.reset();
  }
});

newPostForm.addEventListener("submit", createPost);
searchInput.addEventListener("input", filterPosts);

// Load Posts
async function loadPosts() {
  try {
    const response = await fetch(API_URL);
    const posts = await response.json();
    displayPosts(posts);
    updateStats(posts);
  } catch (error) {
    console.error("Error loading posts:", error);
  }
}

// Create Post
async function createPost(e) {
  e.preventDefault();

  const postData = {
    title: document.getElementById("postTitle").value,
    content: document.getElementById("postContent").value,
    author: document.getElementById("postAuthor").value,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    if (response.ok) {
      newPostModal.style.display = "none";
      newPostForm.reset();
      loadPosts();
    }
  } catch (error) {
    console.error("Error creating post:", error);
  }
}

// Display Posts
function displayPosts(posts) {
  if (posts.length === 0) {
    postsContainer.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  postsContainer.innerHTML = posts.map((post) => createPostHTML(post)).join("");

  // Add event listeners to action buttons
  posts.forEach((post) => {
    const likeBtn = document.getElementById(`like-${post._id}`);
    const commentBtn = document.getElementById(`comment-${post._id}`);

    if (likeBtn) likeBtn.addEventListener("click", () => toggleLike(post._id));
    if (commentBtn)
      commentBtn.addEventListener("click", () => toggleComments(post._id));

    const commentForm = document.getElementById(`comment-form-${post._id}`);
    if (commentForm) {
      commentForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addComment(post._id);
      });
    }
  });
}

// Create Post HTML
function createPostHTML(post) {
  const isLiked = post.likedBy.includes(currentUserId);
  const commentsHTML = post.comments
    .map(
      (comment) => `
        <div class="comment">
            <div class="comment-header">
                <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span class="comment-author">${comment.author}</span>
                <span class="comment-time">${formatTime(
                  comment.timestamp
                )}</span>
            </div>
            <p class="comment-content">${comment.content}</p>
        </div>
    `
    )
    .join("");

  return `
        <div class="post-card" data-post-id="${post._id}">
            <div class="post-header">
                <h3 class="post-title">${post.title}</h3>
                <div class="post-meta">
                    <div class="meta-item">
                        <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>${post.author}</span>
                    </div>
                    <div class="meta-item">
                        <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>${formatTime(post.timestamp)}</span>
                    </div>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-actions">
                <button class="action-btn ${isLiked ? "liked" : ""}" id="like-${
    post._id
  }">
                    <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                    </svg>
                    <span>${post.likes}</span>
                </button>
                <button class="action-btn" id="comment-${post._id}">
                    <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>${post.comments.length}</span>
                </button>
            </div>
            <div class="comments-section" id="comments-${
              post._id
            }" style="display: none;">
                <h4 class="comments-title">Comments</h4>
                <div class="comments-list">${commentsHTML}</div>
                <form class="comment-form" id="comment-form-${post._id}">
                    <input type="text" class="comment-input" id="comment-author-${
                      post._id
                    }" placeholder="Your name" required>
                    <div class="comment-submit">
                        <input type="text" class="comment-input" id="comment-content-${
                          post._id
                        }" placeholder="Add a comment..." required>
                        <button type="submit">Comment</button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Toggle Like
async function toggleLike(postId) {
  try {
    const response = await fetch(`${API_URL}/${postId}/like`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: currentUserId }),
    });

    if (response.ok) {
      loadPosts();
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

// Toggle Comments
function toggleComments(postId) {
  const commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection.style.display === "none") {
    commentsSection.style.display = "block";
  } else {
    commentsSection.style.display = "none";
  }
}

// Add Comment
async function addComment(postId) {
  const author = document.getElementById(`comment-author-${postId}`).value;
  const content = document.getElementById(`comment-content-${postId}`).value;

  try {
    const response = await fetch(`${API_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author, content }),
    });

    if (response.ok) {
      loadPosts();
      document.getElementById(`comments-${postId}`).style.display = "block";
    }
  } catch (error) {
    console.error("Error adding comment:", error);
  }
}

// Filter Posts
function filterPosts() {
  const searchTerm = searchInput.value.toLowerCase();
  const postCards = document.querySelectorAll(".post-card");

  postCards.forEach((card) => {
    const title = card.querySelector(".post-title").textContent.toLowerCase();
    const content = card
      .querySelector(".post-content")
      .textContent.toLowerCase();
    const author = card
      .querySelector(".post-meta .meta-item span")
      .textContent.toLowerCase();

    if (
      title.includes(searchTerm) ||
      content.includes(searchTerm) ||
      author.includes(searchTerm)
    ) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Update Stats
function updateStats(posts) {
  const totalPosts = posts.length;
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = posts.reduce(
    (sum, post) => sum + post.comments.length,
    0
  );

  document.getElementById("totalPosts").textContent = totalPosts;
  document.getElementById("totalLikes").textContent = totalLikes;
  document.getElementById("totalComments").textContent = totalComments;
}

// Format Time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
