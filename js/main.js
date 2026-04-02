document.addEventListener('DOMContentLoaded', () => {

    // --- Custom Cursor ---
    const cursorDot = document.getElementById('cursor-dot');
    const cursorOutline = document.getElementById('cursor-outline');
    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    // Only enable custom cursor if not on a small touch device
    if (window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Smooth animation function for the outline
        function animateCursor() {
            // Easing function to make the outline follow the dot smoothly
            let distX = mouseX - outlineX;
            let distY = mouseY - outlineY;

            outlineX += distX * 0.2; // Adjust speed (0.1 to 1)
            outlineY += distY * 0.2;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animateCursor);
        }
        animateCursor();

        // Add hover effects to clickable elements
        const iteractables = document.querySelectorAll('a, button, input, textarea');
        iteractables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                document.body.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                document.body.classList.remove('cursor-hover');
            });
        });
    }

    // --- Scroll Animations (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once it's visible so animation only plays once
                // observer.unobserve(entry.target);
            } else {
                // If we want elements to fade out when scrolling up, we can remove the class
                // entry.target.classList.remove('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in');
    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Immediately trigger visibility for elements already in viewport on load
    setTimeout(() => {
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom >= 0) {
                el.classList.add('visible');
            }
        });
    }, 100);

    // --- Interactive Terminal Logic ---
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');

    // Focus input when clicking anywhere on the terminal body
    if (terminalBody && terminalInput) {
        terminalBody.addEventListener('click', () => {
            terminalInput.focus();
        });
    }

    const commandHistory = [];
    let historyIndex = -1;

    const commands = {
        'help': {
            desc: 'Lists all available commands',
            action: () => {
                return `Available commands:<br>
                <span class="info">about</span>    - Short introduction<br>
                <span class="info">skills</span>   - Reveal technology stack<br>
                <span class="info">projects</span> - Open project section<br>
                <span class="info">cricket</span>  - Trigger cricket-themed animation<br>
                <span class="info">jack</span>     - Open "Jack of Many Trades" section<br>
                <span class="info">contact</span>  - Show contact info<br>
                <span class="info">clear</span>    - Clear terminal`;
            }
        },
        'about': {
            desc: 'Short introduction',
            action: () => {
                // Scroll to about
                document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
                return 'Navigating to About section... Loading Ankush Profile...';
            }
        },
        'skills': {
            desc: 'Reveal technology stack',
            action: () => {
                const skillsEl = document.getElementById('skills');
                if (skillsEl) {
                    skillsEl.scrollIntoView({ behavior: 'smooth' });
                    return 'Fetching tech stack modules... Routing to Skills...';
                }
                return 'Skills section under construction.';
            }
        },
        'projects': {
            desc: 'Open project section',
            action: () => {
                const projEl = document.getElementById('projects');
                if (projEl) {
                    projEl.scrollIntoView({ behavior: 'smooth' });
                    return 'Initializing project repositories... Routed to Projects...';
                }
                return 'Projects section under construction.';
            }
        },
        'cricket': {
            desc: 'Trigger cricket-themed animation',
            action: () => {
                document.body.classList.toggle('theme-rcb');
                if (document.body.classList.contains('theme-rcb')) {
                    // Navigate to beyond-code section if it exists
                    const bcEl = document.getElementById('beyond-code');
                    if (bcEl) bcEl.scrollIntoView({ behavior: 'smooth' });
                    return '<span class="success">Cricket Mode Activated! Ee Sala Cup Namde!</span>';
                } else {
                    return 'Cricket Mode Deactivated. Restoring default theme.';
                }
            }
        },
        'jack': {
            desc: 'Open "Jack of Many Trades" section',
            action: () => {
                const jackEl = document.getElementById('jack-of-trades');
                if (jackEl) {
                    jackEl.scrollIntoView({ behavior: 'smooth' });
                    return 'Accessing diversified skill matrix... Routed to Jack of Many Trades...';
                }
                return 'Jack of Many Trades section under construction.';
            }
        },
        'contact': {
            desc: 'Show contact info',
            action: () => {
                const contactEl = document.getElementById('contact');
                if (contactEl) {
                    contactEl.scrollIntoView({ behavior: 'smooth' });
                    return 'Opening secure communication channel... Routed to Contact...';
                }
                return 'Contact section under construction.';
            }
        },
        'clear': {
            desc: 'Clear terminal',
            action: () => {
                setTimeout(() => {
                    terminalOutput.innerHTML = '';
                }, 10);
                return '';
            }
        }
    };

    if (terminalInput) {
        terminalInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                const cmd = this.value.trim().toLowerCase();
                if (cmd) {
                    commandHistory.push(cmd);
                    historyIndex = commandHistory.length;

                    // Echo the command
                    appendTerminalOutput(`guest@ankush:~$ ${cmd}`);

                    // Process command
                    if (commands[cmd]) {
                        const response = commands[cmd].action();
                        if (response) {
                            // Typing effect for response
                            typeWriterEffect(response, terminalOutput);
                        }
                    } else {
                        appendTerminalOutput(`<span class="error">Command not found: ${cmd}. Type 'help' for available commands.</span>`);
                    }
                }
                this.value = '';

                // Auto scroll to bottom
                setTimeout(() => {
                    terminalBody.scrollTop = terminalBody.scrollHeight;
                }, 50);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    this.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    this.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    this.value = '';
                }
            }
        });
    }

    function appendTerminalOutput(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.style.marginBottom = '10px';
        terminalOutput.appendChild(div);
    }

    function typeWriterEffect(text, targetElement) {
        const div = document.createElement('div');
        div.style.marginBottom = '10px';
        div.style.color = '#e5e5e5';
        targetElement.appendChild(div);

        let i = 0;
        // Check if text contains HTML, if so, just inject it directly to avoid parsing issues during typing
        if (text.includes('<')) {
            div.innerHTML = text;
            terminalBody.scrollTop = terminalBody.scrollHeight;
            return;
        }

        const speed = 20; // ms per char

        function type() {
            if (i < text.length) {
                div.innerHTML += text.charAt(i);
                i++;
                terminalBody.scrollTop = terminalBody.scrollHeight;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // --- Cricket Ball Trailing Effect ---
    const cricketBall = document.createElement('div');
    cricketBall.classList.add('cricket-ball');
    document.body.appendChild(cricketBall);

    let ballX = 0, ballY = 0;

    if (window.innerWidth > 768) {
        function animateBall() {
            const dx = mouseX - ballX;
            const dy = mouseY - ballY;
            ballX += dx * 0.08;
            ballY += dy * 0.08;
            cricketBall.style.left = `${ballX}px`;
            cricketBall.style.top = `${ballY + 30}px`;
            requestAnimationFrame(animateBall);
        }
        animateBall();
    }

    // =============================================
    // PARTICLE CANVAS SYSTEM
    // =============================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 60;

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 0.5;
                this.opacity = Math.random() * 0.5 + 0.1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(176, 38, 255, ${this.opacity})`;
                ctx.fill();
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        function drawConnections() {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 225, 255, ${0.08 * (1 - dist / 150)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // =============================================
    // TYPING TEXT EFFECT (Hero Role)
    // =============================================
    const typingEl = document.getElementById('typing-role');
    if (typingEl) {
        const roles = [
            'Electronics & CS Student',
            'Full-Stack Developer',
            'Android Enthusiast',
            'Problem Solver',
            'Cricket Fan  🏏'
        ];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        const typeSpeed = 80;
        const deleteSpeed = 40;
        const pauseTime = 2000;

        function typeRole() {
            const current = roles[roleIndex];
            if (!isDeleting) {
                typingEl.textContent = current.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === current.length) {
                    isDeleting = true;
                    setTimeout(typeRole, pauseTime);
                    return;
                }
            } else {
                typingEl.textContent = current.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    roleIndex = (roleIndex + 1) % roles.length;
                }
            }
            setTimeout(typeRole, isDeleting ? deleteSpeed : typeSpeed);
        }
        setTimeout(typeRole, 1000);
    }

    // =============================================
    // NAVBAR SCROLL SHRINK
    // =============================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 80) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // =============================================
    // 3D TILT EFFECT ON PROJECT CARDS
    // =============================================
    const tiltCards = document.querySelectorAll('[data-tilt]');
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -8;
            const rotateY = (x - centerX) / centerX * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // Progress bar animations have been removed.

    // =============================================
    // MOBILE NAVIGATION TOGGLE
    // =============================================
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('mobile-open');
        });
        
        // Close menu when a link is clicked
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navLinks.classList.remove('mobile-open');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('mobile-open') && !menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('mobile-open');
            }
        });
    }

    // --- Re-initialize Lucide Icons ---
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
