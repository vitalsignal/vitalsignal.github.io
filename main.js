// main.js

const API_URL = 'https://vitalsignal.github.io/posts.json';
const POSTS_PER_PAGE = 12;

// placeholder image for missing or invalid thumbnails
const PLACEHOLDER_IMG = "asset/img/placeholder.png";

// Detect invalid image URLs such as play.svg or empty values
function isInvalidImage(url) {
  if (!url || url.trim() === "") return true;

  // Add more patterns as needed
  const blockedPatterns = [
    "play.svg",
    "static/img/play.svg",
    "placeholder",
    "default-thumbnail"
  ];

  return blockedPatterns.some(pattern => url.includes(pattern));
}

// Convert RSS-style date like: "December 09, 2025 at 12:21AM"
function parsePostDate(value) {
  if (!value || typeof value !== 'string') return null;

  const m = value.match(
    /^([A-Za-z]+) (\d{1,2}), (\d{4}) at (\d{1,2}):(\d{2})(AM|PM)$/
  );
  if (!m) return null;

  const [, monthName, dayStr, yearStr, hourStr, minuteStr, ampm] = m;

  const months = {
    January: 0, February: 1, March: 2, April: 3,
    May: 4, June: 5, July: 6, August: 7,
    September: 8, October: 9, November: 10, December: 11
  };

  const month = months[monthName];
  if (month === undefined) return null;

  const year = parseInt(yearStr, 10);
  const day = parseInt(dayStr, 10);
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);

  // 12시간제 변환
  if (ampm === 'AM') {
    if (hour === 12) hour = 0;
  } else {
    if (hour !== 12) hour += 12;
  }

  return new Date(year, month, day, hour, minute, 0, 0);
}

function getCurrentPage() {
  const params = new URLSearchParams(window.location.search);
  const page = parseInt(params.get('page') || '1', 10);
  return page > 0 ? page : 1;
}

function getTextSnippet(html, length = 80) {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const text = temp.textContent || temp.innerText || '';
  return text.length > length ? text.slice(0, length) + '…' : text;
}

function formatDate(value) {
  if (!value) return '';
  const d = parsePostDate(value);
  if (!d) return String(value);
  return d.toISOString().substring(0, 10);
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

    // 이미지 선택 로직
    let imgSrc = post.imageUrl;
    if (isInvalidImage(imgSrc)) imgSrc = PLACEHOLDER_IMG;

    // HTML 생성
    article.innerHTML = `
      <a href="post.html?id=${encodeURIComponent(post.id)}">
        <img 
          class="post-thumb" 
          src="${imgSrc}" 
          alt="${post.title}"
          onerror="this.onerror=null; this.src='${PLACEHOLDER_IMG}'"
        >
        <div class="post-content">
          <div class="post-date">${formatDate(post.date)}</div>
          <h2>${post.title}</h2>
          <p class="post-snippet">${getTextSnippet(post.bodyHtml, 80)}</p>
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
    if (p === currentPage) a.classList.add('active');
    pagEl.appendChild(a);
  }
}

async function loadPosts() {
  try {
    const res = await fetch(API_URL);
    const posts = await res.json();

    posts.sort((a, b) => {
      const da = parsePostDate(a.date);
      const db = parsePostDate(b.date);
      return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });

    renderPosts(posts);
  } catch (err) {
    console.error('Error loading posts:', err);
    const listEl = document.getElementById('post-list');
    listEl.innerHTML = '<p>Failed to load posts. Please try again later.</p>';
  }
}

loadPosts();