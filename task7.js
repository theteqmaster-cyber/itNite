document.addEventListener('DOMContentLoaded', () => {
    // Check if page is already locked in this session
    if (sessionStorage.getItem('teqmaster_locked') === 'true') {
        lockPage(true);
        setupAntiTamperObserver();
    } else {
        // Setup observer for scrolling to UML section
        setupScrollLockObserver();
    }

    // Intercept printing to prevent print bypasses
    window.addEventListener('beforeprint', () => {
        if (sessionStorage.getItem('teqmaster_locked') !== 'true') {
            sessionStorage.setItem('teqmaster_locked', 'true');
            lockPage(true);
            setupAntiTamperObserver();
        }
    });

    // Tab switching logic for screen viewing
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            // If already locked, ignore tab switching clicks
            if (sessionStorage.getItem('teqmaster_locked') === 'true') {
                return;
            }

            // Prank trigger: clicking UML, Java, or ERD tabs locks the page
            if (tabId === 'uml' || tabId === 'java' || tabId === 'erd') {
                triggerLockSequence();
                return;
            }

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            
            if (tabId === 'all') {
                tabContents.forEach(content => content.classList.add('active'));
            } else {
                document.getElementById(tabId).classList.add('active');
            }
        });
    });

    // Setup interactive hover highlights for SVG diagrams
    setupDiagramInteractions();

    // Unlock button listener
    const unlockBtn = document.getElementById('unlock-btn');
    if (unlockBtn) {
        unlockBtn.addEventListener('click', startUnlockProcess);
    }
});

// Detect when UML section enters view on scroll
function setupScrollLockObserver() {
    const umlSection = document.getElementById('uml');
    if (!umlSection) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Trigger lock if UML class diagram section enters the viewport
            if (entry.isIntersecting) {
                // Ensure we are viewing in Full Report mode
                const activeTab = document.querySelector('.tab-button.active');
                if (activeTab && activeTab.getAttribute('data-tab') === 'all') {
                    observer.disconnect();
                    triggerLockSequence();
                }
            }
        });
    }, {
        threshold: 0.1 // Triggers when 10% of UML section is visible
    });

    observer.observe(umlSection);
}

// Lock Sequence: Display heavy full screen animation, then fade to paywall card
function triggerLockSequence() {
    sessionStorage.setItem('teqmaster_locked', 'true');
    
    // Lock scroll immediately
    document.body.style.overflow = 'hidden';
    
    const animOverlay = document.getElementById('animation-overlay');
    const animText = animOverlay.querySelector('.animation-text');
    
    animOverlay.classList.remove('hidden');
    animOverlay.style.opacity = '1';
    
    // Slow text fade-in
    setTimeout(() => {
        animText.style.opacity = '1';
    }, 500);
    
    // Fade out and transition to paywall card
    setTimeout(() => {
        animText.style.opacity = '0';
        animOverlay.style.opacity = '0';
        
        setTimeout(() => {
            animOverlay.classList.add('hidden');
            lockPage(false);
            setupAntiTamperObserver();
        }, 1500);
    }, 3800);
}

// Lock page: blur background and show paywall card
function lockPage(immediate) {
    document.body.classList.add('is-locked');
    document.body.style.overflow = 'hidden';
    
    const paywall = document.getElementById('paywall-overlay');
    if (paywall) {
        paywall.classList.remove('hidden');
    }
}

