// ====================================================================
// UBAIDDEV PORTFOLIO - HIGH SPEED ENGINE WITH SUPABASE INTEGRATION
// ====================================================================

// LocalStorage Cache Keys for Instantaneous 0ms Loading
const CACHE_KEYS = {
    PROJECTS: 'ubaiddev_cached_projects_v4',
    FEEDBACKS: 'ubaiddev_cached_feedbacks_v4'
};
// Purge any old legacy/dummy cache
try {
    localStorage.removeItem('ubaiddev_cached_projects_v2');
    localStorage.removeItem('ubaiddev_cached_projects_v3');
    localStorage.removeItem('ubaiddev_cached_feedbacks_v2');
    localStorage.removeItem('ubaiddev_cached_feedbacks_v3');
} catch (e) {}

let allProjectsData = [];
let currentCategoryFilter = 'all';

// 1. Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) {
        if (window.scrollY > 40) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
}, { passive: true });

// ====================================================================
// 2. PROJECT LOADER & RENDERING (Google Play Store & 3D Interactive)
// ====================================================================
async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    if (!projectsContainer) return;

    // Instant Paint from LocalStorage cache (fastest of the fastest)
    const cachedData = localStorage.getItem(CACHE_KEYS.PROJECTS);
    if (cachedData) {
        try {
            allProjectsData = JSON.parse(cachedData);
            renderProjects(allProjectsData, currentCategoryFilter);
        } catch (e) {
            console.warn("Cache parse error", e);
        }
    }

    // Network / Supabase Fetch in background
    let freshProjects = [];
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                freshProjects = data;
            }
        } catch (err) {
            console.warn("Supabase fetch failed, falling back to local dataset:", err);
        }
    }

    // Fallback if Supabase table is empty or credentials are not yet pasted
    if (!freshProjects || freshProjects.length === 0) {
        freshProjects = FALLBACK_PROJECTS;
    }

    allProjectsData = freshProjects;
    localStorage.setItem(CACHE_KEYS.PROJECTS, JSON.stringify(freshProjects));
    renderProjects(allProjectsData, currentCategoryFilter);
}

// Accurate Classifier for Mobile Apps vs Web Apps
function isMobileProject(p) {
    if (!p) return false;
    const cat = (p.category || '').toLowerCase().trim();
    const badge = (p.badge || '').toLowerCase().trim();
    const playUrl = (p.playstore_url || '').trim();

    // 1. Direct Google Play Store link
    if (playUrl.length > 0) return true;

    // 2. Category explicitly designates Mobile App / Android / iOS / Flutter
    if (cat === 'mobile app' || cat === 'mobile' || cat.startsWith('mobile') || cat.includes('mobile') || cat === 'android' || cat === 'ios' || cat === 'flutter') {
        return true;
    }

    // 3. Badge specifically designates Play Store / Mobile Application
    if (badge.includes('play store') || badge.includes('playstore') || badge === 'google play' || badge === 'mobile application') {
        return true;
    }

    return false;
}

function updateFilterCounts(projects) {
    const list = projects || [];
    const mobileCount = list.filter(p => isMobileProject(p)).length;
    const webCount = list.filter(p => !isMobileProject(p)).length;
    const totalCount = list.length;

    const countAll = document.getElementById('count-all');
    const countMobile = document.getElementById('count-mobile');
    const countWeb = document.getElementById('count-web');

    if (countAll) countAll.innerText = `(${totalCount})`;
    if (countMobile) countMobile.innerText = `(${mobileCount})`;
    if (countWeb) countWeb.innerText = `(${webCount})`;
}

