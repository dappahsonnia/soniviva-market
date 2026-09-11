/* =========================================
   SONIVIVA — Cart Functionality
   ========================================= */

const CART_KEY = 'soniviva_cart';
const DELIVERY_FEE = 15.00;

// ---- Cart CRUD ----

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveCart(cart);
  showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCartPage();
}

function updateCartItemQuantity(productId, newQuantity) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);

  if (item) {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    item.quantity = Math.min(newQuantity, 20);
    saveCart(cart);
    renderCartPage();
  }
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartBadge();
  renderCartPage();
}

// ---- Cart Calculations ----

function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
  const cart = getCart();
  return cart.reduce((total, item) => {
    const product = getProductById(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
}

function getCartTotal() {
  const subtotal = getCartSubtotal();
  return subtotal > 0 ? subtotal + DELIVERY_FEE : 0;
}

// ---- Cart Badge ----

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-count');
  const count = getCartCount();

  badges.forEach(badge => {
    badge.textContent = count;
    if (count === 0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');

      // Pulse animation
      badge.style.animation = 'none';
      badge.offsetHeight; // trigger reflow
      badge.style.animation = 'pulse 0.3s ease';
    }
  });
}

// ---- Cart Page Rendering ----

function renderCartPage() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartSummaryContainer = document.getElementById('cart-summary-details');
  const cartEmptyState = document.getElementById('cart-empty');
  const cartContent = document.getElementById('cart-content');

  if (!cartItemsContainer) return;

  const cart = getCart();

  if (cart.length === 0) {
    if (cartContent) cartContent.style.display = 'none';
    if (cartEmptyState) cartEmptyState.style.display = 'block';
    return;
  }

  if (cartContent) cartContent.style.display = 'grid';
  if (cartEmptyState) cartEmptyState.style.display = 'none';

  // Render cart items
  cartItemsContainer.innerHTML = cart.map(item => {
    const product = getProductById(item.id);
    if (!product) return '';

    const gradient = categoryGradients[product.category] || 'linear-gradient(135deg, #E0E0E0, #BDBDBD)';
    const itemTotal = product.price * item.quantity;

    return `
      <div class="cart-item" data-id="${product.id}">
        <div class="cart-item-image" style="background: ${gradient}">
          <img src="${product.image}" alt="${product.name}" loading="lazy"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span class="emoji-fallback" style="display:none; align-items:center; justify-content:center; width:100%; height:100%; font-size:2rem;">${product.emoji}</span>
        </div>
        <div class="cart-item-info">
          <h4>${product.name}</h4>
          <p>${product.unit} · GH₵ ${product.price.toFixed(2)} each</p>
          <div class="quantity-selector" style="margin-top: 10px; margin-bottom: 0;">
            <button onclick="updateCartItemQuantity(${product.id}, ${item.quantity - 1})">−</button>
            <input type="number" value="${item.quantity}" min="1" max="20" readonly style="width: 45px; height: 34px; font-size: 0.88rem;">
            <button onclick="updateCartItemQuantity(${product.id}, ${item.quantity + 1})">+</button>
          </div>
        </div>
        <div class="cart-item-price">GH₵ ${itemTotal.toFixed(2)}</div>
        <button class="cart-item-remove" onclick="removeFromCart(${product.id})" title="Remove item">✕</button>
      </div>
    `;
  }).join('');

  // Render summary
  if (cartSummaryContainer) {
    const subtotal = getCartSubtotal();
    const total = getCartTotal();
    const itemCount = getCartCount();

    cartSummaryContainer.innerHTML = `
      <div class="cart-summary-row">
        <span>Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})</span>
        <span>GH₵ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row">
        <span>Delivery Fee</span>
        <span>GH₵ ${DELIVERY_FEE.toFixed(2)}</span>
      </div>
      <div class="cart-summary-row total">
        <span>Total</span>
        <span>GH₵ ${total.toFixed(2)}</span>
      </div>
    `;
  }
}

// ---- Toast Notifications ----

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}

// ---- Initialize cart badge on page load ----
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
});
