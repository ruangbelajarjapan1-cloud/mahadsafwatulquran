/* ============================================
   MA'HAD SAFWATUL QUR'AN — SCRIPT.JS
   ============================================ */

/* ---------- 1. Menu Hamburger (Mobile) ---------- */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const navLinks = document.getElementById('navLinks');

if (hamburgerBtn && navLinks) {
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
}

/* ---------- 2. Tahun otomatis di footer ---------- */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

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

if (formDaftar) {
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
}

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
const SHEET_ID = "1v2jMro90-PH40YLaDAklNztoQG2tGO8xueuzba2V2X4";

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
    const grid = document.getElementById('articleGrid');
    if (!grid) return; // halaman ini tidak punya grid artikel
    const data = await fetchSheet('Artikel');
    if (!data.length) { restoreStaticIfEmpty('articleGrid'); return; }

    grid.innerHTML = data.map(item => `
      <article class="article-card">
        <span class="article-tag">${item.Kategori || 'Kabar'}</span>
        <h4>${item.Judul || ''}</h4>
        <p>${item.Ringkasan || ''}</p>
        ${item.Link ? `<a href="${item.Link}" target="_blank" rel="noopener" class="article-link">Baca selengkapnya →</a>` : ''}
      </article>
    `).join('');
  } catch (err) {
    restoreStaticIfEmpty('articleGrid');
  }
}

async function loadGaleriFromSheet() {
  try {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return; // halaman ini tidak punya grid galeri
    const data = await fetchSheet('Galeri');
    if (!data.length) { restoreStaticIfEmpty('galleryGrid'); return; }

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
  } catch (err) {
    restoreStaticIfEmpty('galleryGrid');
  }
}

function showSkeleton(gridId, type, count) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  if (!grid.dataset.staticFallback) {
    grid.dataset.staticFallback = 'true';
    grid._staticHTML = grid.innerHTML; // simpan konten statis asli sebagai cadangan
  }
  const cls = type === 'gallery' ? 'skeleton-gallery' : 'skeleton-card';
  grid.innerHTML = Array(count).fill(`<div class="skeleton ${cls}"></div>`).join('');
}

function restoreStaticIfEmpty(gridId) {
  const grid = document.getElementById(gridId);
  if (grid && grid._staticHTML) grid.innerHTML = grid._staticHTML;
}

async function loadInstagramFromSheet() {
  try {
    const grid = document.getElementById('igGrid');
    if (!grid) return;
    const data = await fetchSheet('Instagram');
    if (!data.length) return; // sheet kosong -> biarkan fallback statis (tombol ke profil IG)

    grid.innerHTML = data.slice(0, 6).map(item => `
      <blockquote class="instagram-media" data-instgrm-permalink="${item.URL}" data-instgrm-version="14" style="margin:0;"></blockquote>
    `).join('');

    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.instagram.com/embed.js';
      script.onload = () => { if (window.instgrm) window.instgrm.Embeds.process(); };
      document.body.appendChild(script);
    }
  } catch (err) {
    // Tab "Instagram" belum ada / gagal dimuat -> fallback statis tetap tampil
  }
}

if (!SHEET_ID.includes("PASTE_ID_GOOGLE_SHEET_DI_SINI")) {
  loadInstagramFromSheet();
  showSkeleton('articleGrid', 'card', 3);
  showSkeleton('galleryGrid', 'gallery', 6);
  loadArtikelFromSheet();
  loadGaleriFromSheet();
}


/* ============================================
   7. BANNER COUNTDOWN PENDAFTARAN
   ============================================
   Datanya diambil otomatis dari tab "Pengaturan" di Google Sheet.
   Nilai di bawah ini HANYA dipakai sebagai cadangan kalau sheet
   belum diisi / gagal dimuat — admin tidak perlu mengubah ini.
*/
let PENDAFTARAN_DEADLINE = "2026-09-30";

function renderCountdown() {
  const el = document.getElementById('countdownText');
  if (!el) return;

  const deadline = new Date(PENDAFTARAN_DEADLINE + "T23:59:59");
  const now = new Date();
  const diffMs = deadline - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    el.textContent = `⏳ Gelombang pendaftaran ditutup dalam ${diffDays} hari lagi — daftarkan putra-putri Anda sekarang!`;
  } else {
    el.textContent = `Pendaftaran gelombang ini sudah ditutup. Hubungi admin untuk info gelombang berikutnya.`;
  }
}
renderCountdown();


/* ============================================
   8. PROGRESS KUOTA PENDAFTARAN
   ============================================
   Sama seperti di atas — datanya dari tab "Pengaturan" di Sheet.
*/
let KUOTA_TERISI = 62;
let KUOTA_TOTAL = 100;

function renderKuota() {
  const bar = document.getElementById('kuotaBar');
  const label = document.getElementById('kuotaLabel');
  if (!bar || !label) return;

  const percent = Math.min(100, Math.round((KUOTA_TERISI / KUOTA_TOTAL) * 100));
  bar.style.width = percent + '%';
  label.textContent = `${KUOTA_TERISI} dari ${KUOTA_TOTAL} kuota santri baru sudah terisi`;
}
renderKuota();


