/* Foto dan video lokal untuk folder Galeri > Kegiatan. */
const KEGIATAN_MEDIA_LOKAL = [
  {
    Nama: 'Merawat tanaman di kebun ma\'had',
    Gambar: 'assets/galeri/kegiatan-berkebun.webp',
    Tipe: 'foto'
  },
  {
    Nama: 'MSQ Garden — kebun mini santriwati',
    Gambar: 'assets/galeri/msq-garden-tanpa-audio.mp4',
    Poster: 'assets/galeri/kegiatan-berkebun.webp',
    Tipe: 'video'
  }
];

const renderGalleryFoldersAsli = renderGalleryFolders;
renderGalleryFolders = function renderGalleryFoldersDenganKegiatan(groups) {
  const kegiatan = groups.Kegiatan || (groups.Kegiatan = []);
  KEGIATAN_MEDIA_LOKAL.forEach(item => {
    if (!kegiatan.some(existing => existing.Gambar === item.Gambar)) kegiatan.push(item);
  });

  renderGalleryFoldersAsli(groups);
  const tombolKegiatan = document.querySelector('.gallery-folder[data-category="Kegiatan"]');
  const jumlah = tombolKegiatan?.querySelector('.folder-count');
  if (jumlah) jumlah.textContent = `${kegiatan.length} media`;
  if (tombolKegiatan) {
    tombolKegiatan.setAttribute('aria-label', `Buka galeri Kegiatan, ${kegiatan.length} media`);
    tombolKegiatan.style.backgroundImage = 'url("assets/galeri/kegiatan-berkebun.webp")';
  }
};

const galeriVideo = document.createElement('video');
galeriVideo.className = 'lightbox-video';
galeriVideo.controls = true;
galeriVideo.playsInline = true;
galeriVideo.preload = 'metadata';
galeriVideo.setAttribute('aria-label', 'Video kegiatan ma\'had');
lightboxImg.insertAdjacentElement('afterend', galeriVideo);

showCarouselSlide = function showMediaKegiatan() {
  const item = carouselItems[carouselIndex];
  if (!item) return;
  const url = safeUrl(item.Gambar || '');
  if (!url) return;

  galeriVideo.pause();
  galeriVideo.removeAttribute('src');
  galeriVideo.load();

  if (item.Tipe === 'video') {
    lightboxImg.style.display = 'none';
    galeriVideo.style.display = 'block';
    galeriVideo.poster = safeUrl(item.Poster || '');
    galeriVideo.src = url;
  } else {
    galeriVideo.style.display = 'none';
    lightboxImg.style.display = 'block';
    lightboxImg.src = url;
    lightboxImg.alt = item.Nama || 'Foto galeri ma\'had';
  }

  lightboxCaption.textContent = `${item.Nama || ''} — ${carouselIndex + 1}/${carouselItems.length}`;
};

lightbox.querySelector('.lightbox-close').addEventListener('click', () => galeriVideo.pause());
lightbox.addEventListener('click', event => {
  if (event.target === lightbox) galeriVideo.pause();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') galeriVideo.pause();
});
renderGalleryFolders(CURRENT_GALLERY_GROUPS);
