// public/js/main.js

window.formatDescription = function(desc) {
  if (!desc || typeof desc !== 'string') return 'Deskripsi belum tersedia.';
  
  // 1. Sanitize HTML
  let formatted = desc
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
    
  // 2. Parse bold (**text**)
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // 3. Parse source ([Source]) at the end
  const sourceMatch = formatted.match(/\[(.*?)\]\s*$/);
  let sourceHtml = '';
  if (sourceMatch) {
    formatted = formatted.replace(/\[(.*?)\]\s*$/, '').trim();
    sourceHtml = `<div class="mt-3 pt-2 text-right text-[12px] italic text-[var(--color-text-secondary)] opacity-80 border-t border-[rgba(0,0,0,0.1)]">${sourceMatch[1]}</div>`;
  }
  
  return formatted + sourceHtml;
};

document.addEventListener('DOMContentLoaded', () => {
  // Global Textarea Formatting Toolbar & Shortcuts
  
  function insertTextareaMarkdown(textarea, prefix, suffix, placeholder) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replace = selected ? `${prefix}${selected}${suffix}` : `${prefix}${placeholder}${suffix}`;
    
    textarea.value = text.substring(0, start) + replace + text.substring(end);
    
    textarea.selectionStart = start + prefix.length;
    textarea.selectionEnd = selected ? start + replace.length - suffix.length : start + prefix.length + placeholder.length;
    
    textarea.dispatchEvent(new Event('input'));
    textarea.focus();
  }

  // Inject Toolbar
  const textareas = document.querySelectorAll('textarea');
  textareas.forEach(textarea => {
    // Wrapper to hold toolbar and textarea
    const wrapper = document.createElement('div');
    wrapper.className = 'w-full flex flex-col gap-1.5';
    textarea.parentNode.insertBefore(wrapper, textarea);
    
    const toolbar = document.createElement('div');
    toolbar.className = 'flex items-center gap-2 p-1 bg-[var(--color-bg-surface-alt)] border border-[var(--color-border)] rounded-md w-fit shadow-sm';
    
    // Bold Button
    const btnBold = document.createElement('button');
    btnBold.type = 'button';
    btnBold.className = 'p-1 px-2 text-xs font-bold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded transition-colors flex items-center justify-center';
    btnBold.innerHTML = 'B';
    btnBold.title = 'Tebal (Ctrl+B)';
    btnBold.onclick = (e) => {
      e.preventDefault();
      insertTextareaMarkdown(textarea, '**', '**', 'teks tebal');
    };
    
    // Source Button
    const btnSource = document.createElement('button');
    btnSource.type = 'button';
    btnSource.className = 'p-1 px-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded transition-colors flex items-center gap-1.5';
    btnSource.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg> Sumber';
    btnSource.title = 'Tambah Sumber Referensi';
    btnSource.onclick = (e) => {
      e.preventDefault();
      const text = textarea.value;
      if (!text.match(/\[.*?\]\s*$/)) {
          textarea.value = text + (text.endsWith(' ') || text === '' ? '' : ' ') + '[Nama Referensi]';
          textarea.dispatchEvent(new Event('input'));
          textarea.focus();
      }
    };
    
    toolbar.appendChild(btnBold);
    toolbar.appendChild(btnSource);
    
    wrapper.appendChild(toolbar);
    wrapper.appendChild(textarea);
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName.toLowerCase() === 'textarea') {
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        insertTextareaMarkdown(e.target, '**', '**', 'teks tebal');
      }
    }
  });

  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  const darkIcon = document.getElementById('theme-toggle-dark-icon');
  const lightIcon = document.getElementById('theme-toggle-light-icon');

  if (darkIcon && lightIcon) {
    // Change the icons inside the button based on previous settings
    if (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      lightIcon.classList.remove('hidden');
    } else {
      darkIcon.classList.remove('hidden');
    }
  }

  // Toggle logic
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function () {
      if (darkIcon) darkIcon.classList.toggle('hidden');
      if (lightIcon) lightIcon.classList.toggle('hidden');

      if (localStorage.getItem('theme')) {
        if (localStorage.getItem('theme') === 'light') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          window.dispatchEvent(new CustomEvent('themeChanged', { detail: 'dark' }));
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
          window.dispatchEvent(new CustomEvent('themeChanged', { detail: 'light' }));
        }
      } else {
        if (document.documentElement.classList.contains('dark')) {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
          window.dispatchEvent(new CustomEvent('themeChanged', { detail: 'light' }));
        } else {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
          window.dispatchEvent(new CustomEvent('themeChanged', { detail: 'dark' }));
        }
      }
    });
  }

  // Hero Text Animation onload
  setTimeout(() => {
    document.querySelectorAll('.reveal-item').forEach((el) => {
      el.classList.add('active');
    });
  }, 300);

  // Overlay Menu Dropdown Toggle
  const dropdownToggles = document.querySelectorAll('.jl-overlay-dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const wrap = toggle.closest('.jl-overlay-dropdown-wrap');
      if (wrap) {
        wrap.classList.toggle('is-open');
      }
    });
  });
});
