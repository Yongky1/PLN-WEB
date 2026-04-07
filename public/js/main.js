// public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Theme Toggle Logic
    const themeToggleBtn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    // Change the icons inside the button based on previous settings
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        lightIcon.classList.remove('hidden');
    } else {
        darkIcon.classList.remove('hidden');
    }

    // Toggle logic
    themeToggleBtn.addEventListener('click', function() {
        // toggle icons
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');

        // if is set in localStorage
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
        // if NOT set via local storage previously
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

    // Hero Text Animation onload
    setTimeout(() => {
        document.querySelectorAll('.reveal-item').forEach(el => {
            el.classList.add('active');
        });
    }, 300);
});
