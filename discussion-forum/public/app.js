// app.js
const API_URL = "http://localhost:5000/api/posts";
let currentUserId =
  localStorage.getItem("userId") ||
  "user_" + Math.random().toString(36).substr(2, 9);
localStorage.setItem("userId", currentUserId);

let deletePostId = null;

// DOM Elements
const newPostBtn = document.getElementById("newPostBtn");
const newPostModal = document.getElementById("newPostModal");
const cancelBtn = document.getElementById("cancelBtn");
const newPostForm = document.getElementById("newPostForm");
const postsContainer = document.getElementById("postsContainer");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const editPostModal = document.getElementById("editPostModal");
const editPostForm = document.getElementById("editPostForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const loadingOverlay = document.getElementById("loadingOverlay");

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

cancelEditBtn.addEventListener("click", () => {
  editPostModal.style.display = "none";
  editPostForm.reset();
});

editPostModal.addEventListener("click", (e) => {
  if (e.target === editPostModal) {
    editPostModal.style.display = "none";
    editPostForm.reset();
  }
});

cancelDeleteBtn.addEventListener("click", () => {
  deleteModal.style.display = "none";
  deletePostId = null;
});

deleteModal.addEventListener("click", (e) => {
  if (e.target === deleteModal) {
    deleteModal.style.display = "none";
    deletePostId = null;
  }
});

confirmDeleteBtn.addEventListener("click", confirmDelete);

newPostForm.addEventListener("submit", createPost);
editPostForm.addEventListener("submit", updatePost);
searchInput.addEventListener("input", filterPosts);

// Toast Notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  const container = document.getElementById("toastContainer");
  container.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Loading State
function setLoading(isLoading) {
  loadingOverlay.style.display = isLoading ? "flex" : "none";
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Load Posts
async function loadPosts() {
  try {
    setLoading(true);
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load posts");
    
    const posts = await response.json();
    displayPosts(posts);
    updateStats(posts);
  } catch (error) {
    console.error("Error loading posts:", error);
    showToast("Failed to load posts. Please try again.", "error");
  } finally {
    setLoading(false);
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
    setLoading(true);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (response.ok) {
      newPostModal.style.display = "none";
      newPostForm.reset();
      showToast("Post created successfully!", "success");
      loadPosts();
    } else {
      showToast(data.message || "Failed to create post", "error");
    }
  } catch (error) {
    console.error("Error creating post:", error);
    showToast("Failed to create post. Please try again.", "error");
  } finally {
    setLoading(false);
  }
}

// Edit Post
function editPost(postId) {
  fetch(`${API_URL}/${postId}`)
    .then((res) => res.json())
    .then((post) => {
      document.getElementById("editPostId").value = post._id;
      document.getElementById("editPostTitle").value = post.title;
      document.getElementById("editPostContent").value = post.content;
      editPostModal.style.display = "flex";
    })
    .catch((error) => {
      console.error("Error fetching post:", error);
      showToast("Failed to load post details", "error");
    });
}

// Update Post
async function updatePost(e) {
  e.preventDefault();

  const postId = document.getElementById("editPostId").value;
  const postData = {
    title: document.getElementById("editPostTitle").value,
    content: document.getElementById("editPostContent").value,
  };

  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const data = await response.json();

    if (response.ok) {
      editPostModal.style.display = "none";
      editPostForm.reset();
      showToast("Post updated successfully!", "success");
      loadPosts();
    } else {
      showToast(data.message || "Failed to update post", "error");
    }
  } catch (error) {
    console.error("Error updating post:", error);
    showToast("Failed to update post. Please try again.", "error");
  } finally {
    setLoading(false);
  }
}

// Delete Post
function deletePost(postId) {
  deletePostId = postId;
  deleteModal.style.display = "flex";
}

async function confirmDelete() {
  if (!deletePostId) return;

  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/${deletePostId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (response.ok) {
      deleteModal.style.display = "none";
      deletePostId = null;
      showToast("Post deleted successfully!", "success");
      loadPosts();
    } else {
      showToast(data.message || "Failed to delete post", "error");
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    showToast("Failed to delete post. Please try again.", "error");
  } finally {
    setLoading(false);
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
    const editBtn = document.getElementById(`edit-${post._id}`);
    const deleteBtn = document.getElementById(`delete-${post._id}`);

    if (likeBtn) likeBtn.addEventListener("click", () => toggleLike(post._id));
    if (commentBtn)
      commentBtn.addEventListener("click", () => toggleComments(post._id));
    if (editBtn) editBtn.addEventListener("click", () => editPost(post._id));
    if (deleteBtn)
      deleteBtn.addEventListener("click", () => deletePost(post._id));

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
                <span class="comment-author">${escapeHtml(comment.author)}</span>
                <span class="comment-time">${formatTime(
                  comment.timestamp
                )}</span>
            </div>
            <p class="comment-content">${escapeHtml(comment.content)}</p>
        </div>
    `
    )
    .join("");

  return `
        <div class="post-card" data-post-id="${post._id}">
            <div class="post-header">
                <div class="post-header-top">
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <div class="post-actions-menu">
                        <button class="action-btn-icon" id="edit-${post._id}" title="Edit post">
                            <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                        </button>
                        <button class="action-btn-icon action-btn-delete" id="delete-${post._id}" title="Delete post">
                            <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="post-meta">
                    <div class="meta-item">
                        <svg class="icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>${escapeHtml(post.author)}</span>
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
            <p class="post-content">${escapeHtml(post.content)}</p>
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
    } else {
      const data = await response.json();
      showToast(data.message || "Failed to update like", "error");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    showToast("Failed to update like. Please try again.", "error");
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
    setLoading(true);
    const response = await fetch(`${API_URL}/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ author, content }),
    });

    const data = await response.json();

    if (response.ok) {
      showToast("Comment added successfully!", "success");
      loadPosts();
      document.getElementById(`comments-${postId}`).style.display = "block";
    } else {
      showToast(data.message || "Failed to add comment", "error");
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    showToast("Failed to add comment. Please try again.", "error");
  } finally {
    setLoading(false);
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
