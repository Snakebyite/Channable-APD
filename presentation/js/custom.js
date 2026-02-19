Reveal.initialize({
    hash: true,
    transition: 'fade',
    transitionSpeed: 'default',
    backgroundTransition: 'fade',
    center: true,
    width: 1280,
    height: 720,
    margin: 0,
    minScale: 0.2,
    maxScale: 3,
    controls: true,
    progress: true,
    slideNumber: false,
    keyboard: true,
    overview: true,
    showNotes: false,
}).then(() => {

    // ── Typewriter Effect ──────────────────────────────
    function typeWriter(el) {
        const text = el.dataset.text;
        const speed = parseInt(el.dataset.speed) || 40;
        const highlights = el.dataset.highlight ? el.dataset.highlight.split(',') : [];
        let i = 0;
        el.textContent = '';

        function type() {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                el.classList.add('done');
                if (highlights.length > 0) {
                    let html = el.textContent;
                    highlights.forEach(word => {
                        html = html.replace(word, `<span class="text-accent">${word}</span>`);
                    });
                    el.innerHTML = html;
                }
            }
        }
        type();
    }

    function startTypewriterSequence(slide) {
        const lines = slide.querySelectorAll('.typewriter-line');
        const firstTw = slide.querySelector('.typewriter:not(.typewriter-line .typewriter)');

        if (firstTw && !firstTw.dataset.started) {
            firstTw.dataset.started = 'true';
            typeWriter(firstTw);
        }

        let maxFinishTime = 0;

        lines.forEach(line => {
            const delay = parseInt(line.dataset.delay) || 0;
            const tw = line.querySelector('.typewriter');
            if (tw && !tw.dataset.started) {
                const text = tw.dataset.text || '';
                const speed = parseInt(tw.dataset.speed) || 40;
                const finishTime = delay + text.length * speed;
                if (finishTime > maxFinishTime) maxFinishTime = finishTime;

                setTimeout(() => {
                    line.classList.add('visible');
                    tw.dataset.started = 'true';
                    typeWriter(tw);
                }, delay);
            }
        });

        if (slide.querySelector('.tool-battle') && !slide.dataset.battleQueued) {
            slide.dataset.battleQueued = 'true';
            setTimeout(() => Reveal.nextFragment(), maxFinishTime + 1200);
            setTimeout(() => Reveal.nextFragment(), maxFinishTime + 2800);
        }
    }

    // ── Slide Fade-In Elements ─────────────────────────
    function animateSlideFadeIns(slide) {
        const els = slide.querySelectorAll('.slide-fade-in');
        els.forEach(el => el.classList.add('visible'));
    }

    // ── Count-Up for Stat Numbers ──────────────────────
    function countUp(el) {
        const raw = el.textContent.trim();
        if (el.dataset.counted) return;
        el.dataset.counted = 'true';

        const prefix = raw.match(/^[^0-9]*/)[0];
        const suffix = raw.match(/[^0-9]*$/)[0];
        const numStr = raw.replace(prefix, '').replace(suffix, '').replace(/[.,]/g, '');
        const target = parseInt(numStr);

        if (isNaN(target)) {
            el.classList.add('counted');
            return;
        }

        const duration = 1200;
        const steps = 40;
        const stepTime = duration / steps;
        let current = 0;
        const increment = target / steps;
        const hasComma = raw.includes(',');

        function formatNum(n) {
            const rounded = Math.round(n);
            if (hasComma && rounded >= 1000) {
                return rounded.toLocaleString('en-US');
            }
            return rounded.toString();
        }

        el.classList.add('counted');

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = prefix + formatNum(current) + suffix;
        }, stepTime);
    }

    function animateCountUps(slide) {
        const stats = slide.querySelectorAll('.stat-number');
        stats.forEach((el, i) => {
            setTimeout(() => countUp(el), 300 + i * 200);
        });
    }

    // ── Count-Up for Result Numbers (inside fragments) ──
    Reveal.on('fragmentshown', event => {
        const frag = event.fragment;
        const results = frag.querySelectorAll('.result-number');
        results.forEach((el, i) => {
            setTimeout(() => countUp(el), 200 + i * 300);
        });
    });

    // ── Hook into Reveal Events ────────────────────────
    Reveal.on('slidechanged', event => {
        const slide = event.currentSlide;

        if (slide.querySelector('.typewriter')) {
            startTypewriterSequence(slide);
        }
        if (slide.querySelector('.slide-fade-in')) {
            animateSlideFadeIns(slide);
        }
        if (slide.querySelector('.stat-number:not([data-counted])')) {
            animateCountUps(slide);
        }
    });

    // Trigger for initial slide
    const first = Reveal.getCurrentSlide();
    if (first.querySelector('.typewriter')) {
        startTypewriterSequence(first);
    }
    if (first.querySelector('.slide-fade-in')) {
        animateSlideFadeIns(first);
    }
});
