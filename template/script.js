// Retail Management System - Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    initializeSidebar();
    initializeSearch();
    initializeNotifications();
    initializeChart();
    initializeTheme();
});

// Sidebar functionality
function initializeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.querySelector('.collapse-btn');
    const navItems = document.querySelectorAll('.nav-item');

    // Toggle sidebar collapse
    collapseBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        
        // Update collapse button icon
        const icon = collapseBtn.querySelector('i');
        if (sidebar.classList.contains('collapsed')) {
            icon.className = 'fas fa-chevron-right';
        } else {
            icon.className = 'fas fa-chevron-left';
        }
    });

    // Navigation item clicks
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Get the target page
            const target = this.getAttribute('href').substring(1);
            loadPage(target);
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchInput = document.querySelector('.search-bar input');
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length > 2) {
            performSearch(query);
        }
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = this.value.toLowerCase();
            performSearch(query);
        }
    });
}

function performSearch(query) {
    // Simulate search functionality
    console.log('Searching for:', query);
    
    // Show search results (placeholder)
    showNotification(`Searching for "${query}"...`, 'info');
}

// Notifications
function initializeNotifications() {
    const notificationBtn = document.querySelector('.notification-btn');
    
    notificationBtn.addEventListener('click', function() {
        showNotificationPanel();
    });
}

function showNotificationPanel() {
    const notifications = [
        { title: 'Low Stock Alert', message: 'Product "Dell Latitude XP" is running low', type: 'warning' },
        { title: 'New Order', message: 'Order #1234 has been placed', type: 'info' },
        { title: 'Payment Received', message: 'Payment of $1,250 received', type: 'success' }
    ];
    
    let notificationHtml = '<div class="notification-panel"><h3>Notifications</h3>';
    
    notifications.forEach(notification => {
        notificationHtml += `
            <div class="notification-item ${notification.type}">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
            </div>
        `;
    });
    
    notificationHtml += '</div>';
    
    showModal(notificationHtml);
}

// Chart initialization
function initializeChart() {
    const canvas = document.getElementById('cashFlowChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Draw a simple bar chart
    drawCashFlowChart(ctx, canvas.width, canvas.height);
}

function drawCashFlowChart(ctx, width, height) {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Sample data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const revenue = [12000, 15000, 18000, 16000, 20000, 22000];
    const expenses = [8000, 9000, 11000, 10000, 12000, 13000];
    
    const barWidth = width / (months.length * 2 + 1);
    const maxValue = Math.max(...revenue, ...expenses);
    
    // Draw bars
    months.forEach((month, index) => {
        const x = (index * 2 + 1) * barWidth;
        
        // Revenue bar
        const revenueHeight = (revenue[index] / maxValue) * (height * 0.7);
        ctx.fillStyle = 'hsl(217, 91%, 60%)';
        ctx.fillRect(x, height - revenueHeight - 40, barWidth * 0.8, revenueHeight);
        
        // Expenses bar
        const expensesHeight = (expenses[index] / maxValue) * (height * 0.7);
        ctx.fillStyle = 'hsl(0, 84%, 60%)';
        ctx.fillRect(x + barWidth, height - expensesHeight - 40, barWidth * 0.8, expensesHeight);
        
        // Month label
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(month, x + barWidth, height - 20);
    });
}

// Theme functionality
function initializeTheme() {
    // Add theme toggle button
    const themeBtn = document.createElement('button');
    themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
    themeBtn.className = 'theme-toggle';
    themeBtn.addEventListener('click', toggleTheme);
    
    document.querySelector('.header-actions').appendChild(themeBtn);
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeBtn = document.querySelector('.theme-toggle i');
    
    if (document.body.classList.contains('dark-theme')) {
        themeBtn.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        themeBtn.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// Page loading simulation
function loadPage(page) {
    const content = document.querySelector('.content');
    
    // Show loading state
    content.style.opacity = '0.5';
    
    setTimeout(() => {
        // Update page content based on navigation
        updatePageContent(page);
        content.style.opacity = '1';
    }, 300);
}

function updatePageContent(page) {
    const contentHeader = document.querySelector('.content-header h1');
    const contentDescription = document.querySelector('.content-header p');
    
    const pageConfigs = {
        dashboard: {
            title: 'Dashboard',
            description: "Welcome back! Here's what's happening with your stores today."
        },
        pos: {
            title: 'Point of Sale',
            description: 'Process sales and manage transactions'
        },
        products: {
            title: 'Products',
            description: 'Manage your product catalog and inventory'
        },
        inventory: {
            title: 'Inventory',
            description: 'Track stock levels and manage inventory'
        },
        customers: {
            title: 'Customers',
            description: 'Manage customer relationships and data'
        },
        sales: {
            title: 'Sales',
            description: 'View sales reports and analytics'
        },
        purchase: {
            title: 'Purchase Orders',
            description: 'Manage supplier purchases and orders'
        },
        expenses: {
            title: 'Expenses',
            description: 'Track business expenses and costs'
        },
        suppliers: {
            title: 'Suppliers',
            description: 'Manage supplier relationships and contacts'
        },
        stores: {
            title: 'Stores',
            description: 'Manage multiple store locations'
        },
        analytics: {
            title: 'Analytics',
            description: 'Advanced reporting and business insights'
        },
        settings: {
            title: 'Settings',
            description: 'Configure system preferences and user settings'
        }
    };
    
    const config = pageConfigs[page] || pageConfigs.dashboard;
    contentHeader.textContent = config.title;
    contentDescription.textContent = config.description;
    
    // Update page title
    document.title = `${config.title} - Retail Management System`;
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        warning: 'exclamation-triangle',
        error: 'times-circle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function showModal(content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            ${content}
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            modal.remove();
        }
    });
}

// Initialize demo data and interactions
function initializeDemoFeatures() {
    // Simulate real-time updates
    setInterval(() => {
        updateMetrics();
    }, 30000); // Update every 30 seconds
    
    // Add some demo interactions
    addDemoInteractions();
}

function updateMetrics() {
    const metricValues = document.querySelectorAll('.metric-value');
    metricValues.forEach(value => {
        if (value.textContent !== '$0.00' && value.textContent !== '0') {
            // Simulate small changes in metrics
            const currentValue = parseInt(value.textContent) || 0;
            const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
            const newValue = Math.max(0, currentValue + change);
            value.textContent = newValue.toString();
        }
    });
}

function addDemoInteractions() {
    // Add click handlers for demo purposes
    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.querySelector('h3').textContent;
            showNotification(`Viewing detailed ${title} analytics`, 'info');
        });
    });
}

// Load saved theme on page load
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

// Initialize demo features
setTimeout(initializeDemoFeatures, 1000);