// DevTools / Tamper protection: monitors body classes and overlay element deletions
function setupAntiTamperObserver() {
    // 1. Monitor Body element attributes (lock classes & scrolling blocks)
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (sessionStorage.getItem('teqmaster_locked') === 'true') {
                if (mutation.attributeName === 'class' && !document.body.classList.contains('is-locked')) {
                    document.body.classList.add('is-locked');
                }
                if (mutation.attributeName === 'style' && document.body.style.overflow !== 'hidden') {
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    });
    bodyObserver.observe(document.body, { attributes: true });

    // 2. Monitor Document tree changes (checks if overlays are deleted or hidden)
    const treeObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (sessionStorage.getItem('teqmaster_locked') === 'true') {
                // If either overlay node is deleted from DOM, trigger page refresh to restore it
                mutation.removedNodes.forEach(node => {
                    if (node.id === 'paywall-overlay' || node.id === 'animation-overlay') {
                        window.location.reload();
                    }
                });

                // If someone sets custom style properties to hide the paywall, force it visible again
                const paywall = document.getElementById('paywall-overlay');
                if (paywall) {
                    if (paywall.classList.contains('hidden') || paywall.style.display === 'none' || paywall.style.visibility === 'hidden' || paywall.style.opacity === '0') {
                        paywall.classList.remove('hidden');
                        paywall.style.display = 'flex';
                        paywall.style.visibility = 'visible';
                        paywall.style.opacity = '1';
                    }
                }
            }
        });
    });
    treeObserver.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
}

// Fake unlock progress bar simulation: stops at 90% and fails
function startUnlockProcess() {
    const btn = document.getElementById('unlock-btn');
    const container = document.getElementById('progress-container');
    const bar = document.getElementById('progress-bar');
    const status = document.getElementById('progress-status');
    
    btn.disabled = true;
    btn.textContent = 'Unlocking...';
    container.classList.remove('hidden');
    bar.classList.remove('failed');
    status.classList.remove('failed');
    bar.style.width = '0%';
    status.textContent = 'Initializing secure handshake...';
    
    let progress = 0;
    const interval = setInterval(() => {
        if (progress >= 90) {
            clearInterval(interval);
            setTimeout(() => {
                bar.classList.add('failed');
                status.classList.add('failed');
                status.textContent = 'Unlock Failed: Access Denied. Nice try, go study! 🧠';
                
                // Allow them to click again after 3.5 seconds to restart and fail again
                setTimeout(() => {
                    btn.disabled = false;
                    btn.textContent = 'Retry Unlock';
                }, 3500);
            }, 600);
            return;
        }
        
        // Random increments
        progress += Math.floor(Math.random() * 5) + 3;
        if (progress > 90) progress = 90;
        
        bar.style.width = progress + '%';
        
        if (progress < 20) {
            status.textContent = 'Connecting to Teqmaster bypass server (' + progress + '%)...';
        } else if (progress < 45) {
            status.textContent = 'Exploiting local storage session keys (' + progress + '%)...';
        } else if (progress < 70) {
            status.textContent = 'Spoofing academic credentials (' + progress + '%)...';
        } else {
            status.textContent = 'Verifying license with Teqmaster servers (' + progress + '%)...';
        }
    }, 140 + Math.random() * 120);
}

// Diagram interaction highlights (retained from previous design)
function setupDiagramInteractions() {
    const nodes = document.querySelectorAll('.process-box, .external-entity, .data-store, .uml-class, .erd-entity');

    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            if (sessionStorage.getItem('teqmaster_locked') === 'true') return;
            const nodeId = node.getAttribute('id');
            if (!nodeId) return;

            const flows = document.querySelectorAll('.data-flow, .uml-relation, .erd-relation');
            flows.forEach(flow => {
                const source = flow.getAttribute('data-source');
                const target = flow.getAttribute('data-target');

                if (source === nodeId || target === nodeId) {
                    const path = flow.querySelector('path');
                    if (path) {
                        path.style.strokeWidth = '2.5px';
                    }
                    flow.style.opacity = '1';
                } else {
                    flow.style.opacity = '0.15';
                }
            });

            nodes.forEach(otherNode => {
                if (otherNode !== node) {
                    otherNode.style.opacity = '0.4';
                }
            });
        });

        node.addEventListener('mouseleave', () => {
            if (sessionStorage.getItem('teqmaster_locked') === 'true') return;
            const flows = document.querySelectorAll('.data-flow, .uml-relation, .erd-relation');
            flows.forEach(flow => {
                const path = flow.querySelector('path');
                if (path) {
                    path.style.strokeWidth = '';
                }
                flow.style.opacity = '';
            });

            nodes.forEach(otherNode => {
                otherNode.style.opacity = '';
            });
        });
    });
}
