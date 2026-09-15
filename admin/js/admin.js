/* ═══════════════════════════════════════
   SONIVIVA Admin Dashboard — JS
   ═══════════════════════════════════════ */

// Auth helpers
function getToken() { return localStorage.getItem('soniviva_token'); }
function getUser() { try { return JSON.parse(localStorage.getItem('soniviva_user')); } catch { return null; } }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

function adminGuard() {
  if (!getToken() || !isAdmin()) { window.location.href = '/login.html'; return false; }
  return true;
}

function logout() { localStorage.removeItem('soniviva_token'); localStorage.removeItem('soniviva_user'); window.location.href = '/login.html'; }

// API helper
async function api(endpoint, method = 'GET', body = null) {
  const opts = { method, headers: { 'Authorization': 'Bearer ' + getToken(), 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch('/api/admin' + endpoint, opts);
  if (res.status === 401 || res.status === 403) { logout(); return null; }
  return res.json();
}

// Formatting
function formatGHC(n) { return 'GH₵ ' + parseFloat(n || 0).toFixed(2); }
function formatDate(d) { if (!d) return '—'; try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; } }
function badgeHTML(status) { return `<span class="badge badge-${status}">${status}</span>`; }

// Toast
function showToast(msg, type = 'success') {
  const t = document.createElement('div'); t.className = `toast toast-${type}`; t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 3000);
}

// Modal
function openModal(id) { document.getElementById(id)?.classList.add('active'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('active'); }

// Sidebar active & mobile toggle
function initSidebar() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    if (a.getAttribute('href') === page || a.getAttribute('href') === './' && page === 'index.html') a.classList.add('active');
  });
  const user = getUser();
  const nameEl = document.getElementById('admin-name');
  if (nameEl && user) nameEl.textContent = user.name;

  // Responsive mobile sidebar handling
  const topBar = document.querySelector('.top-bar');
  const sidebar = document.querySelector('.sidebar');
  if (topBar && sidebar) {
    // Backdrop
    let backdrop = document.querySelector('.sidebar-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }

    // Toggle button in top-bar
    if (!topBar.querySelector('.sidebar-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'sidebar-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
      toggleBtn.innerHTML = '☰';
      topBar.insertBefore(toggleBtn, topBar.firstChild);

      toggleBtn.addEventListener('click', () => {
        const isOpen = sidebar.classList.toggle('open');
        backdrop.classList.toggle('active', isOpen);
      });
    }

    // Close on navigation
    sidebar.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('open');
          backdrop?.classList.remove('active');
        }
      });
    });
  }
}

// ─── Dashboard page ───
async function loadDashboard() {
  const data = await api('/stats');
  if (!data) return;
  document.getElementById('stat-revenue').textContent = formatGHC(data.totalRevenue);
  document.getElementById('stat-orders').textContent = data.totalOrders;
  document.getElementById('stat-users').textContent = data.totalUsers;
  document.getElementById('stat-products').textContent = data.totalProducts;

  const tbody = document.getElementById('recent-orders-body');
  if (tbody) {
    if (data.recentOrders.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-light);">No orders yet</td></tr>'; return; }
    tbody.innerHTML = data.recentOrders.map(o => `<tr>
      <td><strong>${o.order_number}</strong></td>
      <td>${o.customer_name || 'Guest'}</td>
      <td>${formatGHC(o.total)}</td>
      <td>${badgeHTML(o.status)}</td>
      <td>${formatDate(o.created_at)}</td>
    </tr>`).join('');
  }
}

// ─── Products page ───
let allProducts = [];
async function loadProducts() {
  allProducts = await api('/products') || [];
  renderProducts(allProducts);
  const cats = await api('/categories') || [];
  const sel = document.getElementById('filter-category');
  const formSel = document.getElementById('prod-category');
  if (sel) { sel.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c.name}">${c.name}</option>`).join(''); }
  if (formSel) { formSel.innerHTML = '<option value="">Select Category</option>' + cats.map(c => `<option value="${c.id}">${c.name}</option>`).join(''); }
}

