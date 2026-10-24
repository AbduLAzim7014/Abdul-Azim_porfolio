// Initialize Lucide Icons
        lucide.createIcons();

        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const scrollProgress = document.getElementById('scroll-progress');
        const backToTop = document.getElementById('back-to-top');

        function closeMobileMenu() {
            if (!mobileMenuToggle || !mobileMenu) return;

            mobileMenu.hidden = true;
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
            mobileMenuToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        }

        if (mobileMenuToggle && mobileMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                const isOpen = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
                mobileMenu.hidden = isOpen;
                mobileMenuToggle.setAttribute('aria-expanded', String(!isOpen));
                mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
                mobileMenuToggle.innerHTML = `<i class="fa-solid fa-${isOpen ? 'bars' : 'xmark'}" aria-hidden="true"></i>`;
            });

            mobileMenu.addEventListener('click', (event) => {
                if (event.target.closest('a')) closeMobileMenu();
            });

            document.addEventListener('click', (event) => {
                if (!mobileMenu.hidden && !event.target.closest('nav')) closeMobileMenu();
            });

            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && !mobileMenu.hidden) {
                    closeMobileMenu();
                    mobileMenuToggle.focus();
                }
            });
        }

        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        function updateScrollUI() {
            const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollableHeight > 0 ? Math.min(window.scrollY / scrollableHeight, 1) : 0;

            if (scrollProgress) {
                scrollProgress.firstElementChild.style.transform = `scaleX(${progress})`;
                scrollProgress.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
            }

            if (backToTop) backToTop.hidden = window.scrollY < 500;
        }

        let scrollUpdatePending = false;
        window.addEventListener('scroll', () => {
            if (scrollUpdatePending) return;

            scrollUpdatePending = true;
            window.requestAnimationFrame(() => {
                updateScrollUI();
                scrollUpdatePending = false;
            });
        }, { passive: true });
        updateScrollUI();

        const pageSections = document.querySelectorAll('main > section');
        if ('IntersectionObserver' in window) {
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                });
            }, { rootMargin: '0px 0px -8% 0px' });

            pageSections.forEach((section) => {
                section.classList.add('reveal-on-scroll');
                revealObserver.observe(section);
            });

            const navLinks = document.querySelectorAll('nav a[href^="#"]');
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach((link) => {
                        if (link.getAttribute('href') === `#${entry.target.id}`) {
                            link.setAttribute('aria-current', 'location');
                        } else {
                            link.removeAttribute('aria-current');
                        }
                    });
                });
            }, { rootMargin: '-35% 0px -55% 0px' });

            pageSections.forEach((section) => sectionObserver.observe(section));
        } else {
            pageSections.forEach((section) => section.classList.add('is-visible'));
        }

                // ----------------------------------------------------
                // 1. CURSOR SPOTLIGHT & MOUSE PUPIL TRACKING
        // ----------------------------------------------------
        const cursor = document.getElementById('custom-cursor');
        const cursorDot = document.getElementById('custom-cursor-dot');

        document.addEventListener('mousemove', (e) => {
            cursor.style.top = `${e.clientY}px`;
            cursor.style.left = `${e.clientX}px`;
            cursorDot.style.top = `${e.clientY}px`;
            cursorDot.style.left = `${e.clientX}px`;

            updateMascotEyes(e.clientX, e.clientY);
        });

        function updateMascotEyes(mx, my) {
            const svg = document.getElementById('jarvis-mascot-svg');
            if (!svg) return;
            const rect = svg.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;

            const dx = (mx - cx) / 25;
            const dy = (my - cy) / 25;

            const pupilL = document.getElementById('pupil-left');
            const pupilR = document.getElementById('pupil-right');

            if (pupilL && pupilR) {
                const limitX = Math.max(-5, Math.min(5, dx));
                const limitY = Math.max(-5, Math.min(5, dy));
                pupilL.setAttribute('cx', 75 + limitX);
                pupilL.setAttribute('cy', 80 + limitY);
                pupilR.setAttribute('cx', 125 + limitX);
                pupilR.setAttribute('cy', 80 + limitY);
            }
        }

        // 3D Card Tilt with Parallax
        document.querySelectorAll('.card-3d').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = `perspective(1000px) rotateX(${-y / 15}deg) rotateY(${x / 15}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });


        // ----------------------------------------------------
        // 2. ADVANCED WEB AUDIO SYNTHESIZER ENGINE
        // ----------------------------------------------------
        let audioCtx = null;
        let soundEnabled = true;

        function initAudio() {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        function toggleAudio() {
            soundEnabled = !soundEnabled;
            const icon = document.getElementById('sound-icon');
            if (soundEnabled) {
                icon.className = "fa-solid fa-volume-high text-sm";
                playSynthSound('beep');
            } else {
                icon.className = "fa-solid fa-volume-xmark text-sm";
            }
        }

        function playSynthSound(type) {
            if (!soundEnabled) return;
            initAudio();
            if (audioCtx.state === 'suspended') audioCtx.resume();

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            const now = audioCtx.currentTime;

            if (type === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.exponentialRampToValueAtTime(1200, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                osc.start(now); osc.stop(now + 0.08);
            } else if (type === 'panther') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.45);
                gain.gain.setValueAtTime(0.35, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
                osc.start(now); osc.stop(now + 0.45);
            } else if (type === 'dragon') {
                osc.type = 'square';
                osc.frequency.setValueAtTime(90, now);
                osc.frequency.linearRampToValueAtTime(380, now + 0.35);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.85);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
                osc.start(now); osc.stop(now + 0.85);
            } else if (type === 'eagle') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(750, now);
                osc.frequency.exponentialRampToValueAtTime(1500, now + 0.35);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
                osc.start(now); osc.stop(now + 0.5);
            } else if (type === 'lion') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(160, now);
                osc.frequency.exponentialRampToValueAtTime(30, now + 0.75);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
                osc.start(now); osc.stop(now + 0.75);
            } else if (type === 'pop') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now); osc.stop(now + 0.1);
            }
        }


        // ----------------------------------------------------
        // 3. THREE.JS 3D BACKGROUND AMBIENT PARTICLES
        // ----------------------------------------------------
        let scene, camera, renderer, pointsMesh;

        function init3D() {
            const container = document.getElementById('bg-3d-canvas');
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 400;

            renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            container.appendChild(renderer.domElement);

            const count = 1500;
            const positions = new Float32Array(count * 3);
            for (let i = 0; i < count * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 1200;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

            const material = new THREE.PointsMaterial({
                color: 0x00f3ff,
                size: 2,
                transparent: true,
                opacity: 0.55
            });

            pointsMesh = new THREE.Points(geometry, material);
            scene.add(pointsMesh);

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            });
        }

        function animate3D() {
            requestAnimationFrame(animate3D);
            if (pointsMesh) {
                pointsMesh.rotation.y += 0.0006;
                pointsMesh.rotation.x += 0.0003;
            }
            renderer.render(scene, camera);
        }


        // ----------------------------------------------------
        // 4. BONE-RIGGED CREATURE CANVAS ANIMATION
        // ----------------------------------------------------
        const creatureCanvas = document.getElementById('creature-canvas');
        const creatureCtx = creatureCanvas.getContext('2d');
        let activeCreatures = [];

        function resizeCreatureCanvas() {
            creatureCanvas.width = window.innerWidth;
            creatureCanvas.height = window.innerHeight;
        }
        resizeCreatureCanvas();
        window.addEventListener('resize', resizeCreatureCanvas);

        class RiggedCreature {
            constructor(type) {
                this.type = type;
                this.particles = [];
                this.alive = true;
                this.time = 0;

                if (type === 'panther') {
                    this.emoji = '🐆'; this.x = -120; this.y = window.innerHeight * 0.7;
                    this.vx = 18; this.vy = 0; this.size = 75; this.color = '#ff007f';
                } else if (type === 'dragon') {
                    this.emoji = '🐉'; this.x = -120; this.y = window.innerHeight * 0.35;
                    this.vx = 10; this.vy = -1; this.size = 95; this.color = '#ef4444';
                } else if (type === 'eagle') {
                    this.emoji = '🦅'; this.x = -120; this.y = window.innerHeight * 0.25;
                    this.vx = 14; this.vy = 1; this.size = 70; this.color = '#00f3ff';
                } else if (type === 'lion') {
                    this.emoji = '🦁'; this.x = -120; this.y = window.innerHeight * 0.6;
                    this.vx = 12; this.vy = -0.5; this.size = 85; this.color = '#ffd700';
                }
            }

            update() {
                this.time += 0.1;
                this.x += this.vx;
                this.y += Math.sin(this.time) * 3 + this.vy;

                // Particle Trail
                for (let i = 0; i < 4; i++) {
                    this.particles.push({
                        x: this.x + (Math.random() - 0.5) * 25,
                        y: this.y + (Math.random() - 0.5) * 25,
                        radius: Math.random() * 6 + 2,
                        color: this.color,
                        alpha: 1,
                        vx: (Math.random() - 0.5) * 2 - this.vx * 0.2,
                        vy: (Math.random() - 0.5) * 2
                    });
                }

                this.particles.forEach((p, index) => {
                    p.x += p.vx; p.y += p.vy; p.alpha -= 0.025;
                    if (p.alpha <= 0) this.particles.splice(index, 1);
                });

                if (this.x > window.innerWidth + 180) this.alive = false;
            }

            draw() {
                this.particles.forEach(p => {
                    creatureCtx.save();
                    creatureCtx.globalAlpha = p.alpha;
                    creatureCtx.fillStyle = p.color;
                    creatureCtx.beginPath();
                    creatureCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    creatureCtx.fill();
                    creatureCtx.restore();
                });

                creatureCtx.save();
                creatureCtx.font = `${this.size}px sans-serif`;
                creatureCtx.shadowColor = this.color;
                creatureCtx.shadowBlur = 25;
                creatureCtx.fillText(this.emoji, this.x, this.y);
                creatureCtx.restore();
            }
        }

        function triggerCreature(type) {
            playSynthSound(type);
            triggerCameraShake();
            activeCreatures.push(new RiggedCreature(type));
        }

        function triggerCameraShake() {
            const wrapper = document.getElementById('app-wrapper');
            wrapper.classList.add('shake-screen');
            setTimeout(() => wrapper.classList.remove('shake-screen'), 400);
        }

        function clearCreatures() {
            activeCreatures = [];
            creatureCtx.clearRect(0, 0, creatureCanvas.width, creatureCanvas.height);
        }

        function renderCreatureLoop() {
            creatureCtx.clearRect(0, 0, creatureCanvas.width, creatureCanvas.height);
            activeCreatures.forEach((creature, index) => {
                creature.update();
                creature.draw();
                if (!creature.alive) activeCreatures.splice(index, 1);
            });
            requestAnimationFrame(renderCreatureLoop);
        }


        // ----------------------------------------------------
        // 5. INTERACTIVE SKILL NODE GRAPH
        // ----------------------------------------------------
        const skillCanvas = document.getElementById('skill-node-canvas');
        const skillCtx = skillCanvas.getContext('2d');

        function resizeSkillCanvas() {
            if (!skillCanvas) return;
            skillCanvas.width = skillCanvas.parentElement.clientWidth;
            skillCanvas.height = 320;
        }

        let skillNodes = [
            { label: 'Python', x: 80, y: 80, vx: 1, vy: 0.8, color: '#00f3ff' },
            { label: 'Flask', x: 220, y: 120, vx: -0.8, vy: 1, color: '#ff007f' },
            { label: 'React.js', x: 150, y: 220, vx: 1.2, vy: -0.6, color: '#ffd700' },
            { label: 'Tailwind', x: 300, y: 200, vx: -1, vy: -0.8, color: '#00ff88' },
            { label: 'SQL', x: 280, y: 70, vx: 0.7, vy: 0.9, color: '#a855f7' }
        ];

        function animateSkillGraph() {
            if (!skillCanvas.width) resizeSkillCanvas();
            skillCtx.clearRect(0, 0, skillCanvas.width, skillCanvas.height);

            for (let i = 0; i < skillNodes.length; i++) {
                for (let j = i + 1; j < skillNodes.length; j++) {
                    skillCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    skillCtx.lineWidth = 1.5;
                    skillCtx.beginPath();
                    skillCtx.moveTo(skillNodes[i].x, skillNodes[i].y);
                    skillCtx.lineTo(skillNodes[j].x, skillNodes[j].y);
                    skillCtx.stroke();
                }
            }

            skillNodes.forEach(node => {
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 40 || node.x > skillCanvas.width - 40) node.vx *= -1;
                if (node.y < 40 || node.y > skillCanvas.height - 40) node.vy *= -1;

                skillCtx.fillStyle = node.color;
                skillCtx.shadowColor = node.color;
                skillCtx.shadowBlur = 15;
                skillCtx.beginPath();
                skillCtx.arc(node.x, node.y, 14, 0, Math.PI * 2);
                skillCtx.fill();

                skillCtx.fillStyle = '#ffffff';
                skillCtx.font = '11px Fira Code';
                skillCtx.fillText(node.label, node.x - 20, node.y + 28);
            });

            requestAnimationFrame(animateSkillGraph);
        }

        if (skillCanvas) {
            skillCanvas.addEventListener('click', () => {
                skillNodes.forEach(node => {
                    node.vx = (Math.random() - 0.5) * 5;
                    node.vy = (Math.random() - 0.5) * 5;
                });
                playSynthSound('beep');
            });
        }


        // ----------------------------------------------------
        // 6. MINI-GAME TARGET PLAYGROUND ARENA
        // ----------------------------------------------------
        const gameCanvas = document.getElementById('game-arena-canvas');
        const gameCtx = gameCanvas ? gameCanvas.getContext('2d') : null;
        let gameScore = 0;
        let gameCombo = 1;
        let targets = [];

        function resizeGameCanvas() {
            if (!gameCanvas) return;
            gameCanvas.width = gameCanvas.parentElement.clientWidth;
            gameCanvas.height = 280;
        }

        function spawnTarget() {
            if (!gameCanvas) return;
            targets.push({
                x: Math.random() * (gameCanvas.width - 60) + 30,
                y: Math.random() * (gameCanvas.height - 60) + 30,
                radius: Math.random() * 12 + 16,
                color: ['#00f3ff', '#ff007f', '#ffd700', '#00ff88'][Math.floor(Math.random() * 4)],
                alpha: 1
            });
        }

        function updateGameArena() {
            if (!gameCanvas || !gameCtx) return;
            if (!gameCanvas.width) resizeGameCanvas();

            gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

            if (targets.length < 5 && Math.random() < 0.05) spawnTarget();

            targets.forEach((t, index) => {
                t.alpha -= 0.003;
                if (t.alpha <= 0) targets.splice(index, 1);

                gameCtx.save();
                gameCtx.globalAlpha = t.alpha;
                gameCtx.fillStyle = t.color;
                gameCtx.shadowColor = t.color;
                gameCtx.shadowBlur = 15;
                gameCtx.beginPath();
                gameCtx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                gameCtx.fill();
                gameCtx.restore();
            });

            requestAnimationFrame(updateGameArena);
        }

        if (gameCanvas) {
            gameCanvas.addEventListener('click', (e) => {
                const rect = gameCanvas.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const clickY = e.clientY - rect.top;

                targets.forEach((t, index) => {
                    const dist = Math.hypot(t.x - clickX, t.y - clickY);
                    if (dist < t.radius + 10) {
                        targets.splice(index, 1);
                        gameScore += 10 * gameCombo;
                        gameCombo += 1;
                        document.getElementById('game-score').innerText = gameScore;
                        document.getElementById('game-combo').innerText = `${gameCombo}x`;
                        playSynthSound('pop');
                    }
                });
            });
        }

        function resetGame() {
            gameScore = 0;
            gameCombo = 1;
            targets = [];
            if (document.getElementById('game-score')) {
                document.getElementById('game-score').innerText = '0';
                document.getElementById('game-combo').innerText = '1x';
            }
        }


        // ----------------------------------------------------
        // 7. MASCOT BOT INTERACTION
        // ----------------------------------------------------
        function clickMascot() {
            playSynthSound('eagle');
            const mascot = document.getElementById('jarvis-mascot-svg');
            const speech = document.getElementById('mascot-speech');

            gsap.to(mascot, {
                rotation: 360, scale: 1.15, duration: 0.6, ease: "back.out(1.7)", onComplete: () => {
                    gsap.to(mascot, { rotation: 0, scale: 1, duration: 0.3 });
                }
            });

            const msgs = [
                "BEEP BOOP! Abdul Azim Ansari is ready for full-stack builds!",
                "Check out AG Traders E-Commerce in the Projects section!",
                "Summon the Phoenix Dragon for flame breath! 🐉",
                "Based in Jodhpur, Rajasthan, India! 📍"
            ];
            speech.innerText = msgs[Math.floor(Math.random() * msgs.length)];
        }


        // ----------------------------------------------------
        // 8. CLI TERMINAL ENGINE
        // ----------------------------------------------------
        function handleCliCommand(e) {
            e.preventDefault();
            const input = document.getElementById('cli-input');
            const output = document.getElementById('cli-output');
            const cmd = input.value.trim().toLowerCase();
            input.value = '';

            const line = document.createElement('p');
            line.className = "text-cyberPink";
            line.innerHTML = `$ ${cmd}`;
            output.appendChild(line);

            const res = document.createElement('p');
            res.className = "text-gray-300";

            if (cmd === 'help') {
                res.innerHTML = `Available Commands:<br>- <span class="text-cyberCyan">whoami</span>: View candidate info<br>- <span class="text-cyberCyan">skills</span>: Core skill breakdown<br>- <span class="text-cyberCyan">projects</span>: Project list<br>- <span class="text-cyberCyan">summon dragon / panther / eagle / lion</span>: Trigger creature physics<br>- <span class="text-cyberCyan">theme</span>: Cycle themes<br>- <span class="text-cyberCyan">clear</span>: Clear output`;
            } else if (cmd === 'whoami') {
                res.innerText = "Abdul Azim Ansari — Full-Stack Web Developer | BCA Graduate | Jodhpur, Rajasthan, India";
            } else if (cmd === 'skills') {
                res.innerText = "Python, Flask, React.js, JavaScript, HTML5, CSS3, Tailwind CSS, SQL, Git, GitHub, Vercel";
            } else if (cmd === 'projects') {
                res.innerText = "1. AG Traders E-Commerce | 2. E-Hiring Admin Panel";
            } else if (cmd === 'summon dragon') {
                triggerCreature('dragon');
                res.innerText = "Phoenix Dragon unleashed!";
            } else if (cmd === 'summon panther') {
                triggerCreature('panther');
                res.innerText = "Cyber Panther released!";
            } else if (cmd === 'clear') {
                output.innerHTML = '';
                return;
            } else {
                res.innerHTML = `<span class="text-red-400">Command not found. Type 'help' for commands.</span>`;
            }

            output.appendChild(res);
            output.scrollTop = output.scrollHeight;
            playSynthSound('beep');
        }


        // ----------------------------------------------------
        // 9. THEME ENGINE & MODAL INSPECTOR
        // ----------------------------------------------------
        function changeTheme(theme) {
            const root = document.documentElement;
            if (theme === 'cyber') {
                root.style.setProperty('--primary', '#00f3ff');
                root.style.setProperty('--secondary', '#ff007f');
                root.style.setProperty('--bg', '#03050d');
            } else if (theme === 'space') {
                root.style.setProperty('--primary', '#a855f7');
                root.style.setProperty('--secondary', '#00f3ff');
                root.style.setProperty('--bg', '#030210');
            } else if (theme === 'gold') {
                root.style.setProperty('--primary', '#ffd700');
                root.style.setProperty('--secondary', '#ff4500');
                root.style.setProperty('--bg', '#0c0800');
            } else if (theme === 'matrix') {
                root.style.setProperty('--primary', '#00ff88');
                root.style.setProperty('--secondary', '#00f3ff');
                root.style.setProperty('--bg', '#000c05');
            }
            playSynthSound('beep');
        }

        const projectData = {
            agtraders: {
                title: "AG Traders E-Commerce Platform",
                tech: "React.js | Tailwind CSS | Flask | MySQL",
                desc: "Full-stack e-commerce web platform engineered for wooden kitchenware sales. Features dynamic search filters, persistent cart state, user auth, and complete admin dashboard."
            },
            ehiring: {
                title: "E-Hiring Administrative Panel",
                tech: "React.js | Tailwind CSS | RESTful APIs",
                desc: "Recruitment administrative center featuring candidate pipeline workflows, exam template creation, automated test grading, and real-time candidate analytics."
            }
        };

        function inspectProject(key) {
            const data = projectData[key];
            if (!data) return;
            const modal = document.getElementById('project-modal');
            const content = document.getElementById('modal-content');

            content.innerHTML = `
                <div class="inline-block px-3 py-1 rounded-full bg-cyberCyan/10 border border-cyberCyan text-cyberCyan font-mono text-xs">
                    ${data.tech}
                </div>
                <h3 class="font-display font-black text-2xl text-white">${data.title}</h3>
                <p class="text-gray-300 text-xs sm:text-sm leading-relaxed">${data.desc}</p>
                <div class="pt-4 flex justify-end">
                    <button onclick="closeModal()" class="px-5 py-2.5 rounded-xl bg-cyberCyan text-slate-950 font-bold text-xs">
                        Close Inspector
                    </button>
                </div>
            `;
            modal.classList.remove('hidden');
            playSynthSound('beep');
        }

        function closeModal() {
            document.getElementById('project-modal').classList.add('hidden');
        }

        function submitContact(e) {
            e.preventDefault();
            playSynthSound('dragon');

            const btn = document.getElementById('contact-btn');
            const msg = document.getElementById('contact-msg');

            btn.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Sending...`;

            setTimeout(() => {
                msg.className = "mt-6 p-4 rounded-xl text-center text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30";
                msg.innerHTML = `<i class="fa-solid fa-check-circle mr-1"></i> Message delivered successfully to Abdul Azim Ansari!`;
                msg.classList.remove('hidden');
                btn.innerHTML = `<span>Send Message</span> <i class="fa-solid fa-paper-plane"></i>`;
                e.target.reset();
            }, 1200);
        }


        // ----------------------------------------------------
        // INITIALIZATION
        // ----------------------------------------------------
        window.onload = function () {
            init3D();
            animate3D();
            renderCreatureLoop();
            resizeSkillCanvas();
            animateSkillGraph();
            resizeGameCanvas();
            updateGameArena();
        };
