const express = require('express');
const { cachedFetch } = require('../utils/cache');

const router = express.Router();
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

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
      file3d: t.file3d || null,
      image: t.image || null,
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
      image: m.image || null,
      file3d: m.assets && m.assets.length > 0 ? m.assets[0].file : null,
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
      image: m.image,
      materialCount: m.materials && m.materials[0] ? (m.materials[0].count ?? 0) : 0,
      equipmentCount: m.tools && m.tools[0] ? (m.tools[0].count ?? 0) : 0,
      assets: m.assets || [],
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
      assets: moduleItem.assets || [],
      materials: moduleItem.materials || [],
      tools: moduleItem.tools || [],
    };

    res.render('ModulViewer', {
      title: `${mappedModule.title} - PLN Pusdiklat 3D`,
      module: mappedModule,
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