/* ============================================
   9. KALENDER KEGIATAN INTERAKTIF
   ============================================
   Datanya diambil otomatis dari tab "Kalender" di Google Sheet.
   Isi di bawah ini hanya contoh cadangan.
*/
let KEGIATAN_EVENTS = {
  "2026-08-17": ["Upacara &amp; lomba HUT RI"],
  "2026-08-24": ["Ujian tengah semester tahfidz"]
};

let calendarDate = new Date();

function getHijriInfo(date) {
  try {
    const fmt = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' });
    const parts = fmt.formatToParts(date);
    const get = (t) => (parts.find(p => p.type === t) || {}).value || '';
    return { day: get('day'), month: get('month'), year: get('year') };
  } catch (err) {
    return null;
  }
}

function renderCalendar() {
  const grid = document.getElementById('calendarGrid');
  const label = document.getElementById('calendarLabel');
  const eventPanel = document.getElementById('calendarEvents');
  if (!grid || !label) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

  const hijriMid = getHijriInfo(new Date(year, month, 15));
  label.innerHTML = hijriMid
    ? `${monthNames[month]} ${year} <span class="cal-hijri-label">≈ ${hijriMid.month} ${hijriMid.year} H</span>`
    : `${monthNames[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Ahad
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '';
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day cal-empty"></div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const hasEvent = KEGIATAN_EVENTS[dateStr] ? 'has-event' : '';
    const h = getHijriInfo(new Date(year, month, d));
    const hijriSub = h ? `<span class="hijri">${h.day}</span>` : '';
    html += `<div class="cal-day ${hasEvent}" data-date="${dateStr}">${d}${hijriSub}</div>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.cal-day.has-event').forEach(el => {
    el.addEventListener('click', () => {
      grid.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
      el.classList.add('selected');
      const events = KEGIATAN_EVENTS[el.dataset.date] || [];
      eventPanel.innerHTML = events.map(e => `<div class="cal-event-item">📌 ${e}</div>`).join('');
    });
  });

  if (eventPanel) eventPanel.innerHTML = `<p class="note-small" style="margin:0">Klik tanggal bertanda titik untuk lihat agenda.</p>`;
}

const calPrev = document.getElementById('calPrev');
const calNext = document.getElementById('calNext');
if (calPrev && calNext) {
  calPrev.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
  });
  calNext.addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
  });
  renderCalendar();
}


/* ============================================
   10. AMBIL PENGATURAN & KALENDER DARI GOOGLE SHEET
   ============================================
   Tab "Pengaturan" format: kolom Key | Value, contoh isi:
     PENDAFTARAN_DEADLINE | 2026-09-30
     KUOTA_TERISI          | 62
     KUOTA_TOTAL            | 100

   Tab "Kalender" format: kolom Tanggal | Judul
     (boleh beberapa baris dengan tanggal sama)

   Kalau kedua tab ini belum dibuat di Sheet, fitur akan diam saja
   dan memakai nilai cadangan di atas — website tetap aman berjalan.
*/
function parseGvizValue(raw) {
  if (raw && typeof raw === 'string' && raw.startsWith('Date(')) {
    // gviz mengirim tanggal dalam format Date(tahun,bulanIndex,tanggal)
    const parts = raw.replace('Date(', '').replace(')', '').split(',').map(Number);
    const d = new Date(parts[0], parts[1], parts[2]);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  return raw;
}

async function loadPengaturanFromSheet() {
  try {
    const data = await fetchSheet('Pengaturan');
    if (!data.length) return;

    data.forEach(row => {
      const key = (row.Key || '').toString().trim();
      const value = parseGvizValue(row.Value);
      if (key === 'PENDAFTARAN_DEADLINE' && value) {
        PENDAFTARAN_DEADLINE = String(value).slice(0, 10);
      }
      if (key === 'KUOTA_TERISI' && value !== '') {
        KUOTA_TERISI = Number(value);
      }
      if (key === 'KUOTA_TOTAL' && value !== '') {
        KUOTA_TOTAL = Number(value);
      }
    });

    renderCountdown();
    renderKuota();
  } catch (err) {
    // Tab "Pengaturan" belum ada / gagal dimuat -> pakai nilai cadangan
  }
}

async function loadKalenderFromSheet() {
  try {
    const data = await fetchSheet('Kalender');
    if (!data.length) return;

    const events = {};
    data.forEach(row => {
      const tanggal = parseGvizValue(row.Tanggal);
      const judul = row.Judul;
      if (!tanggal || !judul) return;
      if (!events[tanggal]) events[tanggal] = [];
      events[tanggal].push(judul);
    });

    if (Object.keys(events).length) {
      KEGIATAN_EVENTS = events;
      renderCalendar();
    }
  } catch (err) {
    // Tab "Kalender" belum ada / gagal dimuat -> pakai nilai cadangan
  }
}

if (!SHEET_ID.includes("PASTE_ID_GOOGLE_SHEET_DI_SINI")) {
  loadPengaturanFromSheet();
  loadKalenderFromSheet();
}


/* ============================================
   11. SCROLL REVEAL (efek muncul halus saat discroll)
   ============================================
   Progressive enhancement: kalau browser tidak mendukung
   IntersectionObserver, section akan tetap tampil normal
   (tidak disembunyikan sama sekali) — jadi aman.
*/
if ('IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.section, .stats');
  revealTargets.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealTargets.forEach(el => revealObserver.observe(el));
}

function showStatus(type, message) {
  formStatus.textContent = message;
  formStatus.className = 'form-status show ' + type;
  formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
