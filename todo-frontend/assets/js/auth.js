// assets/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const messageAuth = document.getElementById('messageAuth'); // Elemen pesan untuk auth pages

    // --- Logika Halaman Login ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const loginEmail = document.getElementById('loginEmail');
        const loginPassword = document.getElementById('loginPassword');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginEmail.value;
            const password = loginPassword.value;

            try {
                const response = await fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data));
                    displayMessage(messageAuth, 'Login berhasil! Mengalihkan...', false);
                    loginForm.reset();
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Redirect ke dashboard
                    }, 1000);
                } else {
                    displayMessage(messageAuth, data.message || 'Login gagal.', true);
                }
            } catch (error) {
                displayMessage(messageAuth, 'Terjadi kesalahan jaringan.', true);
                console.error('Error:', error);
            }
        });
    }

    // --- Logika Halaman Register ---
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        const registerName = document.getElementById('registerName');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const registerRole = document.getElementById('registerRole');
        const registerJabatan = document.getElementById('registerJabatan');

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = registerName.value;
            const email = registerEmail.value;
            const password = registerPassword.value;
            const role = registerRole.value;
            const jabatan = registerJabatan.value;

            try {
                const response = await fetch(`${BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role, jabatan })
                });
                const data = await response.json();
                if (response.ok) {
                    displayMessage(messageAuth, 'Registrasi berhasil! Anda bisa login sekarang.', false);
                    registerForm.reset();
                    // Opsional: Redirect ke halaman login setelah register
                    // setTimeout(() => { window.location.href = 'login.html'; }, 1500);
                } else {
                    displayMessage(messageAuth, data.message || 'Registrasi gagal.', true);
                }
            } catch (error) {
                displayMessage(messageAuth, 'Terjadi kesalahan jaringan.', true);
                console.error('Error:', error);
            }
        });
    }

    // --- Logika Logout (untuk dashboard.html atau halaman lain yang ada tombol logout) ---
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            updateAuthUI(); // Update UI navigasi
            displayMessage(document.getElementById('messageDashboard') || messageAuth, 'Anda telah logout.', false);
            window.location.href = 'login.html'; // Redirect ke halaman login
        });
    }

    // --- Logic Redirect Otomatis Berdasarkan Status Auth ---
    // Ini akan dijalankan di setiap halaman yang mengimpor auth.js
    const path = window.location.pathname;
    const isLoggedIn = localStorage.getItem('token') !== null;

    if (isLoggedIn) {
        if (path.endsWith('login.html') || path.endsWith('register.html') || path.endsWith('index.html')) {
            window.location.href = 'dashboard.html'; // Redirect ke dashboard jika sudah login
        }
    } else {
        if (path.endsWith('dashboard.html') || path.endsWith('manager_users.html') || path.endsWith('manager_user_tasks.html')) {
            window.location.href = 'login.html'; // Redirect ke login jika belum login dan mencoba akses halaman terproteksi
        }
    }

    updateAuthUI(); // Panggil saat DOM Content Loaded untuk update status navigasi
});