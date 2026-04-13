const express = require('express');
const path    = require('path');
const ejs         = require('ejs');
const cookieParser = require('cookie-parser');
const adminRouter = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts/three', express.static(path.join(__dirname, 'node_modules/three/build')));

const modulesData = [
    {
        id: "anchor-block",
        title: "Anchor-block",
        description: "Visualisasi 3D interaktif Anchor Block.",
        materialCount: 15,
        equipmentCount: 5,
        image: ""
    },
    {
        id: "anchor-expandable-(terbuka)",
        title: "Anchor Expandable (terbuka)",
        description: "Visualisasi 3D interaktif .",
        materialCount: 24,
        equipmentCount: 8,
        image: ""
    },
    {
        id: "kwh-meter",
        title: "Instalasi kWh Meter",
        description: "Simulasi pemasangan sambungan rumah dan kWh meter prabayar untuk pelanggan.",
        materialCount: 7,
        equipmentCount: 3,
        image: ""
    },
    {
        id: "kabel-konektor",
        title: "Penarikan Kabel (SUTR)",
        description: "Latihan prosedur penarikan kabel Saluran Udara Tegangan Rendah dan pemasangan konektor.",
        materialCount: 10,
        equipmentCount: 6,
        image: ""
    }
];

const toolsData = [
    {
        id: 'helm-safety',
        name: 'Helm Safety',
        category: 'k3',
        categoryLabel: 'Alat K3',
        icon: '⛑️',
        bgGradient: 'linear-gradient(135deg, #1e3a5f 0%, #0a2540 100%)',
        description: 'Helm keselamatan kerja wajib dipakai di seluruh area konstruksi jaringan listrik. Melindungi kepala dari benturan benda jatuh. Standar SNI 8400:2017.',
        standard: 'SNI 8400:2017',
        status: 'Wajib',
        procedure: [
            'Periksa kondisi helm sebelum dipakai — tidak retak atau penyok.',
            'Setel suspensi di bagian dalam hingga helm pas dan tidak goyang.',
            'Kencangkan tali pengikat di bawah dagu hingga terasa nyaman.',
            'Jangan menaruh benda apapun di atas helm saat digunakan.',
            'Ganti segera jika pernah mengalami benturan keras.',
        ],
    },
    {
        id: 'sarung-tangan-listrik',
        name: 'Sarung Tangan Listrik',
        category: 'k3',
        categoryLabel: 'Alat K3',
        icon: '🧤',
        bgGradient: 'linear-gradient(135deg, #3b1f1f 0%, #1a0a0a 100%)',
        description: 'Sarung tangan isolasi karet untuk perlindungan dari tegangan listrik hingga 11kV. Wajib digunakan saat bekerja dekat jaringan aktif atau bertegangan.',
        standard: 'IEC 60903',
        status: 'Wajib',
        procedure: [
            'Periksa kebocoran dengan cara digulung perlahan dari ujung jari.',
            'Gunakan glove liner cotton di dalam sarung tangan karet.',
            'Jangan gunakan jika ada tanda robek, berlubang, atau mengeras.',
            'Simpan di tempat sejuk, jauh dari sumber panas dan bahan kimia.',
            'Uji tegangan secara berkala sesuai jadwal kalibrasi.',
        ],
    },
    {
        id: 'full-body-harness',
        name: 'Full Body Harness',
        category: 'k3',
        categoryLabel: 'Alat K3',
        icon: '🦺',
        bgGradient: 'linear-gradient(135deg, #1f2d1a 0%, #0d1a0a 100%)',
        description: 'Harness penahan jatuh untuk pekerjaan di ketinggian di atas 1,8 meter. Dilengkapi D-ring dorsal, dada, dan samping. Wajib digunakan saat memanjat tiang.',
        standard: 'SNI ISO 10333',
        status: 'Wajib',
        procedure: [
            'Periksa semua strap, buckle, dan D-ring sebelum dipakai.',
            'Pastikan D-ring dorsal berada tepat di antara tulang belikat.',
            'Kencangkan seluruh strap hingga tidak ada celah lebih dari dua jari.',
            'Hubungkan lanyard ke anchor point yang kuat dan tersertifikasi.',
            'Pastikan shock absorber dalam kondisi belum pernah terbuka.',
        ],
    },
    {
        id: 'sepatu-safety',
        name: 'Sepatu Safety',
        category: 'k3',
        categoryLabel: 'Alat K3',
        icon: '👟',
        bgGradient: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)',
        description: 'Sepatu keselamatan dengan pelindung ujung baja (steel toe cap) dan sol anti-slip. Melindungi kaki dari benda jatuh dan permukaan licin di area konstruksi.',
        standard: 'SNI ISO 20345',
        status: 'Wajib',
        procedure: [
            'Gunakan setiap saat berada di area konstruksi jaringan.',
            'Periksa kondisi sol dan pelindung ujung setiap hari.',
            'Jangan memodifikasi atau merusak struktur sepatu.',
            'Ganti segera jika sol sudah tipis atau pelindung ujung rusak.',
        ],
    },
    {
        id: 'kacamata-safety',
        name: 'Kacamata Safety',
        category: 'k3',
        categoryLabel: 'Alat K3',
        icon: '🥽',
        bgGradient: 'linear-gradient(135deg, #1a2a3a 0%, #0a1a2a 100%)',
        description: 'Kacamata pelindung untuk melindungi mata dari percikan logam, debu, dan sinar UV saat pekerjaan pemotongan, pengelasan, atau grinding di lapangan.',
        standard: 'ANSI Z87.1',
        status: 'Situasional',
        procedure: [
            'Gunakan saat pekerjaan grinding, pemotongan, atau pengelasan.',
            'Pastikan lensa tidak tergores agar pandangan tetap jelas.',
            'Bersihkan dengan kain lembut setelah setiap penggunaan.',
            'Simpan dalam kotak pelindung agar terhindar dari goresan.',
        ],
    },
    {
        id: 'safety-belt',
        name: 'Safety Belt',
        category: 'k3',
        categoryLabel: 'Alat K3',
        icon: '🔗',
        bgGradient: 'linear-gradient(135deg, #2a1a0a 0%, #1a0f05 100%)',
        description: 'Sabuk pengaman tipe positioning belt untuk menopang tubuh teknisi saat bekerja di tiang. Digunakan bersama full body harness — bukan sebagai pengganti.',
        standard: 'SNI ISO 354',
        status: 'Wajib',
        procedure: [
            'Gunakan selalu bersama full body harness, bukan sendiri.',
            'Kencangkan sabuk di sekitar tiang sebelum melepas tangan.',
            'Periksa semua karabiner dan buckle sebelum dipakai.',
            'Jangan gunakan safety belt yang sudah pernah menahan jatuh.',
        ],
    },
    {
        id: 'tangga-fiberglass',
        name: 'Tangga Fiberglass',
        category: 'teknis',
        categoryLabel: 'Alat Teknis',
        icon: '🪜',
        bgGradient: 'linear-gradient(135deg, #1a2a3a 0%, #0d1e2e 100%)',
        description: 'Tangga fiberglass non-konduktif panjang 8 meter untuk akses kerja di tiang listrik. Material non-logam aman dari induksi listrik dan jaringan bertegangan.',
        standard: 'SPLN D3.013',
        status: 'Wajib',
        procedure: [
            'Pastikan kaki tangga dipasang di tanah yang rata dan padat.',
            'Ikat bagian atas tangga ke tiang dengan tali pengaman.',
            'Pertahankan sudut kemiringan tangga ideal 75° dari tanah.',
            'Tidak boleh lebih dari satu orang di tangga bersamaan.',
            'Jangan menaruh alat berat di anak tangga teratas.',
        ],
    },
    {
        id: 'kunci-torsi',
        name: 'Kunci Torsi',
        category: 'teknis',
        categoryLabel: 'Alat Teknis',
        icon: '🔧',
        bgGradient: 'linear-gradient(135deg, #2a2010 0%, #1a1408 100%)',
        description: 'Kunci torsi untuk mengencangkan baut sesuai nilai torsi yang ditentukan dalam spesifikasi teknis. Mencegah over-torque yang merusak ulir dan under-torque yang mengakibatkan baut kendor.',
        standard: 'ISO 6789',
        status: 'Wajib',
        procedure: [
            'Setting nilai torsi sesuai spesifikasi baut yang digunakan.',
            'Putar searah jarum jam untuk mengencangkan baut.',
            'Bunyi "klik" menandakan nilai torsi sudah tercapai — berhenti.',
            'Jangan membalik arah putaran untuk melepas baut dengan kunci torsi.',
            'Kalibrasi kunci torsi secara berkala sesuai jadwal.',
        ],
    },
    {
        id: 'temporary-grounding',
        name: 'Temporary Grounding',
        category: 'teknis',
        categoryLabel: 'Alat Teknis',
        icon: '🌍',
        bgGradient: 'linear-gradient(135deg, #1a2f1a 0%, #0d1a0d 100%)',
        description: 'Perangkat grounding sementara (temporary earthing) untuk menjamin keselamatan pekerja dari tegangan induksi saat bekerja pada jaringan yang dipadamkan.',
        standard: 'IEC 61230',
        status: 'Wajib',
        procedure: [
            'Pastikan jaringan sudah dipadamkan dan sudah di-voltage-test.',
            'Pasang kabel grounding ke titik earth terlebih dahulu.',
            'Kemudian pasang klem ke konduktor fase satu per satu.',
            'Pasang sedekat mungkin dengan area pekerjaan.',
            'Saat membuka: lepas dari konduktor dahulu, baru dari earth.',
        ],
    },
    {
        id: 'radio-komunikasi',
        name: 'Radio Komunikasi (HT)',
        category: 'teknis',
        categoryLabel: 'Alat Teknis',
        icon: '📻',
        bgGradient: 'linear-gradient(135deg, #0a1f2a 0%, #051015 100%)',
        description: 'Handy Talky untuk komunikasi antar anggota tim di lapangan. Wajib dibawa saat pekerjaan konstruksi atau pemeliharaan yang melibatkan lebih dari satu teknisi.',
        standard: 'SOP PLN No. 12',
        status: 'Wajib',
        procedure: [
            'Pastikan baterai terisi penuh sebelum berangkat ke lapangan.',
            'Set channel sesuai frekuensi tim yang sudah disepakati.',
            'Lakukan pengecekan komunikasi dengan dispatcher sebelum mulai pekerjaan.',
            'Laporkan setiap perubahan kondisi atau kejadian ke dispatcher.',
        ],
    },
    {
        id: 'voltage-tester',
        name: 'Voltage Tester',
        category: 'pengukuran',
        categoryLabel: 'Pengukuran',
        icon: '⚡',
        bgGradient: 'linear-gradient(135deg, #2a1f00 0%, #1a1300 100%)',
        description: 'Alat pendeteksi tegangan listrik. Wajib digunakan sebelum menyentuh jaringan untuk memastikan kondisi tidak bertegangan sesuai prosedur LOTO (Lock Out Tag Out).',
        standard: 'IEC 61010-1',
        status: 'Wajib',
        procedure: [
            'Uji alat terlebih dahulu pada sumber tegangan yang sudah diketahui.',
            'Posisikan probe pada konduktor yang akan diuji secara hati-hati.',
            'Baca indikator dari jarak yang aman dan posisi yang jelas.',
            'Lakukan minimal 3 kali pengukuran untuk validasi hasil.',
            'Tidak bekerja pada jaringan sebelum dipastikan tidak bertegangan.',
        ],
    },
    {
        id: 'tang-ampere',
        name: 'Tang Ampere',
        category: 'pengukuran',
        categoryLabel: 'Pengukuran',
        icon: '📐',
        bgGradient: 'linear-gradient(135deg, #1f1a2a 0%, #120f1a 100%)',
        description: 'Alat ukur arus listrik tanpa memutus rangkaian. Digunakan untuk mengukur arus beban pada jaringan distribusi tegangan rendah tanpa perlu membuka kabel.',
        standard: 'IEC 61010-2-032',
        status: 'Situasional',
        procedure: [
            'Pastikan alat dalam kondisi baik dan baterai terisi.',
            'Set selector pada range arus yang sesuai estimasi beban.',
            'Klem hanya pada satu konduktor — tidak boleh dua sekaligus.',
            'Baca hasil pengukuran dan catat pada lembar kerja.',
            'Simpan dengan pelindung klem terpasang setelah digunakan.',
        ],
    },
];

