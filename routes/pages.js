const express = require('express');
const { cachedFetch } = require('../utils/cache');

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

// Normalisasi URL: ganti absolute URL backend → relative path
// agar browser tidak perlu akses langsung ke port 4000
const normalizeUrl = (url) => url ? url.replace(/^https?:\/\/[^/]+/, '') : url;

router.get('/', (req, res) => {
  res.render('index', {
    title: 'PLN Pusdiklat — Ekosistem Pembelajaran Masa Depan',
    currentPage: 'home',
  });
});

router.get('/tools', async (req, res) => {
  try {
    const [dbTools, categories] = await Promise.all([
      cachedFetch(`${BACKEND_URL}/api/tools`),
      cachedFetch(`${BACKEND_URL}/api/categories?type=tool`).catch(() => []),
    ]);

    const toolsData = dbTools.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category?.id || 'teknis',
      categoryLabel: t.category?.name || 'Teknis',
      bgGradient: t.bgGradient || 'linear-gradient(135deg, #1a2030 0%, #0d1520 100%)',
      description: t.description || '',
      standard: t.standard || '-',
      status: t.status || 'Wajib',
      file3d: normalizeUrl(t.file3d),
      image: normalizeUrl(t.image),
    }));

    res.render('tools', {
      title: 'Tools & Alat K3 — PLN Pusdiklat',
      toolsData,
      categories,
      currentPage: 'tools',
    });
  } catch (err) {
    console.error('[/tools] Gagal fetch data dari backend:', err.message);
    res.render('tools', {
      title: 'Tools & Alat K3 — PLN Pusdiklat',
      toolsData: [],
      categories: [],
      currentPage: 'tools',
    });
  }
});

router.get('/material', async (req, res) => {
  try {
    const [dbMaterials, categories] = await Promise.all([
      cachedFetch(`${BACKEND_URL}/api/materials`),
      cachedFetch(`${BACKEND_URL}/api/categories?type=material`).catch(() => []),
    ]);

    const materialData = dbMaterials.map((m) => ({
      id: m.id,
      name: m.name,
      code: m.code || '',
      category: m.category?.id || 'lainnya',
      categoryLabel: m.category?.name || 'Lainnya',
      bgGradient: m.bgGradient || 'linear-gradient(135deg, #1a2030 0%, #0d1520 100%)',
      description: m.description || '',
      image: normalizeUrl(m.image),
      file3d: m.assets && m.assets.length > 0 ? normalizeUrl(m.assets[0].file) : null,
      assets: (m.assets || []).map(a => ({ ...a, file: normalizeUrl(a.file) })),
    }));

    res.render('material', {
      title: 'Material Jaringan — PLN Pusdiklat',
      materialData,
      categories,
      currentPage: 'material',
    });
  } catch (err) {
    console.error('[/material] Gagal fetch data dari backend:', err.message);
    res.render('material', {
      title: 'Material Jaringan — PLN Pusdiklat',
      materialData: [],
      categories: [],
      currentPage: 'material',
    });
  }
});

router.get('/ModulKonstruksi', async (req, res) => {
  try {
    const sort = req.query.sort || 'newest';
    let dbModules = await cachedFetch(`${BACKEND_URL}/api/modules?sort=${sort}`);

    if (!Array.isArray(dbModules)) {
      console.error('[/ModulKonstruksi] Backend tidak mengembalikan array:', dbModules);
      dbModules = [];
    }

    const activeModules = dbModules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      image: normalizeUrl(m.image),
      materialCount: m.materialCount || 0,
      equipmentCount: m.equipmentCount || 0,
      assets: (m.assets || []).map(a => ({ ...a, file: normalizeUrl(a.file) })),
    }));

    res.render('ModulKonstruksi', {
      title: 'Modul Pembelajaran — PLN Pusdiklat',
      activeModules,
      inactiveModules: [],
      currentSort: sort,
      currentPage: 'konstruksi',
    });
  } catch (err) {
    console.error(err);
    res.render('ModulKonstruksi', {
      title: 'Modul Pembelajaran — PLN Pusdiklat',
      activeModules: [],
      inactiveModules: [],
      currentSort: 'newest',
      currentPage: 'konstruksi',
    });
  }
});

router.get('/ModulKonstruksi/:id', async (req, res) => {
  const moduleId = req.params.id;
  try {
    const moduleItem = await cachedFetch(`${BACKEND_URL}/api/modules/${moduleId}`);

    const mappedModule = {
      id: moduleItem.id,
      title: moduleItem.title,
      description: moduleItem.description,
      materialCount: moduleItem.materials ? moduleItem.materials.length : 0,
      equipmentCount: moduleItem.tools ? moduleItem.tools.length : 0,
      // Normalisasi URL aset agar Three.js tidak akses langsung ke port 4000
      assets: (moduleItem.assets || []).map(a => ({ ...a, file: normalizeUrl(a.file) })),
      materials: (moduleItem.materials || []).map(m => {
        if (m.material) {
          m.material.categoryLabel = m.material.category?.name || 'Lainnya';
          m.material.category = m.material.category?.value || 'lainnya';
          m.material.file3d = normalizeUrl(m.material.file3d);
          m.material.image = normalizeUrl(m.material.image);
          if (m.material.assets) {
            m.material.assets = m.material.assets.map(a => ({ ...a, file: normalizeUrl(a.file) }));
          }
        }
        return m;
      }),
      tools: (moduleItem.tools || []).map(t => {
        if (t.tool) {
          t.tool.categoryLabel = t.tool.category?.name || 'Teknis';
          t.tool.category = t.tool.category?.value || 'teknis';
          t.tool.file3d = normalizeUrl(t.tool.file3d);
          t.tool.image = normalizeUrl(t.tool.image);
        }
        return t;
      }),
    };

    res.render('ModulViewer', {
      title: `${mappedModule.title} - PLN Pusdiklat 3D`,
      module: mappedModule,
      backUrl: req.query.back || '/ModulKonstruksi',
    });
  } catch (err) {
    console.error(err);
    res.redirect('/ModulKonstruksi');
  }
});

router.get('/login', (req, res) => {
  if (req.cookies.auth_token) {
    return res.redirect('/admin');
  }
  res.render('login', { title: 'Login Admin - PLN Pusdiklat' });
});

module.exports = router;
