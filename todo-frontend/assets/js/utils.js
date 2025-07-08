// assets/js/utils.js
const BASE_URL = 'http://localhost:5000/api';

// Helper untuk menampilkan pesan (info atau error)
function displayMessage(element, message, isError = false) {
    element.textContent = message;
    element.className = isError ? 'message-error' : 'message-info';
    element.style.display = 'block';
    setTimeout(() => {
        element.textContent = '';
        element.style.display = 'none';
    }, 5000);
}

// Helper untuk mendapatkan header otorisasi
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    if (token) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }
    return {
        'Content-Type': 'application/json'
    };
}

// Helper untuk mendapatkan data user yang login dari localStorage
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('user'));
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        return null;
    }
}

// Helper untuk update UI berdasarkan status autentikasi
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const user = getCurrentUser();
    const navAuthItems = document.getElementById('nav-auth-items');
    const navLoggedInItems = document.getElementById('nav-logged-in-items');
    const userStatusSpan = document.getElementById('user-status');

    if (navAuthItems && navLoggedInItems && userStatusSpan) {
        if (token && user) {
            navAuthItems.style.display = 'none';
            navLoggedInItems.style.display = 'block';
            userStatusSpan.textContent = `Halo, ${user.name} (${user.role})`;
        } else {
            navAuthItems.style.display = 'block';
            navLoggedInItems.style.display = 'none';
            userStatusSpan.textContent = '';
        }
    }

    // Logic untuk halaman dashboard.html, akan dijalankan setelah init
    // Ini memastikan elemen dashboard tersembunyi/ditampilkan sesuai status login
    if (window.location.pathname.endsWith('dashboard.html')) {
        const dashboardContainer = document.getElementById('dashboard-container');
        if (dashboardContainer) {
            if (token && user) {
                dashboardContainer.style.display = 'block';
            } else {
                dashboardContainer.style.display = 'none';
                // Optional: Redirect to login if not authenticated on dashboard page
                // window.location.href = 'login.html';
            }
        }
    }
}

// Export fungsi-fungsi ini agar bisa digunakan di file JS lain
window.BASE_URL = 'http://localhost:5000/api';
window.displayMessage = displayMessage;
window.getAuthHeaders = getAuthHeaders;
window.getCurrentUser = getCurrentUser;
window.updateAuthUI = updateAuthUI;