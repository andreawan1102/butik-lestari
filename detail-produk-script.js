// detail-produk-script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration - GANTI DENGAN KONFIGURASI ASLI ANDA
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const loginBtnDetail = document.getElementById('login-btn-detail'); // Tombol login di halaman detail

    // Modals
    const loginModal = document.getElementById('login-modal');
    const closeButtonLogin = loginModal ? loginModal.querySelector('.close-button') : null;
    const loginForm = document.getElementById('login-form');

    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    const closeButtonOrder = orderConfirmationModal ? orderConfirmationModal.querySelector('.close-button') : null;
    const orderSummaryContent = document.getElementById('order-summary-content');
    const payDpBtn = document.getElementById('pay-dp-btn');
    const payFullBtn = document.getElementById('pay-full-btn');

    // Elemen detail produk
    const mainProductImage = document.getElementById('main-product-image');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const basePriceDisplay = document.getElementById('base-price-display');
    const modelSelect = document.getElementById('model-select');
    const accessoriesOptionsDiv = document.getElementById('accessories-options');
    const finishDateInput = document.getElementById('finish-date');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const contactOwnerBtn = document.getElementById('contact-owner-btn');

    let currentProduct = null;
    let currentTotalPrice = 0;
    const ownerWhatsApp = "6281234567890"; // Ganti dengan nomor WhatsApp pemilik

    // --- Fungsi Simulasi Cek Login (Diulang agar halaman detail bisa mandiri) ---
    function isUserLoggedIn() {
        return localStorage.getItem('loggedIn') === 'true';
    }

    function setLoggedInStatus(status) {
        if (status) {
            localStorage.setItem('loggedIn', 'true');
            if (loginBtnDetail) {
                loginBtnDetail.textContent = 'Logout';
                // Pastikan event listener lama dihapus sebelum menambah yang baru
                loginBtnDetail.removeEventListener('click', openLoginModal);
                loginBtnDetail.addEventListener('click', logoutUser);
            }
        } else {
            localStorage.removeItem('loggedIn');
            if (loginBtnDetail) {
                loginBtnDetail.textContent = 'Login';
                loginBtnDetail.removeEventListener('click', logoutUser);
                loginBtnDetail.addEventListener('click', openLoginModal);
            }
        }
    }

    function openLoginModal(e) {
        e.preventDefault();
        if (loginModal) {
            loginModal.classList.add('show');
        }
    }

    function closeLoginModal() {
        if (loginModal) {
            loginModal.classList.remove('show');
        }
    }

    function logoutUser(e) {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin logout?')) {
            signOut(auth).then(() => {
                setLoggedInStatus(false);
                alert('Anda telah logout.');
                // Opsional: Redirect atau refresh halaman jika diperlukan
                window.location.href = 'index.html'; // Kembali ke halaman utama setelah logout
            }).catch((error) => {
                console.error("Error signing out: ", error);
                alert("Terjadi kesalahan saat logout.");
            });
        }
    }

    // Initialize login status on page load
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in
            setLoggedInStatus(true);
        } else {
            // User is signed out
            setLoggedInStatus(false);
        }
    });

    // Event Listeners for Login Modal
    if (loginBtnDetail) {
        // Initial setup based on current auth state
        if (isUserLoggedIn()) {
            loginBtnDetail.addEventListener('click', logoutUser);
        } else {
            loginBtnDetail.addEventListener('click', openLoginModal);
        }
    }

    if (closeButtonLogin) {
        closeButtonLogin.addEventListener('click', closeLoginModal);
    }

    if (loginModal) {
        window.addEventListener('click', (event) => {
            if (event.target == loginModal) {
                closeLoginModal();
            }
        });
    }

    // Handle Login Form Submission (Firebase Integration)
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.username.value + "@butiklestari.com"; // Asumsi username adalah bagian dari email
            const password = loginForm.password.value;

            try {
                await signInWithEmailAndPassword(auth, email, password);
                alert('Login berhasil!');
                closeLoginModal();
            } catch (error) {
                console.error("Login failed: ", error.message);
                alert('Login gagal: ' + error.message);
            }
        });
    }

    // --- Mobile Menu Toggle ---
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
        });
    }

    // Tutup menu saat link diklik (untuk mobile)
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
            }
        });
    });

    // --- Product Data (Simulasi dari Backend) ---
    const products = [
        {
            id: '1',
            name: 'Kebaya Klasik Elegance',
            description: 'Kebaya brokat modern dengan desain elegan, cocok untuk acara formal dan pernikahan.',
            price: 1500000,
            image: 'image_9c64b5.png',
            models: [
                { name: 'Lengan Panjang', price_adjustment: 0 },
                { name: 'Lengan Pendek', price_adjustment: -100000 },
                { name: 'Kerah Tinggi', price_adjustment: 50000 }
            ],
            accessories: [
                { name: 'Selendang Sutra', price: 250000 },
                { name: 'Bros Permata', price: 150000 },
                { name: 'Rok Batik Tulis', price: 300000 }
            ]
        },
        {
            id: '2',
            name: 'Gaun Pesta Glamour',
            description: 'Gaun malam bertabur payet dengan potongan A-line yang anggun.',
            price: 2800000,
            image: 'image_9c735a.png',
            models: [
                { name: 'V-Neck', price_adjustment: 0 },
                { name: 'Off-Shoulder', price_adjustment: 100000 },
                { name: 'Backless', price_adjustment: 150000 }
            ],
            accessories: [
                { name: 'Clutch Bertabur', price: 350000 },
                { name: 'Anting Statement', price: 180000 }
            ]
        },
        {
            id: '3',
            name: 'Busana Muslimah Syar\'i',
            description: 'Abaya modern dengan detail bordir minimalis, nyaman dan syar\'i.',
            price: 1200000,
            image: 'image_9cd537.png',
            models: [
                { name: 'Cutting Loose', price_adjustment: 0 },
                { name: 'Aksen Tali Pinggang', price_adjustment: 50000 }
            ],
            accessories: [
                { name: 'Pashmina Premium', price: 100000 },
                { name: 'Manset Brokat', price: 75000 }
            ]
        },
        {
            id: '4',
            name: 'Jas Pria Formal',
            description: 'Jas slim-fit berbahan wool berkualitas tinggi, cocok untuk acara resmi.',
            price: 2500000,
            image: 'image_9ce3f9.png',
            models: [
                { name: 'Single Breasted', price_adjustment: 0 },
                { name: 'Double Breasted', price_adjustment: 200000 }
            ],
            accessories: [
                { name: 'Dasi Kupu-Kupu', price: 120000 },
                { name: 'Saputangan Saku', price: 50000 }
            ]
        },
        {
            id: '5',
            name: 'Kemeja Batik Modern',
            description: 'Kemeja batik tulis dengan desain kontemporer, nyaman untuk sehari-hari atau semi-formal.',
            price: 750000,
            image: 'image_9d45f7.png',
            models: [
                { name: 'Lengan Panjang', price_adjustment: 0 },
                { name: 'Lengan Pendek', price_adjustment: -50000 }
            ],
            accessories: []
        },
        {
            id: '6',
            name: 'Blouse Tenun Etnik',
            description: 'Blouse dengan sentuhan tenun tradisional, memadukan budaya dan gaya modern.',
            price: 900000,
            image: 'image_9d5b65.png',
            models: [
                { name: 'Peplum', price_adjustment: 0 },
                { name: 'Asimetris', price_adjustment: 75000 }
            ],
            accessories: [
                { name: 'Kalung Etnik', price: 180000 }
            ]
        }
    ];

    // Fungsi untuk mendapatkan ID produk dari URL
    function getProductIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // Fungsi untuk memuat detail produk
    function loadProductDetail() {
        const productId = getProductIdFromUrl();
        currentProduct = products.find(p => p.id === productId);

        if (currentProduct) {
            mainProductImage.src = currentProduct.image;
            mainProductImage.alt = currentProduct.name;
            productName.textContent = currentProduct.name;
            productDescription.textContent = currentProduct.description;
            basePriceDisplay.textContent = `Rp ${currentProduct.price.toLocaleString('id-ID')}`;

            // Populate models
            modelSelect.innerHTML = '';
            currentProduct.models.forEach((model, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = `${model.name} (Rp ${model.price_adjustment >= 0 ? '+' : ''}${model.price_adjustment.toLocaleString('id-ID')})`;
                modelSelect.appendChild(option);
            });

            // Populate accessories
            accessoriesOptionsDiv.innerHTML = '';
            if (currentProduct.accessories.length > 0) {
                currentProduct.accessories.forEach((accessory) => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <label>
                            <input type="checkbox" data-name="${accessory.name}" data-price="${accessory.price}">
                            ${accessory.name} (Rp ${accessory.price.toLocaleString('id-ID')})
                        </label>
                    `;
                    accessoriesOptionsDiv.appendChild(div);
                });
            } else {
                accessoriesOptionsDiv.innerHTML = '<p>Tidak ada aksesoris tersedia.</p>';
            }

            // Set minimum date for finish date input to today
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
            const dd = String(today.getDate()).padStart(2, '0');
            const minDate = `${yyyy}-${mm}-${dd}`;
            finishDateInput.min = minDate;

            calculateTotalPrice(); // Hitung harga awal
        } else {
            // Handle product not found, e.g., redirect to 404 or katalog
            alert('Produk tidak ditemukan!');
            window.location.href = 'index.html#katalog';
        }
    }

    // Fungsi untuk menghitung total harga
    function calculateTotalPrice() {
        if (!currentProduct) return;

        let total = currentProduct.price;

        // Add model adjustment
        const selectedModelIndex = modelSelect.value;
        if (selectedModelIndex !== null && currentProduct.models[selectedModelIndex]) {
            total += currentProduct.models[selectedModelIndex].price_adjustment;
        }

        // Add accessories price
        accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            total += parseInt(checkbox.dataset.price);
        });

        currentTotalPrice = total;
        totalPriceDisplay.textContent = `Rp ${total.toLocaleString('id-ID')}`;
    }

    // Event listeners for changes in model or accessories
    modelSelect.addEventListener('change', calculateTotalPrice);
    accessoriesOptionsDiv.addEventListener('change', calculateTotalPrice);

    // Event listener for "Pesan Sekarang" button
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!isUserLoggedIn()) {
                alert('Anda harus login untuk melakukan pemesanan.');
                openLoginModal(event); // Pass event to prevent default
                return;
            }

            const selectedModelIndex = modelSelect.value;
            const selectedModel = currentProduct.models[selectedModelIndex].name;
            const selectedAccessories = Array.from(accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(checkbox => checkbox.dataset.name);
            const finalPrice = currentTotalPrice;
            const desiredFinishDate = finishDateInput.value;

            // Validasi sederhana untuk tanggal
            if (!desiredFinishDate) {
                alert('Mohon pilih tanggal selesai baju yang diinginkan.');
                return;
            }

            // Show order confirmation modal
            showOrderConfirmation(currentProduct.name, selectedModel, selectedAccessories, finalPrice, desiredFinishDate);
        });
    }

    function showOrderConfirmation(productName, model, accessories, totalPrice, finishDate) {
        let accessoriesList = accessories.length > 0 ? accessories.join(', ') : 'Tidak ada';
        orderSummaryContent.innerHTML = `
            <p><strong>Nama Produk:</strong> ${productName}</p>
            <p><strong>Model:</strong> ${model}</p>
            <p><strong>Aksesoris:</strong> ${accessoriesList}</p>
            <p><strong>Tanggal Selesai:</strong> ${new Date(finishDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p><strong>Total Harga:</strong> Rp ${totalPrice.toLocaleString('id-ID')}</p>
            <p class="dp-info">Anda dapat memilih untuk membayar DP (50%) atau bayar penuh.</p>
        `;
        orderConfirmationModal.classList.add('show');

        // Set up payment buttons
        if (payDpBtn) {
            payDpBtn.onclick = () => processPayment(totalPrice * 0.5, 'DP');
        }
        if (payFullBtn) {
            payFullBtn.onclick = () => processPayment(totalPrice, 'Full');
        }
    }

    function closeOrderConfirmationModal() {
        if (orderConfirmationModal) {
            orderConfirmationModal.classList.remove('show');
        }
    }

    if (closeButtonOrder) {
        closeButtonOrder.addEventListener('click', closeOrderConfirmationModal);
    }

    if (orderConfirmationModal) {
        window.addEventListener('click', (event) => {
            if (event.target == orderConfirmationModal) {
                closeOrderConfirmationModal();
            }
        });
    }

    async function processPayment(paymentAmount, paymentType) {
        const user = auth.currentUser;
        if (!user) {
            alert("Anda harus login untuk melanjutkan pembayaran.");
            closeOrderConfirmationModal();
            openLoginModal(event);
            return;
        }

        const selectedModelIndex = modelSelect.value;
        const selectedModel = currentProduct.models[selectedModelIndex].name;
        const selectedAccessories = Array.from(accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(checkbox => checkbox.dataset.name);
        const desiredFinishDate = finishDateInput.value;

        const orderData = {
            userId: user.uid,
            userName: user.displayName || user.email, // Use display name if available, otherwise email
            productId: currentProduct.id,
            productName: currentProduct.name,
            selectedModel: selectedModel,
            selectedAccessories: selectedAccessories,
            basePrice: currentProduct.price,
            totalPrice: currentTotalPrice, // This is the total for the item, not just the paymentAmount
            paymentAmount: paymentAmount,
            paymentType: paymentType,
            desiredFinishDate: desiredFinishDate,
            orderDate: serverTimestamp(),
            status: 'Pending Pembayaran'
        };

        try {
            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("Order document written with ID: ", docRef.id);
            displayPaymentInstructions(paymentAmount, orderData);

        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Terjadi kesalahan saat menyimpan pesanan Anda. Silakan coba lagi.");
        }
    }

    function displayPaymentInstructions(paymentAmount, orderData) {
        const whatsappMessage = `Halo Butik Lestari, saya telah melakukan pemesanan berikut:\n\n` +
                                `ID Pesanan: [Segera setelah konfirmasi transfer]\n` + // ID will be provided after manual verification
                                `Nama Produk: ${orderData.productName}\n` +
                                `Model: ${orderData.selectedModel}\n` +
                                `Aksesoris: ${orderData.selectedAccessories.length > 0 ? orderData.selectedAccessories.join(', ') : 'Tidak ada'}\n` +
                                `Tanggal Selesai: ${new Date(orderData.desiredFinishDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}\n` +
                                `Jumlah Dibayar: Rp ${paymentAmount.toLocaleString('id-ID')} (${orderData.paymentType === 'DP' ? 'DP 50%' : 'Pembayaran Penuh'})\n` +
                                `Total Harga Pesanan: Rp ${orderData.totalPrice.toLocaleString('id-ID')}\n\n` +
                                `Mohon konfirmasi pesanan dan instruksi selanjutnya.`;


        orderSummaryContent.innerHTML = `
            <h3>Pesanan Berhasil Dibuat!</h3>
            <p>Jumlah yang harus dibayarkan: <strong> Rp ${paymentAmount.toLocaleString('id-ID')}</strong></p>
            <p class="important-note">Mohon segera lakukan transfer pembayaran ke rekening berikut:</p>
            <p><strong>Bank:</strong> BCA</p>
            <p><strong>Nomor Rekening:</strong> 1234567890</p>
            <p><strong>Atas Nama:</strong> PT Butik Lestari</p>
            <p class="payment-guidance">Setelah transfer atau jika ada pertanyaan, silakan konfirmasi pembayaran dan konsultasi lebih lanjut melalui WhatsApp:</p>
            <button class="btn btn-primary" id="contact-owner-btn-final">
                <i class="fab fa-whatsapp"></i> Chat WhatsApp Pemilik
            </button>
            <p class="small-text">Tim kami akan memverifikasi pembayaran Anda dan menghubungi Anda kembali.</p>
        `;

        // Sembunyikan tombol DP/Penuh
        if (payDpBtn) payDpBtn.style.display = 'none';
        if (payFullBtn) payFullBtn.style.display = 'none';

        // Tambahkan event listener ke tombol WhatsApp yang baru (jika ada)
        const finalWhatsappBtn = document.getElementById('contact-owner-btn-final');
        if (finalWhatsappBtn) {
            finalWhatsappBtn.onclick = () => {
                window.open(`https://wa.me/${ownerWhatsApp}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            };
        }
        orderConfirmationModal.classList.add('show'); // Pastikan modal tetap terbuka dengan info baru
    }


    // Event listener for "Chat dengan Pemilik" button
    if (contactOwnerBtn) {
        contactOwnerBtn.addEventListener('click', () => {
            const defaultMessage = encodeURIComponent("Halo, saya tertarik dengan salah satu produk Anda. Bisakah saya mendapatkan informasi lebih lanjut?");
            window.open(`https://wa.me/${ownerWhatsApp}?text=${defaultMessage}`, '_blank');
        });
    }

    // Load product detail on page load
    loadProductDetail();
});