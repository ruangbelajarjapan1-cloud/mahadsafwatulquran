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

/* ---------- 5. Filter Galeri ---------- */
const filterBtns = document.querySelectorAll('.filter-btn');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    // query ulang setiap klik, supaya tetap benar walau galeri
    // baru saja diganti otomatis dari Google Sheet
    document.querySelectorAll('#galleryGrid .gallery-item').forEach(item => {
      if (filter === 'Semua' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});


/* ============================================
   6. KONTEN DINAMIS DARI GOOGLE SHEET (OPSIONAL)
   ============================================
   Kalau Anda ingin Artikel & Galeri bisa diupdate cukup
   dengan edit Google Sheet (tanpa sentuh kode sama sekali),
   isi SHEET_ID di bawah ini. Panduan lengkap ada di README.md.

   Kalau dibiarkan kosong, website tetap jalan normal
   memakai konten statis yang sudah ada di index.html.
*/
const SHEET_ID = "https://docs.google.com/spreadsheets/d/1v2jMro90-PH40YLaDAklNztoQG2tGO8xueuzba2V2X4/edit?usp=sharing";

async function fetchSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));
  const cols = json.table.cols.map(c => c.label);
  return json.table.rows.map(r => {
    const obj = {};
    cols.forEach((c, i) => { obj[c] = r.c[i] ? r.c[i].v : ''; });
    return obj;
  });
}

async function loadArtikelFromSheet() {
  try {
    const data = await fetchSheet('Artikel');
    const grid = document.getElementById('articleGrid');
    if (!data.length) return; // sheet kosong -> biarkan statis

    grid.innerHTML = data.map(item => `
      <article class="article-card">
        <span class="article-tag">${item.Kategori || 'Kabar'}</span>
        <h4>${item.Judul || ''}</h4>
        <p>${item.Ringkasan || ''}</p>
        ${item.Link ? `<a href="${item.Link}" target="_blank" rel="noopener" class="article-link">Baca selengkapnya →</a>` : ''}
      </article>
    `).join('');
  } catch (err) {
    // Gagal ambil data (SHEET_ID belum diisi / sheet privat) -> diamkan saja,
    // konten statis di index.html tetap tampil seperti biasa.
  }
}

async function loadGaleriFromSheet() {
  try {
    const data = await fetchSheet('Galeri');
    const grid = document.getElementById('galleryGrid');
    if (!data.length) return;

    const colorClasses = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
    grid.innerHTML = data.map((item, i) => {
      const cls = colorClasses[i % colorClasses.length];
      const bg = item.Gambar
        ? `style="background-image:url('${item.Gambar}'); background-size:cover; background-position:center;"`
        : '';
      return `
        <div class="gallery-item ${item.Gambar ? '' : cls}" data-category="${item.Kategori || 'Lainnya'}" ${bg}>
          <span>${item.Nama || ''}</span>
        </div>`;
    }).join('');

    // pasang ulang event filter setelah konten baru masuk
    document.querySelectorAll('#galleryGrid .gallery-item').forEach(el => {
      // konten baru otomatis ikut ter-filter lewat data-category
    });
  } catch (err) {
    // Diamkan -> konten galeri statis tetap tampil
  }
}

if (!SHEET_ID.includes("PASTE_ID_GOOGLE_SHEET_DI_SINI")) {
  loadArtikelFromSheet();
  loadGaleriFromSheet();
}

function showStatus(type, message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status show ' + type;
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
