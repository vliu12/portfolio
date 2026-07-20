/* ==========================================================================
   Messages — a scripted portfolio assistant.

   There is no model behind this. The site is static on GitHub Pages, so any
   API key shipped here would be public; instead every answer is written by
   hand below and picked by keyword scoring. Answers speak about Victoria in
   the third person and stay to 2–5 sentences, and anything not covered falls
   through to FALLBACK rather than being invented.

   To teach it something new: add an entry to KB. `match` holds the words and
   phrases that should trigger it, `reply` holds the bubbles it sends back.
   ========================================================================== */
(function () {
  'use strict';

  var FALLBACK =
    "I don't have that information, but you can contact Victoria directly to " +
    'learn more — the Mail app in the dock goes straight to her inbox.';

  /* Three knobs decide which topic answers a question:

     match — strong terms. Multi-word phrases outscore single words, so a topic
             needing disambiguation ("machine learning" vs. a bare "learning")
             should list the phrase.
     weak  — conversational filler that hints at a topic but must never beat a
             real one. "tell me about sightbridge" is about SightBridge, not a
             request for Victoria's bio.
     broad — set on hub topics (projects, skills, experience). They lose ties to
             a specific topic, so "blockchain project" gets the blockchain
             answer rather than the project list. */
  var KB = [
    {
      id: 'greeting',
      match: ['hi', 'hey', 'hello', 'yo', 'howdy', 'good morning', 'good evening', 'whats up', 'sup'],
      reply: [
        'Hey there! 👋',
        "I'm Victoria's portfolio assistant. Ask me about her projects, internships, technical skills, or coursework and I'll fill you in."
      ]
    },
    {
      id: 'about',
      broad: true,
      match: ['who is victoria', 'who are you', 'introduce', 'bio', 'her background'],
      weak: ['about victoria', 'about her', 'tell me about', 'yourself', 'summary', 'overview'],
      reply:
        'Victoria Liu is a Computer Science student at Carnegie Mellon University with a concentration in Machine Learning, graduating in May 2028. ' +
        "She was born and raised in Vancouver, Canada, and she's currently a Software Engineer Intern at ServiceNow on the AI Control Tower team. " +
        'Her work spans backend and full-stack engineering, with a through-line of building tools people actually rely on day to day.'
    },
    {
      id: 'education',
      match: [
        'education', 'school', 'university', 'college', 'cmu', 'carnegie mellon', 'degree',
        'major', 'study', 'studying', 'gpa', 'graduate', 'graduation', 'grades', 'year'
      ],
      reply:
        'Victoria is pursuing a B.S. in Computer Science at Carnegie Mellon University with a concentration in Machine Learning, from August 2024 to May 2028. ' +
        'She holds a 3.71/4.0 GPA. Ask about her coursework if you want to know what she has taken.'
    },
    {
      id: 'coursework',
      match: [
        'coursework', 'courses', 'classes', 'curriculum', 'what has she taken',
        'parallel data structures', 'computer systems', 'algorithms', 'probability',
        'discrete math', 'discrete mathematics', 'human ai interaction', 'theoretical foundations'
      ],
      reply: [
        "Victoria's coursework at CMU covers:",
        '• Parallel Data Structures and Algorithms\n' +
        '• Computer Systems\n' +
        '• Algorithms and Theoretical Foundations\n' +
        '• Human-AI Interaction\n' +
        '• Probability\n' +
        '• Discrete Mathematics',
        "She also TAs 15-150: Principles of Functional Programming, so she knows that one inside out."
      ]
    },
    {
      id: 'skills',
      broad: true,
      match: [
        'skills', 'tech stack', 'technologies', 'languages', 'programming languages',
        'what can she code', 'what does she know', 'frameworks', 'proficient',
        'python', 'javascript', 'c++', 'assembly', 'bash', 'php', 'docker', 'kubernetes',
        'postgresql', 'sql', 'django', 'html', 'css'
      ],
      weak: ['tools', 'code', 'coding'],
      reply: [
        "Here's what Victoria works in:",
        '• Languages — C, Python, C++, JavaScript, HTML, CSS, Assembly, Bash, PHP, Standard ML\n' +
        '• Backend — Django, FastAPI, Flask, Node.js, REST APIs, PostgreSQL, MongoDB\n' +
        '• Frontend — React, React Native, TypeScript\n' +
        '• Infra & tools — Docker, Kubernetes, Git',
        'Ask about any one of these and I can point you to where she used it.'
      ]
    },
    {
      id: 'experience',
      broad: true,
      match: [
        'experience', 'work experience', 'internship', 'internships', 'jobs', 'job',
        'employment', 'where has she worked', 'career', 'companies', 'worked at'
      ],
      weak: ['professional', 'work'],
      reply: [
        "Victoria's professional experience so far:",
        '• ServiceNow — Software Engineer Intern, AI Control Tower team (May–Aug 2026)\n' +
        '• Turing — Software Developer (Jul–Oct 2025)\n' +
        '• Wealthmeup.ai — Software Developer Intern (May–Jul 2025)\n' +
        '• ScottyLabs — Software Developer (Jan 2025–present)\n' +
        '• CMU 15-150 — Teaching Assistant (Jan 2026–present)',
        'Ask about any of them for the details.'
      ]
    },
    {
      id: 'servicenow',
      match: ['servicenow', 'service now', 'ai control tower', 'current job', 'current role', 'currently', 'right now'],
      reply:
        'Victoria is a Software Engineer Intern at ServiceNow in Santa Clara, CA, on the AI Control Tower team, from May to August 2026. ' +
        "It's her current role, so there's less public detail on it than her past work — reach out to her directly if you'd like to hear more."
    },
    {
      id: 'turing',
      match: ['turing', 'palo alto', 'dashboards', 'internal dashboard', 'concurrent users'],
      reply:
        'At Turing in Palo Alto, Victoria worked as a Software Developer from July to October 2025. ' +
        'She built internal dashboards with Django and REST APIs that cut team coordination time by 25%, and engineered UI flows and backend integrations to reliably support 4,500+ concurrent users during a planned scale-up. ' +
        'She also implemented advanced search, filtering, and pagination that reduced data retrieval latency by 30% across large datasets, plus real-time JSON endpoints for cross-team data sync.'
    },
    {
      id: 'wealthmeup',
      match: ['wealthmeup', 'wealth me up', 'slack alert', 'scraping pipeline', 'lead generation', 'fintech'],
      reply:
        'Victoria was a Software Developer Intern at Wealthmeup.ai from May to July 2025. ' +
        'She spearheaded an automated Slack alert system that monitored account balances, eliminating manual checks and cutting response delays by 50%. ' +
        'She also engineered Python scraping pipelines that aggregated multi-source outreach data and raised lead generation efficiency by 40%, and partnered with product and growth teams on new app features.'
    },
    {
      id: 'scottylabs',
      match: ['scottylabs', 'scotty labs', 'cmueats', 'cmu eats', 'dining', 'diningapi', 'pwa', 'mongodb'],
      reply:
        'Victoria has been a Software Developer at ScottyLabs since January 2025, working on CMUEats — a full-stack PWA serving 3,000+ monthly users with live dining availability across CMU. ' +
        'She built an SSO-enabled rating and review system storing 1,000+ feedback entries in MongoDB, and integrated DiningAPI to scrape 20+ CMU dining sites and distribute real-time data through a RESTful API. ' +
        'She works on it in a 7-person team, and is also spearheading a separate DiningAPI in Node.js/Bun.'
    },
    {
      id: 'teaching',
      match: [
        'teaching assistant', 'ta', 'teach', 'teaching', '15-150', '15150', 'functional programming',
        'standard ml', 'sml', 'recitation', 'office hours', 'tutor'
      ],
      reply:
        'Victoria has been a Teaching Assistant for 15-150: Principles of Functional Programming at CMU since January 2026. ' +
        'She leads weekly recitations and office hours for a proof- and code-intensive course taught in Standard ML, guiding students through recursion, higher-order functions, cost analysis with work/span reasoning, and inductive proofs. ' +
        'She also gives detailed feedback on code correctness and formal reasoning.'
    },
    {
      id: 'projects',
      broad: true,
      match: ['projects', 'project', 'portfolio', 'side project', 'personal project', 'what has she built'],
      weak: ['built', 'build', 'show me', 'things she made', 'made'],
      reply: [
        "Victoria's projects span accessibility, systems, and web:",
        '• SightBridge — CV-powered accessibility navigation app\n' +
        '• CMUEats — dining availability PWA, 3,000+ monthly users\n' +
        '• Music in the Neighbourhood — live nonprofit website\n' +
        '• C0 Virtual Machine — a VM written in C\n' +
        '• Meditite — AI-generated personalized meditation\n' +
        '• Mini Blockchain — peer-to-peer transactions in Flask',
        'Ask about any one and I can go deeper. The Projects app in the dock has them all too.'
      ]
    },
    {
      id: 'sightbridge',
      match: ['sightbridge', 'sight bridge', 'accessibility', 'computer vision', 'opencv', 'yolo', 'object detection', 'navigation'],
      reply:
        'SightBridge (February 2025) is a full-stack accessibility app that uses computer vision to help visually impaired users navigate their surroundings. ' +
        'Victoria built it with React Native and FastAPI, using OpenCV and YOLO for object detection, and integrated the Google Maps Directions API alongside OpenAI to deliver real-time navigation assistance. ' +
        'The object detection reached a 90% accuracy rate.'
    },
    {
      id: 'mitn',
      match: ['music in the neighbourhood', 'music in the neighborhood', 'mitn', 'nonprofit', 'seo', 'phpmailer', 'music'],
      reply:
        'Music in the Neighbourhood is a live nonprofit website Victoria has designed and maintained since April 2023, showcasing the organization\'s mission, events, and media. ' +
        'She built it from scratch in HTML, CSS, and JavaScript, and integrated PHP with PHPMailer to handle form submissions and backend functionality. ' +
        'Her SEO work drove a 15% increase in user engagement. You can visit it at musicintheneighbourhood.com.'
    },
    {
      id: 'c0vm',
      match: ['c0vm', 'c0 vm', 'virtual machine', 'c0', 'bytecode', 'jvm', 'llvm', 'interpreter', 'compiler', 'systems'],
      reply:
        'The C0 Virtual Machine (April 2025) is a full-featured VM Victoria wrote in C for the C0 language, modeled after the JVM and LLVM. ' +
        'She implemented a complete instruction set covering stack manipulation, arithmetic, control flow, static and native function calls, and heap-based memory operations. ' +
        'It required managing runtime structures like operand stacks, call frames, and program counters to interpret C0 bytecode correctly.'
    },
    {
      id: 'meditite',
      match: ['meditite', 'meditation', 'cartesia', 'audio', 'mindfulness'],
      reply:
        'Meditite (November 2024) is a personalized meditation app that generates tailored audio experiences from user input like speed, mood, and emotion. ' +
        'Victoria built it with React, Python, and Flask, integrating the OpenAI API and Cartesia to dynamically generate soothing meditation audio. ' +
        'The personalization was the point — it adapts the session to how you say you are feeling.'
    },
    {
      id: 'blockchain',
      match: ['blockchain', 'mini blockchain', 'crypto', 'consensus', 'peer to peer', 'distributed ledger'],
      reply:
        'Mini Blockchain (October 2024) is a lightweight blockchain Victoria built in Python and Flask, with a Node component, enabling secure peer-to-peer transactions and data storage. ' +
        'She implemented consensus algorithms to guarantee data integrity and prevent fraudulent activity across the network.'
    },
    {
      id: 'ai-ml',
      broad: true,
      match: [
        'machine learning', 'ml', 'artificial intelligence', 'ai', 'deep learning', 'neural',
        'llm', 'openai', 'ai projects', 'ai experience'
      ],
      reply: [
        'Machine Learning is Victoria\'s concentration at CMU, and it runs through a lot of her work:',
        '• SightBridge — OpenCV and YOLO for object detection at 90% accuracy\n' +
        '• Meditite — OpenAI and Cartesia for generated meditation audio\n' +
        '• ServiceNow — currently on the AI Control Tower team\n' +
        '• Coursework — Human-AI Interaction, Probability',
        'Ask about any of these for the full story.'
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
        'Backend is where Victoria spends most of her time:',
        '• Turing — Django + REST dashboards, 4,500+ concurrent users, 30% lower latency\n' +
        '• ScottyLabs — RESTful DiningAPI scraping 20+ sites, MongoDB review system\n' +
        '• Wealthmeup.ai — Python scraping pipelines and automated Slack monitoring\n' +
        '• SightBridge — FastAPI service behind the mobile app',
        'She also built a C0 virtual machine in C, if lower-level systems work counts.'
      ]
    },
    {
      id: 'frontend',
      broad: true,
      match: ['frontend', 'front end', 'ui', 'ux', 'react', 'react native', 'typescript', 'web development', 'full stack', 'fullstack'],
      weak: ['design', 'website'],
      reply: [
        "Victoria's full-stack and frontend work includes:",
        '• CMUEats — React and TypeScript PWA, 3,000+ monthly users\n' +
        '• SightBridge — React Native mobile app\n' +
        '• Meditite — React frontend\n' +
        '• Music in the Neighbourhood — responsive site from scratch in HTML/CSS/JS',
        'This portfolio site is hers too — the whole macOS desktop is hand-built.'
      ]
    },
    {
      id: 'hackathons',
      match: ['hackathon', 'hackathons', 'competition', 'hack', 'won', 'award', 'awards', 'prize'],
      reply:
        'Several of Victoria\'s projects came out of short build sprints — SightBridge, Meditite, and Mini Blockchain were each built in a matter of days. ' +
        "I don't have a full list of her hackathon placements, though. You can contact Victoria directly to learn more."
    },
    {
      id: 'contact',
      match: [
        'contact', 'email', 'reach', 'get in touch', 'hire', 'hiring', 'recruit', 'connect',
        'linkedin', 'github', 'social', 'message her', 'talk to her'
      ],
      reply:
        'The quickest way is the Mail app in the dock — it sends straight to her inbox. ' +
        'Her LinkedIn and GitHub are linked from the desktop as well, and her full resume is in the Preview app.'
    },
    {
      id: 'resume',
      match: ['resume', 'cv', 'curriculum vitae', 'download resume', 'pdf'],
      reply:
        "Victoria's full resume is available in the Preview app in the dock, and you can download the PDF straight from there. " +
        'It covers her education, technical skills, all five roles, and her projects in detail.'
    },
    {
      id: 'location',
      match: [
        'where', 'location', 'based', 'live', 'lives', 'from', 'vancouver', 'canada',
        'pittsburgh', 'bay area', 'relocate', 'remote'
      ],
      reply:
        'Victoria was born and raised in Vancouver, Canada. She studies at Carnegie Mellon in Pittsburgh, PA, and is currently interning at ServiceNow in Santa Clara, CA. ' +
        "Her past roles have spanned Palo Alto and remote work, so she's comfortable in a range of setups."
    },
    {
      id: 'availability',
      match: [
        'available', 'availability', 'looking for', 'open to', 'opportunities', 'internship 2027',
        'new grad', 'full time', 'seeking', 'next role'
      ],
      reply:
        "Victoria graduates in May 2028 and is interning at ServiceNow through August 2026. For anything about her current availability or what she's looking for next, " +
        'contact her directly through the Mail app — she can give you a much better answer than I can.'
    },
    {
      id: 'interests',
      match: ['interests', 'hobbies', 'fun', 'passion', 'passionate', 'motivates', 'why software', 'outside of work'],
      reply:
        "Victoria is drawn to building things with real impact — especially tools and frameworks people rely on every day, which is why projects like CMUEats and SightBridge appeal to her. " +
        "For anything beyond her technical work, you're better off asking her directly."
    },
    {
      id: 'thanks',
      match: ['thanks', 'thank you', 'ty', 'appreciate it', 'cheers', 'awesome', 'cool', 'nice', 'great'],
      reply: "Anytime! Ask me anything else about Victoria's work, or use the Mail app if you'd like to reach her directly."
    },
    {
      id: 'bye',
      match: ['bye', 'goodbye', 'see you', 'later', 'thats all', 'im done'],
      reply: 'Thanks for stopping by! Feel free to explore the rest of the desktop — the Projects and Preview apps have plenty more. 👋'
    },
    {
      id: 'bot',
      match: [
        'are you real', 'real person', 'are you a bot', 'a bot', 'are you ai', 'are you human',
        'human', 'is this chatgpt', 'chatgpt', 'are you victoria', 'chatbot', 'how do you work',
        'who made you', 'are you a person'
      ],
      reply:
        "I'm a scripted assistant, not a live model — Victoria wrote my answers by hand, so I only know what's on this site. " +
        'That means I answer instantly and never make things up, but anything outside her portfolio is beyond me.'
    }
  ];

  var SUGGESTIONS = [
    'What projects has she built?',
    'Tell me about her internships',
    'What are her technical skills?',
    'Where does she study?'
  ];

  /* ---------- Matching ---------- */

  function normalize(text) {
    return (' ' + text.toLowerCase() + ' ')
      .replace(/[^a-z0-9+#\s]/g, ' ')
      .replace(/\s+/g, ' ');
  }

  /* Phrases beat words, and whole-word hits beat substring hits, so that
     "ml" doesn't fire on "html" and "ta" doesn't fire on "stack". */
  function scoreTerms(query, terms, strong) {
    var total = 0;

    (terms || []).forEach(function (raw) {
      var term = normalize(raw).trim();
      if (!term) return;

      var isPhrase = term.indexOf(' ') !== -1;
      var hit = 0;

      if (query.indexOf(' ' + term + ' ') !== -1) {
        hit = isPhrase ? 6 : 3;
      } else if (isPhrase && query.indexOf(term) !== -1) {
        hit = 4;
      }

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

      // The nudge only orders topics against each other — it is deliberately
      // kept out of the threshold so a broad topic matched by a single strong
      // word still answers.
      var rank = score - (topic.broad ? 0.5 : 0);

      if (rank > bestRank) {
        bestRank = rank;
        best = topic;
      }
    });

    if (!best) return [FALLBACK];

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
       so a three-part answer reads like a conversation instead of a wall. */
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
        "Hey! 👋 I'm Victoria's portfolio assistant.",
        'Ask me about her projects, internships, technical skills, or coursework — or tap one of the suggestions below.'
      ]);
    }

    if (dockBtn) dockBtn.addEventListener('click', greet);

    document.querySelectorAll('[data-opens-window="messages"], [data-opens="messages"]').forEach(function (el) {
      el.addEventListener('click', greet);
    });
  }

  document.addEventListener('DOMContentLoaded', initMessagesApp);
})();