const materialData = [
    {
        id: 'baut-m20',
        name: 'Baut M20 HDG',
        code: 'BT-M20-HDG',
        categoryLabel: 'Pengencang',
        icon: '🔩',
        bgGradient: 'linear-gradient(135deg, #1a2030 0%, #0d1520 100%)',
        shortDesc: 'Baut hexagonal baja galvanis panas M20 untuk pengikat crossarm ke tiang listrik.',
        description: 'Baut hexagonal Hot-Dip Galvanized (HDG) diameter M20 untuk pengikat struktural crossarm ke tiang listrik. Kelas kekuatan Grade 8.8 dengan lapisan galvanis minimum 85 mikron untuk ketahanan korosi jangka panjang di lingkungan outdoor.',
        specs: {
            'Diameter': 'M20',
            'Panjang': '80 – 150 mm',
            'Kelas': 'Grade 8.8',
            'Coating': 'Hot-Dip Galvanis',
            'Torsi Maks': '380 Nm',
            'Standar': 'ISO 4014',
        },
        shape: 'bolt',
        color3d: 0xBBBBBB,
    },
    {
        id: 'ring-per',
        name: 'Ring Per (Spring Washer)',
        code: 'WS-M20-SPR',
        categoryLabel: 'Pengencang',
        icon: '⭕',
        bgGradient: 'linear-gradient(135deg, #1e1e2e 0%, #11111e 100%)',
        shortDesc: 'Ring pegas baja untuk mencegah baut kendor akibat getaran pada jaringan listrik.',
        description: 'Ring pegas (spring washer) baja karbon galvanis untuk mencegah kendornya baut akibat getaran mekanis dan thermal cycling pada jaringan distribusi. Wajib dipasang pada setiap baut kritis di konstruksi tiang.',
        specs: {
            'Diameter': 'M20',
            'Material': 'Baja Per',
            'Tebal': '4 mm',
            'Coating': 'Galvanis',
            'Standar': 'DIN 127',
            'Gaya Pegas': '1.200 N',
        },
        shape: 'torus',
        color3d: 0x999999,
    },
    {
        id: 'insulator-pin',
        name: 'Insulator Pin 11kV',
        code: 'INS-PIN-11kV',
        categoryLabel: 'Insulasi',
        icon: '💡',
        bgGradient: 'linear-gradient(135deg, #2a1a10 0%, #1a0f08 100%)',
        shortDesc: 'Insulator pin keramik tegangan menengah 11kV untuk jaringan distribusi PLN.',
        description: 'Insulator pin keramik glazed untuk jaringan distribusi tegangan menengah 11kV. Mengisolasi konduktor dari struktur tiang agar tidak terjadi kebocoran arus ke tanah. Tahan terhadap polusi ringan hingga sedang (kategori C).',
        specs: {
            'Tegangan Kerja': '11 kV',
            'BIL': '75 kV',
            'Material': 'Keramik Glazed',
            'Kategori Polusi': 'C (Sedang)',
            'Panjang Lintasan': '210 mm',
            'Standar': 'IEC 60305',
        },
        shape: 'insulator',
        color3d: 0xCC9966,
    },
];