function renderProducts(list) {
  const tbody = document.getElementById('products-body');
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:24px;">No products</td></tr>'; return; }
  tbody.innerHTML = list.map(p => `<tr>
    <td>${p.id}</td>
    <td><img src="${p.image_url}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><text y=%2228%22 font-size=%2224%22>${p.emoji || '📦'}</text></svg>'" alt=""></td>
    <td><strong>${p.name}</strong><br><small style="color:var(--text-light)">${p.vendor}</small></td>
    <td>${p.category_name || '—'}</td>
    <td>${formatGHC(p.price)}</td>
    <td>${p.stock}</td>
    <td>${p.featured ? '⭐' : ''}</td>
    <td><button class="btn btn-sm btn-edit" onclick="editProduct(${p.id})">Edit</button> <button class="btn btn-sm btn-delete" onclick="deleteProduct(${p.id})">Delete</button></td>
  </tr>`).join('');
}

function searchProducts() {
  const q = document.getElementById('search-products')?.value.toLowerCase() || '';
  const cat = document.getElementById('filter-category')?.value || '';
  let list = allProducts;
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
  if (cat) list = list.filter(p => p.category_name === cat);
  renderProducts(list);
}

function openAddProduct() {
  document.getElementById('modal-title').textContent = 'Add Product';
  document.getElementById('product-form').reset();
  document.getElementById('edit-product-id').value = '';
  openModal('product-modal');
}

function editProduct(id) {
  const p = allProducts.find(x => x.id === id);
  if (!p) return;
  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('edit-product-id').value = p.id;
  document.getElementById('prod-name').value = p.name;
  document.getElementById('prod-price').value = p.price;
  document.getElementById('prod-category').value = p.category_id || '';
  document.getElementById('prod-unit').value = p.unit || '';
  document.getElementById('prod-vendor').value = p.vendor || '';
  document.getElementById('prod-stock').value = p.stock;
  document.getElementById('prod-image').value = p.image_url || '';
  document.getElementById('prod-emoji').value = p.emoji || '';
  document.getElementById('prod-description').value = p.description || '';
  document.getElementById('prod-featured').checked = p.featured == 1;
  openModal('product-modal');
}

async function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('edit-product-id').value;
  const body = {
    name: document.getElementById('prod-name').value,
    price: document.getElementById('prod-price').value,
    category_id: document.getElementById('prod-category').value || null,
    unit: document.getElementById('prod-unit').value,
    vendor: document.getElementById('prod-vendor').value,
    stock: document.getElementById('prod-stock').value,
    image_url: document.getElementById('prod-image').value,
    emoji: document.getElementById('prod-emoji').value,
    description: document.getElementById('prod-description').value,
    featured: document.getElementById('prod-featured').checked
  };
  const res = id ? await api(`/products/${id}`, 'PUT', body) : await api('/products', 'POST', body);
  if (res) { showToast(id ? 'Product updated' : 'Product created'); closeModal('product-modal'); loadProducts(); }
}

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  const res = await api(`/products/${id}`, 'DELETE');
  if (res) { showToast('Product deleted'); loadProducts(); }
}

// ─── Orders page ───
let allOrders = [];
async function loadOrders(status = '') {
  allOrders = await api('/orders' + (status ? `?status=${status}` : '')) || [];
  renderOrders(allOrders);
}

