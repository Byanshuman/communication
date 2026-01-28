document.addEventListener('DOMContentLoaded', function () {

    // --- FORCE RESET ---
    localStorage.removeItem('reader-theme');
    // -------------------

    const tableRows = document.querySelectorAll('.chapter-table tbody tr');
    const header = document.querySelector('header');

    // 1. Inject CSS for UI Controls
    const style = document.createElement('style');
    style.innerHTML = `
        .js-controls { 
            max-width: var(--reading-width); 
            margin: 0 auto 2rem; 
            display: flex; 
            gap: 12px; 
            position: relative; 
            z-index: 20; 
            align-items: center; /* Vertically center items */
        }
        
        /* SHARED STYLES */
        .js-input, .js-btn { 
            height: 48px; /* Force exact same height */
            box-sizing: border-box; 
            border: 1px solid var(--border-color); 
            border-radius: 6px; 
            background: var(--bg-paper); 
            color: var(--text-primary); 
            font-family: var(--font-heading);
            font-size: 1rem;
            
            /* CRITICAL FIX: Remove global margins causing misalignment */
            margin: 0 !important; 
            vertical-align: middle;
        }
        
        .js-input { 
            flex: 1; 
            padding: 0 16px;
        }
        
        .js-input:focus {
            outline: 2px solid var(--accent-color);
            border-color: transparent;
        }

        .js-btn { 
            padding: 0 24px;
            cursor: pointer; 
            min-width: 120px; 
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            white-space: nowrap;
        }

        .js-btn:hover {
            border-color: var(--accent-color);
            color: var(--accent-color);
        }

        .hidden-row { display: none !important; }
    `;
    document.head.appendChild(style);

    // 2. Build Controls
    const container = document.createElement('div');
    container.className = 'js-controls';

    const input = document.createElement('input');
    input.className = 'js-input';
    input.placeholder = 'Search chapters...';
    input.setAttribute('aria-label', 'Search chapters');

    const btn = document.createElement('button');
    btn.className = 'js-btn';
    btn.innerHTML = '<span>☀️</span> Light';

    container.appendChild(input);
    container.appendChild(btn);
    if (header) header.after(container);

    // 3. Initialize Particles
    createParticles();

    // 4. Theme Logic
    const themes = ['light', 'sepia', 'dark'];
    let themeIndex = 0;

    document.body.className = '';

    btn.addEventListener('click', () => {
        themeIndex = (themeIndex + 1) % themes.length;
        const theme = themes[themeIndex];

        document.body.classList.remove('theme-dark', 'theme-sepia');

        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            btn.innerHTML = '<span>🌙</span> Dark';
        } else if (theme === 'sepia') {
            document.body.classList.add('theme-sepia');
            btn.innerHTML = '<span>☕</span> Sepia';
        } else {
            btn.innerHTML = '<span>☀️</span> Light';
        }
    });

    // 5. Search Logic
    input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        tableRows.forEach(row => {
            row.classList.toggle('hidden-row', !row.textContent.toLowerCase().includes(term));
        });
    });

    // 6. Clickable Rows
    tableRows.forEach(row => {
        row.style.cursor = 'pointer';
        row.onclick = (e) => {
            if (!window.getSelection().toString()) {
                const link = row.querySelector('a');
                if (link) window.location.href = link.href;
            }
        };
    });

    // =========================================
    // BACKGROUND PARTICLES
    // =========================================
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

            const duration = Math.random() * 20 + 15;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `-${Math.random() * 20}s`;

            bgContainer.appendChild(particle);
        }
    }
});