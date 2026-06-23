/* ============================================================
   ApnaKart — Static Frontend Demo Engine
   (Original project uses PHP + MySQL backend. This is a
    client-side-only version for portfolio/demo purposes.
    Cart / Wishlist / Login are simulated using localStorage.)
   ============================================================ */

// ─── PATH HELPERS ────────────────────────────────────────────────────────────
function getBasePath() {
    var path = window.location.pathname;
    if (path.indexOf('/pages/admin/') !== -1) return '../../';
    if (path.indexOf('/pages/') !== -1) return '../';
    return './';
}
var BASE = getBasePath();
var ASSETS_URL = BASE + 'assets';
var PAGES_URL  = (BASE === './') ? 'pages' : (BASE === '../' ? '.' : '..');

function imgUrl(path) {
    if (!path) return ASSETS_URL + '/images/no-image.png';
    path = path.replace(/\\/g, '/').replace(/^\/+/, '');
    if (path.indexOf('assets/') === 0) path = path.substring(7);
    return ASSETS_URL + '/' + path;
}

function fmtPrice(n) {
    return Math.round(n).toLocaleString('en-IN');
}

// ─── DEMO STORAGE (localStorage) ─────────────────────────────────────────────
var Store = {
    get cart() {
        try { return JSON.parse(localStorage.getItem('apnakart_cart') || '{}'); }
        catch(e) { return {}; }
    },
    set cart(v) { localStorage.setItem('apnakart_cart', JSON.stringify(v)); },

    get wishlist() {
        try { return JSON.parse(localStorage.getItem('apnakart_wishlist') || '[]'); }
        catch(e) { return []; }
    },
    set wishlist(v) { localStorage.setItem('apnakart_wishlist', JSON.stringify(v)); },

    get user() {
        try { return JSON.parse(localStorage.getItem('apnakart_user') || 'null'); }
        catch(e) { return null; }
    },
    set user(v) {
        if (v === null) localStorage.removeItem('apnakart_user');
        else localStorage.setItem('apnakart_user', JSON.stringify(v));
    }
};

function cartCount() {
    var cart = Store.cart, total = 0;
    for (var k in cart) total += (cart[k].qty || 0);
    return total;
}
function wishlistCount() { return Store.wishlist.length; }

function addToCart(productId, qty, size) {
    qty = qty || 1; size = size || 'M';
    var cart = Store.cart;
    var key = productId + '_' + size;
    if (cart[key]) cart[key].qty += qty;
    else cart[key] = { product_id: productId, qty: qty, size: size };
    Store.cart = cart;
    updateHeaderBadges();
}
function removeFromCart(key) {
    var cart = Store.cart;
    delete cart[key];
    Store.cart = cart;
    updateHeaderBadges();
}
function changeCartQty(key, delta) {
    var cart = Store.cart;
    if (!cart[key]) return;
    cart[key].qty += delta;
    if (cart[key].qty < 1) delete cart[key];
    Store.cart = cart;
    updateHeaderBadges();
}

function toggleWishlist(productId) {
    productId = parseInt(productId);
    var wl = Store.wishlist;
    var idx = wl.indexOf(productId);
    var added;
    if (idx === -1) { wl.push(productId); added = true; }
    else { wl.splice(idx, 1); added = false; }
    Store.wishlist = wl;
    updateHeaderBadges();
    return added;
}
function isWishlisted(productId) {
    return Store.wishlist.indexOf(parseInt(productId)) !== -1;
}

function updateHeaderBadges() {
    var wc = document.getElementById('wishlistCount');
    if (wc) {
        var c = wishlistCount();
        wc.textContent = c;
        wc.style.display = c === 0 ? 'none' : 'inline';
    }
}

// ─── DATA HELPERS (PRODUCTS / CATEGORIES) ────────────────────────────────────
function getCategoryName(id) {
    var c = CATEGORIES.find(function(c) { return c.id === id; });
    return c ? c.name : '';
}
function getParentCategories() {
    return CATEGORIES.filter(function(c) { return c.parent_id === null; });
}
function getChildCategories(parentId) {
    return CATEGORIES.filter(function(c) { return c.parent_id === parentId; });
}
function getProductsByCategoryFilter(catId) {
    if (!catId) return PRODUCTS.slice().sort(function(a,b){ return b.id - a.id; });
    var cat = CATEGORIES.find(function(c) { return c.id === catId; });
    var ids;
    if (cat && cat.parent_id === null) {
        var children = getChildCategories(catId).map(function(c){ return c.id; });
        ids = children;
    } else {
        ids = [catId];
    }
    return PRODUCTS.filter(function(p) { return ids.indexOf(p.category_id) !== -1; })
                    .sort(function(a,b){ return b.id - a.id; });
}
function getProductById(id) {
    id = parseInt(id);
    return PRODUCTS.find(function(p) { return p.id === id; });
}
function getRelatedProducts(product, limit) {
    limit = limit || 8;
    return PRODUCTS.filter(function(p) {
        return p.category_id === product.category_id && p.id !== product.id;
    }).slice(0, limit);
}
function searchProducts(q) {
    q = q.toLowerCase();
    return PRODUCTS.filter(function(p) {
        var catName = getCategoryName(p.category_id).toLowerCase();
        return p.name.toLowerCase().indexOf(q) !== -1 || catName.indexOf(q) !== -1;
    });
}

