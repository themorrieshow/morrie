(function () {

  // ── Fullscreen overlay ──────────────────────────────────────
  var overlay = document.createElement('div');
  overlay.className = 'ss-fs';
  overlay.innerHTML =
    '<button class="ss-fs-close" aria-label="Close">&#10005;</button>' +
    '<img class="ss-fs-img" src="" alt="">' +
    '<div class="ss-fs-ui">' +
      '<button class="ss-fs-prev" aria-label="Previous">&#8592;</button>' +
      '<span class="ss-fs-counter"><span class="ss-fs-cur">1</span> / <span class="ss-fs-tot">1</span></span>' +
      '<button class="ss-fs-next" aria-label="Next">&#8594;</button>' +
    '</div>';
  document.body.appendChild(overlay);

  var fsSlides = [], fsCurrent = 0;

  function fsOpen(slides, index) {
    fsSlides = Array.from(slides);
    fsCurrent = index;
    fsSync();
    overlay.classList.add('ss-fs--open');
    document.body.style.overflow = 'hidden';
  }

  function fsClose() {
    overlay.classList.remove('ss-fs--open');
    document.body.style.overflow = '';
  }

  function fsGo(n) {
    if (n < 0 || n >= fsSlides.length) return;
    fsCurrent = n;
    fsSync();
  }

  function fsSync() {
    var img = overlay.querySelector('.ss-fs-img');
    img.src = fsSlides[fsCurrent].src;
    img.alt = fsSlides[fsCurrent].alt;
    overlay.querySelector('.ss-fs-cur').textContent = fsCurrent + 1;
    overlay.querySelector('.ss-fs-tot').textContent = fsSlides.length;
    overlay.querySelector('.ss-fs-prev').disabled = fsCurrent === 0;
    overlay.querySelector('.ss-fs-next').disabled = fsCurrent === fsSlides.length - 1;
  }

  overlay.querySelector('.ss-fs-close').addEventListener('click', fsClose);
  overlay.querySelector('.ss-fs-prev').addEventListener('click', function () { fsGo(fsCurrent - 1); });
  overlay.querySelector('.ss-fs-next').addEventListener('click', function () { fsGo(fsCurrent + 1); });
  overlay.addEventListener('click', function (e) { if (e.target === overlay) fsClose(); });

  document.addEventListener('keydown', function (e) {
    if (!overlay.classList.contains('ss-fs--open')) return;
    if (e.key === 'Escape') fsClose();
    if (e.key === 'ArrowLeft') fsGo(fsCurrent - 1);
    if (e.key === 'ArrowRight') fsGo(fsCurrent + 1);
  });

  // ── Init all slideshows on page ─────────────────────────────
  document.querySelectorAll('.slideshow').forEach(function (el) {
    var track = el.querySelector('.slideshow-track');
    var slides = track.querySelectorAll('.slide');
    var counter = el.querySelector('.slideshow-current');
    var btnPrev = el.querySelector('.slideshow-btn--prev');
    var btnNext = el.querySelector('.slideshow-btn--next');
    var current = 0;

    function goTo(n) {
      if (n < 0 || n >= slides.length) return;
      current = n;
      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      if (counter) counter.textContent = current + 1;
      btnPrev.disabled = current === 0;
      btnNext.disabled = current === slides.length - 1;
    }

    btnPrev.addEventListener('click', function () { goTo(current - 1); });
    btnNext.addEventListener('click', function () { goTo(current + 1); });
    goTo(0); // init disabled states

    // Expand button
    var fsBtn = document.createElement('button');
    fsBtn.className = 'slideshow-btn slideshow-btn--fs';
    fsBtn.setAttribute('aria-label', 'Full screen');
    fsBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 4.5V1H4.5M8.5 1H12V4.5M12 8.5V12H8.5M4.5 12H1V8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    el.appendChild(fsBtn);

    fsBtn.addEventListener('click', function () { fsOpen(slides, current); });

    Array.from(slides).forEach(function (slide, i) {
      slide.style.cursor = 'zoom-in';
      slide.addEventListener('click', function () { fsOpen(slides, i); });
    });
  });

})();
