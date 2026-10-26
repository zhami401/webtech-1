function getCart() {
    return JSON.parse(localStorage.getItem('stradivarius_cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('stradivarius_cart', JSON.stringify(cart));
    updateCartIconBadge();
}

function updateCartIconBadge() {
    const cart = getCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartLinks = document.querySelectorAll('#nav-cart-link');
    
    cartLinks.forEach(link => {
        let badge = link.querySelector('.cart-badge');
        if (totalQty > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'cart-badge badge bg-danger rounded-pill ms-1';
                link.appendChild(badge);
            }
            badge.textContent = totalQty;
        } else if (badge) {
            badge.remove();
        }
    });
}

function initCatalog() {
    const addButtons = document.querySelectorAll('[id^="add-"]');
    
    addButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.product-card');
            if (!card) return;

            const id = card.id;
            const name = card.querySelector('.card-title')?.textContent.trim();
            const priceText = card.querySelector('.fw-bold')?.textContent.replace(/[^0-9]/g, '');
            const price = parseInt(priceText, 10) || 0;
            const img = card.querySelector('img')?.getAttribute('src');
            const sizeSelect = card.querySelector('select');
            const size = sizeSelect ? sizeSelect.value : '';

            if (sizeSelect && !size) {
                alert('Please select a size before adding to cart!');
                sizeSelect.classList.add('is-invalid');
                return;
            }

            if (sizeSelect) sizeSelect.classList.remove('is-invalid');

            const cart = getCart();
            const existingIndex = cart.findIndex(item => item.id === id && item.size === size);

            if (existingIndex > -1) {
                cart[existingIndex].qty += 1;
            } else {
                cart.push({ id, name, price, img, size, qty: 1 });
            }

            saveCart(cart);

            const originalText = btn.textContent;
            btn.textContent = 'Added! ✓';
            btn.classList.replace('btn-dark', 'btn-success');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.replace('btn-success', 'btn-dark');
            }, 1200);
        });
    });
}

function initCartPage() {
    const cartFilledSec = document.getElementById('cart-filled');
    const cartEmptySec = document.getElementById('cart-empty');
    const cartItemsUl = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const sumProductsDd = document.getElementById('sum-products');
    const sumCountSpan = document.getElementById('sum-count');
    const orderSubmitBtn = document.getElementById('order-submit-btn');
    const clearBtn = document.getElementById('cart-clear-btn');
    const orderForm = document.getElementById('order-form');

    if (!cartFilledSec || !cartEmptySec) return;

    function renderCart() {
        const cart = getCart();

        if (cart.length === 0) {
            cartFilledSec.style.display = 'none';
            cartEmptySec.style.display = 'block';
            return;
        }

        cartFilledSec.style.display = 'block';
        cartEmptySec.style.display = 'none';

        cartItemsUl.innerHTML = '';
        let totalPrice = 0;
        let totalCount = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            totalPrice += itemTotal;
            totalCount += item.qty;

            const li = document.createElement('li');
            li.className = 'd-flex gap-3 py-3 border-bottom';
            li.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-thumb rounded" width="96" height="96">
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between gap-2">
                        <div>
                            <h2 class="h6 mb-1">${item.name}</h2>
                            <p class="small text-muted mb-0">Size: <span>${item.size || 'N/A'}</span></p>
                        </div>
                        <button type="button" class="btn-close" data-index="${index}" aria-label="Remove item"></button>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div class="btn-group btn-group-sm" role="group">
                            <button type="button" class="btn btn-outline-dark btn-dec" data-index="${index}">&minus;</button>
                            <span class="btn btn-outline-dark disabled px-3 opacity-100">${item.qty}</span>
                            <button type="button" class="btn btn-outline-dark btn-inc" data-index="${index}">+</button>
                        </div>
                        <strong class="text-nowrap">${itemTotal.toLocaleString('ru-RU')}&nbsp;₸</strong>
                    </div>
                </div>
            `;
            cartItemsUl.appendChild(li);
        });

        const formattedTotal = totalPrice.toLocaleString('ru-RU') + ' ₸';
        cartTotalSpan.innerHTML = formattedTotal;
        sumProductsDd.innerHTML = formattedTotal;
        sumCountSpan.textContent = totalCount;
        if (orderSubmitBtn) {
            orderSubmitBtn.textContent = `Place order • ${totalCount} pcs`;
        }
    }

    cartItemsUl?.addEventListener('click', (e) => {
        const cart = getCart();
        const index = e.target.dataset.index;
        if (index === undefined) return;

        if (e.target.classList.contains('btn-close')) {
            cart.splice(index, 1);
        } else if (e.target.classList.contains('btn-inc')) {
            cart[index].qty += 1;
        } else if (e.target.classList.contains('btn-dec')) {
            if (cart[index].qty > 1) {
                cart[index].qty -= 1;
            } else {
                cart.splice(index, 1);
            }
        }
        saveCart(cart);
        renderCart();
    });

    clearBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        saveCart([]);
        renderCart();
    });

    orderForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const cart = getCart();
        if (cart.length === 0) return;

        alert('🎉 Order successfully placed! Thank you for shopping with Stradivarius Mega Silkway.');
        saveCart([]);
        renderCart();
        orderForm.reset();
    });

    renderCart();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartIconBadge();
    initCatalog();
    initCartPage();
});