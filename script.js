document.addEventListener('DOMContentLoaded', function () {

    // --- 1. SMART SETUP & SELECTORS ---
    const header = document.querySelector('header');
    const mainContent = document.querySelector('main');

    // STRICT CHECK: We only consider it a "Table Page" if it has actual content rows
    const indexRows = document.querySelectorAll('.chapter-table tbody tr');
    const isIndexPage = indexRows.length > 0;

    // --- FORCE RESET (Optional) ---
    // localStorage.removeItem('reader-theme'); 

    // ==================================================
    // 2. INJECT CSS
    // ==================================================
    const style = document.createElement('style');
    style.innerHTML = `
        /* CONTROLS CONTAINER */
        .js-controls { 
            max-width: var(--reading-width); 
            margin: 0 auto 2rem; 
            display: flex; gap: 12px; position: relative; z-index: 20; 
            align-items: center; padding: 0 10px;
        }
        
        /* INPUT & BUTTON SHARED STYLES */
        .js-input, .js-btn { 
            height: 48px; box-sizing: border-box; 
            border: 1px solid var(--border-color); border-radius: 6px; 
            background: var(--bg-paper); color: var(--text-primary); 
            font-family: var(--font-heading); font-size: 1rem;
            margin: 0 !important; vertical-align: middle; transition: all 0.2s ease;
        }
        
        .js-input { flex: 1; padding: 0 16px; }
        .js-input:focus { outline: 2px solid var(--accent-color); border-color: transparent; }

        .js-btn { 
            padding: 0 24px; cursor: pointer; min-width: 120px; 
            display: flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; 
        }
        .js-btn:hover { border-color: var(--accent-color); color: var(--accent-color); }

        .hidden-row { display: none !important; }

        /* BACK TO TOP */
        .back-to-top {
            position: fixed; bottom: 30px; right: 30px; width: 50px; height: 50px;
            border-radius: 50%; background-color: var(--accent-color); color: white;
            border: none; font-size: 1.5rem; cursor: pointer; opacity: 0; pointer-events: none;
            transition: opacity 0.3s, transform 0.3s; z-index: 1000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;
        }
        .back-to-top.visible { opacity: 1; pointer-events: auto; }
        .back-to-top:hover { transform: translateY(-5px); }
        
        /* NO RESULTS MESSAGE */
        .no-results-message {
            text-align: center; padding: 40px; color: var(--text-secondary);
            font-style: italic; font-family: var(--font-heading); font-size: 1.1rem;
            display: none; width: 100%;
        }
    `;
    document.head.appendChild(style);

    // ==================================================
    // 3. BUILD UI
    // ==================================================
    const container = document.createElement('div');
    container.className = 'js-controls';

    const input = document.createElement('input');
    input.className = 'js-input';
    // We set the placeholder later based on the mode

    const btn = document.createElement('button');
    btn.className = 'js-btn';
    btn.innerHTML = '<span>☀️</span> Light';

    container.appendChild(input);
    container.appendChild(btn);

    if (header) {
        header.after(container);
    }

    // ==================================================
    // 4. DETERMINE SEARCH MODE (THE FIX)
    // ==================================================

    if (isIndexPage) {
        // --- MODE A: TABLE SEARCH (Index Page) ---
        console.log("Mode: Index Table Search");
        input.placeholder = 'Search chapters...';
        input.setAttribute('aria-label', 'Search chapters');

        const noResultsDiv = document.createElement('div');
        noResultsDiv.className = 'no-results-message';
        noResultsDiv.textContent = 'No chapters found matching your search.';

        // Find the table safely
        const table = document.querySelector('.chapter-table');
        if (table) table.after(noResultsDiv);

        input.addEventListener('input', function (e) {
            const term = e.target.value.toLowerCase();
            let visibleCount = 0;

            indexRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(term)) {
                    row.classList.remove('hidden-row');
                    visibleCount++;
                } else {
                    row.classList.add('hidden-row');
                }
            });

            if (visibleCount === 0) {
                noResultsDiv.style.display = 'block';
            } else {
                noResultsDiv.style.display = 'none';
            }
        });

        // Clickable Rows Logic
        indexRows.forEach(row => {
            row.style.cursor = 'pointer';
            row.onclick = (e) => {
                if (!window.getSelection().toString()) {
                    const link = row.querySelector('a');
                    if (link) window.location.href = link.href;
                }
            };
        });

    } else {
        // --- MODE B: CONTENT SEARCH (Chapter Page) ---
        console.log("Mode: Chapter Word Search");
        input.placeholder = "Find word in chapter...";
        input.setAttribute('aria-label', "Find word in chapter");

        input.addEventListener('input', function (e) {
            const term = e.target.value.trim().toLowerCase();

            // 1. Clear previous highlights
            const marks = mainContent.querySelectorAll('mark');
            marks.forEach(mark => {
                const parent = mark.parentNode;
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize();
            });

            if (term.length < 2) return;

            // 2. Find and highlight
            const walk = document.createTreeWalker(mainContent, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            let node;

            while (node = walk.nextNode()) {
                const parentTag = node.parentNode.tagName.toLowerCase();
                // We exclude 'script', 'style', etc.
                if (['p', 'li', 'span', 'h1', 'h2', 'h3', 'td', 'th'].includes(parentTag)) {
                    textNodes.push(node);
                }
            }

            textNodes.forEach(textNode => {
                const text = textNode.nodeValue;
                if (text.toLowerCase().includes(term)) {
                    const span = document.createElement('span');
                    const regex = new RegExp(`(${term})`, 'gi');
                    span.innerHTML = text.replace(regex, '<mark style="background-color: #ffeb3b; color: #000; border-radius: 2px; padding: 0 2px;">$1</mark>');
                    textNode.parentNode.replaceChild(span, textNode);
                }
            });
        });
    }

    // ==================================================
    // 5. THEME SWITCHER
    // ==================================================
    const themes = ['light', 'sepia', 'dark', 'oled'];
    let themeIndex = 0;

    const savedTheme = localStorage.getItem('reader-theme');
    if (savedTheme && themes.includes(savedTheme)) {
        themeIndex = themes.indexOf(savedTheme);
        applyTheme(savedTheme);
    }

    btn.addEventListener('click', () => {
        themeIndex = (themeIndex + 1) % themes.length;
        const newTheme = themes[themeIndex];
        applyTheme(newTheme);
        localStorage.setItem('reader-theme', newTheme);
    });

    function applyTheme(theme) {
        document.body.classList.remove('theme-dark', 'theme-sepia', 'theme-oled');

        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            btn.innerHTML = '<span>🌙</span> Dark';
        } else if (theme === 'oled') {
            document.body.classList.add('theme-oled');
            btn.innerHTML = '<span>🖤</span> OLED';
        } else if (theme === 'sepia') {
            document.body.classList.add('theme-sepia');
            btn.innerHTML = '<span>☕</span> Sepia';
        } else {
            btn.innerHTML = '<span>☀️</span> Light';
        }
    }

    // ==================================================
    // 6. BACK TO TOP & PARTICLES
    // ==================================================
    const topBtn = document.createElement('button');
    topBtn.innerHTML = '↑';
    topBtn.className = 'back-to-top';
    document.body.appendChild(topBtn);

    window.addEventListener('scroll', () => {
        topBtn.classList.toggle('visible', window.scrollY > 300);
    });

    topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    createParticles();

    function createParticles() {
        const bgContainer = document.createElement('div');
        bgContainer.id = 'bg-animation-container';
        document.body.appendChild(bgContainer);
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            const size = Math.random() * 40 + 10;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDuration = `${Math.random() * 20 + 15}s`;
            particle.style.animationDelay = `-${Math.random() * 20}s`;
            bgContainer.appendChild(particle);
        }
    }
});
