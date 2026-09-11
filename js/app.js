/* =========================================
   SONIVIVA — App Core Utilities
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initBackToTop();
  initNewsletterForm();
  setActiveNavLink();
});

// ---- Sticky Navbar on Scroll ----
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Check initial state
}

// ---- Mobile Menu Toggle ----
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ---- Back to Top Button ----
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- Newsletter Form ----
function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]');
    if (email && email.value.trim()) {
      showToast('Thank you for subscribing! 🎉', 'success');
      email.value = '';
    }
  });
}

// ---- Active Nav Link ----
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ---- Shop Page Initialization ----
function initShopPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');

  let currentFilters = {
    categories: categoryParam ? [decodeURIComponent(categoryParam)] : [],
    minPrice: undefined,
    maxPrice: undefined
  };
  let currentSort = 'default';
  let currentSearch = '';

  // Pre-check category filter if coming from link
  if (categoryParam) {
    const checkbox = document.querySelector(`input[data-category="${decodeURIComponent(categoryParam)}"]`);
    if (checkbox) checkbox.checked = true;
  }

  function applyFiltersAndRender() {
    let result = [...products];

    // Search
    if (currentSearch) {
      result = searchProducts(currentSearch);
    }

    // Filter
    result = filterProducts(result, currentFilters);

    // Sort
    result = sortProducts(result, currentSort);

    // Update results count
    const countEl = document.getElementById('results-count');
    if (countEl) {
      countEl.innerHTML = `Showing <strong>${result.length}</strong> of <strong>${products.length}</strong> products`;
    }

    // Render
    renderProducts(result, 'shop-products');
  }

  // Category filter
  document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const checked = document.querySelectorAll('.filter-option input[type="checkbox"]:checked');
      currentFilters.categories = Array.from(checked).map(c => c.dataset.category);
      applyFiltersAndRender();
    });
  });

  // Price range filter
  const priceSelect = document.getElementById('price-filter');
  if (priceSelect) {
    priceSelect.addEventListener('change', () => {
      const val = priceSelect.value;
      switch (val) {
        case 'under-20':
          currentFilters.minPrice = 0;
          currentFilters.maxPrice = 20;
          break;
        case '20-50':
          currentFilters.minPrice = 20;
          currentFilters.maxPrice = 50;
          break;
        case '50-100':
          currentFilters.minPrice = 50;
          currentFilters.maxPrice = 100;
          break;
        case 'over-100':
          currentFilters.minPrice = 100;
          currentFilters.maxPrice = undefined;
          break;
        default:
          currentFilters.minPrice = undefined;
          currentFilters.maxPrice = undefined;
      }
      applyFiltersAndRender();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      currentSort = sortSelect.value;
      applyFiltersAndRender();
    });
  }

  // Search
  const searchInput = document.getElementById('shop-search');
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        currentSearch = searchInput.value.trim();
        applyFiltersAndRender();
      }, 300);
    });
  }

  // Filter toggle for mobile
  const filterToggle = document.querySelector('.filter-toggle');
  const sidebar = document.querySelector('.shop-sidebar');
  if (filterToggle && sidebar) {
    filterToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      filterToggle.textContent = sidebar.classList.contains('active') ? '✕ Close Filters' : '☰ Filters';
    });
  }

  // Initial render
  applyFiltersAndRender();
}

// ---- Product Detail Page Initialization ----
function initProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = 'shop.html';
    return;
  }

  const product = getProductById(productId);
  if (!product) {
    window.location.href = 'shop.html';
    return;
  }

  renderProductDetail(product);
  renderRelatedProducts(product, 'related-products');
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Message sent successfully! We\'ll get back to you soon. 📬', 'success');
    form.reset();
  });
}

// ---- Checkout (placeholder) ----
function proceedToCheckout() {
  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}