// ─── PRODUCT CARD RENDERING ───────────────────────────────────────────────────
function productCardHTML(p) {
    var wished = isWishlisted(p.id);
    var catName = getCategoryName(p.category_id);
    var outOfStock = p.stock == 0;
    return '' +
    '<div class="product-card">' +
        '<div class="product-image">' +
            (outOfStock ? '<span class="stock-badge">Out of Stock</span>' : '') +
            '<img src="' + imgUrl(p.image) + '" alt="' + escapeHtml(p.name) + '" loading="lazy">' +
            '<button class="wishlist-btn ' + (wished ? 'active' : '') + '" data-id="' + p.id + '" onclick="handleWishlistClick(this)">' +
                '<i class="fa-solid fa-heart"></i>' +
            '</button>' +
        '</div>' +
        '<div class="product-info">' +
            '<h3>' + escapeHtml(p.name) + '</h3>' +
            '<p class="category">' + escapeHtml(catName) + '</p>' +
            '<p class="price">₹' + fmtPrice(p.price) + '</p>' +
            (outOfStock ? '<p style="color:red;font-weight:bold;">Out of Stock</p>' : '') +
            '<div class="actions">' +
                '<a href="' + PAGES_URL + '/product_details.html?id=' + p.id + '" class="btn-outline">View</a>' +
                (outOfStock
                    ? '<button class="btn-solid" disabled style="background:gray;">Out of Stock</button>'
                    : '<button class="btn-solid" onclick="addToCart(' + p.id + ',1,\'M\'); showToast(\'Added to cart\');">Add to Cart</button>') +
            '</div>' +
        '</div>' +
    '</div>';
}

