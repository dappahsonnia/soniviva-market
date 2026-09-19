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
  window.location.href = 'login.html';
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
    // Avoid infinite redirect loop — only logout if not already on login page
    const currentPage = window.location.pathname.split('/').pop() || '';
    if (currentPage !== 'login.html' && currentPage !== 'login' && currentPage !== 'register.html' && currentPage !== 'register') {
      logout();
    }
  }

  return response;
}

function updateAuthNav() {
  const navActions = document.querySelector('.nav-actions');
  const navLinks = document.querySelector('.nav-links');
  
  if (!navActions) return;

  const user = getUser();
  const loggedIn = isLoggedIn();
  
  // 1. Rebuild desktop & mobile nav-actions
  let desktopAuthHtml = '<div class="desktop-auth-links">';
  if (loggedIn && user) {
    if (isAdmin()) {
      desktopAuthHtml += `<a href="/admin/" class="btn btn-sm btn-outline" style="margin-right: 6px;">Admin</a>`;
    }
    const displayName = (user.name || 'Account').split(' ')[0];
    desktopAuthHtml += `
      <a href="profile.html" class="nav-profile-link" style="font-weight: 600; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 4px;">
        <span style="font-size: 1rem;">👤</span> <span class="nav-user-name">${escapeHtml(displayName)}</span>
      </a>
      <a href="#" onclick="logout(); return false;" class="nav-logout-btn" style="font-size: 0.84rem; color: var(--text-muted); margin-left: 4px;">Logout</a>
    `;
  } else {
    desktopAuthHtml += `
      <a href="login.html" class="nav-login-link" style="font-size: 0.88rem; font-weight: 600; color: var(--text);">Login</a>
      <a href="register.html" class="btn btn-sm btn-primary nav-register-btn" style="border-radius: 50px;">Register</a>
    `;
  }
  desktopAuthHtml += '</div>';

  // 2. Preserve cart link
  const cartHtml = `
    <a href="cart.html" class="cart-link" title="Shopping Cart">
      <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
      <span class="cart-count hidden">0</span>
    </a>
  `;
  
  navActions.innerHTML = desktopAuthHtml + cartHtml;
  
  // Update cart badge right away if function exists
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  // 3. Populate Mobile Menu (the three lines beside cart button) with rich profile information
  if (navLinks) {
    let profileWrapper = navLinks.querySelector('.mobile-nav-profile-wrapper');
    if (!profileWrapper) {
      profileWrapper = document.createElement('li');
      profileWrapper.className = 'mobile-nav-profile-wrapper';
      navLinks.insertBefore(profileWrapper, navLinks.firstChild);
    }

    renderMobileProfile(user, profileWrapper);

    // If logged in, fetch latest profile in background to get updated phone/city/address
    if (loggedIn) {
      authFetch('/api/user/profile')
        .then(res => res.ok ? res.json() : null)
        .then(freshData => {
          if (freshData && freshData.id) {
            const merged = { ...user, ...freshData };
            localStorage.setItem(USER_KEY, JSON.stringify(merged));
            renderMobileProfile(merged, profileWrapper);
          }
        })
        .catch(() => {});
    }
  }
}

function renderMobileProfile(user, container) {
  if (!container) return;
  const loggedIn = user && user.email;

  if (loggedIn) {
    const initial = (user.name || user.email || 'U').trim().charAt(0).toUpperCase();
    const isAdminUser = user.role === 'admin';
    const roleBadge = isAdminUser
      ? '<span class="mobile-profile-badge admin">👑 Administrator</span>'
      : '<span class="mobile-profile-badge customer">🌿 Customer Account</span>';

    const locationParts = [user.city, user.region].filter(Boolean);
    const locationStr = locationParts.join(', ');

    container.innerHTML = `
      <div class="mobile-profile-card">
        <div class="mobile-profile-header">
          <div class="mobile-profile-avatar">${escapeHtml(initial)}</div>
          <div class="mobile-profile-info">
            <div class="mobile-profile-name">${escapeHtml(user.name || 'Valued Customer')}</div>
            <div class="mobile-profile-email">${escapeHtml(user.email)}</div>
            ${roleBadge}
          </div>
        </div>
        ${user.phone ? `<div class="mobile-profile-meta"><span class="meta-icon">📞</span><span>${escapeHtml(user.phone)}</span></div>` : ''}
        ${locationStr ? `<div class="mobile-profile-meta"><span class="meta-icon">📍</span><span>${escapeHtml(locationStr)}</span></div>` : ''}
        
        <div class="mobile-profile-actions">
          ${isAdminUser ? '<a href="/admin/" class="mobile-profile-btn admin-btn">⚙️ Admin Dashboard</a>' : ''}
          <a href="profile.html" class="mobile-profile-btn">👤 My Profile</a>
          <a href="profile.html" class="mobile-profile-btn">📦 My Orders</a>
          <button type="button" onclick="logout()" class="mobile-profile-btn logout-btn">🚪 Sign Out</button>
        </div>
      </div>
      <div class="mobile-nav-divider"><span>STORE MENU</span></div>
    `;
  } else {
    container.innerHTML = `
      <div class="mobile-profile-card guest">
        <div class="mobile-profile-header">
          <div class="mobile-profile-avatar guest">👤</div>
          <div class="mobile-profile-info">
            <div class="mobile-profile-name">Welcome to SONIVIVA</div>
            <div class="mobile-profile-email">Sign in to track orders & shop faster</div>
          </div>
        </div>
        <div class="mobile-auth-btn-row">
          <a href="login.html" class="btn btn-sm btn-outline">Login</a>
          <a href="register.html" class="btn btn-sm btn-primary">Register</a>
        </div>
      </div>
      <div class="mobile-nav-divider"><span>STORE MENU</span></div>
    `;
  }

  // Bind closeMenu on any link in the mobile profile card
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    container.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function togglePasswordVisibility(inputId, toggleBtn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    toggleBtn.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
    toggleBtn.innerHTML = isPassword ? `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
      </svg>
    ` : `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    `;
  }
}

// ==========================================
// Authentication Guards (Protected Pages)
// ==========================================

function getCurrentPageName() {
  const cleanPath = (window.location.pathname || '').replace(/\\/g, '/');
  const page = cleanPath.split('/').pop().toLowerCase() || 'index.html';
  return page;
}

function requireAuth() {
  if (!isLoggedIn()) {
    const target = getCurrentPageName() + (window.location.search || '');
    window.location.replace(`login.html?redirect=${encodeURIComponent(target)}`);
  }
}

function requireAdmin() {
  if (!isAdmin()) {
    window.location.replace('login.html?msg=admin_required');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    updateAuthNav();
  });
} else {
  updateAuthNav();
}
