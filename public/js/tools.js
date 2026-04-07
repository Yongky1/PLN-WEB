const toolsData = window.__TOOLS_DATA__ || [];
const overlay   = document.getElementById('modal-overlay');
const toolsGrid = document.getElementById('tools-grid');

function renderTools() {
    if (!toolsGrid) return;
    
    toolsGrid.innerHTML = toolsData.map(tool => {
        const categoryClass = tool.category === 'k3' ? 'bg-brand-pln text-white dark:bg-brand-pln/20 dark:text-brand-accent' : 
                             (tool.category === 'teknis' ? 'bg-brand-yellow text-gray-900 dark:bg-brand-yellow/20 dark:text-brand-yellow' : 'bg-brand-blue text-white dark:bg-brand-blue/30 dark:text-blue-300');
                             
        const statusClass = tool.status === 'Wajib' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';

        return `
        <div class="tool-card group relative rounded-[2rem] overflow-hidden bg-white dark:bg-[#081729] shadow-md hover:shadow-2xl transition-all duration-300 border border-black/5 dark:border-white/5 hover:-translate-y-2 flex flex-col cursor-pointer"
            data-category="${tool.category}" data-id="${tool.id}">

            <div class="w-full h-40 relative overflow-hidden flex items-center justify-center transition-all group-hover:h-44"
                style="background: ${tool.bgGradient};">
                <div class="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent group-hover:scale-150 transition-transform duration-700">
                </div>
                <span class="relative z-10 text-6xl select-none group-hover:scale-110 transition-transform duration-500"
                    style="filter: drop-shadow(0 8px 16px rgba(0,0,0,0.4));">
                    ${tool.icon}
                </span>
                <div class="absolute top-4 right-4 backdrop-blur-md">
                    <span class="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/20 ${categoryClass}">
                        ${tool.categoryLabel}
                    </span>
                </div>
            </div>

            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-brand-blue dark:group-hover:text-cyan-400 transition-colors leading-tight">
                    ${tool.name}
                </h3>
                <p class="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-6 flex-grow">
                    ${tool.description}
                </p>
                <div class="mt-auto border-t border-gray-100 dark:border-white/10 pt-4 flex flex-col gap-2">
                    <p class="text-xs text-gray-600 dark:text-gray-300 font-medium tracking-wide">
                        Standard: <span class="text-brand-blue dark:text-brand-accent font-bold">
                            ${tool.standard}
                        </span></p>
                    <p class="text-xs tracking-wide font-medium">Status: <span
                            class="${statusClass} font-bold">
                            ${tool.status}
                        </span></p>
                </div>
            </div>
        </div>
        `;
    }).join('');

    // Reattach click listeners for the newly generated cards
    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => openDetail(card.dataset.id));
    });
}

// Initial render
renderTools();

// Setup Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('border-brand-accent', 'bg-brand-accent/10', 'text-brand-blue', 'dark:text-brand-accent');
            b.classList.add('border-gray-200', 'dark:border-white/10', 'text-gray-500', 'dark:text-gray-400');
        });
        btn.classList.add('border-brand-accent', 'bg-brand-accent/10', 'text-brand-blue', 'dark:text-brand-accent');
        btn.classList.remove('border-gray-200', 'dark:border-white/10', 'text-gray-500', 'dark:text-gray-400');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.tool-card').forEach(card => {
            card.style.display = (filter === 'all' || card.dataset.category === filter) ? '' : 'none';
        });
    });
});

function openDetail(id) {
    const tool = toolsData.find(t => t.id === id);
    if (!tool) return;

    document.getElementById('modal-header').style.background    = tool.bgGradient;
    document.getElementById('modal-icon').textContent           = tool.icon;
    document.getElementById('modal-category-label').textContent = tool.categoryLabel;
    document.getElementById('modal-name').textContent           = tool.name;
    document.getElementById('modal-desc').textContent           = tool.description;
    document.getElementById('modal-standard').textContent       = tool.standard;

    const statusEl       = document.getElementById('modal-status');
    statusEl.textContent = tool.status;
    statusEl.className   = 'text-sm font-bold ' + (tool.status === 'Wajib' ? 'text-red-500 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400');

    document.getElementById('modal-procedure').innerHTML = tool.procedure.map((step, i) => `
        <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue dark:bg-white/5 border border-brand-accent/40 flex items-center justify-center text-[10px] font-bold text-white dark:text-brand-accent mt-0.5">${i + 1}</span>
            <span class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">${step}</span>
        </li>
    `).join('');

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    
    // Add opacity and transform animation classes back
    const container = document.getElementById('modal-container');
    if (container) {
        setTimeout(() => {
            container.classList.remove('opacity-0', 'scale-95');
            container.classList.add('opacity-100', 'scale-100');
        }, 10);
    }
    
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    const container = document.getElementById('modal-container');
    if (container) {
        container.classList.remove('opacity-100', 'scale-100');
        container.classList.add('opacity-0', 'scale-95');
        
        // Wait for animation to finish before hiding modal entirely
        setTimeout(() => {
            overlay.classList.add('hidden');
            overlay.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300);
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

document.getElementById('modal-close').addEventListener('click', closeDetail);
overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });
