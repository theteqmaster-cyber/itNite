document.addEventListener('DOMContentLoaded', () => {
    // Tab switching logic for screen viewing
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            
            if (tabId === 'all') {
                // Show all contents sequentially (like a single document)
                tabContents.forEach(content => content.classList.add('active'));
            } else {
                document.getElementById(tabId).classList.add('active');
            }
        });
    });

    // Setup interactive hover highlights for SVG diagrams
    setupDiagramInteractions();
});

function setupDiagramInteractions() {
    // Select all interactive diagram nodes
    const nodes = document.querySelectorAll('.process-box, .external-entity, .data-store, .uml-class, .erd-entity');

    nodes.forEach(node => {
        node.addEventListener('mouseenter', () => {
            const nodeId = node.getAttribute('id');
            if (!nodeId) return;

            // Highlight connected data flows or relationships
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

            // Dim other nodes
            nodes.forEach(otherNode => {
                if (otherNode !== node) {
                    otherNode.style.opacity = '0.4';
                }
            });
        });

        node.addEventListener('mouseleave', () => {
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
