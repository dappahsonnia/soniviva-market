/* =========================================
   SONIVIVA — Client-side Auth Manager
   ========================================= */

const TOKEN_KEY = 'soniviva_token';
const USER_KEY = 'soniviva_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function isAdmin() {
  const user = getUser();
  return isLoggedIn() && user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.href = '/login.html';
}

async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Unauthorized, token might be expired
    logout();
  }

  return response;
}

function updateAuthNav() {
  const navActions = document.querySelector('.nav-actions');
  const navLinks = document.querySelector('.nav-links');
  
  if (!navActions) return;

  const user = getUser();
  const loggedIn = isLoggedIn();
  
  // Rebuild nav-actions
  let authHtml = '';
  
  if (loggedIn) {
    if (isAdmin()) {
      authHtml += `<a href="/admin/" class="btn btn-sm btn-outline" style="margin-right: 10px;">Admin</a>`;
    }
    authHtml += `
      <a href="/profile.html" style="margin-right: 15px; font-weight: 500; font-size: 0.9rem;">Hi, ${user.name.split(' ')[0]}</a>
      <a href="#" onclick="logout(); return false;" style="margin-right: 15px; font-size: 0.9rem; color: var(--text-muted);">Logout</a>
    `;
  } else {
    authHtml += `
      <a href="/login.html" style="margin-right: 15px; font-size: 0.9rem; font-weight: 500;">Login</a>
      <a href="/register.html" class="btn btn-sm btn-primary" style="margin-right: 15px;">Register</a>
    `;
  }

  // Preserve cart link
  const cartHtml = `
    <a href="cart.html" class="cart-link" title="Shopping Cart">
      <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
      <span class="cart-count hidden">0</span>
    </a>
  `;
  
  navActions.innerHTML = authHtml + cartHtml;
  
  // Update cart badge right away if function exists
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
  }
}

function requireAdmin() {
  if (!isAdmin()) {
    window.location.href = '/login.html';
  }
}

document.addEventListener('DOMContentLoaded', updateAuthNav);
