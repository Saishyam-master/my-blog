// script.js - Modular, accessible blog JS
// 1. Theme toggle
// 2. Navbar scroll shadow
// 3. Scroll reveal
// 4. Load more posts
// 5. Reading time (post page)

(function(){
  // Theme toggle
  const html = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const darkClass = 'dark';
  function setTheme(dark) {
    if (dark) html.classList.add(darkClass);
    else html.classList.remove(darkClass);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
  if (toggle) {
    toggle.addEventListener('click', () => setTheme(!html.classList.contains(darkClass)));
    // Init
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)) setTheme(true);
  }

  // Navbar shadow on scroll
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 0);
    });
  }

  // Scroll reveal
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  // Load more posts
  const postsGrid = document.getElementById('posts');
  const loadMoreBtn = document.getElementById('load-more');
  const announcer = document.getElementById('aria-announcer');
  let posts = [], page = 1, perPage = 6, loading = false;
  function createPostCard(post) {
    const card = document.createElement('article');
    card.className = 'card bg-img reveal';
    card.style.setProperty('--bg', `url('${post.image}')`);
    card.innerHTML = `
      <a class="card-link" href="post.html?slug=${post.slug}" tabindex="-1" aria-label="Read post: ${post.title}"></a>
      <div class="card-content">
        <span class="tag">${post.tags[0]}</span>
        <h3>${post.title}</h3>
        <p>${post.excerpt}</p>
        <div class="card-meta">
          <time datetime="${post.date}">${new Date(post.date).toLocaleDateString(undefined, {year:'numeric',month:'short',day:'numeric'})}</time>
          <span class="muted"> &bull; Updated ${daysAgo(post.date)}d ago</span>
        </div>
      </div>`;
    return card;
  }
  function daysAgo(dateStr) {
    const d = new Date(dateStr), now = new Date();
    return Math.floor((now-d)/(1000*60*60*24));
  }
  function renderPosts() {
    if (!postsGrid) return;
    const start = (page-1)*perPage, end = page*perPage;
    posts.slice(start, end).forEach(post => postsGrid.appendChild(createPostCard(post)));
    if (end >= posts.length) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'No more posts';
      if (announcer) announcer.textContent = 'No more posts.';
    } else {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Load more';
    }
  }
  if (postsGrid && loadMoreBtn) {
    fetch('posts.json').then(r=>r.json()).then(data=>{
      posts = data;
      renderPosts();
    });
    loadMoreBtn.addEventListener('click', () => {
      if (loading) return;
      loading = true;
      page++;
      renderPosts();
      loading = false;
    });
  }

  // Reading time (post page)
  if (document.querySelector('.post-body')) {
    const body = document.querySelector('.post-body');
    const words = body.textContent.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words/200));
    const rt = document.getElementById('reading-time');
    if (rt) rt.textContent = `${mins} min read`;
  }

  // Back to top button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.style.display = window.scrollY > 600 ? 'block' : 'none';
    });
    backToTop.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }
})();
