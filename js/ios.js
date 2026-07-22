/* =====================================================
   iOS phone-homescreen behaviour.

   The Mac desktop (js/macos.js) already builds every app as a
   .window[data-app]. On phones we hide the Mac chrome, paint an iOS
   homescreen, and open those same windows full-screen as "apps" — reusing
   all the existing app logic (projects, notes, mail, messages, …).

   Everything here is a no-op on wider screens: the homescreen is only wired
   up while :root has the `ios` class, which index.html sets before first
   paint and this file keeps in sync on resize.
   ===================================================== */
(function () {
  'use strict';

  var PHONE_MQ = window.matchMedia('(max-width: 720px)');
  var root = document.documentElement;

  /* ---------- SVG glyphs (reused from the Mac dock / menu bar) ---------- */
  var G = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zm.9 2L12 13l8.1-5.5H3.9z"/></svg>',
    messages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2c5.1 0 9.2 3.4 9.2 7.6s-4.1 7.6-9.2 7.6a11 11 0 0 1-2.6-.3c-1 .7-2.6 1.6-4.3 1.8-.3 0-.5-.2-.4-.5.3-.6.8-1.7 1-2.8-1.8-1.4-2.9-3.4-2.9-5.8 0-4.2 4.1-7.6 9.2-7.6z"/></svg>',
    notes: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 8.5h12M6 12.5h12M6 16.5h8"/></svg>',
    work: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 2.5h7.2L19 7.8V21a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21V3a.5.5 0 0 1 .5-.5zm6.6 1.6v3.8h3.7l-3.7-3.8z"/></svg>',
    projects: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3.2c.4 0 .8.2 1.1.5l.9.9H13a1.5 1.5 0 0 1 1.5 1.5v.6h-13V3.5zM1.5 6.8h13v5.7A1.5 1.5 0 0 1 13 14H3a1.5 1.5 0 0 1-1.5-1.5V6.8z"/></svg>',
    photos: '<svg viewBox="0 0 48 48" aria-hidden="true">' +
      '<circle cx="24" cy="12.5" r="8.4" fill="#fdd10a"/>' +
      '<circle cx="34" cy="18.5" r="8.4" fill="#f97e0f"/>' +
      '<circle cx="34" cy="30" r="8.4" fill="#ec2c8f"/>' +
      '<circle cx="24" cy="35.5" r="8.4" fill="#7b3ff2"/>' +
      '<circle cx="14" cy="30" r="8.4" fill="#12b3ff"/>' +
      '<circle cx="14" cy="18.5" r="8.4" fill="#2ecb57"/>' +
      '<circle cx="24" cy="24" r="6.6" fill="#fff"/></svg>',
    resume: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h7l4 4v15a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm6 1.6V7h3.4L13 3.6zM8.5 11h7v1.4h-7zM8.5 14h7v1.4h-7zM8.5 17h4.5v1.4H8.5z"/></svg>',
    github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.4.7 0-.6.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8a7.6 7.6 0 0 1 4 0c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.5.8 1.2.8 2.1 0 3-1.8 3.7-3.6 3.9.3.3.5.8.5 1.5v2.2c0 .2.1.5.6.4A8 8 0 0 0 8 0z"/></svg>',
    linkedin: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.6 5.3H.7V15h2.9V5.3zM2.1 1a1.7 1.7 0 1 0 0 3.4A1.7 1.7 0 0 0 2.1 1zM15.3 9.5c0-2.8-1.5-4.4-3.6-4.4-1.5 0-2.3.8-2.7 1.4V5.3H6.1c0 .8 0 9.7 0 9.7H9V9.6c0-.3 0-.5.1-.7.2-.5.7-1.1 1.5-1.1 1 0 1.5.8 1.5 2V15h2.9V9.5z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"/></svg>'
  };

  /* ---------- App catalogue ---------- */
  // `open` = data-app of the window to launch. `href` = external link.
  var GRID = [
    { key: 'calendar', label: 'Calendar', open: 'calendar', icon: 'calendar' },
    { key: 'about',    label: 'About Me', open: 'about',    icon: 'about' },
    { key: 'work',     label: 'Work',     open: 'pages',    icon: 'work' },
    { key: 'photos',   label: 'Photos',   open: 'photos',   icon: 'photos' },
    { key: 'resume',   label: 'Resume',   open: 'preview',  icon: 'resume' },
    { key: 'github',   label: 'GitHub',   href: 'https://github.com/vliu12', icon: 'github' },
    { key: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/victoria-liu-9a439a294/', icon: 'linkedin' },
    { key: 'x',        label: 'X',        href: 'https://x.com/victor1aliu', icon: 'x' }
  ];

  var DOCK = [
    { key: 'messages', label: 'Messages', open: 'messages', icon: 'messages' },
    { key: 'mail',     label: 'Mail',     open: 'mail',     icon: 'mail' },
    { key: 'notes',    label: 'Notes',    open: 'notes',    icon: 'notes' },
    { key: 'projects', label: 'Projects', open: 'projects', icon: 'projects' }
  ];

  // Friendly names for the nav bar, keyed by window data-app.
  var APP_TITLES = {
    calendar: 'Calendar', about: 'About Me', pages: 'Work', photos: 'Photos',
    preview: 'Resume', notes: 'Notes', projects: 'Projects', mail: 'Mail',
    messages: 'Messages'
  };

  // Apps whose content is light, so the home indicator needs to be dark.
  var LIGHT_APPS = { notes: true, messages: true, pages: true, preview: true, about: true };

  /* ---------- Build an app icon ---------- */
  function makeIcon(app) {
    var el = app.href
      ? document.createElement('a')
      : document.createElement('button');

    el.className = 'ios-app';
    if (app.href) {
      el.href = app.href;
      el.target = '_blank';
      el.rel = 'noopener';
    } else {
      el.type = 'button';
    }
    el.setAttribute('aria-label', app.label);

    var iconInner;
    if (app.icon === 'calendar') {
      // Live date, the way the real Calendar icon reads.
      var now = new Date();
      var dow = now.toLocaleDateString('en-US', { weekday: 'short' });
      iconInner =
        '<span class="ico-cal-dow">' + dow + '</span>' +
        '<span class="ico-cal-day">' + now.getDate() + '</span>';
    } else if (app.icon === 'about') {
      iconInner = '<img src="img/profile.jpg" alt="">';
    } else {
      iconInner = G[app.icon] || '';
    }

    el.innerHTML =
      '<span class="ios-app-icon ico-' + app.icon + '">' + iconInner + '</span>' +
      '<span class="ios-app-label">' + app.label + '</span>';

    if (app.open) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openApp(app.open);
      });
    }
    return el;
  }

  function buildHome() {
    var grid = document.getElementById('ios-grid');
    var dock = document.getElementById('ios-dock');
    if (grid && !grid.childElementCount) {
      GRID.forEach(function (a) { grid.appendChild(makeIcon(a)); });
    }
    if (dock && !dock.childElementCount) {
      DOCK.forEach(function (a) { dock.appendChild(makeIcon(a)); });
    }
  }

  /* ---------- Open / close apps ---------- */
  var appbar = document.getElementById('ios-appbar');
  var appbarTitle = document.getElementById('ios-appbar-title');
  var homebar = document.getElementById('ios-homebar');

  function openApp(dataApp) {
    var api = window.macDesktop;
    var win = document.querySelector('.window[data-app="' + dataApp + '"]');
    if (!api || !win) return;

    api.openWindow(win);

    if (appbarTitle) appbarTitle.textContent = APP_TITLES[dataApp] || '';
    if (appbar) appbar.hidden = false;
    if (homebar) homebar.hidden = false;
    root.classList.add('app-open');
    root.classList.toggle('app-light', !!LIGHT_APPS[dataApp]);
  }

  function goHome() {
    var api = window.macDesktop;
    // Close every open app so the home button always lands on the homescreen.
    var open = document.querySelectorAll('.window:not([hidden])');
    [].forEach.call(open, function (win) {
      if (api) api.closeWindow(win);
      else win.hidden = true;
    });
    if (appbar) appbar.hidden = true;
    if (homebar) homebar.hidden = true;
    root.classList.remove('app-open', 'app-light');
  }

  /* ---------- Status bar ---------- */
  function startStatusClock() {
    var el = document.getElementById('ios-sb-time');
    if (!el) return;
    function tick() {
      el.textContent = new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit'
      });
    }
    tick();
    setInterval(tick, 10000);
  }

  function initBattery() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then(function (b) {
      var fill = document.querySelector('.ios-sb-batt i');
      function paint() {
        if (fill) fill.style.width = Math.round(b.level * 100) + '%';
      }
      paint();
      b.addEventListener('levelchange', paint);
    }).catch(function () {});
  }

  /* ---------- Photos homescreen widget (auto cross-fade) ---------- */
  var ALBUM = [];
  (function () {
    for (var i = 1; i <= 9; i++) {
      ALBUM.push('img/album/album-' + (i < 10 ? '0' + i : i) + '.jpg');
    }
  })();

  function initPhotosWidget() {
    var stage = document.getElementById('iw-photos-stage');
    if (!stage || stage.childElementCount) return;

    var order = ALBUM.slice();
    for (var s = order.length - 1; s > 0; s--) {
      var j = Math.floor(Math.random() * (s + 1));
      var t = order[s]; order[s] = order[j]; order[j] = t;
    }

    var layers = [document.createElement('img'), document.createElement('img')];
    layers.forEach(function (img) { img.alt = ''; img.decoding = 'async'; stage.appendChild(img); });

    var pos = 0, front = 0;
    function show(index) {
      index = ((index % order.length) + order.length) % order.length;
      pos = index;
      var back = front ^ 1;
      var img = layers[back];
      var swapped = false;
      function swap() {
        if (swapped) return;
        swapped = true;
        layers[front].classList.remove('is-active');
        img.classList.add('is-active');
        front = back;
      }
      img.onload = swap;
      img.src = order[index];
      if (img.complete && img.naturalWidth) swap();
    }
    show(0);
    setInterval(function () { show(pos + 1); }, 4200);
  }

  /* ---------- Calendar app ---------- */
  function initCalendarApp() {
    var titleEl = document.getElementById('calapp-title');
    var dowsEl = document.getElementById('calapp-dows');
    var grid = document.getElementById('calapp-grid');
    if (!titleEl || !grid || grid.dataset.ready) return;
    grid.dataset.ready = '1';

    var prevBtn = document.getElementById('calapp-prev');
    var nextBtn = document.getElementById('calapp-next');
    var todayBtn = document.getElementById('calapp-today');
    var egg = document.getElementById('calapp-egg');

    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    var DOWS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // April 12 is the birthday easter egg, matching the Mac calendar widget.
    var BDAY_MONTH = 3, BDAY_DAY = 12;

    var now = new Date();
    var todayY = now.getFullYear(), todayM = now.getMonth(), todayD = now.getDate();
    var viewY = todayY, viewM = todayM;
    var eggTimer = null;

    dowsEl.innerHTML = DOWS.map(function (d) { return '<span>' + d + '</span>'; }).join('');

    function render() {
      titleEl.innerHTML = MONTHS[viewM] + ' <span class="calapp-year">' + viewY + '</span>';
      var firstDow = new Date(viewY, viewM, 1).getDay();
      var daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

      var html = '';
      for (var i = 0; i < firstDow; i++) html += '<span class="calapp-cell empty"></span>';
      for (var d = 1; d <= daysInMonth; d++) {
        var isToday = viewY === todayY && viewM === todayM && d === todayD;
        html += '<button class="calapp-cell' + (isToday ? ' today' : '') +
          '" type="button" data-day="' + d + '"><span class="num">' + d + '</span></button>';
      }
      grid.innerHTML = html;
    }

    function hideEgg() { if (egg) egg.classList.remove('show'); }
    function showEgg() {
      if (!egg) return;
      egg.classList.add('show');
      clearTimeout(eggTimer);
      eggTimer = setTimeout(hideEgg, 4200);
    }

    function shift(delta) {
      viewM += delta;
      if (viewM < 0) { viewM = 11; viewY -= 1; }
      else if (viewM > 11) { viewM = 0; viewY += 1; }
      hideEgg();
      render();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { shift(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { shift(1); });
    if (todayBtn) todayBtn.addEventListener('click', function () {
      viewY = todayY; viewM = todayM; hideEgg(); render();
    });

    grid.addEventListener('click', function (e) {
      var cell = e.target.closest('.calapp-cell[data-day]');
      if (!cell) return;
      if (viewM === BDAY_MONTH && parseInt(cell.dataset.day, 10) === BDAY_DAY) {
        cell.classList.add('bday');
        showEgg();
      }
    });

    render();
  }

  /* ---------- Photos app (grid + lightbox) ---------- */
  function initPhotosApp() {
    var grid = document.getElementById('photoapp-grid');
    if (!grid || grid.dataset.ready) return;
    grid.dataset.ready = '1';

    ALBUM.forEach(function (src, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = '<img src="' + src + '" alt="" loading="lazy">';
      btn.addEventListener('click', function () { openViewer(i); });
      grid.appendChild(btn);
    });

    var viewer = document.getElementById('photoapp-viewer');
    var img = document.getElementById('pv-img');
    var closeBtn = document.getElementById('pv-close');
    var prevBtn = document.getElementById('pv-prev');
    var nextBtn = document.getElementById('pv-next');
    var idx = 0;

    function paint() { if (img) img.src = ALBUM[idx]; }
    function openViewer(i) {
      idx = i; paint();
      if (viewer) viewer.hidden = false;
    }
    function step(d) {
      idx = ((idx + d) % ALBUM.length + ALBUM.length) % ALBUM.length;
      paint();
    }

    if (closeBtn) closeBtn.addEventListener('click', function () { viewer.hidden = true; });
    if (prevBtn) prevBtn.addEventListener('click', function () { step(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { step(1); });
  }

  /* ---------- Keep the phone skin in sync with viewport width ---------- */
  function syncMode(e) {
    var isPhone = e ? e.matches : PHONE_MQ.matches;
    root.classList.toggle('ios', isPhone);
    // Leaving phone width mid-app: tidy up so the Mac desktop is clean.
    if (!isPhone) {
      if (appbar) appbar.hidden = true;
      if (homebar) homebar.hidden = true;
      root.classList.remove('app-open', 'app-light');
    }
  }

  if (PHONE_MQ.addEventListener) PHONE_MQ.addEventListener('change', syncMode);
  else if (PHONE_MQ.addListener) PHONE_MQ.addListener(syncMode); // older Safari

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildHome();
    startStatusClock();
    initBattery();
    initPhotosWidget();
    initCalendarApp();
    initPhotosApp();

    var back = document.getElementById('ios-back');
    var indicator = document.getElementById('ios-home-indicator');
    if (back) back.addEventListener('click', goHome);
    if (indicator) indicator.addEventListener('click', goHome);

    syncMode();

    // Deep link: /#calendar, /#work, /#projects, … opens straight into an app
    // on phones (handy for sharing a specific view).
    if (PHONE_MQ.matches && location.hash.length > 1) {
      var byKey = {};
      GRID.concat(DOCK).forEach(function (a) { if (a.open) byKey[a.key] = a.open; });
      var target = byKey[location.hash.slice(1).toLowerCase()];
      if (target) openApp(target);
    }
  });
})();