function handleWishlistClick(btn) {
    var id = btn.dataset.id;
    var added = toggleWishlist(id);
    btn.classList.toggle('active', added);
    showToast(added ? 'Added to wishlist' : 'Removed from wishlist');
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
    var existing = document.getElementById('apnakartToast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.id = 'apnakartToast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
        'background:#1e3c72;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;' +
        'font-weight:600;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);opacity:0;transition:opacity .25s;';
    document.body.appendChild(t);
    requestAnimationFrame(function(){ t.style.opacity = '1'; });
    setTimeout(function() {
        t.style.opacity = '0';
        setTimeout(function(){ t.remove(); }, 300);
    }, 1800);
}

// ─── HEADER / FOOTER TEMPLATES ────────────────────────────────────────────────
function renderHeader() {
    var user = Store.user;
    var wCount = wishlistCount();

    var catDropdown = getParentCategories().map(function(cat) {
        return '<a href="' + PAGES_URL + '/products.html?cat_id=' + cat.id + '">' + escapeHtml(cat.name) + '</a>';
    }).join('');

    var userBlock = user
        ? (
            '<div class="nav-dropdown user-dropdown">' +
                '<span class="user-toggle"><i class="fa-solid fa-user"></i> ' + escapeHtml(user.name) + '</span>' +
                '<div class="dropdown-menu">' +
                    '<a href="' + PAGES_URL + '/user_profile.html"><i class="fa-solid fa-id-card"></i> My Profile</a>' +
                    '<a href="' + PAGES_URL + '/orders.html"><i class="fa-solid fa-box"></i> My Orders</a>' +
                    '<a href="#" onclick="demoLogout(); return false;" class="logout"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>' +
                '</div>' +
            '</div>'
          )
        : '<a href="' + PAGES_URL + '/login.html" class="login-btn"><i class="fa-solid fa-right-to-bracket"></i> Login</a>';

    return '' +
    '<header class="site-header">' +
        '<div class="header-inner">' +
            '<div class="logo"><a href="' + (PAGES_URL === '.' ? 'index.html' : PAGES_URL + '/index.html') + '"><img src="' + ASSETS_URL + '/images/logo.png" alt="ApnaKart"></a></div>' +
            '<button class="hamburger" id="hamburgerBtn" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>' +
            '<nav class="main-nav" id="mainNav">' +
                '<form action="' + PAGES_URL + '/search.html" method="get" class="header-search" onsubmit="return true;">' +
                    '<input type="text" name="q" placeholder="Search products..." autocomplete="off" id="searchInput">' +
                    '<button type="submit" class="fa-solid fa-magnifying-glass"></button>' +
                    '<div id="searchResults"></div>' +
                '</form>' +
                '<a href="' + PAGES_URL + '/index.html"><i class="fa-solid fa-house"></i> Home</a>' +
                '<div class="nav-dropdown">' +
                    '<span><i class="fa-solid fa-list"></i> Categories</span>' +
                    '<div class="dropdown-menu">' +
                        '<a href="' + PAGES_URL + '/products.html">All Products</a>' + catDropdown +
                    '</div>' +
                '</div>' +
                '<a href="' + PAGES_URL + '/cart.html"><i class="fa-solid fa-cart-shopping"></i> Cart</a>' +
                '<a href="' + PAGES_URL + '/wishlist.html" class="wishlist-header">' +
                    '<i class="fa-solid fa-heart"></i>' +
                    '<span id="wishlistCount" style="' + (wCount === 0 ? 'display:none;' : '') + '">' + wCount + '</span> Wishlist' +
                '</a>' +
                '<a href="' + PAGES_URL + '/contact.html"><i class="fa-solid fa-envelope"></i> Contact Us</a>' +
                userBlock +
            '</nav>' +
        '</div>' +
    '</header>';
}

function renderFooter() {
    return '' +
    '<footer class="site-footer">' +
        '<div class="footer-container">' +
            '<div class="footer-col"><h3 class="footer-logo">ApnaKart</h3><p class="footer-text">Your trusted online fashion store for premium quality clothing at affordable prices.</p></div>' +
            '<div class="footer-col"><h4>Quick Links</h4><ul>' +
                '<li><a href="' + PAGES_URL + '/index.html">Home</a></li>' +
                '<li><a href="' + PAGES_URL + '/products.html">Products</a></li>' +
                '<li><a href="' + PAGES_URL + '/cart.html">Cart</a></li>' +
                '<li><a href="' + PAGES_URL + '/wishlist.html">Wishlist</a></li>' +
            '</ul></div>' +
            '<div class="footer-col"><h4>Customer Service</h4><ul>' +
                '<li><a href="' + PAGES_URL + '/about.html">About Us</a></li>' +
                '<li><a href="' + PAGES_URL + '/contact.html">Contact Us</a></li>' +
            '</ul></div>' +
            '<div class="footer-col"><h4>Contact</h4><p>Email: support@apnakart.com</p><p>Phone: +91 9XXXX XXXXX</p></div>' +
        '</div>' +
        '<div class="footer-bottom">© 2026 ApnaKart. All Rights Reserved &nbsp;|&nbsp; <span style="opacity:.7;">Static demo build (frontend showcase only)</span></div>' +
    '</footer>';
}

function mountLayout() {
    var headerMount = document.getElementById('siteHeader');
    var footerMount = document.getElementById('siteFooter');
    if (headerMount) {
        headerMount.outerHTML = renderHeader();
        initHamburger();
        initDropdowns();
    }
    if (footerMount) footerMount.outerHTML = renderFooter();
    if ((headerMount || footerMount) && typeof onLayoutMounted === 'function') onLayoutMounted();

    var adminHeaderMount = document.getElementById('adminHeader');
    if (adminHeaderMount) {
        var key = document.body.getAttribute('data-admin-active') || '';
        mountAdminLayout(key);
    }
}

function initHamburger() {
    var hamburger = document.getElementById('hamburgerBtn');
    var mainNav   = document.getElementById('mainNav');
    if (hamburger && mainNav) {
        hamburger.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            var icon = hamburger.querySelector('i');
            icon.className = mainNav.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });
    }
}
function initDropdowns() {
    document.querySelectorAll('.nav-dropdown').forEach(function(dd) {
        dd.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('open');
        });
    });
    document.addEventListener('click', function() {
        document.querySelectorAll('.nav-dropdown').forEach(function(dd){ dd.classList.remove('open'); });
    });

    var searchInput = document.getElementById('searchInput');
    var searchResults = document.getElementById('searchResults');
    if (searchInput && searchResults) {
        var timer;
        searchInput.addEventListener('input', function() {
            var q = this.value.trim();
            clearTimeout(timer);
            if (q.length < 2) { searchResults.innerHTML = ''; return; }
            timer = setTimeout(function() {
                var results = searchProducts(q).slice(0, 6);
                if (results.length === 0) { searchResults.innerHTML = '<div style="padding:10px;font-size:13px;color:#888;">No results</div>'; return; }
                searchResults.innerHTML = results.map(function(p) {
                    return '<a href="' + PAGES_URL + '/product_details.html?id=' + p.id + '" style="display:flex;align-items:center;gap:8px;padding:8px;text-decoration:none;color:#333;">' +
                        '<img src="' + imgUrl(p.image) + '" style="width:32px;height:32px;object-fit:cover;border-radius:4px;">' +
                        '<span style="font-size:13px;">' + escapeHtml(p.name.substring(0,40)) + '</span></a>';
                }).join('');
            }, 200);
        });
        document.addEventListener('click', function(e) {
            if (!searchInput.closest('.header-search').contains(e.target)) searchResults.innerHTML = '';
        });
    }
}