function renderOrders(list) {
  const tbody = document.getElementById('orders-body');
  if (!tbody) return;
  if (list.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;">No orders</td></tr>'; return; }
  tbody.innerHTML = list.map(o => `<tr onclick="toggleOrderDetail('detail-${o.id}')" style="cursor:pointer">
    <td><strong>${o.order_number}</strong></td>
    <td>${o.customer_name || 'Guest'}</td>
    <td>${o.items?.length || 0}</td>
    <td>${formatGHC(o.total)}</td>
    <td>${badgeHTML(o.status)}</td>
    <td>${formatDate(o.created_at)}</td>
    <td><select onchange="updateOrderStatus(${o.id}, this.value); event.stopPropagation();" class="filter-select" style="font-size:0.78rem;">
      <option value="">Change...</option>
      ${['pending','confirmed','processing','shipped','delivered','cancelled'].map(s => `<option value="${s}" ${s===o.status?'disabled':''}>${s}</option>`).join('')}
    </select></td>
  </tr>
  <tr class="order-detail" id="detail-${o.id}"><td colspan="7">
    <strong>Items:</strong><ul class="order-items-list">${(o.items||[]).map(i => `<li>${i.product_name} × ${i.quantity} — ${formatGHC(i.total)}</li>`).join('')}</ul>
    <p style="margin-top:8px;font-size:0.82rem;"><strong>Ship to:</strong> ${o.shipping_name}, ${o.shipping_address}, ${o.shipping_city} ${o.shipping_region}</p>
    <p style="font-size:0.82rem;"><strong>Payment:</strong> ${o.payment_method || '—'}</p>
  </td></tr>`).join('');
}

function toggleOrderDetail(id) { document.getElementById(id)?.classList.toggle('active'); }

async function updateOrderStatus(id, status) {
  if (!status) return;
  const res = await api(`/orders/${id}/status`, 'PUT', { status });
  if (res) { showToast('Status updated'); loadOrders(); }
}

function filterOrders(status) {
  document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  loadOrders(status === 'all' ? '' : status);
}

// ─── Users page ───
async function loadUsers() {
  const users = await api('/users') || [];
  const tbody = document.getElementById('users-body');
  if (!tbody) return;
  if (users.length === 0) { tbody.innerHTML = '<tr><td colspan="7">No users</td></tr>'; return; }
  tbody.innerHTML = users.map(u => `<tr>
    <td>${u.id}</td>
    <td><strong>${u.name}</strong></td>
    <td>${u.email}</td>
    <td>${u.phone || '—'}</td>
    <td>${badgeHTML(u.role)}</td>
    <td>${formatDate(u.created_at)}</td>
    <td>${u.role === 'admin' && u.id === getUser()?.id ? '—' : `
      <button class="btn btn-sm btn-edit" onclick="toggleRole(${u.id},'${u.role === 'admin' ? 'user' : 'admin'}')">${u.role === 'admin' ? 'Demote' : 'Promote'}</button>
      <button class="btn btn-sm btn-delete" onclick="deleteUser(${u.id})">Delete</button>`}
    </td>
  </tr>`).join('');
}

async function toggleRole(id, newRole) {
  if (!confirm(`Change this user to ${newRole}?`)) return;
  const res = await api(`/users/${id}/role`, 'PUT', { role: newRole });
  if (res?.error) { showToast(res.error, 'error'); return; }
  if (res) { showToast('Role updated'); loadUsers(); }
}

async function deleteUser(id) {
  if (!confirm('Delete this user permanently?')) return;
  const res = await api(`/users/${id}`, 'DELETE');
  if (res?.error) { showToast(res.error, 'error'); return; }
  if (res) { showToast('User deleted'); loadUsers(); }
}

// ─── Categories page ───
async function loadCategories() {
  const cats = await api('/categories') || [];
  const grid = document.getElementById('categories-grid');
  if (!grid) return;
  grid.innerHTML = cats.map(c => `<div class="category-card-admin">
    <span class="cat-emoji">${c.emoji || '📁'}</span>
    <div class="cat-info"><h4>${c.name}</h4><p>${c.product_count || 0} products</p></div>
    <div class="cat-actions">
      <button class="btn btn-sm btn-edit" onclick="editCategory(${c.id},'${c.name}','${c.emoji||''}')">Edit</button>
      <button class="btn btn-sm btn-delete" onclick="deleteCategory(${c.id})">Delete</button>
    </div>
  </div>`).join('');
}

function openAddCategory() {
  document.getElementById('cat-form')?.reset();
  document.getElementById('edit-cat-id').value = '';
  document.getElementById('cat-modal-title').textContent = 'Add Category';
  openModal('category-modal');
}

function editCategory(id, name, emoji) {
  document.getElementById('edit-cat-id').value = id;
  document.getElementById('cat-name').value = name;
  document.getElementById('cat-emoji').value = emoji;
  document.getElementById('cat-modal-title').textContent = 'Edit Category';
  openModal('category-modal');
}

async function saveCategory(e) {
  e.preventDefault();
  const id = document.getElementById('edit-cat-id').value;
  const body = { name: document.getElementById('cat-name').value, emoji: document.getElementById('cat-emoji').value };
  const res = id ? await api(`/categories/${id}`, 'PUT', body) : await api('/categories', 'POST', body);
  if (res) { showToast(id ? 'Updated' : 'Created'); closeModal('category-modal'); loadCategories(); }
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  const res = await api(`/categories/${id}`, 'DELETE');
  if (res?.error) { showToast(res.error, 'error'); return; }
  if (res) { showToast('Deleted'); loadCategories(); }
}

// ─── Mobile sidebar toggle ───
function toggleSidebar() { document.querySelector('.sidebar')?.classList.toggle('open'); }

// Init
document.addEventListener('DOMContentLoaded', () => { if (!adminGuard()) return; initSidebar(); });
