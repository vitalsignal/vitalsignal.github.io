// post.js

const API_URL = 'https://script.google.com/macros/s/AKfycbyqLmmZySB3D3F_6p25ywMg4QANet3A-Zo6mtLq0GQZOA_vdbNryaoTtixZ4UPPly_XKw/exec';

function getPostIdFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  return id ? parseInt(id, 10) : null;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  return d.toISOString().substring(0, 10);
}

async function loadPost() {
  const postId = getPostIdFromQuery();
  const container = document.getElementById('post');

  if (!postId) {
    container.innerHTML = '<p>Invalid post ID.</p>';
    return;
  }

  try {
    const res = await fetch(API_URL);
    const posts = await res.json();

    const post = posts.find(p => Number(p.id) === postId);
    if (!post) {
      container.innerHTML = '<p>Post not found.</p>';
      return;
    }

    container.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${formatDate(post.date)}</div>
      ${post.imageUrl ? `<img src="${post.imageUrl}" alt="${post.title}">` : ''}
      <div class="body">${post.bodyHtml}</div>
    `;
  } catch (err) {
    console.error('Error loading post:', err);
    container.innerHTML = '<p>Failed to load post. Please try again later.</p>';
  }
}

loadPost();