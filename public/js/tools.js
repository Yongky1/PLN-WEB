const toolsData = window.__TOOLS_DATA__;
const overlay   = document.getElementById('modal-overlay');

// ============ OPEN DETAIL MODAL ============
document.querySelectorAll('.tool-card').forEach(card => {
    card.addEventListener('click', () => openDetail(card.dataset.id));
});

function openDetail(id) {
    const tool = toolsData.find(t => t.id === id);
    if (!tool) return;

    // Header
    document.getElementById('modal-header').style.background = tool.bgGradient;
    document.getElementById('modal-icon').textContent        = tool.icon || '🔧';

    // Category badge
    const catLabel = document.getElementById('modal-category-label');
    catLabel.textContent = tool.categoryLabel;
    catLabel.className   = 'text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block mb-2 ';
    if (tool.category === 'k3')          catLabel.className += 'cat-badge-k3';
    else if (tool.category === 'teknis') catLabel.className += 'cat-badge-teknis';
    else                                 catLabel.className += 'cat-badge-pengukuran';

    // Name & Description
    document.getElementById('modal-name').textContent     = tool.name;
    document.getElementById('modal-desc').textContent     = tool.description || 'Deskripsi belum tersedia.';
    document.getElementById('modal-standard').textContent = tool.standard || '-';

    // Status with color
    const statusEl       = document.getElementById('modal-status');
    statusEl.textContent = tool.status || '-';
    statusEl.className   = 'text-sm font-bold ' + (tool.status === 'Wajib' ? 'text-red-400' : 'text-emerald-400');

    // Procedure steps
    const procedures = Array.isArray(tool.procedure) ? tool.procedure : [];
    document.getElementById('modal-procedure').innerHTML = procedures.length > 0
        ? procedures.map((step, i) => `
            <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-pln-yellow)]/10 border border-[var(--color-pln-yellow)]/30 flex items-center justify-center text-[10px] font-bold text-[var(--color-pln-yellow)] mt-0.5">${i + 1}</span>
                <span class="text-xs text-white/50 leading-relaxed">${step}</span>
            </li>
        `).join('')
        : `<li class="text-xs text-white/30 italic">Prosedur belum tersedia.</li>`;

    // Show modal
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

// ============ CLOSE DETAIL MODAL ============
function closeDetail() {
    overlay.classList.add('hidden');
    overlay.classList.remove('flex');
    document.body.style.overflow = '';
}

document.getElementById('modal-close').addEventListener('click', closeDetail);
overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });
