const API_BASE = ''; // same origin

// ---- State ----
let token = localStorage.getItem('token') || null;
let currentUser = null;

// ---- Elements ----
const shortenForm = document.getElementById('shortenForm');
const longUrlInput = document.getElementById('longUrl');
const customCodeInput = document.getElementById('customCode');
const formError = document.getElementById('formError');
const result = document.getElementById('result');
const resultLink = document.getElementById('resultLink');
const copyBtn = document.getElementById('copyBtn');

const authStatus = document.getElementById('authStatus');
const authCard = document.getElementById('authCard');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const authError = document.getElementById('authError');
const logoutBtn = document.getElementById('logoutBtn');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

const myUrlsCard = document.getElementById('myUrlsCard');
const urlList = document.getElementById('urlList');

// ---- Helpers ----
function authHeaders() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}

function setToken(newToken) {
  token = newToken;
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
}

// ---- Shorten form ----
shortenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.textContent = '';
  result.classList.add('hidden');

  try {
    const data = await api('/api/shorten', {
      method: 'POST',
      body: JSON.stringify({
        url: longUrlInput.value.trim(),
        customCode: customCodeInput.value.trim() || undefined
      })
    });

    resultLink.href = data.shortUrl;
    resultLink.textContent = data.shortUrl;
    result.classList.remove('hidden');
    shortenForm.reset();

    if (currentUser) loadMyUrls();
  } catch (err) {
    formError.textContent = err.message;
  }
});

copyBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(resultLink.href);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
});

// ---- Auth tabs ----
tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    tabBtns.forEach((b) => b.classList.remove('active'));
    tabPanels.forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${btn.dataset.tab}Form`).classList.add('active');
    authError.textContent = '';
  });
});

// ---- Register ----
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  try {
    const data = await api('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: document.getElementById('registerName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: document.getElementById('registerPassword').value
      })
    });
    onAuthSuccess(data);
  } catch (err) {
    authError.textContent = err.message;
  }
});

// ---- Login ----
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: document.getElementById('loginEmail').value.trim(),
        password: document.getElementById('loginPassword').value
      })
    });
    onAuthSuccess(data);
  } catch (err) {
    authError.textContent = err.message;
  }
});

logoutBtn.addEventListener('click', () => {
  setToken(null);
  currentUser = null;
  renderAuthState();
});

function onAuthSuccess(data) {
  setToken(data.token);
  currentUser = data.user;
  renderAuthState();
  loadMyUrls();
}

function renderAuthState() {
  if (currentUser) {
    authStatus.textContent = `Signed in as ${currentUser.name} (${currentUser.role})`;
    authCard.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    myUrlsCard.classList.remove('hidden');
  } else {
    authStatus.textContent = 'Not signed in';
    authCard.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    myUrlsCard.classList.add('hidden');
  }
}

async function loadMyUrls() {
  try {
    const urls = await api('/api/urls');
    urlList.innerHTML = '';
    urls.forEach((u) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${u.shortUrl}" target="_blank">${u.shortUrl}</a><span>${u.clicks} clicks</span>`;
      urlList.appendChild(li);
    });
  } catch {
    // silently ignore if not authenticated
  }
}

async function init() {
  if (token) {
    try {
      const data = await api('/api/auth/me');
      currentUser = data.user;
      loadMyUrls();
    } catch {
      setToken(null);
    }
  }
  renderAuthState();
}

init();