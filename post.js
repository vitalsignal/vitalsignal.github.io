// post.js

const API_URL = 'https://vitalsignal.github.io/posts.json';

// 특정 URL(또는 패턴)이면 "이미지 없음"으로 처리하는 함수
function hasValidImage(url) {
  if (!url) return false;

  // 건강 관련 사이트의 플레이 아이콘 URL이면 이미지로 취급하지 않기
  const invalidPrefix = 'https://www.healthcaredive.com/static/img/play.svg';
  if (url.startsWith(invalidPrefix)) {
    return false;
  }

  return true;
}

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

    const showImage = hasValidImage(post.imageUrl);

    container.innerHTML = `
      <h1>${post.title}</h1>
      <div class="post-date">${formatDate(post.date)}</div>
      ${showImage ? `<img src="${post.imageUrl}" alt="${post.title}">` : ''}
      <div class="body" style="margin-top:2rem;">${post.bodyHtml}</div>
    `;
  } catch (err) {
    console.error('Error loading post:', err);
    container.innerHTML = '<p>Failed to load post. Please try again later.</p>';
  }
}

loadPost();