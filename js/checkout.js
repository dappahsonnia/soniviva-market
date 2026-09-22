/* =========================================
   SONIVIVA — Checkout System
   Multi-step: Shipping → Payment → Review → Confirmation
   ========================================= */

// ─── State ───
let checkoutData = {
  shipping: {},
  payment: {},
  orderNumber: null
};

let currentStep = 1;
const TOTAL_STEPS = 4;

// Ghana regions
const ghanaRegions = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Volta', 'Upper East', 'Upper West', 'Bono',
  'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti',
  'Western North'
];

// ─── Initialize Checkout ───
function initCheckout() {
  const cart = getCart();

  // Redirect if cart is empty
  if (cart.length === 0) {
    window.location.href = 'cart.html';
    return;
  }

  populateRegionDropdown();
  renderOrderItems();
  updateStepIndicator();
  showStep(1);

  // Autofill shipping if logged in
  if (typeof getUser === 'function') {
    const user = getUser();
    if (user) {
      const nameEl = document.getElementById('ship-name');
      const emailEl = document.getElementById('ship-email');
      const phoneEl = document.getElementById('ship-phone');
      const addrEl = document.getElementById('ship-address');
      const cityEl = document.getElementById('ship-city');
      const regEl = document.getElementById('ship-region');

      if (nameEl && !nameEl.value && user.name) nameEl.value = user.name;
      if (emailEl && !emailEl.value && user.email) emailEl.value = user.email;
      if (phoneEl && !phoneEl.value && user.phone) phoneEl.value = user.phone;
      if (addrEl && !addrEl.value && user.address) addrEl.value = user.address;
      if (cityEl && !cityEl.value && user.city) cityEl.value = user.city;
      if (regEl && !regEl.value && user.region) regEl.value = user.region;
    }
  }
}

