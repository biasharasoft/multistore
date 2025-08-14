// POS System JavaScript

let cart = [];
let selectedPaymentMethod = 'cash';
const TAX_RATE = 0.08;

document.addEventListener('DOMContentLoaded', function() {
    initializePOS();
});

function initializePOS() {
    initializeProductCards();
    initializeCartActions();
    initializePaymentMethods();
    initializeCheckout();
    updateCartDisplay();
}

function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const addBtn = card.querySelector('.add-to-cart-btn');
        
        addBtn.addEventListener('click', function() {
            const productId = card.getAttribute('data-product-id');
            const productName = card.querySelector('h4').textContent;
            const productPrice = parseFloat(card.querySelector('.product-price').textContent.replace('$', ''));
            
            addToCart({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            });
        });

        // Add hover effect
        card.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

function initializeCartActions() {
    const clearCartBtn = document.querySelector('.clear-cart-btn');
    
    clearCartBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            if (confirm('Are you sure you want to clear the cart?')) {
                clearCart();
            }
        }
    });
}

function initializePaymentMethods() {
    const paymentBtns = document.querySelectorAll('.payment-btn');
    
    paymentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            paymentBtns.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update selected payment method
            selectedPaymentMethod = this.getAttribute('data-method');
        });
    });
}

function initializeCheckout() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            processCheckout();
        }
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product });
    }
    
    updateCartDisplay();
    showNotification(`${product.name} added to cart`, 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCartDisplay();
        }
    }
}

function clearCart() {
    cart = [];
    updateCartDisplay();
    showNotification('Cart cleared', 'info');
}

function updateCartDisplay() {
    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalEl = document.querySelector('.subtotal');
    const taxEl = document.querySelector('.tax');
    const totalEl = document.querySelector('.total-amount');
    const checkoutBtn = document.querySelector('.checkout-btn');
    
    // Clear current display
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Add products to start a sale</p>
            </div>
        `;
        
        subtotalEl.textContent = '$0.00';
        taxEl.textContent = '$0.00';
        totalEl.textContent = '$0.00';
        checkoutBtn.disabled = true;
        
        return;
    }
    
    // Display cart items
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="item-controls">
                <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Calculate totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
    
    checkoutBtn.disabled = false;
}

function processCheckout() {
    const customerSelect = document.querySelector('.customer-select select');
    const customerId = customerSelect.value;
    const customerName = customerId ? customerSelect.options[customerSelect.selectedIndex].text : 'Walk-in Customer';
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    
    const saleData = {
        customer: {
            id: customerId,
            name: customerName
        },
        items: cart,
        payment: {
            method: selectedPaymentMethod,
            subtotal: subtotal,
            tax: tax,
            total: total
        },
        timestamp: new Date().toISOString()
    };
    
    // Simulate processing
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    checkoutBtn.disabled = true;
    
    setTimeout(() => {
        completeSale(saleData);
    }, 2000);
}

function completeSale(saleData) {
    // Show receipt modal
    showReceipt(saleData);
    
    // Clear cart
    clearCart();
    
    // Reset checkout button
    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.innerHTML = '<i class="fas fa-check"></i> Complete Sale';
    
    showNotification('Sale completed successfully!', 'success');
}

function showReceipt(saleData) {
    const receiptHtml = `
        <div class="receipt">
            <div class="receipt-header">
                <h2>Sale Receipt</h2>
                <p>RetailPro - Main Store</p>
                <p>${new Date().toLocaleString()}</p>
            </div>
            
            <div class="receipt-customer">
                <p><strong>Customer:</strong> ${saleData.customer.name}</p>
                <p><strong>Payment:</strong> ${saleData.payment.method.charAt(0).toUpperCase() + saleData.payment.method.slice(1)}</p>
            </div>
            
            <div class="receipt-items">
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${saleData.items.map(item => `
                            <tr>
                                <td>${item.name}</td>
                                <td>${item.quantity}</td>
                                <td>$${item.price.toFixed(2)}</td>
                                <td>$${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="receipt-totals">
                <div class="total-line">
                    <span>Subtotal:</span>
                    <span>$${saleData.payment.subtotal.toFixed(2)}</span>
                </div>
                <div class="total-line">
                    <span>Tax (8%):</span>
                    <span>$${saleData.payment.tax.toFixed(2)}</span>
                </div>
                <div class="total-line final-total">
                    <span>Total:</span>
                    <span>$${saleData.payment.total.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="receipt-footer">
                <p>Thank you for your business!</p>
                <div class="receipt-actions">
                    <button onclick="printReceipt()" class="btn-primary">
                        <i class="fas fa-print"></i> Print
                    </button>
                    <button onclick="emailReceipt()" class="btn-secondary">
                        <i class="fas fa-envelope"></i> Email
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(receiptHtml);
}

function printReceipt() {
    window.print();
    showNotification('Receipt sent to printer', 'info');
}

function emailReceipt() {
    showNotification('Receipt emailed to customer', 'info');
}

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.printReceipt = printReceipt;
window.emailReceipt = emailReceipt;