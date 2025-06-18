document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const loginBtn = document.getElementById('login-btn'); // Tombol Login/Logout di header
    const katalogContainer = document.getElementById('katalog-container');

    // Elemen modal dan tombol penutup
    const loginModal = document.getElementById('login-modal');
    const closeButton = document.querySelector('.close-button');
    const loginForm = document.getElementById('login-form'); // Form login

    // --- Fungsi Cek & Atur Status Login ---
    // Fungsi ini akan memeriksa status login dari localStorage
    function isUserLoggedIn() {
        // Mengembalikan true jika ada item 'loggedIn' di localStorage dan nilainya 'true'
        // Jika tidak ada atau nilainya bukan 'true', akan mengembalikan false.
        return localStorage.getItem('loggedIn') === 'true';
    }

    // Fungsi ini akan mengatur status login di localStorage dan memperbarui UI
    function setLoggedInStatus(status) {
        if (status) {
            localStorage.setItem('loggedIn', 'true');
            if (loginBtn) {
                loginBtn.textContent = 'Logout';
                // Penting: Hapus event listener lama (openLoginModal) sebelum menambahkan logoutUser
                // Ini mencegah multiple listeners jika setLoggedInStatus dipanggil berulang kali
                loginBtn.removeEventListener('click', openLoginModal); // Hapus listener lama
                loginBtn.addEventListener('click', logoutUser); // Tambahkan listener baru
            }
            // Sembunyikan modal login jika sedang terbuka setelah login berhasil
            if (loginModal && loginModal.classList.contains('show')) {
                loginModal.classList.remove('show');
            }
        } else {
            localStorage.removeItem('loggedIn'); // Hapus status login
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                // Penting: Hapus event listener lama (logoutUser) sebelum menambahkan openLoginModal
                loginBtn.removeEventListener('click', logoutUser); // Hapus listener lama
                loginBtn.addEventListener('click', openLoginModal); // Tambahkan listener baru
            }
        }
        // Opsional: Muat ulang produk atau perbarui bagian UI lain yang mungkin terpengaruh oleh status login
        // Misalnya, jika ada tombol "Checkout" yang hanya muncul saat login
        // loadProducts(); // Uncomment jika produk perlu dimuat ulang berdasarkan status login
    }

    // --- Event Listeners Global ---

    // Toggle navigasi untuk mobile
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Fungsi untuk membuka modal login
    // Ini adalah fungsi yang akan dipanggil oleh tombol "Login" atau "Lihat Detail"
    function openLoginModal(e) {
        if (e) e.preventDefault(); // Mencegah default action (misal, navigasi ke #)
        if (loginModal) {
            loginModal.classList.add('show'); // Tampilkan modal
        }
    }

    // Fungsi untuk menangani logout
    function logoutUser(e) {
        if (e) e.preventDefault();
        const confirmLogout = confirm('Anda yakin ingin logout?');
        if (confirmLogout) {
            setLoggedInStatus(false);
            alert('Anda telah berhasil logout.');
            // Opsional: Redirect ke halaman beranda atau muat ulang halaman
            // window.location.href = 'index.html';
        }
    }

    // Inisialisasi status tombol login/logout saat halaman dimuat
    // Ini PENTING untuk memastikan tombol LOGIN/LOGOUT di header benar saat pertama kali dibuka
    // Panggil setLoggedInStatus saat DOMContentLoaded agar UI sesuai dengan status login awal
    if (loginBtn) {
        setLoggedInStatus(isUserLoggedIn()); // Panggil fungsi ini saat DOMContentLoaded
    }

    // Handle klik tombol tutup modal
    if (closeButton && loginModal) {
        closeButton.addEventListener('click', () => {
            loginModal.classList.remove('show'); // Sembunyikan modal
        });
    }

    // Sembunyikan modal jika klik di luar area modal content
    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            // Jika target klik adalah modal itu sendiri (bukan konten di dalamnya)
            if (e.target === loginModal) {
                loginModal.classList.remove('show');
            }
        });
    }

    // Handle pengiriman formulir login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Mencegah form untuk refresh halaman

            const username = loginForm.elements['username'].value;
            const password = loginForm.elements['password'].value;

            // --- Logika Autentikasi Sederhana (SIMULASI) ---
            // Untuk demo ini, kita akan menggunakan username dan password dummy
            if (username === 'user' && password === 'password') {
                setLoggedInStatus(true); // Set status login menjadi true
                alert('Login berhasil! Selamat datang.');
                loginForm.reset(); // Kosongkan formulir setelah berhasil login
            } else {
                alert('Username atau password salah. Silakan coba lagi.');
            }
        });
    }

    // --- Data Produk (Contoh) ---
    const products = [
        { id: '1', name: 'Batik Pria', price: 1500000, imageUrl: '' },
        { id: '2', name: 'Batik Wanita', price: 2800000, imageUrl: '' },
        { id: '3', name: 'Baju Muslim', price: 1200000, imageUrl: '' },
        { id: '4', name: 'Seragam Dinas', price: 5500000, imageUrl: '' },
        { id: '5', name: 'Kebaya', price: 1800000, imageUrl: '' },
        { id: '6', name: 'Setelan Jas', price: 750000, imageUrl: '' },

    ];

    // Fungsi untuk memuat produk ke dalam katalog
    function loadProducts() {
        if (!katalogContainer) return; // Pastikan elemen ada

        katalogContainer.innerHTML = ''; // Kosongkan kontainer sebelum memuat ulang
        products.forEach(product => {
            const produkItem = document.createElement('div');
            produkItem.classList.add('produk-item');
            produkItem.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="harga">Rp ${product.price.toLocaleString('id-ID')}</p>
                <button class="btn btn-detail" data-id="${product.id}">Lihat Detail</button>
            `;
            katalogContainer.appendChild(produkItem);
        });

        // Tambahkan event listener ke semua tombol "Lihat Detail" yang baru dibuat
        katalogContainer.querySelectorAll('.btn-detail').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                
                if (isUserLoggedIn()) {
                    // Jika sudah login, arahkan ke halaman detail produk atau proses pembayaran
                    alert(`Anda sudah login. Melanjutkan ke detail produk ID: ${productId}`);
                    // Di sini Anda akan mengarahkan ke halaman detail produk yang sebenarnya:
                    // window.location.href = `detail-produk.html?id=${productId}`;
                } else {
                    // Jika belum login, tampilkan pesan dan modal login
                    alert('Anda harus login untuk melihat detail produk atau melakukan pemesanan.');
                    openLoginModal(e); // Panggil fungsi openLoginModal untuk menampilkan modal
                }
            });
        });
        // snippet from script.js
// ... (kode yang sudah ada) ...

katalogContainer.querySelectorAll('.btn-detail').forEach(button => {
    button.addEventListener('click', (e) => {
        const productId = e.target.dataset.id;

        if (isUserLoggedIn()) {
            // Jika sudah login, arahkan ke halaman detail produk
            // alert(`Anda sudah login. Melanjutkan ke detail produk ID: ${productId}`); // Hapus alert ini
            window.location.href = `detail-produk.html?id=${productId}`; // Arahkan ke halaman detail produk
        } else {
            // Jika belum login, tampilkan pesan dan modal login
            alert('Anda harus login untuk melihat detail produk atau melakukan pemesanan.');
            if (loginModal) {
                loginModal.classList.add('show');
            }
        }
    });
});

// ... (kode yang sudah ada) ...
    }

    // Panggil fungsi untuk memuat produk saat halaman selesai dimuat
    loadProducts();
});