// ─── DEMO AUTH ────────────────────────────────────────────────────────────────
function demoLogin(name, email) {
    Store.user = { name: name, email: email, mobile: '9000000000' };
}
function demoLogout() {
    Store.user = null;
    window.location.reload();
}
function requireDemoLogin(redirectTo) {
    if (!Store.user) {
        window.location.href = PAGES_URL + '/login.html' + (redirectTo ? ('?redirect=' + encodeURIComponent(redirectTo)) : '');
        return false;
    }
    return true;
}

// ─── ADMIN DEMO AUTH & LAYOUT ─────────────────────────────────────────────────
var ADMIN_DEMO_NAME = 'Admin';
function isAdminLoggedIn() {
    return localStorage.getItem('apnakart_admin_logged_in') === '1';
}
function adminDemoLogin() {
    localStorage.setItem('apnakart_admin_logged_in', '1');
}
function adminDemoLogout() {
    localStorage.removeItem('apnakart_admin_logged_in');
    window.location.href = (window.location.pathname.indexOf('/pages/admin/') !== -1 ? 'admin_login.html' : 'admin/admin_login.html');
}
function requireAdminLogin() {
    if (!isAdminLoggedIn()) {
        window.location.href = 'admin_login.html';
        return false;
    }
    return true;
}

function renderAdminHeader(activeKey) {
    var items = [
        { key: 'dashboard',  href: 'dashboard.html',         icon: 'fa-gauge',         label: 'Dashboard' },
        { key: 'products',   href: 'admin_products.html',    icon: 'fa-box',           label: 'Products' },
        { key: 'categories', href: 'admin_categories.html',  icon: 'fa-layer-group',   label: 'Categories' },
        { key: 'orders',     href: 'admin_orders.html',      icon: 'fa-cart-shopping', label: 'Orders' },
        { key: 'messages',   href: 'admin_messages.html',    icon: 'fa-envelope',      label: 'Messages' }
    ];
    var navLinks = items.map(function(it) {
        return '<a href="' + it.href + '" class="' + (it.key === activeKey ? 'active-admin-link' : '') + '"><i class="fa-solid ' + it.icon + '"></i> ' + it.label + '</a>';
    }).join('');

    return '' +
    '<header class="admin-header">' +
        '<div class="header-inner">' +
            '<div class="header-left">' +
                '<div class="logo"><img src="../../assets/images/logo.png" alt="ApnaKart"></div>' +
                '<span class="role">Admin Panel</span>' +
            '</div>' +
            '<nav class="header-nav">' +
                navLinks +
                '<div class="admin-profile-box" id="adminProfileBox">' +
                    '<div class="admin-profile-toggle" id="adminProfileToggle">' +
                        '<i class="fa-solid fa-user-shield"></i> ' + ADMIN_DEMO_NAME +
                        ' <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>' +
                    '</div>' +
                    '<div class="admin-profile-menu" id="adminProfileMenu">' +
                        '<a href="admin_profile.html"><i class="fa-solid fa-id-card"></i> My Profile</a>' +
                        '<a href="admin_edit_profile.html"><i class="fa-solid fa-pen"></i> Edit Profile</a>' +
                        '<a href="admin_change_password.html"><i class="fa-solid fa-key"></i> Change Password</a>' +
                        '<a href="#" class="admin-logout" onclick="adminDemoLogout(); return false;"><i class="fa-solid fa-right-from-bracket"></i> Logout</a>' +
                    '</div>' +
                '</div>' +
            '</nav>' +
        '</div>' +
    '</header>';
}

function mountAdminLayout(activeKey) {
    var headerMount = document.getElementById('adminHeader');
    if (headerMount) headerMount.outerHTML = renderAdminHeader(activeKey);
    var toggle = document.getElementById('adminProfileToggle');
    var menu = document.getElementById('adminProfileMenu');
    if (toggle && menu) {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
        document.addEventListener('click', function() { menu.classList.remove('open'); });
    }
    if (typeof onAdminLayoutMounted === 'function') onAdminLayoutMounted();
}

document.addEventListener('DOMContentLoaded', mountLayout);
