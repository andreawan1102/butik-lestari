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

    const registerModal = document.getElementById('register-modal');
    const closeButtonRegister = registerModal ? registerModal.querySelector('.close-button') : null;
    const registerForm = document.getElementById('register-form');
    const registerLink = document.querySelector('.register-link a');
    const loginLink = document.querySelector('.login-link a');

    const orderConfirmationModal = document.getElementById('order-confirmation-modal');
    const closeButtonOrder = orderConfirmationModal ? orderConfirmationModal.querySelector('.close-button') : null;
    const orderSummaryContent = document.getElementById('order-summary-content');
    const payDpBtn = document.getElementById('pay-dp-btn');
    const payFullBtn = document.getElementById('pay-full-btn');

    // Elemen detail produk
    const mainProductImage = document.getElementById('main-product-image');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const modelSelect = document.getElementById('model-select');
    const accessoriesOptionsDiv = document.getElementById('accessories-options');
    const finishDateInput = document.getElementById('finish-date');
    const totalPriceDisplay = document.getElementById('total-price-display');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const contactOwnerBtn = document.getElementById('contact-owner-btn');
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');

    // New elements for own fabric
    const ownFabricCheckbox = document.getElementById('own-fabric-checkbox');
    const fabricCostInfo = document.getElementById('fabric-cost-info');
    const additionalFabricCostDisplay = document.getElementById('additional-fabric-cost');

    let currentProduct = null; // To store the product data being viewed

    // --- Data Produk Simulasi (bisa diganti dengan data dari Firebase di kemudian hari) ---
    const products = [
        {
            id: '1',
            name: 'Kebaya Klasik',
            description: 'Kebaya modern dengan sentuhan klasik, cocok untuk acara formal dan pesta.',
            basePrice: 500000, // Harga dasar jasa jahit
            fabricCost: 250000, // Biaya kain jika tidak bawa sendiri
            images: [
                './image_a741bd.png',
                './image_a74d04.png',
                './image_a7b621.png'
            ],
            models: [
                { name: 'Model A', priceAdjustment: 0, image: './image_a741bd.png' },
                { name: 'Model B', priceAdjustment: 100000, image: './image_a74d04.png' },
                { name: 'Model C', priceAdjustment: 150000, image: './image_a7b621.png' }
            ],
            accessories: [
                { name: 'Bros Swarovski', price: 75000 },
                { name: 'Selendang Batik', price: 120000 },
                { name: 'Payet Tangan', price: 80000 }
            ]
        },
        {
            id: '2',
            name: 'Gaun Pesta Elegan',
            description: 'Gaun malam dengan desain mewah dan material berkualitas tinggi.',
            basePrice: 800000,
            fabricCost: 350000,
            images: [
                './image_9d45f7.png',
                './image_9d5878.png',
                './image_9d5b65.png'
            ],
            models: [
                { name: 'Model X', priceAdjustment: 0, image: './image_9d45f7.png' },
                { name: 'Model Y', priceAdjustment: 200000, image: './image_9d5878.png' },
                { name: 'Model Z', priceAdjustment: 300000, image: './image_9d5b65.png' }
            ],
            accessories: [
                { name: 'Sarung Tangan Satin', price: 50000 },
                { name: 'Kalung Berlian Imitasi', price: 150000 }
            ]
        },
        {
            id: '3',
            name: 'Jas Pria Modern',
            description: 'Jas slim-fit untuk tampilan formal yang trendi.',
            basePrice: 700000,
            fabricCost: 300000,
            images: [
                './image_9c64b5.png',
                './image_9c735a.png',
                './image_9cd537.png'
            ],
            models: [
                { name: 'Model Alpha', priceAdjustment: 0, image: './image_9c64b5.png' },
                { name: 'Model Beta', priceAdjustment: 100000, image: './image_9c735a.png' },
                { name: 'Model Gamma', priceAdjustment: 180000, image: './image_9cd537.png' }
            ],
            accessories: [
                { name: 'Dasi Sutra', price: 60000 },
                { name: 'Manset Kemeja', price: 45000 }
            ]
        },
        {
            id: '4',
            name: 'Baju Batik Kontemporer',
            description: 'Kemeja batik dengan desain kontemporer, cocok untuk acara semi-formal.',
            basePrice: 400000,
            fabricCost: 200000,
            images: [
                './image_124a59.jpg',
                './image_dad5cf.jpg',
                './image_db3a2d.jpg'
            ],
            models: [
                { name: 'Model A', priceAdjustment: 0, image: './image_124a59.jpg' },
                { name: 'Model B', priceAdjustment: 50000, image: './image_dad5cf.jpg' },
                { name: 'Model C', priceAdjustment: 75000, image: './image_db3a2d.jpg' }
            ],
            accessories: [
                { name: 'Furing', price: 70000 }
            ]
        }
    ];

    const ownerWhatsApp = '6281234567890'; // Ganti dengan nomor WhatsApp pemilik

    // --- Fungsi Cek & Atur Status Login (Diulang agar halaman detail bisa mandiri) ---
    function isUserLoggedIn() {
        return localStorage.getItem('loggedIn') === 'true';
    }

    function setLoggedInStatus(status) {
        if (status) {
            localStorage.setItem('loggedIn', 'true');
            if (loginBtnDetail) {
                loginBtnDetail.textContent = 'Logout';
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
        e.preventDefault(); // Mencegah navigasi default link
        if (loginModal) {
            loginModal.classList.add('show');
        }
    }

    function openRegisterModal(e) {
        e.preventDefault();
        if (registerModal) {
            registerModal.classList.add('show');
            if (loginModal) {
                loginModal.classList.remove('show'); // Sembunyikan modal login
            }
        }
    }

    function logoutUser(e) {
        e.preventDefault();
        // Firebase signOut
        signOut(auth).then(() => {
            setLoggedInStatus(false);
            alert('Anda telah logout.');
            // Opsional: Redirect ke halaman utama atau refresh
            // window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Error signing out:", error);
            alert('Gagal logout. Silakan coba lagi.');
        });
    }

    // Initialize login status on page load
    setLoggedInStatus(isUserLoggedIn());

    // Event Listeners for Modals
    if (loginBtnDetail) {
        loginBtnDetail.addEventListener('click', isUserLoggedIn() ? logoutUser : openLoginModal);
    }

    if (closeButtonLogin) {
        closeButtonLogin.addEventListener('click', () => {
            if (loginModal) loginModal.classList.remove('show');
        });
    }

    if (closeButtonRegister) {
        closeButtonRegister.addEventListener('click', () => {
            if (registerModal) registerModal.classList.remove('show');
        });
    }

    if (closeButtonOrder) {
        closeButtonOrder.addEventListener('click', () => {
            if (orderConfirmationModal) orderConfirmationModal.classList.remove('show');
        });
    }

    // Close modals if clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.classList.remove('show');
        }
        if (event.target === registerModal) {
            registerModal.classList.remove('show');
        }
        if (event.target === orderConfirmationModal) {
            orderConfirmationModal.classList.remove('show');
        }
    });

    // Login Form Submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            // In a real application, you'd send this to your backend or Firebase for authentication
            // For now, a simple simulation:
            signInWithEmailAndPassword(auth, username, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    alert('Login berhasil! Selamat datang, ' + user.email);
                    setLoggedInStatus(true);
                    if (loginModal) loginModal.classList.remove('show'); // Hide modal on successful login
                    // Optionally, redirect or refresh the page to show logged-in state
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(`Login Gagal: ${errorMessage}`);
                    console.error("Login Error:", errorCode, errorMessage);
                });
        });
    }

    // Register Form Submission
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = registerForm.reg_email.value;
            const password = registerForm.reg_password.value;

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    alert('Registrasi berhasil! Selamat datang, ' + user.email + '. Silakan login.');
                    if (registerModal) registerModal.classList.remove('show');
                    if (loginModal) loginModal.classList.add('show'); // Show login modal after registration
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(`Registrasi Gagal: ${errorMessage}`);
                    console.error("Registration Error:", errorCode, errorMessage);
                });
        });
    }

    // Toggle between login and register modals
    if (registerLink) {
        registerLink.addEventListener('click', openRegisterModal);
    }

    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (registerModal) registerModal.classList.remove('show');
            if (loginModal) loginModal.classList.add('show');
        });
    }

    // Mobile menu toggle
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            if (nav) {
                nav.classList.toggle('active');
            }
        });
    }

    // --- Product Detail Logic ---

    function calculateTotalPrice() {
        if (!currentProduct) return 0;

        let total = currentProduct.basePrice;

        // Add model price adjustment
        const selectedModelIndex = modelSelect.value;
        if (selectedModelIndex !== "" && currentProduct.models[selectedModelIndex]) {
            total += currentProduct.models[selectedModelIndex].priceAdjustment;
        }

        // Add accessories price
        accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            total += parseFloat(checkbox.dataset.price);
        });

        // Handle own fabric option
        if (!ownFabricCheckbox.checked) {
            total += currentProduct.fabricCost;
            fabricCostInfo.style.display = 'block';
            additionalFabricCostDisplay.textContent = `Rp ${currentProduct.fabricCost.toLocaleString('id-ID')}`;
        } else {
            fabricCostInfo.style.display = 'none';
        }

        return total;
    }

    function updateTotalPriceDisplay() {
        const total = calculateTotalPrice();
        if (totalPriceDisplay) {
            totalPriceDisplay.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        }
    }

    function loadProductDetail() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        currentProduct = products.find(p => p.id === productId);

        if (currentProduct) {
            if (mainProductImage) mainProductImage.src = currentProduct.images[0];
            if (productName) productName.textContent = currentProduct.name;
            if (productDescription) productDescription.textContent = currentProduct.description;

            // Clear previous options
            if (modelSelect) modelSelect.innerHTML = '';
            if (accessoriesOptionsDiv) accessoriesOptionsDiv.innerHTML = '';
            if (thumbnailGallery) thumbnailGallery.innerHTML = '';

            // Populate models
            if (modelSelect) {
                currentProduct.models.forEach((model, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${model.name} (Rp ${model.priceAdjustment.toLocaleString('id-ID')})`;
                    modelSelect.appendChild(option);
                });
                modelSelect.addEventListener('change', () => {
                    const selectedModel = currentProduct.models[modelSelect.value];
                    if (mainProductImage && selectedModel && selectedModel.image) {
                        mainProductImage.src = selectedModel.image;
                    }
                    updateTotalPriceDisplay();
                });
            }

            // Populate accessories
            if (accessoriesOptionsDiv) {
                currentProduct.accessories.forEach(accessory => {
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.innerHTML = `
                        <input type="checkbox" id="accessory-${accessory.name}" data-name="${accessory.name}" data-price="${accessory.price}">
                        <label for="accessory-${accessory.name}">${accessory.name} (Rp ${accessory.price.toLocaleString('id-ID')})</label>
                    `;
                    accessoriesOptionsDiv.appendChild(checkboxDiv);
                });
                accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                    checkbox.addEventListener('change', updateTotalPriceDisplay);
                });
            }

            // Populate thumbnails
            if (thumbnailGallery) {
                currentProduct.images.forEach(imageSrc => {
                    const img = document.createElement('img');
                    img.src = imageSrc;
                    img.alt = currentProduct.name;
                    img.classList.add('thumbnail');
                    img.addEventListener('click', () => {
                        if (mainProductImage) mainProductImage.src = imageSrc;
                    });
                    thumbnailGallery.appendChild(img);
                });
            }

            // Event listener for own fabric checkbox
            if (ownFabricCheckbox) {
                ownFabricCheckbox.addEventListener('change', updateTotalPriceDisplay);
            }

            // Initial price calculation
            updateTotalPriceDisplay();

        } else {
            if (productName) productName.textContent = 'Produk Tidak Ditemukan';
            if (productDescription) productDescription.textContent = 'Maaf, produk yang Anda cari tidak tersedia.';
            // Hide other elements if product not found
            if (modelSelect) modelSelect.style.display = 'none';
            if (accessoriesOptionsDiv) accessoriesOptionsDiv.style.display = 'none';
            if (addToCartBtn) addToCartBtn.style.display = 'none';
            if (contactOwnerBtn) contactOwnerBtn.style.display = 'none';
            if (finishDateInput) finishDateInput.style.display = 'none';
            if (ownFabricCheckbox) ownFabricCheckbox.style.display = 'none';
            if (document.querySelector('label[for="model-select"]')) document.querySelector('label[for="model-select"]').style.display = 'none';
            if (document.querySelector('label[for="finish-date"]')) document.querySelector('label[for="finish-date"]').style.display = 'none';
            if (document.querySelector('label[for="own-fabric-checkbox"]')) document.querySelector('label[for="own-fabric-checkbox"]').style.display = 'none';
        }
    }

    // Handle "Pesan Sekarang" button click
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (!isUserLoggedIn()) {
                alert('Anda harus login untuk melihat detail produk atau melakukan pemesanan.');
                if (loginModal) loginModal.classList.add('show');
                return;
            }

            const selectedModelIndex = modelSelect.value;
            if (selectedModelIndex === "") {
                alert("Mohon pilih model baju terlebih dahulu.");
                return;
            }

            const desiredFinishDate = finishDateInput.value;
            if (!desiredFinishDate) {
                alert('Mohon pilih tanggal selesai baju.');
                return;
            }

            const totalPrice = calculateTotalPrice();
            const selectedModel = currentProduct.models[selectedModelIndex];
            const selectedAccessories = Array.from(accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]:checked'))
                                            .map(checkbox => ({
                                                name: checkbox.dataset.name,
                                                price: parseFloat(checkbox.dataset.price)
                                            }));

            // Show confirmation modal
            if (orderConfirmationModal && orderSummaryContent) {
                orderSummaryContent.innerHTML = `
                    <p><strong>Nama Produk:</strong> ${currentProduct.name}</p>
                    <p><strong>Model:</strong> ${selectedModel.name}</p>
                    <p><strong>Aksesoris:</strong> ${selectedAccessories.length > 0 ? selectedAccessories.map(acc => acc.name).join(', ') : 'Tidak ada'}</p>
                    <p><strong>Tanggal Selesai:</strong> ${desiredFinishDate}</p>
                    <p class="dp-info">Harga DP (50%): <strong>Rp ${(totalPrice / 2).toLocaleString('id-ID')}</strong></p>
                    <p><strong>Harga Total:</strong> <span class="final-price-display">Rp ${totalPrice.toLocaleString('id-ID')}</span></p>
                    <p class="important-note">Harap perhatikan: Tanggal selesai yang Anda pilih adalah tanggal baju selesai dijahit, belum termasuk waktu pengiriman.</p>
                `;
                orderConfirmationModal.classList.add('show');
                if (payDpBtn) payDpBtn.style.display = 'inline-block';
                if (payFullBtn) payFullBtn.style.display = 'inline-block';
            }
        });
    }

    // Handle "Bayar DP" button click
    if (payDpBtn) {
        payDpBtn.addEventListener('click', () => {
            const totalPrice = calculateTotalPrice();
            const dpAmount = totalPrice / 2;
            proceedToPayment(dpAmount, "DP");
        });
    }

    // Handle "Bayar Penuh" button click
    if (payFullBtn) {
        payFullBtn.addEventListener('click', () => {
            const totalPrice = calculateTotalPrice();
            proceedToPayment(totalPrice, "Penuh");
        });
    }

    // Fungsi untuk melanjutkan ke pembayaran (simulasi)
    async function proceedToPayment(paymentAmount, paymentType) {
        const selectedModelIndex = modelSelect.value;
        const selectedModel = currentProduct.models[selectedModelIndex].name;
        const selectedAccessories = Array.from(accessoriesOptionsDiv.querySelectorAll('input[type="checkbox"]:checked'))
                                        .map(checkbox => checkbox.dataset.name);
        const desiredFinishDate = finishDateInput.value;

        // Prepare order data for Firebase
        const orderData = {
            userId: auth.currentUser ? auth.currentUser.uid : 'guest', // Use user ID if logged in
            productId: currentProduct.id,
            productName: currentProduct.name,
            selectedModel: selectedModel,
            selectedAccessories: selectedAccessories,
            ownFabric: ownFabricCheckbox.checked,
            totalPrice: calculateTotalPrice(),
            paymentAmount: paymentAmount,
            paymentType: paymentType,
            desiredFinishDate: desiredFinishDate,
            orderDate: serverTimestamp(),
            status: 'Pending Pembayaran'
        };

        try {
            const docRef = await addDoc(collection(db, "orders"), orderData);
            console.log("Order submitted with ID: ", docRef.id);
            displayFinalPaymentInfo(paymentAmount, orderData, docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
            alert("Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.");
        }
    }

    function displayFinalPaymentInfo(paymentAmount, orderData, orderId) {
        const whatsappMessage = `Halo Butik Lestari, saya ingin mengonfirmasi pesanan saya.\n\n` +
                                `ID Pesanan: ${orderId}\n` +
                                `Nama Produk: ${orderData.productName}\n` +
                                `Model: ${orderData.selectedModel}\n` +
                                `Aksesoris: ${orderData.selectedAccessories.length > 0 ? orderData.selectedAccessories.join(', ') : 'Tidak ada'}\n` +
                                `Bawa Kain Sendiri: ${orderData.ownFabric ? 'Ya' : 'Tidak'}\n` +
                                `Tanggal Selesai yang Diinginkan: ${orderData.desiredFinishDate}\n` +
                                `Jumlah Pembayaran: Rp ${paymentAmount.toLocaleString('id-ID')} (${orderData.paymentType})\n` +
                                `\nMohon petunjuk untuk langkah selanjutnya.`;

        orderSummaryContent.innerHTML = `
            <h3>Terima kasih atas pesanan Anda!</h3>
            <p>ID Pesanan Anda: <strong>${orderId}</strong></p>
            <p>Total yang harus dibayarkan untuk ${orderData.paymentType} adalah: <strong> Rp ${paymentAmount.toLocaleString('id-ID')}</strong></p>
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


    // Handle "Hubungi Pemilik" button click
    if (contactOwnerBtn) {
        contactOwnerBtn.addEventListener('click', () => {
            const defaultMessage = encodeURIComponent("Halo, saya tertarik dengan salah satu produk Anda. Bisakah saya mendapatkan informasi lebih lanjut?");
            window.open(`https://wa.me/${ownerWhatsApp}?text=${defaultMessage}`, '_blank');
        });
    }

    // Load product detail on page load
    loadProductDetail();
});