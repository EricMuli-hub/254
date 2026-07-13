// script.js - complete application logic
(function() {
    'use strict';

    // ---------- DATA ----------
    let users = JSON.parse(localStorage.getItem('em_users')) || [];
    let resources = JSON.parse(localStorage.getItem('em_resources')) || [];
    let currentUser = JSON.parse(sessionStorage.getItem('em_current_user')) || null;
    let currentLang = localStorage.getItem('em_lang') || CONFIG.DEFAULT_LANG;

    // Ensure admin exists
    const adminExists = users.some(u => u.username === CONFIG.ADMIN_USERNAME);
    if (!adminExists) {
        users.push({
            id: 'admin_001',
            username: CONFIG.ADMIN_USERNAME,
            password: CONFIG.ADMIN_PASSWORD,
            email: CONFIG.ADMIN_EMAIL,
            fullname: CONFIG.ADMIN_FULLNAME,
            role: 'admin',
            lang: CONFIG.DEFAULT_LANG,
            created: Date.now()
        });
        localStorage.setItem('em_users', JSON.stringify(users));
    }

    // Default resources if empty
    if (resources.length === 0) {
        resources = [
            { id: 'r1', category: 'photo', title: 'Sunset at the Lake', desc: 'Beautiful sunset view',
                url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%2313182B%22/%3E%3Ccircle cx=%22250%22 cy=%22150%22 r=%2280%22 fill=%22%23F59E0B%22 opacity=%220.4%22/%3E%3Ccircle cx=%2250%22 cy=%22120%22 r=%2260%22 fill=%22%23EC4899%22 opacity=%220.3%22/%3E%3Ctext x=%22150%22 y=%22110%22 text-anchor=%22middle%22 fill=%22%23F1F5F9%22 font-size=%2216%22 font-family=%22Inter%22%3E🌅 Sunset%3C/text%3E%3C/svg%3E',
                uploadedBy: CONFIG.ADMIN_USERNAME, uploadedAt: Date.now() - 86400000 },
            { id: 'r2', category: 'video', title: 'Coding Session', desc: 'Live coding in progress',
                url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%2313182B%22/%3E%3Crect x=%2240%22 y=%2240%22 width=%22220%22 height=%22120%22 rx=%228%22 fill=%22%231A2140%22/%3E%3Ctext x=%22150%22 y=%22110%22 text-anchor=%22middle%22 fill=%22%236C3CE1%22 font-size=%2230%22 font-family=%22Inter%22%3E▶%3C/text%3E%3Ctext x=%22150%22 y=%22140%22 text-anchor=%22middle%22 fill=%22%2394A3B8%22 font-size=%2212%22 font-family=%22Inter%22%3ECoding Session%3C/text%3E%3C/svg%3E',
                uploadedBy: CONFIG.ADMIN_USERNAME, uploadedAt: Date.now() - 172800000 },
            { id: 'r3', category: 'document', title: 'The Art of Chess', desc: 'Strategic guide to chess',
                url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%2313182B%22/%3E%3Ctext x=%22150%22 y=%2290%22 text-anchor=%22middle%22 fill=%22%23F59E0B%22 font-size=%2248%22 font-family=%22Inter%22%3E♛%3C/text%3E%3Ctext x=%22150%22 y=%22130%22 text-anchor=%22middle%22 fill=%22%23F1F5F9%22 font-size=%2216%22 font-family=%22Inter%22%3EChess Guide%3C/text%3E%3C/svg%3E',
                uploadedBy: CONFIG.ADMIN_USERNAME, uploadedAt: Date.now() - 259200000 },
            { id: 'r4', category: 'photo', title: 'Nature Walk', desc: 'Peaceful forest trail',
                url: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22200%22 viewBox=%220 0 300 200%22%3E%3Crect width=%22300%22 height=%22200%22 fill=%22%2313182B%22/%3E%3Ccircle cx=%2260%22 cy=%22120%22 r=%2250%22 fill=%22%2322C55E%22 opacity=%220.3%22/%3E%3Ccircle cx=%22240%22 cy=%22100%22 r=%2260%22 fill=%22%233B82F6%22 opacity=%220.3%22/%3E%3Ctext x=%22150%22 y=%22110%22 text-anchor=%22middle%22 fill=%22%23F1F5F9%22 font-size=%2218%22 font-family=%22Inter%22%3E🌿 Nature%3C/text%3E%3C/svg%3E',
                uploadedBy: CONFIG.ADMIN_USERNAME, uploadedAt: Date.now() - 345600000 }
        ];
        localStorage.setItem('em_resources', JSON.stringify(resources));
    }

    // ---------- HELPERS ----------
    function saveUsers() { localStorage.setItem('em_users', JSON.stringify(users)); }

    function saveResources() { localStorage.setItem('em_resources', JSON.stringify(resources)); }

    function setCurrentUser(u) {
        currentUser = u;
        if (u) {
            sessionStorage.setItem('em_current_user', JSON.stringify(u));
            if (u.lang) { currentLang = u.lang;
                localStorage.setItem('em_lang', u.lang); }
        } else {
            sessionStorage.removeItem('em_current_user');
        }
    }

    function toast(msg, type = 'info') {
        const c = document.getElementById('toastContainer');
        if (!c) return;
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = msg;
        c.appendChild(el);
        setTimeout(() => { el.style.opacity = '0';
            setTimeout(() => el.remove(), 300); }, 3500);
    }

    function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    // ---------- RENDER FUNCTIONS ----------
    function renderMediaGrid(filter = 'all') {
        const grid = document.getElementById('mediaGrid');
        if (!grid) return;
        let items = resources;
        if (filter !== 'all') items = items.filter(r => r.category === filter);
        if (items.length === 0) {
            grid.innerHTML =
                `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px 0;">No resources found. ${currentUser && currentUser.role === 'admin' ? 'Upload some!' : 'Check back later.'}</p>`;
            return;
        }
        grid.innerHTML = items.map(r => `
              <div class="media-item">
                <div class="thumb" style="background:${r.category === 'photo' ? '#1A2140' : r.category === 'video' ? '#2D1A40' : '#1A2D40'};">
                  ${r.category === 'photo' ? '📷' : r.category === 'video' ? '🎬' : '📄'}
                </div>
                <div class="info">
                  <h5>${r.title}</h5>
                  <p>${r.desc || ''}</p>
                  <div class="actions">
                    <button class="btn btn-sm btn-outline view-resource" data-id="${r.id}"><i class="fas fa-eye"></i> View</button>
                    <button class="btn btn-sm download-resource" data-id="${r.id}"><i class="fas fa-download"></i> Download</button>
                  </div>
                </div>
              </div>
            `).join('');

        document.querySelectorAll('.view-resource').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const res = resources.find(r => r.id === id);
                if (res) {
                    toast(`📄 Viewing: ${res.title} (online only)`, 'info');
                    window.open(res.url, '_blank');
                }
            });
        });

        document.querySelectorAll('.download-resource').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.dataset.id;
                const res = resources.find(r => r.id === id);
                if (res) {
                    toast(`💳 Payment required to download "${res.title}". Contact admin.`, 'error');
                }
            });
        });
    }

    function renderBeliefVerse(belief = 'bible', containerId = 'beliefContent') {
        const verses = {
            bible: [
                { text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.',
                    ref: 'John 3:16' },
                { text: 'The Lord is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
                { text: 'Faith is the substance of things hoped for, the evidence of things not seen.',
                    ref: 'Hebrews 11:1' },
                { text: 'I can do all things through Christ who strengthens me.', ref: 'Philippians 4:13' },
                { text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
                    ref: 'Jeremiah 29:11' }
            ],
            quran: [
                { text: 'So verily, with hardship, there is ease.', ref: 'Quran 94:5' },
                { text: 'And whoever puts their trust in Allah, He is sufficient for them.',
                    ref: 'Quran 65:3' },
                { text: 'And We have certainly made the Quran easy to remember, so is there any who will remember?',
                    ref: 'Quran 54:17' },
                { text: 'Peace be upon you for what you patiently endured. And excellent is the final home.',
                    ref: 'Quran 13:24' }
            ],
            hindu: [
                { text: 'The soul is neither born, nor does it ever die; nor having once existed, does it ever cease to be.',
                    ref: 'Bhagavad Gita 2:20' },
                { text: 'You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions.',
                    ref: 'Bhagavad Gita 2:47' },
                { text: 'The mind is restless, turbulent, strong, and very difficult to control, just like the wind.',
                    ref: 'Bhagavad Gita 6:34' }
            ],
            buddhism: [
                { text: 'The mind is everything. What you think you become.', ref: 'Buddha' },
                { text: 'Peace comes from within. Do not seek it without.', ref: 'Buddha' },
                { text: 'Thousands of candles can be lit from a single candle, and the life of the candle will not be shortened.',
                    ref: 'Buddha' }
            ],
            other: [
                { text: 'In the end, only three things matter: how much you loved, how gently you lived, and how gracefully you let go of things not meant for you.',
                    ref: 'Anonymous' },
                { text: 'The universe is full of magical things, patiently waiting for our wits to grow sharper.',
                    ref: 'Eden Phillpotts' },
                { text: 'What you seek is seeking you.', ref: 'Rumi' }
            ]
        };

        const list = verses[belief] || verses.bible;
        const idx = Math.floor(Math.random() * list.length);
        const v = list[idx];

        const container = document.getElementById(containerId);
        if (!container) return;
        const card = container.querySelector('.verse-card');
        if (card) {
            const textEl = card.querySelector('.verse-text');
            const refEl = card.querySelector('.verse-ref');
            if (textEl) textEl.textContent = `"${v.text}"`;
            if (refEl) refEl.innerHTML = `— <strong>${v.ref}</strong> · ${belief.charAt(0).toUpperCase() + belief.slice(1)}`;
        }

        // Also update standalone if present
        const stText = document.getElementById('beliefVerseTextStandalone');
        const stRef = document.getElementById('beliefVerseRefStandalone');
        if (stText) stText.textContent = `"${v.text}"`;
        if (stRef) stRef.textContent = v.ref;
    }

    function updateUI() {
        const isLoggedIn = !!currentUser;
        const isAdmin = isLoggedIn && currentUser.role === 'admin';

        // Nav
        const loginBtn = document.getElementById('loginNavBtn');
        const logoutBtn = document.getElementById('logoutNavBtn');
        const adminNav = document.getElementById('adminNavLink');
        if (loginBtn) loginBtn.classList.toggle('hidden', isLoggedIn);
        if (logoutBtn) logoutBtn.classList.toggle('hidden', !isLoggedIn);
        if (adminNav) adminNav.classList.toggle('hidden', !isAdmin);

        // Dashboard header
        const dashName = document.getElementById('dashUserName');
        const dashRole = document.getElementById('dashUserRole');
        const dashBadgeName = document.getElementById('dashBadgeName');
        const dashBadgeRole = document.getElementById('dashBadgeRole');
        const adminTab = document.getElementById('adminTabBtn');
        if (dashName) dashName.textContent = isLoggedIn ? currentUser.fullname || currentUser.username : 'Guest';
        if (dashRole) dashRole.textContent = `Role: ${isLoggedIn ? currentUser.role : 'viewer'}`;
        if (dashBadgeName) dashBadgeName.textContent = isLoggedIn ? currentUser.username : 'Guest';
        if (dashBadgeRole) dashBadgeRole.textContent = isLoggedIn ? currentUser.role : 'viewer';
        if (adminTab) adminTab.classList.toggle('hidden', !isAdmin);

        // Profile fields
        const pUser = document.getElementById('profileUsername');
        const pEmail = document.getElementById('profileEmail');
        const pRole = document.getElementById('profileRole');
        if (pUser) pUser.value = isLoggedIn ? currentUser.username : '';
        if (pEmail) pEmail.value = isLoggedIn ? currentUser.email : '';
        if (pRole) pRole.value = isLoggedIn ? currentUser.role : '';

        // Admin stats
        if (isAdmin) {
            const totalRes = document.getElementById('adminTotalResources');
            const totalUsers = document.getElementById('adminTotalUsers');
            const userCount = document.getElementById('adminUserCount');
            if (totalRes) totalRes.textContent = resources.length;
            if (totalUsers) totalUsers.textContent = users.length;
            if (userCount) userCount.textContent = users.length;
            const userList = document.getElementById('adminUserList');
            if (userList) {
                userList.innerHTML = users.map(u =>
                    `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.9rem;">
                                <span>${u.username} ${u.role === 'admin' ? '👑' : ''}</span>
                                <span style="color:var(--text-muted);">${u.role}</span>
                            </div>`
                ).join('');
            }
        }

        // Media grid
        renderMediaGrid('all');
        // Daily verse on index
        const dailyPreview = document.getElementById('dailyVersePreview');
        if (dailyPreview) {
            const verses = [
                { text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.',
                    ref: 'Jeremiah 29:11' },
                { text: 'The Lord is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
                { text: 'Faith is the substance of things hoped for, the evidence of things not seen.',
                    ref: 'Hebrews 11:1' }
            ];
            const v = verses[Math.floor(Math.random() * verses.length)];
            const textEl = dailyPreview.querySelector('.verse-text');
            const refEl = dailyPreview.querySelector('.verse-ref');
            if (textEl) textEl.textContent = `"${v.text}"`;
            if (refEl) refEl.innerHTML = `— <strong>${v.ref}</strong>`;
        }

        // Beliefs in dashboard
        renderBeliefVerse('bible', 'beliefContent');

        // Language selector
        const langSelect = document.getElementById('profileLang');
        if (langSelect) langSelect.value = currentLang;

        // WhatsApp status
        document.querySelectorAll('.wa-status').forEach(el => {
            el.innerHTML =
                `<i class="fab fa-whatsapp"></i> <span>${CONFIG.WHATSAPP_NUMBERS.join(' · ')}</span> <span class="offline">(AI auto-reply active)</span>`;
        });
    }

    // ---------- NAVIGATION ----------
    function navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('[id^="page"]').forEach(el => el.classList.add('hidden'));

        const pageMap = {
            home: 'pageHome',
            dashboard: 'pageDashboard',
            beliefs: 'pageBeliefs',
            'ai-assistant': 'pageAIAssistant',
            admin: 'pageAdmin',
            login: 'pageLogin',
            register: 'pageRegister'
        };

        const target = pageMap[page] || 'pageHome';
        const el = document.getElementById(target);
        if (el) el.classList.remove('hidden');

        // Update nav active
        document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
            a.classList.toggle('active', a.dataset.page === page);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (page === 'dashboard') {
            renderMediaGrid('all');
            renderBeliefVerse('bible', 'beliefContent');
            updateUI();
        }
        if (page === 'beliefs') {
            renderBeliefVerse('bible', 'beliefContentStandalone');
        }
        if (page === 'admin') {
            updateUI();
        }
    }

    // ---------- EVENT BINDINGS ----------
    function init() {
        // ---- Nav clicks ----
        document.querySelectorAll('.nav-links a[data-page]').forEach(a => {
            a.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.dataset.page;
                if (page === 'login' && currentUser) { toast('Already logged in.', 'info'); return; }
                if (page === 'register' && currentUser) { toast('Already logged in.', 'info'); return; }
                if (page === 'dashboard' && !currentUser) { toast('Please sign in first.', 'error');
                    navigateTo('login'); return; }
                if (page === 'admin' && (!currentUser || currentUser.role !== 'admin')) { toast(
                        'Access denied. Admin only.', 'error'); return; }
                navigateTo(page);
                document.getElementById('navLinks')?.classList.remove('open');
            });
        });

        // Logo click
        document.getElementById('logoLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo('home');
        });

        // Mobile toggle
        document.getElementById('mobileToggle')?.addEventListener('click', function() {
            document.getElementById('navLinks')?.classList.toggle('open');
        });

        // ---- Login form ----
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('loginUsername').value.trim();
                const password = document.getElementById('loginPassword').value.trim();
                const lang = document.getElementById('loginLang').value;

                const user = users.find(u => (u.username === username || u.email === username) && u.password ===
                    password);
                if (!user) {
                    toast('Invalid credentials.', 'error');
                    return;
                }
                user.lang = lang;
                setCurrentUser(user);
                saveUsers();
                toast('Welcome back, ' + user.fullname + '!', 'success');
                window.location.href = 'dashboard.html';
            });
        }

                   // ---- Register form ----
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const fullname = document.getElementById('regFullname').value.trim();
                const username = document.getElementById('regUsername').value.trim();
                const email = document.getElementById('regEmail').value.trim();
                const password = document.getElementById('regPassword').value;
                const confirm = document.getElementById('regConfirm').value;
                const lang = document.getElementById('regLang').value;

                if (password !== confirm) { toast('Passwords do not match.', 'error'); return; }
                if (users.some(u => u.username === username)) { toast('Username already taken.', 'error'); return; }
                if (users.some(u => u.email === email)) { toast('Email already registered.', 'error'); return; }

                const newUser = {
                    id: generateId(),
                    username,
                    password,
                    email,
                    fullname,
                    role: 'user',
                    lang,
                    created: Date.now()
                };
                users.push(newUser);
                saveUsers();
                toast('Account created! Please sign in.', 'success');
                window.location.href = 'login.html';
            });
        }

        // ---- Logout ----
        document.getElementById('logoutNavBtn')?.addEventListener('click', function(e) {
            e.preventDefault();
            setCurrentUser(null);
            toast('Logged out.', 'info');
            window.location.href = 'index.html';
        });

        // ---- Profile: Change password ----
        document.getElementById('profileChangePwdBtn')?.addEventListener('click', function() {
            if (!currentUser) { toast('Not logged in.', 'error'); return; }
            const curr = document.getElementById('profileCurrPwd').value;
            const newp = document.getElementById('profileNewPwd').value;
            const confirm = document.getElementById('profileConfirmPwd').value;
            if (curr !== currentUser.password) { toast('Current password is wrong.', 'error'); return; }
            if (newp.length < 6) { toast('New password must be at least 6 characters.', 'error'); return; }
            if (newp !== confirm) { toast('New passwords do not match.', 'error'); return; }
            const user = users.find(u => u.id === currentUser.id);
            if (user) {
                user.password = newp;
                saveUsers();
                setCurrentUser(user);
                toast('Password updated successfully.', 'success');
                document.getElementById('profileCurrPwd').value = '';
                document.getElementById('profileNewPwd').value = '';
                document.getElementById('profileConfirmPwd').value = '';
            }
        });

        // ---- Profile: Language ----
        document.getElementById('profileLangBtn')?.addEventListener('click', function() {
            const lang = document.getElementById('profileLang').value;
            if (currentUser) {
                const user = users.find(u => u.id === currentUser.id);
                if (user) {
                    user.lang = lang;
                    saveUsers();
                    setCurrentUser(user);
                }
            } else {
                localStorage.setItem('em_lang', lang);
                currentLang = lang;
            }
            toast('Language updated to ' + lang, 'success');
            location.reload();
        });

        // ---- Belief tabs (dashboard) ----
        document.querySelectorAll('.belief-tabs button').forEach(btn => {
            btn.addEventListener('click', function() {
                const belief = this.dataset.belief;
                document.querySelectorAll('.belief-tabs button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const container = this.closest('.dash-panel') ? 'beliefContent' : 'beliefContentStandalone';
                renderBeliefVerse(belief, container);
            });
        });

        // ---- Belief AI generation ----
        function setupBeliefGen(promptId, resultId, btnId, randomBtnId, containerId) {
            document.getElementById(btnId)?.addEventListener('click', function() {
                const prompt = document.getElementById(promptId).value.trim() || 'hope';
                const belief = document.querySelector('.belief-tabs .active')?.dataset.belief || 'bible';
                const verses = {
                    bible: ['For God so loved the world...', 'The Lord is my shepherd...',
                        'Faith is the substance...'
                    ],
                    quran: ['So verily, with hardship, there is ease.', 'And whoever puts their trust in Allah...',
                        'Peace be upon you...'
                    ],
                    hindu: ['The soul is neither born...', 'You have the right to perform...',
                        'The mind is restless...'
                    ],
                    buddhism: ['The mind is everything.', 'Peace comes from within.',
                        'Thousands of candles can be lit...'
                    ],
                    other: ['In the end, only three things matter...', 'The universe is full of magical things...',
                        'What you seek is seeking you.'
                    ]
                };
                const list = verses[belief] || verses.bible;
                const gen = `AI generated for "${prompt}": ${list[Math.floor(Math.random() * list.length)]}`;
                document.getElementById(resultId).textContent = gen;
                toast('Verse generated!', 'success');
            });

            document.getElementById(randomBtnId)?.addEventListener('click', function() {
                const belief = document.querySelector('.belief-tabs .active')?.dataset.belief || 'bible';
                renderBeliefVerse(belief, containerId);
                toast('Random verse shown.', 'info');
            });
        }
        setupBeliefGen('beliefPrompt', 'beliefGenResult', 'genBeliefBtn', 'randomBeliefBtn', 'beliefContent');
        setupBeliefGen('beliefPromptStandalone', 'beliefGenResultStandalone', 'genBeliefBtnStandalone',
            'randomBeliefBtnStandalone', 'beliefContentStandalone');

  // ---- AI Chat ----
        function setupChat(inputId, sendBtnId, messagesId) {
            const input = document.getElementById(inputId);
            const sendBtn = document.getElementById(sendBtnId);
            const messages = document.getElementById(messagesId);

            function addMessage(text, sender) {
                const div = document.createElement('div');
                div.className = `chat-msg ${sender}`;
                div.textContent = text;
                messages.appendChild(div);
                messages.scrollTop = messages.scrollHeight;
            }

            function handleSend() {
                const text = input.value.trim();
                if (!text) return;
                addMessage(text, 'user');
                input.value = '';
                // Simulate AI response
                setTimeout(() => {
                    const responses = [
                        'That\'s a great question! Let me think...',
                        'Based on my research, I would suggest...',
                        'Interesting! Here’s what I know about that.',
                        'I can help with that. Please provide more details.',
                        'That topic is fascinating. Let me share some insights.'
                    ];
                    const reply = responses[Math.floor(Math.random() * responses.length)] +
                        ' (AI sim) – also, check the resources section.';
                    addMessage(reply, 'ai');
                }, 500);
            }

            sendBtn?.addEventListener('click', handleSend);
            input?.addEventListener('keypress', function(e) { if (e.key === 'Enter') handleSend(); });
        }
        setupChat('chatInput', 'chatSendBtn', 'chatMessages');
        setupChat('chatInputStandalone', 'chatSendBtnStandalone', 'chatMessagesStandalone');

        // ---- Admin upload ----
        function setupUpload(uploadBtnId, categoryId, titleId, descId, urlId) {
            document.getElementById(uploadBtnId)?.addEventListener('click', function() {
                if (!currentUser || currentUser.role !== 'admin') {
                    toast('Only admin can upload.', 'error');
                    return;
                }
                const category = document.getElementById(categoryId).value;
                const title = document.getElementById(titleId).value.trim();
                const desc = document.getElementById(descId).value.trim();
                const url = document.getElementById(urlId).value.trim();
                if (!title || !url) { toast('Title and URL are required.', 'error'); return; }
                const newRes = {
                    id: generateId(),
                    category,
                    title,
                    desc: desc || '',
                    url,
                    uploadedBy: currentUser.username,
                    uploadedAt: Date.now()
                };
                resources.push(newRes);
                saveResources();
                toast('Resource uploaded successfully!', 'success');
                document.getElementById(titleId).value = '';
                document.getElementById(descId).value = '';
                document.getElementById(urlId).value = '';
                renderMediaGrid('all');
                updateUI();
            });
        }
        setupUpload('uploadResourceBtn', 'uploadCategory', 'uploadTitle', 'uploadDesc', 'uploadUrl');
        setupUpload('uploadResourceAdminBtn', 'uploadCategoryAdmin', 'uploadTitleAdmin', 'uploadDescAdmin',
            'uploadUrlAdmin');

        // ---- Dashboard tabs ----
        document.querySelectorAll('.dash-tabs button').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.dash-tabs button').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const tab = this.dataset.tab;
                document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
                const panelMap = {
                    media: 'tabMedia',
                    beliefs: 'tabBeliefs',
                    ai: 'tabAI',
                    profile: 'tabProfile',
                    'admin-upload': 'tabAdminUpload'
                };
                const panel = document.getElementById(panelMap[tab]);
                if (panel) panel.classList.add('active');
                if (tab === 'media') renderMediaGrid('all');
                if (tab === 'beliefs') renderBeliefVerse('bible', 'beliefContent');
            });
        });

        // ---- Media filter buttons ----
        document.getElementById('mediaFilterAll')?.addEventListener('click', function() { renderMediaGrid('all'); });
        document.getElementById('mediaFilterPhotos')?.addEventListener('click', function() { renderMediaGrid(
            'photo'); });
        document.getElementById('mediaFilterVideos')?.addEventListener('click', function() { renderMediaGrid(
            'video'); });
        document.getElementById('mediaFilterDocs')?.addEventListener('click', function() { renderMediaGrid(
            'document'); });

        // ---- Forgot password (simulated) ----
        document.getElementById('forgotPwdLink')?.addEventListener('click', function(e) {
            e.preventDefault();
            toast('Please contact admin to reset your password.', 'info');
        });

        // ---- Initial UI update ----
        updateUI();

        // If on dashboard and not logged in, redirect to login
        if (window.location.pathname.includes('dashboard.html') && !currentUser) {
            window.location.href = 'login.html';
        }
        if (window.location.pathname.includes('admin.html') && (!currentUser || currentUser.role !== 'admin')) {
            window.location.href = 'login.html';
        }

        // ---- Handle page visibility ----
        // After DOM load, if we are on a page that needs login, check
        const page = window.location.pathname.split('/').pop().replace('.html', '');
        if (page === 'dashboard' && !currentUser) window.location.href = 'login.html';
        if (page === 'admin' && (!currentUser || currentUser.role !== 'admin')) window.location.href = 'login.html';
    }

    // Run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();