app.get('/', (req, res) => {
    res.render('index', {
        title: 'PLN Pusdiklat — Ekosistem Pembelajaran Masa Depan',
    });
});

app.get('/tools', (req, res) => {
    res.render('tools', {
        title: 'Tools & Alat K3 — PLN Pusdiklat',
        toolsData,
    });
});

app.get('/material', (req, res) => {
    res.render('material', {
        title: 'Material Jaringan — PLN Pusdiklat',
        materialData,
    });
});

app.get('/ModulKonstruksi', async (req, res) => {
    try {
        const fetchRes = await fetch('http://localhost:4000/api/modules?all=true');
        let dbModules = await fetchRes.json();
        
        // Sorting logic based on req.query.sort
        const sort = req.query.sort || 'newest';
        if (sort === 'newest') {
            dbModules.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else if (sort === 'name_asc') {
            dbModules.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        } else if (sort === 'name_desc') {
            dbModules.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
        }

        // Hitung material & eq count, lalu petakan
        const mappedModules = dbModules.map(m => {
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                image: m.image,
                status: m.status,
                materialCount: m.materials ? m.materials.length : 0,
                equipmentCount: m.tools ? m.tools.length : 0,
                assets: m.assets || []
            };
        });

        // Pisahkan yang aktif dan yang non-aktif/draft
        const activeModules = mappedModules.filter(m => m.status === 'Aktif');
        const inactiveModules = mappedModules.filter(m => m.status !== 'Aktif');

        res.render('ModulKonstruksi', {
            title: 'Modul Pembelajaran — PLN Pusdiklat',
            activeModules,
            inactiveModules,
            currentSort: sort
        });
    } catch(err) {
        console.error(err);
        res.render('ModulKonstruksi', {
            title: 'Modul Pembelajaran — PLN Pusdiklat',
            activeModules: [],
            inactiveModules: [],
            currentSort: 'newest'
        });
    }
});

