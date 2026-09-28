document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Loading Screen Handler ---
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 600);
    }

    // --- 2. Lanyard API Tracking (Discord Presence & Spotify Widget) ---
    const DISCORD_USER_ID = '1373549788628254821';

    const songNameEl = document.querySelector('.song-name');
    const artistNameEl = document.querySelector('.artist-name');
    const albumArtEl = document.querySelector('.music-thumb');
    const musicWidget = document.querySelector('.music-widget');
    const statusDot = document.getElementById('discord-status-dot');

    function updateLanyardData() {
        fetch(`https://api.lanyard.rest/v1/users/${DISCORD_USER_ID}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.data) {
                    const presence = data.data;

                    const discordStatus = presence.discord_status;
                    if (statusDot) {
                        switch (discordStatus) {
                            case 'online':
                                statusDot.style.backgroundColor = '#23a55a';
                                break;
                            case 'idle':
                                statusDot.style.backgroundColor = '#f0b232';
                                break;
                            case 'dnd':
                                statusDot.style.backgroundColor = '#f23f43';
                                break;
                            default:
                                statusDot.style.backgroundColor = '#80848e';
                                break;
                        }
                    }

                    if (presence.spotify && presence.listening_to_spotify) {
                        const spotify = presence.spotify;
                        if (songNameEl) songNameEl.textContent = spotify.song;
                        if (artistNameEl) artistNameEl.textContent = spotify.artist;
                        if (albumArtEl && spotify.album_art_url) {
                            albumArtEl.src = spotify.album_art_url;
                        }
                        if (musicWidget) musicWidget.style.display = 'flex';
                    } else {
                        if (musicWidget) musicWidget.style.display = 'none';
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching Lanyard data:', error);
            });
    }

    updateLanyardData();
    setInterval(updateLanyardData, 10000);

    // --- 3. Discord Profile Redirect ---
    const discordProfileLink = document.getElementById('discord-profile-link');
    if (discordProfileLink) {
        const openProfile = () => {
            window.open('https://discord.com/users/1373549788628254821', '_blank');
        };
        discordProfileLink.addEventListener('click', openProfile);
        discordProfileLink.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProfile();
            }
        });
    }

    // --- 4. Language Selector Translation Wiring ---
    const languageSelect = document.getElementById('language-select');
    const rtlLangs = ['ar', 'he', 'fa', 'ur'];

    function applyLanguage(lang) {
        if (typeof changeLanguage === 'function') {
            changeLanguage(lang);
        }
        document.documentElement.lang = lang;
        document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
        try { localStorage.setItem('tvman-lang', lang); } catch (e) {}
    }

    if (languageSelect && typeof changeLanguage === 'function') {
        let saved = 'en';
        try { saved = localStorage.getItem('tvman-lang') || 'en'; } catch (e) {}
        if (languageSelect.querySelector(`option[value="${saved}"]`)) {
            languageSelect.value = saved;
            applyLanguage(saved);
        }
        languageSelect.addEventListener('change', (e) => {
            applyLanguage(e.target.value);
        });
    }

    // --- 5. Modal Popups (FAQ, Credits, Updates) ---
    const setupModal = (triggerId, modalId, closeId) => {
        const trigger = document.getElementById(triggerId);
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeId);

        if (trigger && modal && closeBtn) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('active');
            });

            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }
    };

    setupModal('open-faq', 'faq-modal', 'close-faq');
    setupModal('open-credits', 'credits-modal', 'close-credits');
    setupModal('open-updates', 'update-modal', 'close-updates');

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach((m) => m.classList.remove('active'));
        }
    });

    // --- 6. Link Routing (Discord & MediaFire Lib Flow) ---
    const discordInviteUrl = "https://discord.gg/chG2a3uyRY";
    const mediafireLibUrl = "https://www.mediafire.com/file/s55mh4kz8zybxl1/libTvMenu.so/file";

    document.querySelectorAll('[data-link="discord"]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(discordInviteUrl, '_blank');
        });
    });

    document.querySelectorAll('[data-link="lib"]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(mediafireLibUrl, '_blank');
            const libModal = document.getElementById('lib-modal');
            if (libModal) {
                libModal.classList.add('active');
            }
        });
    });

    const closeLibModalBtn = document.getElementById('close-lib-modal');
    const libModal = document.getElementById('lib-modal');
    const libDiscordBtn = document.getElementById('lib-discord-btn');

    if (closeLibModalBtn && libModal) {
        closeLibModalBtn.addEventListener('click', () => {
            libModal.classList.remove('active');
        });
        libModal.addEventListener('click', (e) => {
            if (e.target === libModal) {
                libModal.classList.remove('active');
            }
        });
    }

    if (libDiscordBtn) {
        libDiscordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(discordInviteUrl, '_blank');
        });
    }

    // Live presence: public Worker URL ONLY.
    // Discord webhook stays in Cloudflare Secrets as DISCORD_WEBHOOK. Never paste it here.
    const STATS_URL = "https://tvwebhook.elijahpauley186.workers.dev";
    const SESSION_KEY = "tvman-session";

    function sessionId() {
        let id = localStorage.getItem(SESSION_KEY);
        if (!id) {
            id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random();
            localStorage.setItem(SESSION_KEY, id);
        }
        return id;
    }

    const liveUsers = document.getElementById("live-users");

    async function ping() {
        if (!STATS_URL || STATS_URL.indexOf("YOUR-SUBDOMAIN") !== -1) return;
        try {
            const res = await fetch(STATS_URL, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ id: sessionId() })
            });
            const data = await res.json();
            if (liveUsers && data.online != null) liveUsers.textContent = data.online;
        } catch (e) {}
    }

    ping();
    setInterval(ping, 25000);

    // Boot log
    const boot = document.getElementById("boot-log");
    if (boot) {
        const lines = ["LINKING DISCORD…", "KV / STATS OK", "LANYARD HANDSHAKE", "HUB v3.1 READY"];
        boot.textContent = "";
        lines.forEach((line, i) => {
            setTimeout(() => { boot.textContent += line + "\n"; }, 180 * i);
        });
    }

    // Blood trail
    const canvas = document.getElementById("blood-trail");
    if (canvas && window.matchMedia("(pointer:fine)").matches) {
        const ctx = canvas.getContext("2d");
        const dots = [];
        const resize = () => { canvas.width = innerWidth; canvas.height = innerHeight; };
        resize();
        addEventListener("resize", resize);
        addEventListener("mousemove", (e) => {
            dots.push({ x: e.clientX, y: e.clientY, life: 1, r: 3 + Math.random() * 3 });
            if (dots.length > 60) dots.shift();
        });
        (function tick() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (const d of dots) {
                d.life -= 0.025;
                ctx.beginPath();
                ctx.fillStyle = `rgba(180,0,20,${Math.max(d.life, 0)})`;
                ctx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2);
                ctx.fill();
            }
            for (let i = dots.length - 1; i >= 0; i--) if (dots[i].life <= 0) dots.splice(i, 1);
            requestAnimationFrame(tick);
        })();
    }

    // Hotkeys D / L / S
    const discordInviteUrlHot = "https://discord.gg/chG2a3uyRY";
    const mediafireLibUrlHot = "https://www.mediafire.com/file/s55mh4kz8zybxl1/libTvMenu.so/file";
    document.addEventListener("keydown", (e) => {
        if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA")) return;
        const k = e.key.toLowerCase();
        if (k === "d") window.open(discordInviteUrlHot, "_blank");
        if (k === "l") {
            window.open(mediafireLibUrlHot, "_blank");
            const libModal = document.getElementById("lib-modal");
            if (libModal) libModal.classList.add("active");
        }
        if (k === "s") {
            document.body.classList.toggle("static-on");
            const ov = document.getElementById("static-overlay");
            if (ov) ov.hidden = !document.body.classList.contains("static-on");
        }
    });

    // Server member count
    const sc = document.getElementById("server-count");
    if (sc) {
        fetch("https://discord.com/api/guilds/1538740748709658694/widget.json")
            .then((r) => r.json())
            .then((d) => {
                if (d.presence_count != null) sc.textContent = d.presence_count + " online";
                else if (d.name) sc.textContent = d.name;
            })
            .catch(() => { sc.textContent = "live"; });
    }

    const staticBtn = document.getElementById("static-toggle");
    function setStatic(on) {
        document.body.classList.toggle("static-on", on);
        const ov = document.getElementById("static-overlay");
        if (ov) ov.hidden = !on;
        if (staticBtn) staticBtn.classList.toggle("on", on);
    }
    if (staticBtn) staticBtn.addEventListener("click", () => {
        setStatic(!document.body.classList.contains("static-on"));
    });

    const surprise = document.getElementById("surprise-overlay");
    const surpriseClose = document.getElementById("surprise-close");
    if (surprise) {
        let seen = false;
        try { seen = localStorage.getItem("tvman-v4") === "1"; } catch (e) {}
        if (seen) surprise.classList.add("hide");
        if (surpriseClose) {
            surpriseClose.addEventListener("click", () => {
                surprise.classList.add("hide");
                try { localStorage.setItem("tvman-v4", "1"); } catch (e) {}
            });
        }
    }

    const rain = document.getElementById("rain-canvas");
    if (rain) {
        const ctx = rain.getContext("2d");
        let w = 0, h = 0;
        const mobile = window.matchMedia("(max-width: 700px)").matches;
        const n = mobile ? 90 : 180;
        const drops = [];
        const resize = () => {
            w = rain.width = innerWidth;
            h = rain.height = innerHeight;
        };
        resize();
        addEventListener("resize", resize);
        for (let i = 0; i < n; i++) {
            drops.push({
                x: Math.random() * innerWidth,
                y: Math.random() * innerHeight,
                len: 12 + Math.random() * 22,
                spd: 14 + Math.random() * 18,
                a: 0.12 + Math.random() * 0.28
            });
        }
        (function fall() {
            ctx.clearRect(0, 0, w, h);
            for (const d of drops) {
                ctx.strokeStyle = "rgba(210,225,255," + d.a + ")";
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(d.x, d.y);
                ctx.lineTo(d.x - 2.5, d.y + d.len);
                ctx.stroke();
                d.y += d.spd;
                d.x -= 1.1;
                if (d.y > h) {
                    d.y = -d.len;
                    d.x = Math.random() * w + 20;
                }
            }
            requestAnimationFrame(fall);
        })();
        setInterval(() => {
            if (Math.random() > 0.88) {
                document.body.classList.add("lightning");
                setTimeout(() => document.body.classList.remove("lightning"), 70);
            }
        }, 5000);
    }

});
