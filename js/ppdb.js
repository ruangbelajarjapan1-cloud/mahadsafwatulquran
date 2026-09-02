/* Fitur khusus poster dan pengumuman PPDB 2027–2028. */
document.querySelectorAll('[data-share-ppdb]').forEach(button => {
  button.addEventListener('click', async () => {
    const shareUrl = new URL('ppdb.html', window.location.href).href;
    const shareData = {
      title: "PPDB 2027–2028 — Ma'had Shafwatul Qur'an",
      text: "Informasi Penerimaan Santri Baru Ma'had Shafwatul Qur'an Tahun Ajaran 2027–2028.",
      url: shareUrl
    };
    const status = button.closest('.ppdb-poster-copy, .ppdb-page-actions')?.querySelector('[data-share-status]');

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError' && status) status.textContent = 'Tautan belum berhasil dibagikan.';
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      if (status) status.textContent = 'Tautan PPDB berhasil disalin.';
    } catch (err) {
      const text = encodeURIComponent(`${shareData.text} ${shareUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
    }
  });
});

const ppdbDialog = document.getElementById('ppdbAnnouncement');
const ppdbDetailButton = document.getElementById('ppdbAnnouncementDetail');

if (ppdbDialog && ppdbDetailButton) {
  ppdbDetailButton.addEventListener('click', () => {
    ppdbDialog.querySelector('.ppdb-announcement-card')?.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (new URLSearchParams(window.location.search).get('showppdb') === '1') {
    window.setTimeout(() => {
      if (!ppdbDialog.open) document.getElementById('ppdbAnnouncementTrigger')?.click();
    }, 2200);
  }
}