app.get('/ModulKonstruksi/:id', async (req, res) => {
    const moduleId = req.params.id;
    try {
        const fetchRes = await fetch(`http://localhost:4000/api/modules/${moduleId}`);
        if (!fetchRes.ok) {
            return res.redirect('/ModulKonstruksi');
        }
        const moduleItem = await fetchRes.json();
        
        const mappedModule = {
            id: moduleItem.id,
            title: moduleItem.title,
            description: moduleItem.description,
            materialCount: moduleItem.materials ? moduleItem.materials.length : 0,
            equipmentCount: moduleItem.tools ? moduleItem.tools.length : 0,
            assets: moduleItem.assets || []
        };
        
        res.render('ModulViewer', {
            title: `${mappedModule.title} - PLN Pusdiklat 3D`,
            module: mappedModule
        });
    } catch(err) {
        console.error(err);
        res.redirect('/ModulKonstruksi');
    }
});

// Middleware Proteksi Rute Admin
const authGuard = (req, res, next) => {
    if (!req.cookies.auth_token) {
        return res.redirect('/login');
    }
    next();
};

// Admin login route
app.get('/login', (req, res) => {
    // Jika sudah ada cookie token, jangan biarkan login lagi, lempar ke admin
    if (req.cookies.auth_token) {
        return res.redirect('/admin');
    }
    res.render('login', { title: 'Login Admin - PLN Pusdiklat' });
});

// Helper Route: Set Session (Cookie)
app.post('/set-session', (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token missing' });

    // Set cookie (HttpOnly: false agar bisa dibaca client-side jika perlu, atau true untuk keamanan extra)
    // Di sini kita pakai default (Session Cookie - hilang saat browser tutup)
    res.cookie('auth_token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    });
    res.json({ success: true });
});

// Helper Route: Clear Session (Cookie)
app.get('/clear-session', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ success: true });
});

app.get('/admin-logout', (req, res) => {
    res.clearCookie('auth_token');
    res.redirect('/login');
});

// Admin routes - Menggunakan authGuard
app.use('/admin', authGuard, adminRouter);

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 PLN Pusdiklat Concept running on http://localhost:${PORT}`);
    console.log(`===============================================`);
});
