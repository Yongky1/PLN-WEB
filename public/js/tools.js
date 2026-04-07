const toolsData = window.__TOOLS_DATA__;
const overlay   = document.getElementById('modal-overlay');

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

document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
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
    statusEl.className   = 'text-sm font-bold ' + (tool.status === 'Wajib' ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400');

    document.getElementById('modal-procedure').innerHTML = tool.procedure.map((step, i) => `
        <li class="flex items-start gap-3">
            <span class="flex-shrink-0 w-5 h-5 rounded-full bg-brand-blue dark:bg-white/5 border border-brand-accent/40 flex items-center justify-center text-[10px] font-bold text-white dark:text-brand-accent mt-0.5">${i + 1}</span>
            <span class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">${step}</span>
        </li>
    `).join('');

    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function closeDetail() {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeDetail);
overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });
