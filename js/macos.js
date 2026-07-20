/* =====================================================
   macOS desktop behaviour: clock, dock, windows
   ===================================================== */
(function () {
  'use strict';

  /* =====================================================
     MAIL SETUP — one line to make the contact form send.

     A static site can't deliver email on its own, so the Send button
     needs a form endpoint. Pick either service, paste the value below,
     and in-page sending starts working immediately:

       Formspree   https://formspree.io  → create a form, paste its URL
                   e.g. MAIL_ENDPOINT = 'https://formspree.io/f/abcdwxyz';

       Web3Forms   https://web3forms.com → enter your email, get a key
                   MAIL_ENDPOINT   = 'https://api.web3forms.com/submit';
                   MAIL_ACCESS_KEY = 'your-access-key';

     Until MAIL_ENDPOINT is set, Send falls back to opening the
     visitor's own mail client with the message pre-filled.
     ===================================================== */
  /* =====================================================
     NOW PLAYING — the Spotify widget, top-left.

     A static site can't call the Spotify API directly (it needs OAuth,
     and any token shipped here would be public and expire), so the
     widget shows FALLBACK below until you point it at a live feed.

     To go live, set LANYARD_ID to your Discord user ID:
       1. Connect Spotify to Discord (Settings > Connections)
       2. Join https://discord.gg/lanyard  (this is what makes your
          presence readable — it's the same data Discord shows)
       3. Paste your Discord user ID below.
     The widget then polls your real current track and falls back to
     FALLBACK whenever you're not playing anything.
     ===================================================== */
  var LANYARD_ID = '';
  var NOW_PLAYING_POLL_MS = 30000;

  // Shown when nothing live is available. Swap in whatever you like.
  // The progress bar sits still here — it only advances for a live track.
  var FALLBACK_TRACK = {
    title: 'Sundress',
    artist: 'A$AP Rocky',
    url: 'https://open.spotify.com/track/2aPTvyE09vUCRwVvj0I8WK',
    art: 'img/np-sundress.jpg',
    status: 'Listening on Spotify',
    elapsedMs: 47000,
    durationMs: 158000 // 2:38
  };

  var MAIL_ENDPOINT = 'https://api.web3forms.com/submit';
  var MAIL_ACCESS_KEY = '60015dc0-b6a8-43fc-9153-90b29b8a3aa3';
  var MAIL_TO = 'victoriahliu2@gmail.com';

  /* ---------- Project data ---------- */
  var PROJECTS = [
    {
      id: 'sightbridge',
      name: 'SightBridge',
      date: 'February 2025',
      stack: ['React Native', 'CSS', 'Python', 'FastAPI', 'OpenCV', 'YOLO'],
      body: [
        'Developed SightBridge, a full-stack accessibility app, using React Native and FastAPI, leveraging computer vision and AI to bridge the gap between technology and accessibility.',
        'Integrated the Google Maps Directions API and OpenAI to provide real-time navigation assistance with a 90% accuracy rate in object detection.'
      ]
    },
    {
      id: 'mitn',
      name: 'Music in the Neighbourhood',
      date: 'April 2023 – Present',
      url: 'https://musicintheneighbourhood.com/',
      stack: ['HTML', 'CSS', 'JavaScript', 'PHPMailer', 'Git'],
      body: [
        "Designed and developed a responsive website from scratch using HTML, CSS, and JavaScript to showcase Music in the Neighbourhood's mission, events, and media.",
        'Integrated PHP to handle form submissions and manage backend functionality, enhancing user interaction and data management.',
        'Implemented SEO best practices to boost visibility and drive traffic to the site, resulting in a 15% increase in user engagement.'
      ]
    },
    {
      id: 'c0vm',
      name: 'C0 Virtual Machine',
      date: 'April 2025',
      stack: ['C'],
      body: [
        'Built a full-featured virtual machine (C0VM) in C for the C0 programming language, modeled after the JVM and LLVM.',
        'Implemented a complete instruction set including stack manipulation, arithmetic, control flow, function calls (static and native), and heap-based memory operations.',
        'Managed runtime structures such as operand stacks, call frames, bytecode execution, and program counters for accurate C0 code interpretation.'
      ]
    },
    {
      id: 'blockchain',
      name: 'Mini Blockchain',
      date: 'October 2024',
      stack: ['Python', 'Node', 'Flask'],
      body: [
        'Developed a lightweight blockchain application using Python and Flask, enabling secure peer-to-peer transactions and data storage.',
        'Implemented consensus algorithms to ensure data integrity and prevent fraudulent activity within the blockchain network.'
      ]
    },
    {
      id: 'meditite',
      name: 'Meditite',
      date: 'November 2024',
      stack: ['React', 'Python', 'Flask', 'CSS', 'OpenAI', 'Cartesia'],
      body: [
        'Developed Meditite, a personalized meditation app using React.js, to provide tailored audio experiences based on user input such as speed, mood, and emotion.',
        'Integrated the OpenAI API and Cartesia to generate dynamic meditation audio from user input, improving engagement with customized, soothing content.'
      ]
    }
  ];

  var ICON_DOC =
    '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M9.3 1H4.5A1.5 1.5 0 0 0 3 2.5v11A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5V4.7L9.3 1zm-.3 4V2.1L12 5H9z"/></svg>';

  var HOME_TZ = 'America/Los_Angeles';

  /* ---------- Live clock ---------- */
  function startClock() {
    var el = document.getElementById('clock');
    var localEl = document.getElementById('local-time');
    var zoneEl = document.getElementById('local-zone');

    function tick() {
      var now = new Date();

      if (el) {
        var day = now.toLocaleDateString('en-US', { weekday: 'short' });
        var date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        var time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        // Narrow screens drop the date, the way macOS does, so the status
        // icons and clock still fit on one line.
        el.textContent =
          window.innerWidth <= 720 ? time : day + ' ' + date + '  ' + time;
      }

      // San Jose time, derived rather than hardcoded so it stays correct
      // for the viewer's clock and across daylight saving.
      if (localEl) {
        localEl.textContent = now.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          timeZone: HOME_TZ
        });
      }

      if (zoneEl) {
        var parts = new Intl.DateTimeFormat('en-US', {
          timeZone: HOME_TZ,
          timeZoneName: 'short'
        }).formatToParts(now);

        for (var i = 0; i < parts.length; i++) {
          if (parts[i].type === 'timeZoneName') {
            zoneEl.textContent = parts[i].value;
            break;
          }
        }
      }
    }

    tick();
    setInterval(tick, 10000);
    window.addEventListener('resize', tick);
  }

  /* ---------- World clock ---------- */
  var WORLD_CLOCKS = [
    { city: 'Vancouver', tz: 'America/Vancouver' },
    { city: 'Pittsburgh', tz: 'America/New_York' },
    { city: 'San Francisco', tz: 'America/Los_Angeles' },
    { city: 'Dalian', tz: 'Asia/Shanghai' }
  ];

  // Read a zone's own wall-clock reading, rather than shifting by a fixed
  // offset — this stays correct across daylight saving on both ends.
  function wallClock(date, tz) {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).formatToParts(date);

    var v = {};
    parts.forEach(function (p) {
      if (p.type !== 'literal') v[p.type] = parseInt(p.value, 10);
    });
    return v;
  }

  function initWorldClock() {
    var grid = document.getElementById('wc-grid');
    if (!grid) return;

    // Build the faces once; only the hands and labels change per tick.
    WORLD_CLOCKS.forEach(function (c) {
      var ticks = '';
      for (var i = 0; i < 12; i++) {
        var a = (i * 30 * Math.PI) / 180;
        var outer = 44;
        var inner = i % 3 === 0 ? 36 : 39;
        ticks +=
          '<line class="wc-tick' + (i % 3 === 0 ? ' major' : '') + '"' +
          ' x1="' + (50 + outer * Math.sin(a)).toFixed(1) + '"' +
          ' y1="' + (50 - outer * Math.cos(a)).toFixed(1) + '"' +
          ' x2="' + (50 + inner * Math.sin(a)).toFixed(1) + '"' +
          ' y2="' + (50 - inner * Math.cos(a)).toFixed(1) + '"/>';
      }

      var el = document.createElement('div');
      el.className = 'wc-clock';
      el.dataset.tz = c.tz;
      el.innerHTML =
        '<svg class="wc-face" viewBox="0 0 100 100" aria-hidden="true">' +
        '<circle class="wc-dial" cx="50" cy="50" r="48"/>' + ticks +
        '<line class="wc-hand wc-hour" x1="50" y1="50" x2="50" y2="26"/>' +
        '<line class="wc-hand wc-min" x1="50" y1="50" x2="50" y2="16"/>' +
        '<line class="wc-sec" x1="50" y1="56" x2="50" y2="14"/>' +
        '<circle class="wc-pin" cx="50" cy="50" r="4"/>' +
        '</svg>' +
        '<div class="wc-city" title="' + c.city + '">' + c.city + '</div>' +
        '<div class="wc-day"></div>' +
        '<div class="wc-off"></div>';
      grid.appendChild(el);
    });

    var clocks = [].slice.call(grid.querySelectorAll('.wc-clock'));

    function tick() {
      var now = new Date();
      var here = wallClock(now, Intl.DateTimeFormat().resolvedOptions().timeZone);
      var hereUTC = Date.UTC(here.year, here.month - 1, here.day, here.hour, here.minute);

      clocks.forEach(function (el) {
        var t = wallClock(now, el.dataset.tz);

        var sec = t.second * 6;
        var min = t.minute * 6 + t.second * 0.1;
        var hour = (t.hour % 12) * 30 + t.minute * 0.5;

        el.querySelector('.wc-hour').style.transform = 'rotate(' + hour + 'deg)';
        el.querySelector('.wc-min').style.transform = 'rotate(' + min + 'deg)';
        el.querySelector('.wc-sec').style.transform = 'rotate(' + sec + 'deg)';

        // Offset and day are both relative to whoever is viewing the page.
        var thereUTC = Date.UTC(t.year, t.month - 1, t.day, t.hour, t.minute);
        var diffH = Math.round((thereUTC - hereUTC) / 3600000);

        var dayDiff =
          Date.UTC(t.year, t.month - 1, t.day) -
          Date.UTC(here.year, here.month - 1, here.day);
        var dayLabel =
          dayDiff > 0 ? 'Tomorrow' : dayDiff < 0 ? 'Yesterday' : 'Today';

        el.querySelector('.wc-day').textContent = dayLabel;
        el.querySelector('.wc-off').textContent =
          diffH === 0
            ? 'Same time'
            : (diffH > 0 ? '+' : '−') + Math.abs(diffH) + 'HRS';
      });
    }

    tick();
    setInterval(tick, 1000);
  }

  /* ---------- Now playing widget ---------- */
  function initNowPlaying() {
    var card = document.getElementById('now-playing');
    if (!card) return;

    var els = {
      art: document.getElementById('np-art-img'),
      status: document.getElementById('np-status'),
      title: document.getElementById('np-title'),
      artist: document.getElementById('np-artist'),
      fill: document.getElementById('np-fill'),
      elapsed: document.getElementById('np-elapsed'),
      total: document.getElementById('np-total')
    };

    var current = null;   // the track being shown
    var ticker = null;    // interval that advances the progress bar

    function mmss(ms) {
      if (!ms || ms < 0) return '0:00';
      var s = Math.floor(ms / 1000);
      return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    }

    function paint(track, elapsedMs) {
      els.title.textContent = track.title;
      els.artist.textContent = track.artist;
      els.status.textContent = track.status || 'Listening on Spotify';
      card.href = track.url || 'https://open.spotify.com/';

      if (track.art) {
        els.art.src = track.art;
        els.art.hidden = false;
      } else {
        els.art.hidden = true;
        els.art.removeAttribute('src');
      }

      var dur = track.durationMs || 0;
      var at = Math.min(Math.max(elapsedMs || 0, 0), dur);
      els.fill.style.width = dur ? (at / dur) * 100 + '%' : '0%';
      els.elapsed.textContent = mmss(at);
      els.total.textContent = mmss(dur);
      els.times = null;
    }

    function show(track) {
      current = track;
      if (ticker) {
        clearInterval(ticker);
        ticker = null;
      }

      paint(track, track.elapsedMs);

      // Only a live track has a real start time worth advancing.
      if (track.startedAt && track.durationMs) {
        ticker = setInterval(function () {
          var at = Date.now() - track.startedAt;
          if (at >= track.durationMs) {
            clearInterval(ticker);
            ticker = null;
            return;
          }
          paint(track, at);
        }, 1000);
      }
    }

    function fetchLive() {
      if (!LANYARD_ID) return;

      fetch('https://api.lanyard.rest/v1/users/' + LANYARD_ID)
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.json();
        })
        .then(function (payload) {
          var s = payload && payload.data && payload.data.spotify;
          if (!s) {
            show(FALLBACK_TRACK); // not playing anything
            return;
          }
          show({
            title: s.song,
            artist: s.artist,
            art: s.album_art_url,
            url: s.track_id
              ? 'https://open.spotify.com/track/' + s.track_id
              : 'https://open.spotify.com/',
            status: 'Listening on Spotify',
            startedAt: s.timestamps && s.timestamps.start,
            durationMs:
              s.timestamps && s.timestamps.end
                ? s.timestamps.end - s.timestamps.start
                : 0,
            elapsedMs:
              s.timestamps && s.timestamps.start
                ? Date.now() - s.timestamps.start
                : 0
          });
        })
        .catch(function () {
          // Network down or Lanyard unreachable: keep whatever is shown.
          if (!current) show(FALLBACK_TRACK);
        });
    }

    show(FALLBACK_TRACK); // paint something immediately
    fetchLive();
    if (LANYARD_ID) setInterval(fetchLive, NOW_PLAYING_POLL_MS);
  }

  /* ---------- Apple menu ---------- */
  function initAppleMenu() {
    var btn = document.getElementById('apple-btn');
    var menu = document.getElementById('apple-menu');
    if (!btn || !menu) return;

    function place() {
      var r = btn.getBoundingClientRect();
      menu.style.top = r.bottom + 4 + 'px';
      menu.style.left = Math.max(4, r.left - 4) + 'px';
    }

    function close() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    function open() {
      closeMenus(menu); // only one menu bar item open at a time
      menu.hidden = false;
      place();
      btn.setAttribute('aria-expanded', 'true');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.hidden) {
        open();
      } else {
        close();
      }
    });

    menu.querySelectorAll('.am-item').forEach(function (item) {
      item.addEventListener('click', function () {
        var app = item.dataset.opensWindow;
        if (app) {
          var win = document.querySelector('.window[data-app="' + app + '"]');
          if (win) {
            if (win.hidden) {
              openWindow(win);
            } else {
              focusWindow(win);
            }
          }
        }
        // Decorative entries simply dismiss the menu, as a no-op would.
        close();
      });
    });

    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && !btn.contains(e.target)) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) close();
    });

    window.addEventListener('resize', function () {
      if (!menu.hidden) place();
    });
  }

  // Close every menu-bar dropdown except the one being opened.
  function closeMenus(except) {
    [
      ['apple-menu', 'apple-btn'],
      ['location-panel', 'location-btn']
    ].forEach(function (pair) {
      var panel = document.getElementById(pair[0]);
      var button = document.getElementById(pair[1]);
      if (!panel || panel === except || panel.hidden) return;
      panel.hidden = true;
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  /* ---------- Location popover ---------- */
  function initLocationPanel() {
    var btn = document.getElementById('location-btn');
    var panel = document.getElementById('location-panel');
    if (!btn || !panel) return;

    function place() {
      var r = btn.getBoundingClientRect();
      panel.style.top = r.bottom + 6 + 'px';

      // Right-align the panel to the icon, but keep it fully on screen.
      // On narrow viewports the icon sits far from the right edge, so the
      // offset must also be capped to keep the panel's left edge visible.
      var right = window.innerWidth - r.right - 6;
      var maxRight = Math.max(8, window.innerWidth - panel.offsetWidth - 8);
      panel.style.right = Math.min(Math.max(right, 8), maxRight) + 'px';
    }

    function open() {
      closeMenus(panel); // only one menu bar item open at a time
      panel.hidden = false;
      place();
      btn.setAttribute('aria-expanded', 'true');
    }

    function close() {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (panel.hidden) {
        open();
      } else {
        close();
      }
    });

    // Clicking anywhere else, or pressing Escape, dismisses it.
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) {
        close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    window.addEventListener('resize', function () {
      if (!panel.hidden) place();
    });
  }

  /* ---------- Window manager ---------- */
  var zTop = 100;

  function focusWindow(win) {
    zTop += 1;
    win.style.zIndex = zTop;
  }

  function makeDraggable(win) {
    var bar = win.querySelector('.titlebar');
    if (!bar) return;

    bar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.traffic')) return;
      if (win.classList.contains('maximized')) return;

      focusWindow(win);

      var startX = e.clientX;
      var startY = e.clientY;
      var startLeft = win.offsetLeft;
      var startTop = win.offsetTop;
      var menubarH = 28;

      function onMove(ev) {
        var nextLeft = startLeft + (ev.clientX - startX);
        var nextTop = startTop + (ev.clientY - startY);

        // Keep the window on screen: never above the menu bar, always
        // leaving a grabbable strip of title bar visible.
        var maxLeft = window.innerWidth - 80;
        var maxTop = window.innerHeight - 40;
        nextLeft = Math.min(Math.max(nextLeft, 80 - win.offsetWidth), maxLeft);
        nextTop = Math.min(Math.max(nextTop, menubarH), maxTop);

        win.style.left = nextLeft + 'px';
        win.style.top = nextTop + 'px';
      }

      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      e.preventDefault();
    });
  }

  function makeResizable(win) {
    var handle = win.querySelector('.resize-handle');
    if (!handle) return;

    handle.addEventListener('pointerdown', function (e) {
      if (win.classList.contains('maximized')) return;

      focusWindow(win);

      var startX = e.clientX;
      var startY = e.clientY;
      var startW = win.offsetWidth;
      var startH = win.offsetHeight;

      function onMove(ev) {
        win.style.width = Math.max(460, startW + (ev.clientX - startX)) + 'px';
        win.style.height = Math.max(300, startH + (ev.clientY - startY)) + 'px';
      }

      function onUp() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
      }

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
      e.preventDefault();
      e.stopPropagation();
    });
  }

  function setRunning(appId, running) {
    var btn = document.querySelector('.dock-app[data-app="' + appId + '"]');
    if (btn) btn.classList.toggle('running', running);
  }

  function openWindow(win) {
    var wasHidden = win.hidden;
    win.hidden = false;

    // Defer heavy embeds (the resume PDF) until the window is first opened.
    // <object> takes its URL from `data`, everything else from `src`.
    var lazy = win.querySelector('[data-src]');
    if (lazy) {
      var attr = lazy.tagName === 'OBJECT' ? 'data' : 'src';
      if (!lazy.getAttribute(attr)) lazy.setAttribute(attr, lazy.dataset.src);
    }
    win.classList.remove('minimizing');
    focusWindow(win);
    setRunning(win.dataset.app, true);

    if (wasHidden) {
      win.classList.remove('opening');
      // Force reflow so the animation replays on every open.
      void win.offsetWidth;
      win.classList.add('opening');
    }
  }

  function closeWindow(win) {
    win.hidden = true;
    win.classList.remove('minimizing', 'opening');
    setRunning(win.dataset.app, false);
  }

  function minimizeWindow(win) {
    win.classList.add('minimizing');
    setTimeout(function () {
      win.hidden = true;
      win.classList.remove('minimizing');
    }, 320);
  }

  function initWindow(win) {
    makeDraggable(win);
    makeResizable(win);

    win.addEventListener('pointerdown', function () {
      focusWindow(win);
    });

    var close = win.querySelector('.traffic .close');
    var min = win.querySelector('.traffic .minimize');
    var zoom = win.querySelector('.traffic .zoom');

    if (close) close.addEventListener('click', function () { closeWindow(win); });
    if (min) min.addEventListener('click', function () { minimizeWindow(win); });
    if (zoom) {
      zoom.addEventListener('click', function () {
        win.classList.toggle('maximized');
      });
    }
  }

  /* ---------- Draggable desktop items (icons + widgets) ---------- */
  function initDesktopDragging() {
    var desktop = document.getElementById('desktop');
    if (!desktop) return;

    // App shortcuts only — the widgets stay put where CSS places them.
    var items = [].slice.call(document.querySelectorAll('.desktop-icon'));
    if (!items.length) return;

    var MENUBAR = 28;
    var host = desktop.getBoundingClientRect();

    // Measure every item BEFORE moving any of them. Reparenting one pulls
    // it out of the flex column, which shifts the rest up — measuring and
    // moving in a single pass would stack them all on the first slot.
    var spots = items.map(function (el) {
      var r = el.getBoundingClientRect();
      return { left: r.left - host.left, top: r.top - host.top };
    });

    // Now apply, so no measurement is affected by an earlier move.
    items.forEach(function (el, i) {
      el.style.position = 'absolute';
      el.style.left = spots[i].left + 'px';
      el.style.top = spots[i].top + 'px';
      el.style.margin = '0';
      el.style.zIndex = '2';
      desktop.appendChild(el);

      // Anchors and images are natively draggable; that HTML5 drag would
      // cancel our pointer gesture, so turn it off.
      el.draggable = false;
      [].forEach.call(el.querySelectorAll('img'), function (img) {
        img.draggable = false;
      });
    });

    items.forEach(function (el) {
      el.addEventListener('pointerdown', function (e) {
        if (e.button !== 0) return;

        var startX = e.clientX;
        var startY = e.clientY;
        var originX = parseFloat(el.style.left) || 0;
        var originY = parseFloat(el.style.top) || 0;
        var moved = false;

        el.setPointerCapture(e.pointerId);
        el.style.zIndex = '3';

        function onMove(ev) {
          var dx = ev.clientX - startX;
          var dy = ev.clientY - startY;

          // A few pixels of slop so a normal click still counts as a click.
          if (!moved && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
            moved = true;
            el.classList.add('dragging');
          }
          if (!moved) return;

          var maxX = desktop.clientWidth - el.offsetWidth;
          var maxY = desktop.clientHeight - el.offsetHeight;

          el.style.left = Math.min(Math.max(originX + dx, 0), Math.max(0, maxX)) + 'px';
          el.style.top =
            Math.min(Math.max(originY + dy, MENUBAR), Math.max(MENUBAR, maxY)) + 'px';
        }

        function onUp(ev) {
          el.removeEventListener('pointermove', onMove);
          el.removeEventListener('pointerup', onUp);
          el.removeEventListener('pointercancel', onUp);
          if (el.hasPointerCapture && el.hasPointerCapture(ev.pointerId)) {
            el.releasePointerCapture(ev.pointerId);
          }

          el.classList.remove('dragging');
          el.style.zIndex = '2';

          // A drag ends with a click event; swallow it so dragging an icon
          // doesn't also open its link.
          if (moved) {
            el.addEventListener('click', function swallow(cev) {
              cev.preventDefault();
              cev.stopPropagation();
              el.removeEventListener('click', swallow, true);
            }, true);
          }
        }

        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
      });
    });
  }

  /* ---------- Notes app (editable, in-memory only) ---------- */
  function initNotesApp() {
    var editor = document.getElementById('note-editor');
    var list = document.getElementById('note-list');
    if (!editor || !list) return;

    var newBtn = document.getElementById('note-new');
    var delBtn = document.getElementById('note-delete');
    var stamp = document.getElementById('note-timestamp');

    // Nothing is persisted: reloading the page rebuilds this from the HTML,
    // so visitors can type freely without changing what anyone else sees.
    var notes = [
      {
        id: 1,
        html: editor.innerHTML,
        date: 'Jul 18',
        stamp: stamp ? stamp.textContent : ''
      }
    ];
    var nextId = 2;
    var activeId = 1;

    function byId(id) {
      for (var i = 0; i < notes.length; i++) {
        if (notes[i].id === id) return notes[i];
      }
      return null;
    }

    // Titles come from the first non-empty line, the way Notes does it.
    function summarise(html) {
      var probe = document.createElement('div');
      probe.innerHTML = html;

      // Each block child counts as one line. textContent alone would run
      // them together ("IdeasTry clicking...") since it inserts no breaks.
      var lines = [];
      [].forEach.call(probe.children, function (el) {
        var t = (el.textContent || '').replace(/ /g, ' ').trim();
        if (t) lines.push(t);
      });

      // Plain text with no block wrappers (e.g. select-all then retype).
      if (!lines.length) {
        var flat = (probe.textContent || '').replace(/ /g, ' ').trim();
        if (flat) lines.push(flat);
      }

      return {
        title: lines[0] || 'New Note',
        preview: lines.slice(1).join(' ').slice(0, 60) || 'No additional text'
      };
    }

    function renderList() {
      list.innerHTML = '';

      notes.forEach(function (note) {
        var s = summarise(note.html);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'note-item' + (note.id === activeId ? ' active' : '');
        btn.innerHTML =
          '<span class="note-item-title"></span>' +
          '<span class="note-item-meta"><span class="note-item-date"></span> </span>';
        btn.querySelector('.note-item-title').textContent = s.title;
        btn.querySelector('.note-item-date').textContent = note.date;
        btn.querySelector('.note-item-meta').appendChild(
          document.createTextNode(s.preview)
        );

        btn.addEventListener('click', function () {
          if (note.id === activeId) return;
          save();
          activeId = note.id;
          load();
        });

        list.appendChild(btn);
      });
    }

    function save() {
      var note = byId(activeId);
      if (note) note.html = editor.innerHTML;
    }

    function load() {
      var note = byId(activeId);
      if (!note) return;
      editor.innerHTML = note.html;
      if (stamp) stamp.textContent = note.stamp;
      renderList();
    }

    // Typing updates the sidebar title/preview live.
    editor.addEventListener('input', function () {
      save();
      renderList();
    });

    if (newBtn) {
      newBtn.addEventListener('click', function () {
        save();

        var now = new Date();
        var note = {
          id: nextId++,
          html: '<h1 class="note-title">New Note</h1><p><br></p>',
          date: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          stamp: now.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
          }) + ' at ' + now.toLocaleTimeString('en-US', {
            hour: 'numeric', minute: '2-digit'
          })
        };

        notes.unshift(note);
        activeId = note.id;
        load();

        // Drop the caret at the end of the title so typing renames it.
        editor.focus();
        var title = editor.querySelector('.note-title');
        if (title && window.getSelection) {
          var range = document.createRange();
          range.selectNodeContents(title);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        }
      });
    }

    if (delBtn) {
      delBtn.addEventListener('click', function () {
        if (notes.length <= 1) return; // never leave an empty app
        var i = notes.indexOf(byId(activeId));
        notes.splice(i, 1);
        activeId = notes[Math.min(i, notes.length - 1)].id;
        load();
      });
    }

    renderList();
  }

  /* ---------- Projects app ---------- */
  function renderProject(project) {
    var detail = document.getElementById('project-detail');
    if (!detail) return;

    var html = '';
    html += '<h2>' + project.name + '</h2>';
    html += '<div class="meta">' + project.date + '</div>';

    html += '<div class="stack">';
    project.stack.forEach(function (tech) {
      html += '<span>' + tech + '</span>';
    });
    html += '</div>';

    project.body.forEach(function (para) {
      html += '<p>' + para + '</p>';
    });

    if (project.url) {
      html +=
        '<a class="visit" href="' + project.url + '" target="_blank" rel="noopener">' +
        '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3h7v7h-2V6.4l-6.3 6.3-1.4-1.4L9.6 5H6V3z"/></svg>' +
        'Visit site</a>';
    }

    detail.innerHTML = html;
    detail.scrollTop = 0;
  }

  function initProjectsApp() {
    var list = document.getElementById('project-list');
    if (!list) return;

    PROJECTS.forEach(function (project, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = ICON_DOC + '<span>' + project.name + '</span>';
      btn.addEventListener('click', function () {
        list.querySelectorAll('button').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        renderProject(project);
      });

      if (i === 0) btn.classList.add('active');
      list.appendChild(btn);
    });

    renderProject(PROJECTS[0]);
  }

  /* ---------- Mail app ---------- */
  function initMailApp() {
    var form = document.getElementById('mail-form');
    if (!form) return;

    var status = document.getElementById('mail-status');
    var sendBtn = form.querySelector('.mail-send');
    var from = document.getElementById('mail-from');
    var subject = document.getElementById('mail-subject');
    var message = document.getElementById('mail-message');
    var honeypot = form.querySelector('.mail-hp');

    function setStatus(text, kind) {
      status.textContent = text;
      status.className = 'mail-status' + (kind ? ' ' + kind : '');
    }

    function markInvalid(field, bad) {
      var target = field === message ? field : field.closest('.mail-field');
      target.classList.toggle('invalid', bad);
    }

    // Trash icon behaves like Gmail's: discard the draft and close.
    var discard = form.querySelector('.mail-discard');
    if (discard) {
      discard.addEventListener('click', function () {
        form.reset();
        setStatus('');
        [from, subject, message].forEach(function (f) {
          markInvalid(f, false);
        });
        closeWindow(document.querySelector('.window[data-app="mail"]'));
      });
    }

    // Clear the error styling as soon as someone starts fixing the field.
    [from, subject, message].forEach(function (field) {
      field.addEventListener('input', function () {
        markInvalid(field, false);
      });
    });

    function validate() {
      var okFrom = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.value.trim());
      var okSubject = subject.value.trim().length > 0;
      var okMessage = message.value.trim().length > 0;

      markInvalid(from, !okFrom);
      markInvalid(subject, !okSubject);
      markInvalid(message, !okMessage);

      if (!okFrom) return 'Please enter a valid email address so I can reply.';
      if (!okSubject) return 'Please add a subject.';
      if (!okMessage) return 'Please write a message.';
      return null;
    }

    // No endpoint configured yet: hand off to the visitor's mail client
    // with everything pre-filled, rather than silently failing.
    function mailtoFallback() {
      var body = message.value.trim() + '\n\n— ' + from.value.trim();
      var href =
        'mailto:' + MAIL_TO +
        '?subject=' + encodeURIComponent(subject.value.trim()) +
        '&body=' + encodeURIComponent(body);

      window.location.href = href;
      setStatus('Opening your mail app…');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (honeypot && honeypot.value) return; // bot
      var problem = validate();
      if (problem) {
        setStatus(problem, 'error');
        return;
      }

      if (!MAIL_ENDPOINT) {
        mailtoFallback();
        return;
      }

      var payload = {
        email: from.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
        // So hitting Reply in the inbox goes back to the sender.
        replyto: from.value.trim(),
        from_name: 'Portfolio contact form'
      };
      if (MAIL_ACCESS_KEY) payload.access_key = MAIL_ACCESS_KEY;

      sendBtn.disabled = true;
      setStatus('Sending…');

      fetch(MAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          form.reset();
          setStatus('Sent — thanks! I\'ll get back to you soon.', 'success');
        })
        .catch(function () {
          setStatus('Couldn\'t send just now. Please email ' + MAIL_TO + ' directly.', 'error');
        })
        .then(function () {
          sendBtn.disabled = false;
        });
    });
  }

  /* ---------- Links that open an app window ---------- */
  function initAppLinks() {
    document.querySelectorAll('a[data-opens]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var win = document.querySelector(
          '.window[data-app="' + link.dataset.opens + '"]'
        );
        if (!win) return;

        // Let cmd/ctrl/shift/middle clicks fall through to the href so
        // "open in new tab" still works, and so does a plain click if
        // this script never ran.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

        e.preventDefault();
        if (win.hidden) {
          openWindow(win);
        } else {
          focusWindow(win);
        }
      });
    });
  }

  /* ---------- Dock ---------- */
  function initDock() {
    document.querySelectorAll('.dock-app').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var win = document.querySelector('.window[data-app="' + btn.dataset.app + '"]');
        if (!win) return;

        // Clicking a running app's icon brings it forward rather than
        // toggling it shut, matching the Dock's behaviour.
        if (win.hidden) {
          openWindow(win);
        } else {
          focusWindow(win);
        }
      });
    });
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    startClock();
    initNowPlaying();
    initWorldClock();
    initAppleMenu();
    initLocationPanel();
    initDesktopDragging();
    initNotesApp();
    initProjectsApp();
    initMailApp();
    initAppLinks();
    initDock();

    document.querySelectorAll('.window').forEach(initWindow);

    // Place each window on first paint. They start hidden, and a hidden
    // element measures 0, so un-hide invisibly to take the size.
    document.querySelectorAll('.window').forEach(function (win) {
      var wasHidden = win.hidden;
      win.style.visibility = 'hidden';
      win.hidden = false;

      var w = win.offsetWidth;
      var h = win.offsetHeight;

      win.hidden = wasHidden;
      win.style.visibility = '';

      // Cascade the windows rather than centring them all on top of
      // each other. Notes is the narrowest, so centring alone would
      // leave it nearly flush with Projects.
      var CASCADE = { notes: 0, about: 15, preview: 30, mail: 45, pages: 52, projects: 60, messages: 68 };
      var nudge = CASCADE[win.dataset.app] || 0;

      var left = Math.max(12, (window.innerWidth - w) / 2 + nudge);

      // Keep windows clear of the top-left widget column on first paint,
      // but only when there's room — otherwise centring wins.
      var clearOfWidgets = 336;
      if (window.innerWidth - w - 12 >= clearOfWidgets) {
        left = Math.max(left, clearOfWidgets);
      }

      win.style.left = left + 'px';
      win.style.top = Math.max(48, (window.innerHeight - h) / 2 - 30 + nudge) + 'px';
    });

    // Notes is the landing view: open it as soon as the desktop loads.
    var notesWin = document.querySelector('.window[data-app="notes"]');
    if (notesWin) openWindow(notesWin);
  });
})();
