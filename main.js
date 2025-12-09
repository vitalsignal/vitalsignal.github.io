// main.js

// Apps Script Web App URL로 교체하세요
const API_URL = 'posts.json';
const POSTS_PER_PAGE = 10;

function getCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get('page') || '1', 10);
  return page > 0 ? page : 1;
}

function getTextSnippet(html, length = 100) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent || temp.innerText || '';
  return text.length > length ? text.slice(0, length) + '…' : text;
}

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value); // 날짜 파싱 실패 시 원문 출력
  return d.toISOString().substring(0, 10); // YYYY-MM-DD
}

function renderPosts(posts) {
  const currentPage = getCurrentPage();
  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const end = start + POSTS_PER_PAGE;
  const pagePosts = posts.slice(start, end);

  const listEl = document.getElementById('post-list');
  listEl.innerHTML = '';

  pagePosts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'post-item';

    const imgHtml = post.imageUrl
      ? `<img class="post-thumb" src="${post.imageUrl}" alt="${post.title}">`
      : `<div class="post-thumb"></div>`;

    article.innerHTML = `
      <a href="post.html?id=${encodeURIComponent(post.id)}">
        ${imgHtml}
        <div class="post-content">
          <div class="post-date">${formatDate(post.date)}</div>
          <h2>${post.title}</h2>
          <p class="post-snippet">${getTextSnippet(post.bodyHtml, 100)}</p>
        </div>
      </a>
    `;

    listEl.appendChild(article);
  });

  renderPagination(posts.length, currentPage);
}

function renderPagination(totalCount, currentPage) {
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE) || 1;
  const pagEl = document.getElementById('pagination');
  pagEl.innerHTML = '';

  for (let p = 1; p <= totalPages; p++) {
    const a = document.createElement('a');
    a.href = `?page=${p}`;
    a.textContent = p;
    if (p === currentPage) {
      a.classList.add('active');
    }
    pagEl.appendChild(a);
  }
}

async function loadPosts() {
  try {
    const res = await fetch(API_URL);
    const posts = await res.json();

    // D열 날짜를 기준으로 최신순 정렬 (내림차순)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    renderPosts(posts);
  } catch (err) {
    console.error('Error loading posts:', err);
    const listEl = document.getElementById('post-list');
    listEl.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
  }
}

loadPosts();