/* ==========================================================================
   Messages: a scripted auto-reply that texts like Victoria.

   There is no model behind this. The site is static on GitHub Pages, so any
   API key shipped here would be public; instead every reply is written by
   hand below and picked by keyword scoring. The voice is first-person and
   texts-a-close-friend casual: lowercase, abbreviations (idk, tbh, rn, bc),
   short rapid-fire bubbles, and NO em dashes anywhere. When someone asks
   whether it's really her, it says so (see the 'bot' topic): friendly, but
   never pretending to be a live person. Off-topic stuff falls through to
   FALLBACK rather than being invented.

   Style rules for any new copy: no em or en dashes (plain hyphens / "to" /
   commas only), keep product + company names capitalized for legibility, and
   split anything longer than a sentence or two into separate bubbles.

   To teach it something new: add an entry to KB. `match` holds the words and
   phrases that should trigger it, `reply` holds the bubbles it sends back.
   ========================================================================== */
(function () {
  'use strict';

  var FALLBACK = [
    "hmm idk that one tbh",
    "but shoot me an email (mail app in the dock) and i'll actually answer :)"
  ];

  /* Three knobs decide which topic answers a question:

     match: strong terms. Multi-word phrases outscore single words, so a topic
            needing disambiguation ("machine learning" vs. a bare "learning")
            should list the phrase.
     weak:  conversational filler that hints at a topic but must never beat a
            real one. "tell me about sightbridge" is about SightBridge, not a
            request for a bio.
     broad: set on hub topics (projects, skills, experience). They lose ties to
            a specific topic, so "blockchain project" gets the blockchain
            answer rather than the project list. */
  var KB = [
    {
      id: 'greeting',
      match: ['hi', 'hey', 'hello', 'yo', 'howdy', 'good morning', 'good evening', 'whats up', 'sup'],
      reply: [
        'heyy!! 👋',
        'ask me anything abt my projects, internships, classes, whatever',
        'or just tap a button below lol'
      ]
    },
    {
      id: 'about',
      broad: true,
      match: ['who is victoria', 'who are you', 'introduce', 'bio', 'your background', 'about you'],
      weak: ['about victoria', 'about her', 'tell me about', 'yourself', 'summary', 'overview'],
      reply: [
        'aw hii ok so',
        "i'm a cs major at CMU doing the machine learning concentration, graduating 2028",
        'grew up in Vancouver btw 🇨🇦',
        "rn i'm interning at ServiceNow on their AI Control Tower team",
        'mostly i just love building backend + full stack stuff ppl actually use :)'
      ]
    },
    {
      id: 'education',
      match: [
        'education', 'school', 'university', 'college', 'cmu', 'carnegie mellon', 'degree',
        'major', 'study', 'studying', 'gpa', 'graduate', 'graduation', 'grades', 'year'
      ],
      reply: [
        "i'm at CMU doing cs w an ml concentration, 2024 to 2028",
        "gpa's a 3.71 if ur curious lol",
        "ask me abt my classes if u wanna know what i've taken!"
      ]
    },
    {
      id: 'coursework',
      match: [
        'coursework', 'courses', 'classes', 'curriculum', 'what have you taken', 'what has she taken',
        'parallel data structures', 'computer systems', 'algorithms', 'probability',
        'discrete math', 'discrete mathematics', 'human ai interaction', 'theoretical foundations'
      ],
      reply: [
        "ok here's what i've taken so far:",
        '• Parallel Data Structures and Algorithms\n' +
        '• Computer Systems\n' +
        '• Algorithms and Theoretical Foundations\n' +
        '• Human-AI Interaction\n' +
        '• Probability\n' +
        '• Discrete Mathematics',
        'and i TA 15-150 (functional programming) so i basically live in that one lol'
      ]
    },
    {
      id: 'skills',
      broad: true,
      match: [
        'skills', 'tech stack', 'technologies', 'languages', 'programming languages',
        'what can you code', 'what do you know', 'frameworks', 'proficient',
        'python', 'javascript', 'c++', 'assembly', 'bash', 'php', 'docker', 'kubernetes',
        'postgresql', 'sql', 'django', 'html', 'css'
      ],
      weak: ['tools', 'code', 'coding'],
      reply: [
        'ooh ok my stack:',
        '• languages: C, Python, C++, JavaScript, HTML, CSS, Assembly, Bash, PHP, Standard ML\n' +
        '• backend: Django, FastAPI, Flask, Node.js, REST APIs, PostgreSQL, MongoDB\n' +
        '• frontend: React, React Native, TypeScript\n' +
        '• infra + tools: Docker, Kubernetes, Git',
        "ask abt any of em and i'll tell u where i actually used it"
      ]
    },
    {
      id: 'experience',
      broad: true,
      match: [
        'experience', 'work experience', 'internship', 'internships', 'jobs', 'job',
        'employment', 'where have you worked', 'where has she worked', 'career', 'companies', 'worked at'
      ],
      weak: ['professional', 'work'],
      reply: [
        "here's everywhere i've worked so far:",
        '• ServiceNow: SWE intern, AI Control Tower team (may-aug 2026)\n' +
        '• Turing: software dev (jul-oct 2025)\n' +
        '• Wealthmeup.ai: software dev intern (may-jul 2025)\n' +
        '• ScottyLabs: software dev (jan 2025-now)\n' +
        '• CMU 15-150: teaching assistant (jan 2026-now)',
        'lmk which one u wanna hear abt!'
      ]
    },
    {
      id: 'servicenow',
      match: ['servicenow', 'service now', 'ai control tower', 'current job', 'current role', 'currently', 'right now'],
      reply: [
        "yeah!! i'm at ServiceNow in santa clara this summer",
        'on the AI Control Tower team',
        "it's my current thing so i can't say a ton publicly yet tbh",
        'but email me if u wanna chat abt it :)'
      ]
    },
    {
      id: 'turing',
      match: ['turing', 'palo alto', 'dashboards', 'internal dashboard', 'concurrent users'],
      reply: [
        'at Turing i was a software dev in palo alto (jul-oct 2025)',
        'built internal dashboards w Django + REST',
        'cut our coordination time like 25%, and got the backend solid enough for 4,500+ concurrent users during a scale up',
        'also did the search/filter/pagination stuff, dropped data retrieval latency ~30% on big datasets'
      ]
    },
    {
      id: 'wealthmeup',
      match: ['wealthmeup', 'wealth me up', 'slack alert', 'scraping pipeline', 'lead generation', 'fintech'],
      reply: [
        'wealthmeup was a software dev internship, summer 2025',
        'i built an automated Slack alert system for account balances',
        'killed a bunch of manual checking, cut response delays in half lol',
        'also wrote Python scraping pipelines that bumped lead gen efficiency ~40%'
      ]
    },
    {
      id: 'scottylabs',
      match: ['scottylabs', 'scotty labs', 'cmueats', 'cmu eats', 'dining', 'diningapi', 'pwa', 'mongodb'],
      reply: [
        "scottylabs is my club at CMU! been on CMUEats since jan 2025",
        "it's a dining app ~3k students use to see what's open on campus",
        'i built the ratings + reviews system (SSO, 1k+ entries in MongoDB)',
        'and hooked up DiningAPI to scrape 20+ dining sites into a REST api. team of 7 :)'
      ]
    },
    {
      id: 'teaching',
      match: [
        'teaching assistant', 'ta', 'teach', 'teaching', '15-150', '15150', 'functional programming',
        'standard ml', 'sml', 'recitation', 'office hours', 'tutor'
      ],
      reply: [
        'yeah! i TA 15-150: principles of functional programming at CMU',
        'i run recitations + office hours',
        "it's all Standard ML, proofs, recursion, work/span cost analysis, that kinda thing",
        'honestly love it ngl'
      ]
    },
    {
      id: 'projects',
      broad: true,
      match: ['projects', 'project', 'portfolio', 'side project', 'personal project', 'what have you built', 'what has she built'],
      weak: ['built', 'build', 'show me', 'things you made', 'made'],
      reply: [
        "oh i've got a few! quick rundown:",
        '• ResyFinder: finds open restaurant reservations on Resy\n' +
        '• SightBridge: CV-powered accessibility navigation app\n' +
        '• CMUEats: dining app, ~3k monthly users\n' +
        '• Music in the Neighbourhood: live nonprofit site\n' +
        '• C0 Virtual Machine: a VM written in C\n' +
        '• Meditite: AI-generated meditation\n' +
        '• Mini Blockchain: peer to peer transactions in Flask',
        'which one sounds interesting?',
        'the Projects app in the dock has em all too btw'
      ]
    },
    {
      id: 'resyfinder',
      match: ['resyfinder', 'resy finder', 'resy', 'reservation', 'reservations', 'restaurant', 'restaurants'],
      reply: [
        'resyfinder!! it finds open restaurant reservations on Resy in real time',
        'so instead of checking a bunch of restaurant pages one by one, u just filter by location, party size, time, cuisine, price, whatever',
        'built it in Next.js + React w serverless api routes hitting Resy, and it plots the open spots on a map. deployed on Vercel. april 2026',
        "it's live if u wanna try it: resy-finder-vh.vercel.app"
      ]
    },
    {
      id: 'sightbridge',
      match: ['sightbridge', 'sight bridge', 'accessibility', 'computer vision', 'opencv', 'yolo', 'object detection', 'navigation'],
      reply: [
        'sightbridge!! ok so it uses computer vision to help visually impaired ppl get around',
        'built it in React Native + FastAPI',
        'OpenCV + YOLO for object detection (~90% accuracy), and Google Maps + OpenAI for the real time navigation',
        'early 2025 :)'
      ]
    },
    {
      id: 'mitn',
      match: ['music in the neighbourhood', 'music in the neighborhood', 'mitn', 'nonprofit', 'seo', 'phpmailer', 'music'],
      reply: [
        "that's a nonprofit site i've been running since 2023 :)",
        'made it from scratch, html/css/js',
        'PHP + PHPMailer for the forms, did the SEO too which bumped engagement ~15%',
        "it's live at musicintheneighbourhood.com if u wanna peek!"
      ]
    },
    {
      id: 'c0vm',
      match: ['c0vm', 'c0 vm', 'virtual machine', 'c0', 'bytecode', 'jvm', 'llvm', 'interpreter', 'compiler', 'systems'],
      reply: [
        'ok the C0 VM was so fun (and kinda pain lol)',
        'i wrote a full virtual machine in C for the C0 language, modeled after the JVM/LLVM',
        'did the whole instruction set, stack ops, arithmetic, control flow, function calls, heap memory, all of it'
      ]
    },
    {
      id: 'meditite',
      match: ['meditite', 'meditation', 'cartesia', 'audio', 'mindfulness'],
      reply: [
        "meditite's a lil meditation app!",
        'it generates audio based on ur mood, speed, emotion, whatever u tell it',
        'React + Python/Flask, w OpenAI + Cartesia doing the audio gen. late 2024'
      ]
    },
    {
      id: 'blockchain',
      match: ['blockchain', 'mini blockchain', 'crypto', 'consensus', 'peer to peer', 'distributed ledger'],
      reply: [
        'yeah i built a mini blockchain in Python + Flask',
        'peer to peer transactions + secure data storage',
        'wrote the consensus algorithms too so everything stays tamper proof. oct 2024'
      ]
    },
    {
      id: 'ai-ml',
      broad: true,
      match: [
        'machine learning', 'ml', 'artificial intelligence', 'ai', 'deep learning', 'neural',
        'llm', 'openai', 'ai projects', 'ai experience'
      ],
      reply: [
        "ML's my concentration so it's in a lot of my stuff:",
        '• SightBridge: OpenCV + YOLO, ~90% object detection accuracy\n' +
        '• Meditite: OpenAI + Cartesia for generated audio\n' +
        '• ServiceNow: currently on the AI Control Tower team\n' +
        '• classes: Human-AI Interaction, Probability',
        'wanna hear abt any of those?'
      ]
    },
    {
      id: 'backend',
      broad: true,
      match: [
        'backend', 'back end', 'server side', 'api', 'apis', 'rest', 'database', 'databases',
        'infrastructure', 'systems programming', 'scalability', 'scale'
      ],
      reply: [
        "backend's my fav honestly. some highlights:",
        '• Turing: Django + REST dashboards, 4,500+ concurrent users, ~30% less latency\n' +
        '• ScottyLabs: RESTful DiningAPI scraping 20+ sites, MongoDB reviews\n' +
        '• Wealthmeup: Python scraping pipelines + automated Slack monitoring\n' +
        '• SightBridge: FastAPI service behind the app',
        "oh and i wrote a whole virtual machine in C if we're counting low level stuff lol"
      ]
    },
    {
      id: 'frontend',
      broad: true,
      match: ['frontend', 'front end', 'ui', 'ux', 'react', 'react native', 'typescript', 'web development', 'full stack', 'fullstack'],
      weak: ['design', 'website'],
      reply: [
        'yeah i do full stack! frontend wise:',
        '• ResyFinder: Next.js + React reservation finder\n' +
        '• CMUEats: React + TypeScript, ~3k monthly users\n' +
        '• SightBridge: React Native app\n' +
        '• Meditite: React\n' +
        '• Music in the Neighbourhood: responsive site from scratch',
        'oh and this whole site is mine too',
        'hand built the entire macOS desktop lol 😄'
      ]
    },
    {
      id: 'hackathons',
      match: ['hackathon', 'hackathons', 'competition', 'hack', 'won', 'award', 'awards', 'prize'],
      reply: [
        'a bunch of my projects were built in like a weekend',
        'sightbridge, meditite, the blockchain one',
        "i don't have my placements written down here tho, email me if u wanna know more!"
      ]
    },
    {
      id: 'contact',
      match: [
        'contact', 'email', 'reach', 'get in touch', 'hire', 'hiring', 'recruit', 'connect',
        'linkedin', 'github', 'social', 'message you', 'talk to you'
      ],
      reply: [
        'easiest is the Mail app in the dock, goes straight to my inbox 📬',
        'my LinkedIn + GitHub are on the desktop too',
        "and my full resume's in the Preview app!"
      ]
    },
    {
      id: 'resume',
      match: ['resume', 'cv', 'curriculum vitae', 'download resume', 'pdf'],
      reply: [
        "my full resume's in the Preview app in the dock",
        'u can grab the pdf right from there',
        "it's got everything, school, skills, all my roles, projects"
      ]
    },
    {
      id: 'location',
      match: [
        'where', 'location', 'based', 'live', 'lives', 'from', 'vancouver', 'canada',
        'pittsburgh', 'bay area', 'relocate', 'remote'
      ],
      reply: [
        'i grew up in Vancouver! 🇨🇦',
        "i'm at CMU in pittsburgh for school",
        'and rn interning at ServiceNow in santa clara for the summer, so i move around a bit bc of school + internships lol'
      ]
    },
    {
      id: 'availability',
      match: [
        'available', 'availability', 'looking for', 'open to', 'opportunities', 'internship 2027',
        'new grad', 'full time', 'seeking', 'next role'
      ],
      reply: [
        "i graduate in 2028 and i'm at ServiceNow through this august",
        "for what i'm looking for next, honestly just email me",
        "i'll give u a way better answer than some canned one lol"
      ]
    },
    {
      id: 'interests',
      match: ['interests', 'hobbies', 'fun', 'passion', 'passionate', 'motivates', 'why software', 'outside of work'],
      reply: [
        "i'm really into building stuff ppl actually use",
        "that's why things like CMUEats + SightBridge are my favs",
        'for the non code stuff u should just ask me directly :)'
      ]
    },
    {
      id: 'thanks',
      match: ['thanks', 'thank you', 'ty', 'appreciate it', 'cheers', 'awesome', 'cool', 'nice', 'great'],
      reply: [
        'ofc!! lmk if u wanna know anything else',
        'or hit the mail app to actually reach me :)'
      ]
    },
    {
      id: 'bye',
      match: ['bye', 'goodbye', 'see you', 'later', 'thats all', 'im done'],
      reply: [
        'thanks for stopping by!! 👋',
        'poke around the rest of the desktop, projects + preview have more'
      ]
    },
    {
      id: 'bot',
      match: [
        'are you real', 'real person', 'are you a bot', 'a bot', 'are you ai', 'are you human',
        'human', 'is this chatgpt', 'chatgpt', 'are you actually victoria', 'chatbot', 'how do you work',
        'who made you', 'are you a person'
      ],
      reply: [
        "haha no i'm not actually sitting here typing",
        'this is like a lil auto-reply version of me lol',
        "but everything i'm telling u is real! if u wanna reach the actual me the mail app's right there 📬"
      ]
    }
  ];

  var SUGGESTIONS = [
    'what projects have you built?',
    'tell me about your internships',
    "what's your tech stack?",
    'where do you study?'
  ];

  /* ---------- Matching ---------- */

  function normalize(text) {
    return (' ' + text.toLowerCase() + ' ')
      .replace(/[^a-z0-9+#\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /* Every term is matched on whole-word boundaries (normalize() has already
     turned punctuation into spaces, so the surrounding spaces are enough).
     That keeps "ml" from firing on "html", "ta" from firing on "stack", and
     "about you" from firing on "about your internships". Phrases score higher
     than single words so a multi-word term wins a genuine overlap. */
  function scoreTerms(query, terms, strong) {
    var total = 0;

    (terms || []).forEach(function (raw) {
      var term = normalize(raw).trim();
      if (!term) return;

      var isPhrase = term.indexOf(' ') !== -1;
      var hit = query.indexOf(' ' + term + ' ') !== -1 ? (isPhrase ? 6 : 3) : 0;

      // Weak terms contribute at most a nudge, never enough to clear the
      // threshold on their own.
      total += strong ? hit : Math.min(hit, 1);
    });

    return total;
  }

  function scoreTopic(query, topic) {
    return scoreTerms(query, topic.match, true) + scoreTerms(query, topic.weak, false);
  }

  // One whole-word hit on a strong term is enough to answer.
  var THRESHOLD = 3;

  function findReply(text) {
    var query = normalize(text);
    var best = null;
    var bestRank = 0;

    KB.forEach(function (topic) {
      var score = scoreTopic(query, topic);
      if (score < THRESHOLD) return;

      // The nudge only orders topics against each other. It is deliberately
      // kept out of the threshold so a broad topic matched by a single strong
      // word still answers.
      var rank = score - (topic.broad ? 0.5 : 0);

      if (rank > bestRank) {
        bestRank = rank;
        best = topic;
      }
    });

    if (!best) return FALLBACK.slice();

    return Array.isArray(best.reply) ? best.reply : [best.reply];
  }

  /* ---------- UI ---------- */

  function initMessagesApp() {
    var win = document.querySelector('.window[data-app="messages"]');
    if (!win) return;

    var scroll = document.getElementById('msg-scroll');
    var body = document.getElementById('msg-thread-body');
    var form = document.getElementById('msg-composer');
    var input = document.getElementById('msg-input');
    var send = document.getElementById('msg-send');
    var chips = document.getElementById('msg-suggestions');
    var preview = document.getElementById('msg-thread-preview');
    var threadTime = document.getElementById('msg-thread-time');

    var busy = false;

    function scrollToEnd() {
      scroll.scrollTop = scroll.scrollHeight;
    }

    function stamp() {
      return new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    function addBubble(text, who) {
      var row = document.createElement('div');
      row.className = 'msg-row ' + who;

      var bubble = document.createElement('div');
      bubble.className = 'msg-bubble';
      bubble.textContent = text;

      row.appendChild(bubble);
      body.appendChild(row);
      scrollToEnd();

      preview.textContent = text.replace(/\n+/g, ' ');
      threadTime.textContent = stamp();
    }

    function addTyping() {
      var row = document.createElement('div');
      row.className = 'msg-row in typing';
      row.innerHTML =
        '<div class="msg-bubble msg-typing" aria-label="Victoria is typing">' +
        '<span></span><span></span><span></span></div>';
      body.appendChild(row);
      scrollToEnd();
      return row;
    }

    function setBusy(state) {
      busy = state;
      input.disabled = state;
      send.disabled = state || !input.value.trim();
      chips.classList.toggle('hidden', state);
    }

    /* Replies arrive as separate bubbles with a typing pause between them,
       so a multi-part answer reads like someone actually texting back
       instead of one wall of text. */
    function respond(parts, index) {
      index = index || 0;

      if (index >= parts.length) {
        setBusy(false);
        input.focus();
        return;
      }

      var typing = addTyping();
      var delay = Math.min(1100, 320 + parts[index].length * 6);

      setTimeout(function () {
        typing.remove();
        addBubble(parts[index], 'in');
        setTimeout(function () {
          respond(parts, index + 1);
        }, 260);
      }, delay);
    }

    function ask(text) {
      if (busy) return;

      var clean = text.trim();
      if (!clean) return;

      addBubble(clean, 'out');
      input.value = '';
      setBusy(true);
      respond(findReply(clean));
    }

    SUGGESTIONS.forEach(function (question) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'msg-chip';
      chip.textContent = question;
      chip.addEventListener('click', function () {
        ask(question);
      });
      chips.appendChild(chip);
    });

    input.addEventListener('input', function () {
      send.disabled = busy || !input.value.trim();
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input.value);
    });

    // Greet on the first open, not at load, so the desktop doesn't start noisy.
    var greeted = false;
    var dockBtn = document.querySelector('.dock-app[data-app="messages"]');

    function greet() {
      if (greeted) return;
      greeted = true;
      setBusy(true);
      respond([
        'heyy!! thanks for stopping by 👋',
        'i\'m around if u wanna know abt my projects, internships, classes, whatever',
        'or just tap a button below lol'
      ]);
    }

    if (dockBtn) dockBtn.addEventListener('click', greet);

    document.querySelectorAll('[data-opens-window="messages"], [data-opens="messages"]').forEach(function (el) {
      el.addEventListener('click', greet);
    });
  }

  document.addEventListener('DOMContentLoaded', initMessagesApp);
})();