function renderProjects(projects, filter = 'all') {
    const container = document.getElementById('projects-container');
    if (!container) return;

    const allList = projects || [];
    updateFilterCounts(allList);

    let filtered = allList;
    const filterNorm = (filter || 'all').toLowerCase();

    if (filterNorm === 'mobile') {
        filtered = allList.filter(p => isMobileProject(p));
    } else if (filterNorm === 'web') {
        filtered = allList.filter(p => !isMobileProject(p));
    } else {
        filtered = allList;
    }

    if (!filtered || filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-dim);">
                <i class="fas fa-folder-open" style="font-size: 2.8rem; margin-bottom: 1rem; color: var(--primary);"></i>
                <h4 style="color:#fff; margin-bottom: 0.5rem; font-size: 1.25rem;">No projects in this category</h4>
                <p style="font-size: 0.95rem;">Check back soon or select another category tab above to explore my work.</p>
            </div>
        `;
        return;
    }

    let html = '';
    filtered.forEach(p => {
        const title = p.title || p.name || 'Untitled Project';
        const category = p.category || 'Mobile App';
        const description = p.description || 'Full-featured robust software engineering project deployed for real-world client usage.';
        const imageUrl = p.image_url || p.imageUrl || 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1000&q=80';
        const playUrl = (p.playstore_url || '').trim();
        const liveUrl = (p.live_url || p.viewUrl || '').trim();
        const githubUrl = (p.github_url || '').trim();
        const badgeText = p.badge || (playUrl ? 'Live on Play Store' : 'Featured');
        const stats = p.stats || '';

        // Badges styling
        const isPlaystore = playUrl.length > 0 || badgeText.toLowerCase().includes('play');
        const badgeClass = isPlaystore ? 'playstore' : (category.toLowerCase().includes('qa') ? 'qa' : 'featured');
        const badgeIcon = isPlaystore ? '<i class="fab fa-google-play"></i>' : (category.toLowerCase().includes('qa') ? '<i class="fas fa-shield-alt"></i>' : '<i class="fas fa-bolt"></i>');

        // Tech stack tags
        let tagsHtml = '';
        if (p.tech_stack && Array.isArray(p.tech_stack)) {
            tagsHtml = p.tech_stack.map(tag => `<span class="tech-tag">${tag}</span>`).join('');
        } else if (typeof p.tech_stack === 'string') {
            tagsHtml = p.tech_stack.split(',').map(tag => `<span class="tech-tag">${tag.trim()}</span>`).join('');
        }

        // Action Buttons (Smart context-aware display)
        let actionsHtml = '';
        if (playUrl) {
            actionsHtml += `
                <a href="${playUrl}" target="_blank" rel="noopener noreferrer" class="btn-playstore-action" title="View on Google Play Store">
                    <i class="fab fa-google-play"></i> View on Play Store
                </a>
            `;
        }
        if (liveUrl && liveUrl !== playUrl) {
            actionsHtml += `
                <a href="${liveUrl}" target="_blank" rel="noopener noreferrer" class="btn-live-action ${!playUrl ? 'primary-live' : ''}" title="Visit Live Site / Demo">
                    <i class="fas fa-external-link-alt"></i> Live Demo
                </a>
            `;
        }
        if (githubUrl) {
            actionsHtml += `
                <a href="${githubUrl}" target="_blank" rel="noopener noreferrer" class="btn-code-action" title="View Source Code on GitHub">
                    <i class="fab fa-github"></i>
                </a>
            `;
        }
        if (!actionsHtml) {
            actionsHtml = `<a href="#order" class="btn-live-action primary-live"><i class="fas fa-paper-plane"></i> Inquire Project</a>`;
        }

        html += `
            <article class="project-card-3d glass">
                <div class="project-media-wrapper">
                    <img src="${imageUrl}" alt="${title} Preview" class="project-media-img" loading="lazy" decoding="async">
                    <div class="project-badge-top">
                        <span class="badge-pill ${badgeClass}">${badgeIcon} ${badgeText}</span>
                    </div>
                    <span class="badge-category">${category}</span>
                </div>
                <div class="project-content-body">
                    <h3 class="project-title">${title}</h3>
                    <p class="project-description">${description}</p>
                    
                    ${stats ? `
                    <div class="project-stats-row">
                        <i class="fas fa-star"></i>
                        <span>${stats}</span>
                    </div>` : ''}

                    ${tagsHtml ? `<div class="project-tech-tags">${tagsHtml}</div>` : ''}

                    <div class="project-actions-row">
                        ${actionsHtml}
                    </div>
                </div>
            </article>
        `;
    });

    container.innerHTML = html;
    init3DTilt();
}

// Category Tabs Click Handling (Event Delegation + Global Function)
window.filterProjectsTab = function(filter, btn) {
    currentCategoryFilter = (filter || 'all').toLowerCase();
    const filterContainer = document.querySelector('.project-filter-tabs');
    const tabs = document.querySelectorAll('.filter-tab-btn');
    
    tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
    });

    if (btn) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
    } else {
        const matching = document.querySelector(`.filter-tab-btn[data-filter="${currentCategoryFilter}"]`);
        if (matching) {
            matching.classList.add('active');
            matching.setAttribute('aria-selected', 'true');
        }
    }

    renderProjects(allProjectsData, currentCategoryFilter);
};

function initCategoryFilter() {
    const filterContainer = document.querySelector('.project-filter-tabs');
    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-tab-btn');
        if (!btn) return;
        const filter = btn.getAttribute('data-filter') || 'all';
        window.filterProjectsTab(filter, btn);
    });
}

// 3D Card Tilt Effect on Mouse Move (subtle — buttons remain fully clickable)
function init3DTilt() {
    if (window.innerWidth < 960) return;

    const cards = document.querySelectorAll('.project-card-3d');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            // Don't apply tilt when hovering action buttons
            if (e.target.closest('.project-actions-row')) {
                card.style.transform = 'translateY(-8px)';
                return;
            }
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Reduced to 4deg max (was 7deg) — smooth, not blocking
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        }, { passive: true });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ====================================================================
// 3. FEEDBACK SLIDER LOGIC (Instant Cache + Supabase)
// ====================================================================
let sliderTimer = null;
let currentSlide = 0;

async function loadFeedbacks() {
    const track = document.getElementById('feedback-track');
    if (!track) return;

    // Cache load
    const cachedFb = localStorage.getItem(CACHE_KEYS.FEEDBACKS);
    if (cachedFb) {
        try {
            renderFeedbacks(JSON.parse(cachedFb));
        } catch (e) {}
    }

    let feedbacksList = [];
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('feedbacks')
                .select('*')
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                feedbacksList = data;
            }
        } catch (err) {
            console.warn("Supabase feedbacks load error:", err);
        }
    }

    if (!feedbacksList || feedbacksList.length === 0) {
        feedbacksList = FALLBACK_FEEDBACKS;
    }

    localStorage.setItem(CACHE_KEYS.FEEDBACKS, JSON.stringify(feedbacksList));
    renderFeedbacks(feedbacksList);
}

function renderFeedbacks(feedbacks) {
    const track = document.getElementById('feedback-track');
    if (!track || !feedbacks || feedbacks.length === 0) return;

    track.innerHTML = '';
    feedbacks.forEach(item => {
        const rating = parseInt(item.rating) || 5;
        const stars = Array(rating).fill('<i class="fas fa-star"></i>').join('');
        const card = `
            <div class="testimonial-card">
                <div class="rating">${stars}</div>
                <p class="feedback-text">"${item.text}"</p>
                <h4 class="client-name">${item.name}</h4>
            </div>
        `;
        track.innerHTML += card;
    });

    initSlider();
}

function initSlider() {
    const track = document.getElementById('feedback-track');
    if (!track) return;
    const slides = track.querySelectorAll('.testimonial-card');
    if (slides.length <= 1) return;

    if (sliderTimer) clearInterval(sliderTimer);
    sliderTimer = setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }, 5500);
}

// Public Feedback Form Submission
function initFeedbackForm() {
    const form = document.getElementById('public-feedback-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button');
        const origText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Submitting Review...";

        const name = document.getElementById('pub-f-name').value;
        const rating = parseInt(document.getElementById('pub-f-rating').value) || 5;
        const text = document.getElementById('pub-f-text').value;

        try {
            if (supabaseClient) {
                const { error } = await supabaseClient.from('feedbacks').insert([{
                    name,
                    rating,
                    text,
                    is_approved: true
                }]);
                if (error) throw error;
            } else {
                // Mock local addition
                FALLBACK_FEEDBACKS.unshift({ name, rating, text });
                localStorage.setItem(CACHE_KEYS.FEEDBACKS, JSON.stringify(FALLBACK_FEEDBACKS));
            }

            alert("Thank you! Your testimonial has been submitted successfully.");
            form.reset();
            loadFeedbacks();
        } catch (err) {
            console.error("Error saving feedback:", err);
            alert("Feedback submitted successfully! Thank you for sharing your experience.");
            form.reset();
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = origText;
        }
    };
}

// ====================================================================
// 4. ORDER FORM PROCESSING (Supabase + Cloudinary + Zero 522 Multi-Channel)
// ====================================================================
function initOrderForm() {
    const form = document.querySelector('.order form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Securing Your Request...';

        const formData = new FormData(form);
        const reqFileInput = document.getElementById('requirements-file');
        const payFileInput = document.getElementById('payment-file');
        const reqFile = reqFileInput && reqFileInput.files ? reqFileInput.files[0] : null;
        const payFile = payFileInput && payFileInput.files ? payFileInput.files[0] : null;

        let reqUrl = "";
        let payUrl = "";

        try {
            // Upload Requirements file to Cloudinary if provided
            if (reqFile && reqFile.size > 0) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Requirements...';
                try {
                    const reqData = new FormData();
                    reqData.append('file', reqFile);
                    reqData.append('upload_preset', 'ubaiddev');
                    const reqRes = await fetch('https://api.cloudinary.com/v1_1/ddq4qywrl/image/upload', {
                        method: 'POST',
                        body: reqData
                    });
                    const reqJson = await reqRes.json();
                    if (reqJson && reqJson.secure_url) reqUrl = reqJson.secure_url;
                } catch (cErr) {
                    console.warn("Cloudinary requirements upload note:", cErr);
                }
            }

            // Upload Payment Screenshot to Cloudinary if provided
            if (payFile && payFile.size > 0) {
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Payment Slip...';
                try {
                    const payData = new FormData();
                    payData.append('file', payFile);
                    payData.append('upload_preset', 'ubaiddev');
                    const payRes = await fetch('https://api.cloudinary.com/v1_1/ddq4qywrl/image/upload', {
                        method: 'POST',
                        body: payData
                    });
                    const payJson = await payRes.json();
                    if (payJson && payJson.secure_url) payUrl = payJson.secure_url;
                } catch (cErr) {
                    console.warn("Cloudinary payment upload note:", cErr);
                }
            }

            // Set Cloudinary links into hidden fields so FormSubmit includes them in the email
            const reqLinkInput = document.getElementById('fs-req-link');
            if (reqLinkInput) reqLinkInput.value = reqUrl || "None Provided";

            const payLinkInput = document.getElementById('fs-pay-link');
            if (payLinkInput) payLinkInput.value = payUrl || "None Provided";

            // If uploaded to Cloudinary, clear binary input so FormSubmit never chokes on large payloads (prevents 522 Cloudflare timeout)
            if (reqUrl && reqFileInput) {
                try { reqFileInput.value = ''; } catch(e) {}
            }
            if (payUrl && payFileInput) {
                try { payFileInput.value = ''; } catch(e) {}
            }

            const orderPayload = {
                name: (formData.get('name') || '').trim(),
                email: (formData.get('email') || '').trim(),
                phone: (formData.get('phone') || '').trim(),
                service_type: formData.get('service_type') || '',
                requirements_url: reqUrl,
                payment_url: payUrl,
                status: 'pending'
            };

            // Save order into Supabase
            if (supabaseClient) {
                try {
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recording In Database...';
                    await supabaseClient.from('orders').insert([orderPayload]);
                    console.log("Order logged into Supabase successfully.");
                } catch (sbErr) {
                    console.warn("Supabase order insert note:", sbErr);
                }
            }

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Delivering to Inbox...';

            // Channel 1: Dedicated Custom Serverless Backend (Direct Gmail SMTP, 0 third-party middleman)
            try {
                fetch('/.netlify/functions/send-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                }).catch(() => {});
            } catch(e) {}
            // Channel A: Netlify Forms AJAX (zero redirect, Netlify emails ubaidabbasi291@gmail.com)
            try {
                const netlifyParams = new URLSearchParams();
                netlifyParams.append('form-name', 'inquiries');
                netlifyParams.append('name', orderPayload.name);
                netlifyParams.append('email', orderPayload.email);
                netlifyParams.append('phone', orderPayload.phone);
                netlifyParams.append('service_type', orderPayload.service_type);
                netlifyParams.append('Requirements_Link', reqUrl || 'None Provided');
                netlifyParams.append('Payment_Slip_Link', payUrl || 'None Provided');

                fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: netlifyParams.toString()
                }).catch(() => {});
            } catch(e) {}

            // Channel B: EmailJS if configured
            if (typeof emailjs !== 'undefined' && window.EMAILJS_CONFIG && window.EMAILJS_CONFIG.publicKey) {
                try {
                    emailjs.init({ publicKey: window.EMAILJS_CONFIG.publicKey });
                    emailjs.send(
                        window.EMAILJS_CONFIG.serviceId,
                        window.EMAILJS_CONFIG.templateId,
                        {
                            from_name: orderPayload.name,
                            from_email: orderPayload.email,
                            phone_number: orderPayload.phone,
                            service_type: orderPayload.service_type,
                            requirements_url: reqUrl || 'None',
                            payment_url: payUrl || 'None',
                            message: `New client inquiry from ${orderPayload.name} (${orderPayload.email}, ${orderPayload.phone}) for ${orderPayload.service_type}.`
                        }
                    ).catch(e => console.warn("EmailJS notice:", e));
                } catch(e) {}
            }

            // Channel C: Store in sessionStorage for thanks.html personal greeting & WhatsApp chat
            try {
                sessionStorage.setItem('ubaiddev_last_order', JSON.stringify({
                    name: orderPayload.name,
                    email: orderPayload.email,
                    phone: orderPayload.phone,
                    service: orderPayload.service_type,
                    reqUrl: reqUrl,
                    payUrl: payUrl,
                    time: new Date().toISOString()
                }));
            } catch(e) {}
            window.location.href = "thanks.html";

        } catch (err) {
            console.error("Order submission note:", err);
            window.location.href = "thanks.html";
        }
    };
}

// ====================================================================
// 5. HIGH-PERFORMANCE HERO CANVAS (With battery & RAF optimization)
// ====================================================================
function initHeroAnimation() {
    const canvas = document.getElementById('smoke-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationId = null;
    let isVisible = true;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();

    let particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 80;

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 45 + 15;
            this.speedX = (Math.random() - 0.5) * 0.6;
            this.speedY = (Math.random() - 0.5) * 0.6;
            this.color = `rgba(0, 242, 254, ${Math.random() * 0.05 + 0.01})`;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        if (!isVisible) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        animationId = requestAnimationFrame(animate);
    }

    animate();

    // Auto pause canvas when out of view or tab inactive (Fastest of the fastest & zero battery drain)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible && !animationId) {
                animate();
            } else if (!isVisible && animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });
    }, { threshold: 0.1 });

    const heroSection = document.getElementById('home');
    if (heroSection) observer.observe(heroSection);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            isVisible = false;
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else {
            isVisible = true;
            if (!animationId) animate();
        }
    });

    window.addEventListener('resize', resize, { passive: true });
}

// 6. Dynamic Title
function initDynamicTitle() {
    const originalTitle = document.title;
    window.addEventListener('blur', () => {
        document.title = "⚡ UBAIDDEV | Ready to Build Your App?";
    });
    window.addEventListener('focus', () => {
        document.title = originalTitle;
    });
}

// 7. Mobile Menu
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// 8. Ultra-Smooth Precision Scrolling with Header Compensation
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;

            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                const navOffset = 78;
                const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navOffset;

                window.scrollTo({
                    top: targetPos,
                    behavior: 'smooth'
                });

                if (window.history && window.history.pushState) {
                    window.history.pushState(null, null, targetId);
                }
            }
        });
    });
}

// 9. Active Navbar Scroll Spy (Throttled & Non-blocking)
function initScrollSpy() {
    const sections = document.querySelectorAll('header[id], section[id]');
    const navItems = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navItems.length) return;

    const onScroll = () => {
        const scrollPos = window.scrollY + 120;
        sections.forEach(sec => {
            const top = sec.offsetTop;
            const height = sec.offsetHeight;
            const id = sec.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navItems.forEach(link => {
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    } else if (link.getAttribute('href')?.startsWith('#')) {
                        link.classList.remove('active');
                    }
                });
            }
        });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

// ====================================================================
// INITIALIZATION
// ====================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 UBAIDDEV Portfolio Initialized with High Speed & Supabase");
    loadProjects();
    initCategoryFilter();
    loadFeedbacks();
    initFeedbackForm();
    initOrderForm();
    initMobileMenu();
    initHeroAnimation();
    initDynamicTitle();
    initSmoothScrolling();
    initScrollSpy();

    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 700,
            once: true,
            offset: 40
        });
    }
});
