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
    initLocationPanel();
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
      var CASCADE = { notes: 0, preview: 30, mail: 45, projects: 60 };
      var nudge = CASCADE[win.dataset.app] || 0;

      win.style.left = Math.max(12, (window.innerWidth - w) / 2 + nudge) + 'px';
      win.style.top = Math.max(48, (window.innerHeight - h) / 2 - 30 + nudge) + 'px';
    });

    // Notes is the landing view: open it as soon as the desktop loads.
    var notesWin = document.querySelector('.window[data-app="notes"]');
    if (notesWin) openWindow(notesWin);
  });
})();