// ─── Step Navigation ───
function showStep(step) {
  // Hide all steps
  document.querySelectorAll('.checkout-step').forEach(el => {
    el.classList.remove('active');
  });

  // Show target step
  const targetStep = document.getElementById(`step-${step}`);
  if (targetStep) {
    targetStep.classList.add('active');
  }

  currentStep = step;
  updateStepIndicator();
  updateNavigationButtons();

  // Scroll to top of checkout
  const checkoutSection = document.querySelector('.checkout-section');
  if (checkoutSection) {
    checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function nextStep() {
  if (currentStep === 1 && !validateShipping()) return;
  if (currentStep === 2 && !validatePayment()) return;

  if (currentStep === 2) {
    collectShippingData();
    collectPaymentData();
    renderReviewStep();
  }

  if (currentStep === 3) {
    placeOrder();
    return;
  }

  if (currentStep < TOTAL_STEPS) {
    showStep(currentStep + 1);
  }
}

function prevStep() {
  if (currentStep > 1) {
    showStep(currentStep - 1);
  }
}

// ─── Step Indicator ───
function updateStepIndicator() {
  document.querySelectorAll('.step-item').forEach((item, index) => {
    const stepNum = index + 1;
    item.classList.remove('active', 'completed');

    if (stepNum === currentStep) {
      item.classList.add('active');
    } else if (stepNum < currentStep) {
      item.classList.add('completed');
    }
  });

  // Update progress bar
  const progressFill = document.querySelector('.progress-fill');
  if (progressFill) {
    const percent = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    progressFill.style.width = `${percent}%`;
  }
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const navButtons = document.querySelector('.checkout-nav');

  if (currentStep === 4) {
    if (navButtons) navButtons.style.display = 'none';
    return;
  }

  if (navButtons) navButtons.style.display = 'flex';
  if (prevBtn) prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

  if (nextBtn) {
    if (currentStep === 3) {
      nextBtn.innerHTML = '🛒 Place Order';
      nextBtn.classList.add('btn-accent');
      nextBtn.classList.remove('btn-primary');
    } else {
      nextBtn.innerHTML = 'Continue →';
      nextBtn.classList.add('btn-primary');
      nextBtn.classList.remove('btn-accent');
    }
  }
}

// ─── Populate Region Dropdown ───
function populateRegionDropdown() {
  const select = document.getElementById('ship-region');
  if (!select) return;

  ghanaRegions.forEach(region => {
    const option = document.createElement('option');
    option.value = region;
    option.textContent = region;
    select.appendChild(option);
  });
}

// ─── Render Order Items Sidebar ───
function renderOrderItems() {
  const container = document.getElementById('checkout-items');
  const summaryContainer = document.getElementById('checkout-summary-totals');
  if (!container) return;

  const cart = getCart();
  const subtotal = getCartSubtotal();
  const total = getCartTotal();
  const itemCount = getCartCount();

  container.innerHTML = cart.map(item => {
    const product = getProductById(item.id);
    if (!product) return '';
    const gradient = categoryGradients[product.category] || 'linear-gradient(135deg, #E0E0E0, #BDBDBD)';
    return `
      <div class="checkout-item">
        <div class="checkout-item-img" style="background: ${gradient}">
          <img src="${product.image}" alt="${product.name}" loading="lazy"
               onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <span class="emoji-fallback" style="display:none; align-items:center; justify-content:center; width:100%; height:100%; font-size:1.2rem;">${product.emoji}</span>
          <span class="checkout-item-qty">${item.quantity}</span>
        </div>
        <div class="checkout-item-info">
          <span class="checkout-item-name">${product.name}</span>
          <span class="checkout-item-unit">${product.unit}</span>
        </div>
        <span class="checkout-item-price">GH₵ ${(product.price * item.quantity).toFixed(2)}</span>
      </div>
    `;
  }).join('');

  if (summaryContainer) {
    summaryContainer.innerHTML = `
      <div class="checkout-summary-row">
        <span>Subtotal (${itemCount} item${itemCount !== 1 ? 's' : ''})</span>
        <span>GH₵ ${subtotal.toFixed(2)}</span>
      </div>
      <div class="checkout-summary-row">
        <span>Delivery Fee</span>
        <span>GH₵ ${DELIVERY_FEE.toFixed(2)}</span>
      </div>
      <div class="checkout-summary-row total">
        <span>Total</span>
        <span>GH₵ ${total.toFixed(2)}</span>
      </div>
    `;
  }
}

// ─── Validation ───
function validateShipping() {
  const fields = [
    { id: 'ship-name', label: 'Full Name' },
    { id: 'ship-email', label: 'Email Address' },
    { id: 'ship-phone', label: 'Phone Number' },
    { id: 'ship-address', label: 'Street Address' },
    { id: 'ship-city', label: 'City' },
    { id: 'ship-region', label: 'Region' }
  ];

  let isValid = true;

  // Clear previous errors
  document.querySelectorAll('.field-error').forEach(el => el.remove());
  document.querySelectorAll('.form-group.error').forEach(el => el.classList.remove('error'));

  fields.forEach(field => {
    const input = document.getElementById(field.id);
    if (!input || !input.value.trim()) {
      showFieldError(input, `${field.label} is required`);
      isValid = false;
    }
  });

  // Email validation
  const email = document.getElementById('ship-email');
  if (email && email.value.trim() && !isValidEmail(email.value)) {
    showFieldError(email, 'Please enter a valid email address');
    isValid = false;
  }

  // Phone validation
  const phone = document.getElementById('ship-phone');
  if (phone && phone.value.trim() && phone.value.trim().length < 10) {
    showFieldError(phone, 'Please enter a valid phone number');
    isValid = false;
  }

  if (!isValid) {
    showToast('Please fill in all required fields', 'error');
  }

  return isValid;
}

function validatePayment() {
  const selectedMethod = document.querySelector('input[name="payment-method"]:checked');

  if (!selectedMethod) {
    showToast('Please select a payment method', 'error');
    return false;
  }

  // If MoMo, validate phone
  if (selectedMethod.value === 'momo') {
    const momoPhone = document.getElementById('momo-phone');
    const momoProvider = document.getElementById('momo-provider');

    if (!momoProvider || !momoProvider.value) {
      showToast('Please select a mobile money provider', 'error');
      return false;
    }

    if (!momoPhone || !momoPhone.value.trim() || momoPhone.value.trim().length < 10) {
      showFieldError(momoPhone, 'Please enter a valid MoMo number');
      showToast('Please enter a valid MoMo number', 'error');
      return false;
    }
  }

  return true;
}

function showFieldError(input, message) {
  if (!input) return;
  const group = input.closest('.form-group');
  if (group) {
    group.classList.add('error');
    const existing = group.querySelector('.field-error');
    if (!existing) {
      const error = document.createElement('span');
      error.className = 'field-error';
      error.textContent = message;
      group.appendChild(error);
    }
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Collect Data ───
function collectShippingData() {
  checkoutData.shipping = {
    name: document.getElementById('ship-name').value.trim(),
    email: document.getElementById('ship-email').value.trim(),
    phone: document.getElementById('ship-phone').value.trim(),
    address: document.getElementById('ship-address').value.trim(),
    address2: document.getElementById('ship-address2')?.value.trim() || '',
    city: document.getElementById('ship-city').value.trim(),
    region: document.getElementById('ship-region').value,
    gps: document.getElementById('ship-gps')?.value.trim() || '',
    notes: document.getElementById('ship-notes')?.value.trim() || ''
  };
}

function collectPaymentData() {
  const method = document.querySelector('input[name="payment-method"]:checked');
  checkoutData.payment = {
    method: method ? method.value : '',
    label: method ? method.closest('.payment-option').querySelector('.payment-label').textContent : ''
  };

  if (checkoutData.payment.method === 'momo') {
    checkoutData.payment.provider = document.getElementById('momo-provider')?.value || '';
    checkoutData.payment.momoPhone = document.getElementById('momo-phone')?.value.trim() || '';
  }
}

// ─── Payment Method Toggle ───
function selectPaymentMethod(method) {
  document.querySelectorAll('.payment-option').forEach(opt => {
    opt.classList.remove('selected');
  });

  const selectedOption = document.querySelector(`input[value="${method}"]`);
  if (selectedOption) {
    selectedOption.checked = true;
    selectedOption.closest('.payment-option').classList.add('selected');
  }

  // Show/hide MoMo details
  const momoDetails = document.getElementById('momo-details');
  if (momoDetails) {
    momoDetails.style.display = method === 'momo' ? 'block' : 'none';
  }
}

// ─── Render Review Step ───
function renderReviewStep() {
  const s = checkoutData.shipping;
  const p = checkoutData.payment;

  // Shipping review
  const shipReview = document.getElementById('review-shipping');
  if (shipReview) {
    shipReview.innerHTML = `
      <div class="review-card">
        <div class="review-card-header">
          <h4>📍 Shipping Details</h4>
          <button class="review-edit-btn" onclick="showStep(1)">Edit</button>
        </div>
        <div class="review-card-body">
          <p><strong>${s.name}</strong></p>
          <p>${s.address}${s.address2 ? ', ' + s.address2 : ''}</p>
          <p>${s.city}, ${s.region}</p>
          ${s.gps ? `<p>GPS: ${s.gps}</p>` : ''}
          <p>${s.phone}</p>
          <p>${s.email}</p>
          ${s.notes ? `<p class="review-notes"><em>Notes: ${s.notes}</em></p>` : ''}
        </div>
      </div>
    `;
  }

  // Payment review
  const payReview = document.getElementById('review-payment');
  if (payReview) {
    let paymentDetails = `<p><strong>${p.label}</strong></p>`;
    if (p.method === 'momo') {
      paymentDetails += `<p>${p.provider} — ${p.momoPhone}</p>`;
    } else if (p.method === 'bank') {
      paymentDetails += `<p>Bank transfer details will be sent to your email</p>`;
    } else if (p.method === 'cod') {
      paymentDetails += `<p>Pay with cash when your order arrives</p>`;
    }

    payReview.innerHTML = `
      <div class="review-card">
        <div class="review-card-header">
          <h4>💳 Payment Method</h4>
          <button class="review-edit-btn" onclick="showStep(2)">Edit</button>
        </div>
        <div class="review-card-body">
          ${paymentDetails}
        </div>
      </div>
    `;
  }

  // Items review
  const itemsReview = document.getElementById('review-items');
  if (itemsReview) {
    const cart = getCart();
    const subtotal = getCartSubtotal();
    const total = getCartTotal();

    let itemsHTML = cart.map(item => {
      const product = getProductById(item.id);
      if (!product) return '';
      return `
        <div class="review-item">
          <span class="review-item-name">${product.name} × ${item.quantity}</span>
          <span class="review-item-price">GH₵ ${(product.price * item.quantity).toFixed(2)}</span>
        </div>
      `;
    }).join('');

    itemsReview.innerHTML = `
      <div class="review-card">
        <div class="review-card-header">
          <h4>📦 Order Items</h4>
          <button class="review-edit-btn" onclick="window.location.href='cart.html'">Edit Cart</button>
        </div>
        <div class="review-card-body">
          ${itemsHTML}
          <div class="review-divider"></div>
          <div class="review-item">
            <span>Subtotal</span>
            <span>GH₵ ${subtotal.toFixed(2)}</span>
          </div>
          <div class="review-item">
            <span>Delivery Fee</span>
            <span>GH₵ ${DELIVERY_FEE.toFixed(2)}</span>
          </div>
          <div class="review-item review-total">
            <span>Total</span>
            <span>GH₵ ${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }
}

// ─── Place Order ───
let _placingOrder = false;
async function placeOrder() {
  if (_placingOrder) return; // prevent double-click
  _placingOrder = true;

  // Disable the place order button if it exists
  const placeBtn = document.querySelector('.btn-place-order, [onclick*="placeOrder"]');
  if (placeBtn) {
    placeBtn.disabled = true;
    placeBtn.style.opacity = '0.6';
    placeBtn.textContent = 'Placing Order...';
  }

  const currentCart = getCart();
  const total = getCartTotal();

  // Generate default order number
  let orderNum = 'SNV-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();

  // Universal order sync to backend for database logging and admin notification
  const ADMIN_WHATSAPP = '233597118637';
  let serverWhatsappLink = '';

  try {
    const items = currentCart.map(i => ({ id: i.id, quantity: i.quantity }));
    const requestFn = (typeof isLoggedIn === 'function' && isLoggedIn()) 
      ? authFetch 
      : (url, opts) => fetch(url, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } });

    const res = await requestFn('/api/user/orders', {
      method: 'POST',
      body: JSON.stringify({
        items,
        shipping: checkoutData.shipping,
        payment: checkoutData.payment
      })
    });
    if (res.ok) {
      const orderData = await res.json();
      if (orderData.orderNumber) {
        orderNum = orderData.orderNumber;
      }
      if (orderData.whatsappLink) {
        serverWhatsappLink = orderData.whatsappLink;
      }
    }
  } catch (e) {
    console.warn('Backend order recording error:', e);
  }

  checkoutData.orderNumber = orderNum;

  // Build fallback WhatsApp order dispatch URL if needed
  let whatsappUrl = serverWhatsappLink;
  if (!whatsappUrl) {
    const itemsText = currentCart.map(i => {
      const p = getProductById(i.id);
      return `• ${p ? p.name : 'Product'} x${i.quantity} (GH₵ ${((p ? p.price : 0) * i.quantity).toFixed(2)})`;
    }).join('\n');
    const deliveryAddress = [checkoutData.shipping.address, checkoutData.shipping.city, checkoutData.shipping.region].filter(Boolean).join(', ');
    const msg = `🛒 *NEW ORDER RECEIVED — SONIVIVA*\n----------------------------------\n*Order Number:* ${orderNum}\n*Customer:* ${checkoutData.shipping.name || 'Customer'}\n*Phone:* ${checkoutData.shipping.phone || 'N/A'}\n*Email:* ${checkoutData.shipping.email || 'N/A'}\n*Address:* ${deliveryAddress || 'Not specified'}\n\n📦 *Items Ordered:*\n${itemsText}\n\n💰 *Subtotal:* GH₵ ${(total - DELIVERY_FEE).toFixed(2)}\n🚚 *Delivery:* GH₵ ${DELIVERY_FEE.toFixed(2)}\n💵 *TOTAL AMOUNT:* GH₵ ${total.toFixed(2)}\n💳 *Payment Method:* ${(checkoutData.payment.label || checkoutData.payment.method || 'Cash on Delivery').toUpperCase()}\n${checkoutData.shipping.notes ? `📝 *Notes:* ${checkoutData.shipping.notes}\n` : ''}----------------------------------\n_Automated Order Dispatch from Soniviva Market_`;
    whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }

  // Calculate estimated delivery
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 1);
  const deliveryStr = deliveryDate.toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Render confirmation
  const confirmation = document.getElementById('confirmation-content');
  if (confirmation) {
    const total = getCartTotal();
    confirmation.innerHTML = `
      <div class="confirmation-icon">✓</div>
      <h2>Order Placed Successfully!</h2>
      <p class="confirmation-subtitle">Thank you for shopping with SONIVIVA, <strong>${checkoutData.shipping.name}</strong>!</p>

      <div class="confirmation-details">
        <div class="confirmation-detail-row">
          <span class="detail-label">Order Number</span>
          <span class="detail-value order-number">${orderNum}</span>
        </div>
        <div class="confirmation-detail-row">
          <span class="detail-label">Total Paid</span>
          <span class="detail-value">GH₵ ${total.toFixed(2)}</span>
        </div>
        <div class="confirmation-detail-row">
          <span class="detail-label">Payment Method</span>
          <span class="detail-value">${checkoutData.payment.label}</span>
        </div>
        <div class="confirmation-detail-row">
          <span class="detail-label">Delivery To</span>
          <span class="detail-value">${checkoutData.shipping.address}, ${checkoutData.shipping.city}</span>
        </div>
        <div class="confirmation-detail-row">
          <span class="detail-label">Estimated Delivery</span>
          <span class="detail-value">${deliveryStr}</span>
        </div>
      </div>

      <!-- Admin Instant WhatsApp Dispatch -->
      <div style="background:#E8F5E9; border:2px solid #2E7D32; border-radius:14px; padding:20px; margin:24px 0; text-align:center;">
        <div style="display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px;">
          <span style="font-size:24px;">💬</span>
          <h3 style="margin:0; color:#1B5E20; font-size:1.15rem; font-weight:700;">Instant WhatsApp Dispatch</h3>
        </div>
        <p style="margin:0 0 16px; font-size:14px; color:#2E7D32; line-height:1.5;">
          Click below to send your order receipt directly to store management on WhatsApp for immediate priority dispatch!
        </p>
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn" style="display:inline-flex; align-items:center; justify-content:center; gap:10px; background:#25D366; color:#ffffff; font-weight:700; font-size:15px; padding:14px 26px; border-radius:30px; text-decoration:none; box-shadow:0 4px 14px rgba(37,211,102,0.35); transition:all 0.2s ease;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
          Send Order to WhatsApp Manager
        </a>
      </div>

      <p class="confirmation-note">
        📧 A confirmation has also been dispatched to <strong>${checkoutData.shipping.email}</strong> and store operations.
      </p>

      <div class="confirmation-actions">
        <a href="shop.html" class="btn btn-primary btn-lg">Continue Shopping →</a>
        <a href="index.html" class="btn btn-outline btn-lg">Back to Home</a>
      </div>
    `;
  }

  // Clear cart
  clearCart();

  // Show confirmation step
  showStep(4);
}

// ─── Init on DOM ready ───
document.addEventListener('DOMContentLoaded', () => {
  initCheckout();
});
