/* ============================================
   MA'HAD SAFWATUL QUR'AN — SCRIPT.JS
   ============================================ */

/* ---------- 1. Menu Hamburger (Mobile) ---------- */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');

hamburgerBtn.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburgerBtn.setAttribute('aria-expanded', isOpen);
});

// Tutup menu otomatis saat salah satu link diklik (khusus mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', false);
  });
});

/* ---------- 2. Tahun otomatis di footer ---------- */
document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- 3. Animasi angka statistik ---------- */
const statNums = document.querySelectorAll('.stat-item .num');
const statsSection = document.querySelector('.stats');
let statsAnimated = false;

function animateStats(){
  statNums.forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const timer = setInterval(() => {
      current += step;
      if (current >= target){
        current = target;
        clearInterval(timer);
      }
      el.textContent = current;
    }, 25);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated){
      statsAnimated = true;
      animateStats();
    }
  });
}, { threshold: 0.4 });

if (statsSection) statsObserver.observe(statsSection);


/* ============================================
   4. FORM PENDAFTARAN -> GOOGLE SHEET (backend)
   ============================================
   PENTING: Ganti nilai SCRIPT_URL di bawah ini dengan
   URL Web App Google Apps Script milik Anda sendiri.
   Panduan lengkap cara membuatnya ada di file README.md
*/
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6-fOzaO9AIOMc0EaqQs7MNfMUxcl77p-9VNV2oBcEn4oRuHN9EYaxgQLoJiwzCPs/exec";

const formDaftar = document.getElementById('formDaftar');
const formStatus = document.getElementById('formStatus');
const btnSubmit = document.getElementById('btnSubmit');

formDaftar.addEventListener('submit', function (e) {
  e.preventDefault();

  if (SCRIPT_URL.includes("PASTE_URL_GOOGLE_APPS_SCRIPT_DI_SINI")) {
    showStatus('error', 'Backend belum terhubung. Admin: silakan ikuti panduan di README.md untuk menghubungkan Google Sheet.');
    return;
  }

  const formData = new FormData(formDaftar);
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Mengirim...';

  fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData
  })
    .then(() => {
      // Google Apps Script Web App tidak selalu mengizinkan pembacaan
      // response (CORS), jadi kita anggap sukses jika tidak ada error jaringan.
      showStatus('success', 'Alhamdulillah, pendaftaran terkirim! Admin kami akan menghubungi Anda via WhatsApp.');
      formDaftar.reset();
    })
    .catch(() => {
      showStatus('error', 'Maaf, terjadi kendala saat mengirim data. Coba lagi atau hubungi admin via WhatsApp.');
    })
    .finally(() => {
      btnSubmit.disabled = false;
      btnSubmit.textContent = 'Kirim Pendaftaran';
    });
});

function showStatus(type, message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status show ' + type;
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
