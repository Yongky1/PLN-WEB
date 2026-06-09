// @ts-check
const js = require('@eslint/js');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  // Konfigurasi file yang diabaikan
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'public/css/output.css', '**/*.min.js'],
  },
  // Konfigurasi utama untuk semua file JS (server-side + client-side)
  {
    files: ['**/*.js'],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        // Node.js globals
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'writable',
        require: 'readonly',
        exports: 'writable',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        URL: 'readonly',
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        FormData: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        Blob: 'readonly',
        URLSearchParams: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        MutationObserver: 'readonly',
        IntersectionObserver: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        THREE: 'readonly',
        Image: 'readonly',
        performance: 'readonly',
        DataTransfer: 'readonly',
        event: 'readonly',
        ResizeObserver: 'readonly',
        location: 'readonly',
        // App globals
        showToast: 'readonly',
        fetchBackend: 'readonly',
        gsap: 'readonly',
        ScrollTrigger: 'readonly',
        closeEditModal: 'readonly',
        closeAddMatModal: 'readonly',
        closeAddToolModal: 'readonly',
        closeAddKonstruksiModal: 'readonly',
        getAdminSkeleton: 'readonly',
        setToolFilter: 'readonly',
        setMatFilter: 'readonly',
        changeAdminPreview: 'readonly',
        showConfirmDialog: 'readonly',
        refreshAdminPreviewSelector: 'readonly',
        initDropZone: 'readonly',
        initImageDropZone: 'readonly',
        openCatalogModal: 'readonly',
        closeCatalogModal: 'readonly',
        toggleCatalogFullscreen: 'readonly',
        initCatalogFullscreen: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...prettierConfig.rules,

      // --- Code Quality ---
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-empty': 'warn',

      // --- Error Prevention ---
      'no-undef': 'error',
      'no-duplicate-imports': 'error',

      // --- Prettier ---
      'prettier/prettier': 'warn',
    },
  },
  // Khusus untuk file yang menggunakan ES Modules
  {
    files: ['tailwind.config.js', 'vite.config.js', 'public/js/modul-viewer.js', 'public/js/admin/mapping-viewer.js', 'src/**/*.js'],
    languageOptions: {
      sourceType: 'module',
    },
  },
];
