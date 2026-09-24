/* =========================================
   SONIVIVA — Chatbot Widget
   Smart FAQ chatbot with live WhatsApp escalation
   ========================================= */

(function() {
  'use strict';

  const ADMIN_WHATSAPP = '233597118637';
  const STORE_NAME = 'SONIVIVA';

  // ─── FAQ Knowledge Base ───
  const faqs = [
    {
      keywords: ['delivery', 'deliver', 'shipping', 'ship', 'how long', 'when will', 'arrive'],
      q: 'How long does delivery take?',
      a: 'We deliver within <strong>24 hours</strong> in Accra and surrounding areas. For other regions in Ghana, delivery takes <strong>2-3 business days</strong>. Delivery fee is <strong>GH₵ 15.00</strong>.'
    },
    {
      keywords: ['payment', 'pay', 'momo', 'mobile money', 'cash', 'how to pay', 'mtn'],
      q: 'What payment methods do you accept?',
      a: 'We accept <strong>Mobile Money (MTN, Vodafone, AirtelTigo)</strong>, <strong>Cash on Delivery</strong>, and <strong>Bank Transfer</strong>. You can choose your preferred method at checkout.'
    },
    {
      keywords: ['return', 'refund', 'exchange', 'damaged', 'broken', 'wrong'],
      q: 'Can I return or get a refund?',
      a: 'Yes! If you receive damaged or wrong items, contact us within <strong>24 hours</strong> of delivery. We will arrange a replacement or full refund. Call us at <strong>0256322653</strong> or WhatsApp <strong>0597118637</strong>.'
    },
    {
      keywords: ['order', 'track', 'status', 'where is', 'my order'],
      q: 'How do I track my order?',
      a: 'After placing your order, you\'ll receive an order number. You can check your order status in your <a href="profile.html" style="color:#2E7D32; font-weight:600;">Profile page</a>, or contact us on WhatsApp with your order number for a quick update.'
    },
    {
      keywords: ['account', 'sign up', 'register', 'login', 'log in', 'sign in'],
      q: 'How do I create an account?',
      a: 'Click <a href="register.html" style="color:#2E7D32; font-weight:600;">Sign Up</a> and enter your email and password. You can also sign in with <strong>Google</strong> for a faster experience! No account needed to browse — you can shop as a guest too.'
    },
    {
      keywords: ['hamper', 'gift', 'gift basket', 'food hamper', 'bundle'],
      q: 'What are Food Hampers?',
      a: 'Our <a href="hampers.html" style="color:#2E7D32; font-weight:600;">Food Hampers</a> are beautifully curated gift baskets packed with premium Ghanaian foodstuffs. Perfect for holidays, celebrations, or gifting to loved ones! Prices range from <strong>GH₵ 150 - GH₵ 500</strong>.'
    },
    {
      keywords: ['contact', 'phone', 'call', 'email', 'reach', 'whatsapp', 'number'],
      q: 'How can I contact you?',
      a: '📞 Call: <strong>0256322653</strong><br>💬 WhatsApp: <strong>0597118637</strong><br>✉️ Email: <strong>dappahsonnia@gmail.com</strong><br>Or visit our <a href="contact.html" style="color:#2E7D32; font-weight:600;">Contact page</a>!'
    },
    {
      keywords: ['fresh', 'perishable', 'expire', 'shelf life', 'quality'],
      q: 'Are your products fresh?',
      a: 'Absolutely! 🌿 We source directly from local farms and trusted suppliers across Ghana. Perishable items are packed and delivered the <strong>same day</strong> to ensure maximum freshness. All products have quality checks before dispatch.'
    },
    {
      keywords: ['minimum', 'order', 'minimum order', 'how much'],
      q: 'Is there a minimum order amount?',
      a: 'No minimum order! 🎉 You can order as little as one item. However, a flat delivery fee of <strong>GH₵ 15.00</strong> applies to all orders.'
    },
    {
      keywords: ['location', 'where', 'address', 'accra', 'ghana', 'located'],
      q: 'Where are you located?',
      a: '📍 We\'re based at <strong>24 Independence Ave, Accra, Ghana</strong>. We deliver nationwide across all regions of Ghana!'
    },
    {
      keywords: ['price', 'expensive', 'cheap', 'cost', 'affordable'],
      q: 'Are your prices affordable?',
      a: 'We pride ourselves on offering <strong>competitive market prices</strong>! Our products range from as low as <strong>GH₵ 5</strong> to premium items. Browse our <a href="shop.html" style="color:#2E7D32; font-weight:600;">Shop</a> to see all prices.'
    },
    {
      keywords: ['bulk', 'wholesale', 'large order', 'quantity', 'business'],
      q: 'Do you offer bulk/wholesale orders?',
      a: 'Yes! For bulk orders and wholesale inquiries, please contact us directly on WhatsApp at <strong>0597118637</strong> or call <strong>0256322653</strong>. We offer special pricing for large quantities.'
    }
  ];

  // Quick action buttons shown initially
  const quickActions = [
    { label: '🚚 Delivery Info', query: 'delivery' },
    { label: '💳 Payment Methods', query: 'payment' },
    { label: '📞 Contact Us', query: 'contact' },
    { label: '🎁 Food Hampers', query: 'hamper' },
    { label: '📦 Track Order', query: 'track my order' },
    { label: '🔄 Returns & Refunds', query: 'return refund' }
  ];

  // ─── Find best FAQ match ───
  function findAnswer(input) {
    const words = input.toLowerCase().replace(/[?!.,]/g, '').split(/\s+/);
    let bestMatch = null;
    let bestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      for (const keyword of faq.keywords) {
        for (const word of words) {
          if (word.length >= 3 && keyword.includes(word)) score += 2;
          if (keyword.includes(word)) score += 1;
        }
        if (input.toLowerCase().includes(keyword)) score += 3;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = faq;
      }
    }

    return bestScore >= 3 ? bestMatch : null;
  }

  // ─── Generate bot response ───
  function getBotResponse(input) {
    const lower = input.toLowerCase().trim();

    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|yo|sup)\b/.test(lower)) {
      return 'Hello! 👋 Welcome to <strong>' + STORE_NAME + '</strong>! I\'m your shopping assistant. How can I help you today?';
    }
    if (/^(thanks|thank you|thx|ty|cheers)\b/.test(lower)) {
      return 'You\'re welcome! 😊 Happy to help. Is there anything else you\'d like to know?';
    }
    if (/^(bye|goodbye|see you|ciao)\b/.test(lower)) {
      return 'Goodbye! 👋 Thank you for visiting ' + STORE_NAME + '. Happy shopping! 🛒';
    }

    var match = findAnswer(input);
    if (match) return match.a;

    return 'I\'m not sure I have the answer to that, but our team can help! 💬<br><br>' +
      '<a href="https://wa.me/' + ADMIN_WHATSAPP + '?text=' + encodeURIComponent('Hi SONIVIVA, I need help with: ' + input) + '" ' +
      'target="_blank" rel="noopener" ' +
      'style="display:inline-flex; align-items:center; gap:6px; background:#25D366; color:#fff; padding:8px 16px; border-radius:20px; text-decoration:none; font-size:13px; font-weight:600;">' +
      '💬 Chat with us on WhatsApp</a>';
  }

  // ─── Create Chat Widget ───
  function createChatWidget() {
    if (window.location.pathname.includes('/admin')) return;

    var widget = document.createElement('div');
    widget.id = 'soniviva-chatbot';
    widget.innerHTML = 
      '<button id="chat-toggle-btn" aria-label="Open chat" style="' +
        'position:fixed; bottom:24px; right:24px; z-index:99998;' +
        'width:60px; height:60px; border-radius:50%;' +
        'background: linear-gradient(135deg, #1B5E20, #2E7D32);' +
        'color:#fff; border:none; cursor:pointer;' +
        'box-shadow:0 4px 20px rgba(27,94,32,0.4);' +
        'display:flex; align-items:center; justify-content:center;' +
        'font-size:28px; transition:all 0.3s ease;' +
      '">💬</button>' +

      '<div id="chat-window" style="' +
        'display:none; position:fixed; bottom:96px; right:24px; z-index:99999;' +
        'width:370px; max-width:calc(100vw - 32px); height:520px; max-height:calc(100vh - 120px);' +
        'background:#fff; border-radius:20px;' +
        'box-shadow:0 12px 40px rgba(0,0,0,0.18);' +
        'border:1px solid #e0e0e0;' +
        'flex-direction:column; overflow:hidden;' +
        'font-family:Inter,Segoe UI,Arial,sans-serif;' +
      '">' +
        '<div style="' +
          'background:linear-gradient(135deg, #1B5E20, #2E7D32);' +
          'padding:16px 20px; display:flex; align-items:center; justify-content:space-between;' +
          'flex-shrink:0;' +
        '">' +
          '<div style="display:flex; align-items:center; gap:10px;">' +
            '<div style="width:36px; height:36px; background:rgba(255,255,255,0.2); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px;">🤖</div>' +
            '<div>' +
              '<div style="color:#fff; font-weight:700; font-size:15px;">SONIVIVA Assistant</div>' +
              '<div style="color:#A5D6A7; font-size:11px;">● Online — Ask me anything!</div>' +
            '</div>' +
          '</div>' +
          '<button id="chat-close-btn" style="background:none; border:none; color:#fff; font-size:22px; cursor:pointer; padding:4px; line-height:1;">✕</button>' +
        '</div>' +
        '<div id="chat-messages" style="' +
          'flex:1; overflow-y:auto; padding:16px; background:#f8faf8; display:flex; flex-direction:column;' +
        '"></div>' +
        '<div id="chat-quick-actions" style="' +
          'padding:10px 16px; background:#fff; border-top:1px solid #eee;' +
          'display:flex; flex-wrap:wrap; gap:6px; flex-shrink:0;' +
        '"></div>' +
        '<div style="' +
          'display:flex; align-items:center; gap:8px;' +
          'padding:12px 16px; background:#fff; border-top:1px solid #eee; flex-shrink:0;' +
        '">' +
          '<input id="chat-input" type="text" placeholder="Type your question..." ' +
            'autocomplete="off" style="' +
              'flex:1; padding:10px 14px; border:1px solid #ddd; border-radius:24px;' +
              'font-size:14px; outline:none; font-family:inherit; background:#f5f5f5;' +
            '">' +
          '<button id="chat-send-btn" style="' +
            'width:40px; height:40px; border-radius:50%;' +
            'background:#2E7D32; color:#fff; border:none; cursor:pointer;' +
            'display:flex; align-items:center; justify-content:center;' +
            'font-size:18px; flex-shrink:0;' +
          '">➤</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(widget);

    var toggleBtn = document.getElementById('chat-toggle-btn');
    var chatWindow = document.getElementById('chat-window');
    var closeBtn = document.getElementById('chat-close-btn');
    var messagesDiv = document.getElementById('chat-messages');
    var quickActionsDiv = document.getElementById('chat-quick-actions');
    var input = document.getElementById('chat-input');
    var sendBtn = document.getElementById('chat-send-btn');

    function openChat() {
      chatWindow.style.display = 'flex';
      toggleBtn.style.display = 'none';
      input.focus();
    }
    function closeChat() {
      chatWindow.style.display = 'none';
      toggleBtn.style.display = 'flex';
    }

    toggleBtn.addEventListener('click', openChat);
    closeBtn.addEventListener('click', closeChat);

    function addMessage(text, isBot) {
      var bubble = document.createElement('div');
      bubble.style.cssText = 
        'max-width:85%; padding:10px 14px; border-radius:16px;' +
        'font-size:13px; line-height:1.5; margin-bottom:10px;' +
        'word-wrap:break-word; animation:chatFadeIn 0.3s ease;' +
        (isBot 
          ? 'background:#fff; color:#333; border:1px solid #e0e0e0; border-bottom-left-radius:4px; align-self:flex-start;'
          : 'background:linear-gradient(135deg, #1B5E20, #2E7D32); color:#fff; border-bottom-right-radius:4px; align-self:flex-end; margin-left:auto;'
        );
      bubble.innerHTML = text;
      messagesDiv.appendChild(bubble);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function showTyping() {
      var typing = document.createElement('div');
      typing.id = 'chat-typing';
      typing.style.cssText = 'max-width:60px; padding:12px 16px; border-radius:16px; background:#fff; border:1px solid #e0e0e0; border-bottom-left-radius:4px; margin-bottom:10px; display:flex; gap:4px; align-items:center;';
      typing.innerHTML = '<span style="width:6px;height:6px;background:#999;border-radius:50%;animation:chatBounce 1s infinite 0s;display:inline-block;"></span><span style="width:6px;height:6px;background:#999;border-radius:50%;animation:chatBounce 1s infinite 0.2s;display:inline-block;"></span><span style="width:6px;height:6px;background:#999;border-radius:50%;animation:chatBounce 1s infinite 0.4s;display:inline-block;"></span>';
      messagesDiv.appendChild(typing);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
    function hideTyping() {
      var t = document.getElementById('chat-typing');
      if (t) t.remove();
    }

    function sendMessage(text) {
      if (!text || !text.trim()) return;
      addMessage(text.trim(), false);
      quickActionsDiv.style.display = 'none';
      showTyping();
      setTimeout(function() {
        hideTyping();
        addMessage(getBotResponse(text), true);
      }, 400 + Math.random() * 600);
    }

    sendBtn.addEventListener('click', function() {
      sendMessage(input.value);
      input.value = '';
      input.focus();
    });
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(input.value);
        input.value = '';
      }
    });

    toggleBtn.addEventListener('mouseenter', function() { toggleBtn.style.transform = 'scale(1.1)'; });
    toggleBtn.addEventListener('mouseleave', function() { toggleBtn.style.transform = 'scale(1)'; });

    // Render quick actions
    quickActions.forEach(function(action) {
      var btn = document.createElement('button');
      btn.textContent = action.label;
      btn.style.cssText = 'padding:6px 12px; border-radius:20px; border:1px solid #C8E6C9; background:#E8F5E9; color:#1B5E20; font-size:12px; cursor:pointer; font-weight:500; transition:all 0.2s; font-family:inherit; white-space:nowrap;';
      btn.addEventListener('mouseenter', function() { btn.style.background = '#C8E6C9'; });
      btn.addEventListener('mouseleave', function() { btn.style.background = '#E8F5E9'; });
      btn.addEventListener('click', function() { sendMessage(action.query); });
      quickActionsDiv.appendChild(btn);
    });

    // Welcome message
    addMessage('Hi there! 👋 I\'m your <strong>' + STORE_NAME + '</strong> shopping assistant. I can help with delivery info, payments, orders, returns, and more!<br><br>Tap a quick option below or type your question.', true);

    // CSS Animations
    if (!document.getElementById('chatbot-styles')) {
      var style = document.createElement('style');
      style.id = 'chatbot-styles';
      style.textContent = 
        '@keyframes chatFadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }' +
        '@keyframes chatBounce { 0%, 80%, 100% { transform:scale(0.6); opacity:0.5; } 40% { transform:scale(1); opacity:1; } }' +
        '#chat-input:focus { border-color:#2E7D32 !important; background:#fff !important; }' +
        '#chat-send-btn:hover { background:#1B5E20 !important; }' +
        '@media (max-width: 480px) {' +
          '#chat-window { bottom:0 !important; right:0 !important; width:100vw !important; max-width:100vw !important; height:100vh !important; max-height:100vh !important; border-radius:0 !important; }' +
          '#chat-toggle-btn { bottom:16px !important; right:16px !important; width:54px !important; height:54px !important; }' +
        '}';
      document.head.appendChild(style);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatWidget);
  } else {
    createChatWidget();
  }
})();
