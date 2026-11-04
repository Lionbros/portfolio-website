/* ═══════════════════════════════════════════
   TAART SHOP — accordion (FAQ) + allergens + shopping cart.
   Vanilla, no dependencies. Cart persists in localStorage.
   ═══════════════════════════════════════════ */
(function () {
    'use strict';

    /* Single-open accordions */
    document.querySelectorAll('.accordion').forEach(function (box) {
        box.querySelectorAll('.accordion-trigger').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = btn.closest('.accordion-item');
                var wasOpen = item.classList.contains('is-open');
                box.querySelectorAll('.accordion-item.is-open').forEach(function (other) {
                    other.classList.remove('is-open');
                    other.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
                });
                if (!wasOpen) {
                    item.classList.add('is-open');
                    btn.setAttribute('aria-expanded', 'true');
                }
            });
        });
    });

    /* Allergen panel "Show all / Show less" toggles */
    document.querySelectorAll('[data-allergen-row]').forEach(function (row) {
        var btn = row.querySelector('.allergen-toggle');
        if (!btn) return;
        var extras = row.querySelectorAll('.pill--extra');
        if (!extras.length) {
            btn.hidden = true;
            return;
        }
        var label = btn.querySelector('.toggle-text');
        btn.addEventListener('click', function () {
            var open = row.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (label) label.textContent = open ? t('taart.allergen.hide', 'Show less') : t('taart.allergen.show', 'Show all');
        });
    });

    /* ═══════ Shopping cart ═══════ */
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var CATALOG = {
        'Appeltaart': { price: 2000, unit: '24 cm' },
        'Limburgse kruimelvlaai': { price: 2450, unit: '24 cm' },
        'Peperkoek': { price: 1250, unit: 'loaf' },
        'Gevulde koek': { price: 300, unit: 'per cookie' },
        'Roze koeken': { price: 250, unit: 'per koek' },
        'Kersentaart': { price: 2000, unit: '24 cm' },
        'Frikandelbroodje': { price: 250, unit: 'per broodje' },
        'Speculaas': { price: 150, unit: 'per koek' },
        'Brabantse worstenbroodjes': { price: 300, unit: 'per piece' },
        'Kaneelbroodjes': { price: 1200, unit: 'box of 4' },
        'Tiramisu': { price: 2200, unit: 'whole tray' },
        'Chocolate Chip Cookies': { price: 250, unit: 'per cookie' },
        'Krentenbollen': { price: 200, unit: 'per bun' }
    };
    var CART_KEY = 'tvm-cart-v1';

    var fab = document.getElementById('cartFab');
    var countBadge = document.getElementById('cartCount');
    var panel = document.getElementById('cartPanel');
    var backdrop = document.getElementById('cartBackdrop');
    var linesBox = document.getElementById('cartLines');
    var emptyNote = document.getElementById('cartEmpty');
    var grandBox = document.getElementById('cartGrand');
    var orderBtn = document.getElementById('cartOrder');
    var closeBtn = document.getElementById('cartClose');
    var summaryBox = document.getElementById('cartSummary');
    var linesField = document.getElementById('orderLines');
    var totalField = document.getElementById('orderTotal');
    var errorNote = document.getElementById('cartError');
    var form = document.getElementById('contact-form');
    var submitBtn = form ? form.querySelector('[type="submit"]') : null;

    function loadCart() {
        try {
            var raw = localStorage.getItem(CART_KEY);
            if (!raw) return {};
            var parsed = JSON.parse(raw);
            var clean = {};
            Object.keys(parsed).forEach(function (id) {
                if (CATALOG[id] && parsed[id] > 0) {
                    clean[id] = Math.min(99, Math.floor(parsed[id]));
                }
            });
            return clean;
        } catch (err) {
            return {};
        }
    }
    var cart = loadCart();

    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (err) {
            /* storage unavailable — cart still works for this visit */
        }
    }
    function fmt(cents) {
        return '\u20AC' + (cents / 100).toFixed(2).replace('.', ',');
    }
    function cartIds() {
        return Object.keys(cart).filter(function (id) { return cart[id] > 0; });
    }
    function cartCount() {
        return cartIds().reduce(function (sum, id) { return sum + cart[id]; }, 0);
    }
    function cartTotal() {
        return cartIds().reduce(function (sum, id) { return sum + CATALOG[id].price * cart[id]; }, 0);
    }
    function esc(text) {
        return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /* i18n: dictionary lookup with English fallback. Units map to the
       same keys used by the menu-price spans in the HTML. */
    function t(key, fb) {
        var lang = (typeof window.I18N_getLang === 'function') ? window.I18N_getLang() : 'en';
        var d = (window.I18N && (window.I18N[lang] || window.I18N.en)) || {};
        return (d[key] !== undefined && d[key] !== null) ? d[key] : (fb !== undefined ? fb : key);
    }
    function tu(unit) {
        return t('taart.unit.' + ({
            'loaf': 'loaf', 'per cookie': 'cookie', 'per koek': 'koek',
            'per broodje': 'broodje', 'box of 4': 'box', 'whole tray': 'tray',
            'per piece': 'worst', 'per bun': 'bun'
        }[unit] || 'bun'), unit);
    }
    function ariaFill(tmpl, id) {
        return String(tmpl).split('{id}').join(id);
    }

    function render() {
        var ids = cartIds();
        var count = cartCount();
        var total = cartTotal();

        if (fab) {
            fab.hidden = count === 0 && panel.hidden;
            if (countBadge) countBadge.textContent = count;
        }
        if (linesBox) {
            linesBox.innerHTML = ids.map(function (id) {
                var item = CATALOG[id];
                return '<li class="cart-line">' +
                    '<div class="cart-line__top"><div class="cart-line__info"><strong>' + esc(id) + '</strong>' +
                    '<span>' + fmt(item.price) + ' \u00B7 ' + esc(tu(item.unit)) + '</span></div>' +
                    '<div class="cart-line__side"><span class="cart-line__total">' + fmt(item.price * cart[id]) + '</span>' +
                    '<button type="button" class="cart-remove" data-remove="' + esc(id) + '" aria-label="' + esc(ariaFill(t('taart.cart.remove', 'Remove {id}'), id)) + '">\u00D7</button></div></div>' +
                    '<div class="qty-stepper qty-stepper--small">' +
                    '<button type="button" class="qty-btn" data-dec="' + esc(id) + '" aria-label="' + esc(ariaFill(t('taart.cart.oneLess', 'One less {id}'), id)) + '">\u2212</button>' +
                    '<span class="qty-val">' + cart[id] + '</span>' +
                    '<button type="button" class="qty-btn" data-inc="' + esc(id) + '" aria-label="' + esc(ariaFill(t('taart.cart.oneMore', 'One more {id}'), id)) + '">+</button>' +
                    '</div></li>';
            }).join('');
        }
        if (emptyNote) emptyNote.hidden = ids.length > 0;
        if (grandBox) grandBox.textContent = fmt(total);

        if (summaryBox) {
            summaryBox.innerHTML = ids.length === 0
                ? '<p class="cart-summary__empty">' + esc(t('taart.cart.empty', 'Your cart is empty. Add bakes from the menu above.')) + '</p>'
                : '<ul class="cart-summary__list">' + ids.map(function (id) {
                    var item = CATALOG[id];
                    return '<li><span>' + cart[id] + ' \u00D7 ' + esc(id) + ' (' + esc(tu(item.unit)) + ')</span><span>' + fmt(item.price * cart[id]) + '</span></li>';
                }).join('') + '</ul><p class="cart-summary__total">' + esc(t('taart.cart.total', 'Total')) + ': <strong>' + fmt(total) + '</strong></p>';
        }
        if (linesField) {
            linesField.value = ids.map(function (id) {
                return cart[id] + ' x ' + id + ' (' + CATALOG[id].unit + ') - ' + fmt(CATALOG[id].price * cart[id]);
            }).join('\n');
        }
        if (totalField) totalField.value = fmt(total);
        if (submitBtn) submitBtn.disabled = ids.length === 0;
        if (errorNote && ids.length > 0) errorNote.hidden = true;
    }

    function addToCart(id, qty) {
        if (!CATALOG[id] || qty < 1) return;
        cart[id] = Math.min(99, (cart[id] || 0) + qty);
        saveCart();
        render();
        if (fab) {
            fab.classList.remove('is-bump');
            void fab.offsetWidth;
            fab.classList.add('is-bump');
        }
    }

    function openCart() {
        if (!panel || !backdrop) return;
        panel.hidden = false;
        backdrop.hidden = false;
        requestAnimationFrame(function () { panel.classList.add('open'); });
        if (closeBtn) closeBtn.focus();
    }
    function closeCart() {
        if (!panel || !backdrop) return;
        panel.classList.remove('open');
        window.setTimeout(function () {
            if (!panel.classList.contains('open')) {
                panel.hidden = true;
                backdrop.hidden = true;
                render();
            }
        }, reduced ? 0 : 450);
    }

    /* Quantity steppers + Add buttons on menu cards */
    document.querySelectorAll('.menu-order[data-product]').forEach(function (btn) {
        var id = btn.getAttribute('data-product') || '';
        if (!CATALOG[id]) return;
        btn.textContent = t('taart.menu.add', 'Add');
        var wrap = document.createElement('div');
        wrap.className = 'menu-buy';
        var stepper = document.createElement('div');
        stepper.className = 'qty-stepper';
        stepper.innerHTML = '<button type="button" class="qty-btn" data-step="-1" aria-label="' + esc(t('taart.cart.less', 'One less')) + '">\u2212</button>' +
            '<span class="qty-val">1</span>' +
            '<button type="button" class="qty-btn" data-step="1" aria-label="' + esc(t('taart.cart.more', 'One more')) + '">+</button>';
        var val = stepper.querySelector('.qty-val');
        stepper.addEventListener('click', function (ev) {
            var step = ev.target.closest('.qty-btn');
            if (!step) return;
            var next = parseInt(val.textContent, 10) + parseInt(step.getAttribute('data-step'), 10);
            if (next < 1) next = 1;
            if (next > 99) next = 99;
            val.textContent = next;
        });
        if (btn.parentNode) {
            btn.parentNode.insertBefore(wrap, btn);
            wrap.appendChild(stepper);
            wrap.appendChild(btn);
        }
        btn.addEventListener('click', function () {
            addToCart(id, parseInt(val.textContent, 10) || 1);
            val.textContent = '1';
        });
    });

    /* Cart panel interactions */
    if (fab) fab.addEventListener('click', openCart);
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (backdrop) backdrop.addEventListener('click', closeCart);
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && panel && !panel.hidden) closeCart();
    });
    if (linesBox) linesBox.addEventListener('click', function (ev) {
        var dec = ev.target.closest('[data-dec]');
        var inc = ev.target.closest('[data-inc]');
        var rem = ev.target.closest('[data-remove]');
        if (dec) {
            var id = dec.getAttribute('data-dec');
            cart[id] = (cart[id] || 1) - 1;
            if (cart[id] < 1) delete cart[id];
            saveCart();
            render();
        } else if (inc) {
            var id2 = inc.getAttribute('data-inc');
            if (CATALOG[id2]) cart[id2] = Math.min(99, (cart[id2] || 0) + 1);
            saveCart();
            render();
        } else if (rem) {
            delete cart[rem.getAttribute('data-remove')];
            saveCart();
            render();
        }
    });
    if (orderBtn) orderBtn.addEventListener('click', function () {
        if (cartIds().length === 0) return;
        closeCart();
        var target = document.getElementById('contact-form-anchor');
        if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    });

    /* Re-translate dynamic strings when the language changes. */
    document.addEventListener('mvdl:lang', function () {
        render();
        document.querySelectorAll('.menu-order[data-product]').forEach(function (btn) {
            btn.textContent = t('taart.menu.add', 'Add');
        });
        document.querySelectorAll('.qty-stepper .qty-btn[data-step]').forEach(function (step) {
            var dir = step.getAttribute('data-step');
            step.setAttribute('aria-label', t(dir === '-1' ? 'taart.cart.less' : 'taart.cart.more', dir === '-1' ? 'One less' : 'One more'));
        });
        document.querySelectorAll('[data-allergen-row]').forEach(function (row) {
            var label = row.querySelector('.allergen-toggle .toggle-text');
            if (label) label.textContent = row.classList.contains('is-open') ? t('taart.allergen.hide', 'Show less') : t('taart.allergen.show', 'Show all');
        });
    });

    render();
})();
