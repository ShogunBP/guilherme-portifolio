const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { DEFAULT_STATIC_PAGES, DEFAULT_WHATSAPP_SETTINGS } = require('./constants/settings');

// Usar diretório de dados se existir (Docker volume), senão usar diretório atual
const dataDir = fs.existsSync(path.join(__dirname, 'data')) 
  ? path.join(__dirname, 'data') 
  : __dirname;
const dbPath = path.join(dataDir, 'database.db');

// Garantir que o diretório existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Projects table
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    category_ids TEXT DEFAULT '[]',
    image_main TEXT NOT NULL,
    images_additional TEXT DEFAULT '[]',
    layout_type TEXT DEFAULT 'full',
    grid_config TEXT,
    featured BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'published',
    sort_order INTEGER DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_og_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Adicionar coluna sort_order se não existir (SQLite não suporta IF NOT EXISTS em ALTER TABLE)
  db.run(`ALTER TABLE projects ADD COLUMN sort_order INTEGER DEFAULT 0`, (err) => {
    // Ignorar erro se coluna já existir
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding sort_order column:', err);
    }
  });

  // Adicionar coluna status em categories se não existir
  db.run(`ALTER TABLE categories ADD COLUMN status TEXT DEFAULT 'published'`, (err) => {
    // Ignorar erro se coluna já existir
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding status column to categories:', err);
    }
  });

  // Adicionar coluna accessible_when_hidden em categories se não existir
  db.run(`ALTER TABLE categories ADD COLUMN accessible_when_hidden INTEGER DEFAULT 0`, (err) => {
    // Ignorar erro se coluna já existir
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding accessible_when_hidden column to categories:', err);
    }
  });

  // Adicionar coluna nav_section em categories se não existir
  db.run(`ALTER TABLE categories ADD COLUMN nav_section TEXT DEFAULT 'left'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding nav_section column to categories:', err);
    }
  });

  // Adicionar colunas name_html e description_html em categories se não existir
  db.run(`ALTER TABLE categories ADD COLUMN name_html TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding name_html column to categories:', err);
    }
  });

  db.run(`ALTER TABLE categories ADD COLUMN description_html TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding description_html column to categories:', err);
    }
  });

  // Adicionar colunas de SEO em categories se não existir
  db.run(`ALTER TABLE categories ADD COLUMN seo_title TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding seo_title column to categories:', err);
    }
  });

  db.run(`ALTER TABLE categories ADD COLUMN seo_description TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding seo_description column to categories:', err);
    }
  });

  db.run(`ALTER TABLE categories ADD COLUMN seo_og_image TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding seo_og_image column to categories:', err);
    }
  });

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#FFD84F',
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Analytics table
  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    page_path TEXT,
    project_id INTEGER,
    click_x INTEGER,
    click_y INTEGER,
    ip_hash TEXT,
    user_agent TEXT,
    device_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Admin users table
  db.run(`CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`);

  // Adicionar coluna updated_at em admin_users se não existir
  db.run(`ALTER TABLE admin_users ADD COLUMN updated_at DATETIME`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding updated_at column to admin_users:', err);
    }
  });

  // Site settings (key-value store)
  db.run(`CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Translations table
  db.run(`CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'pt',
    value TEXT NOT NULL,
    original_pt_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(key, language)
  )`);

  // Adicionar coluna original_pt_value se não existir
  db.run(`ALTER TABLE translations ADD COLUMN original_pt_value TEXT`, (err) => {
    // Ignorar erro se coluna já existir
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding original_pt_value column:', err);
    }
  });

  // Social links
  db.run(`CREATE TABLE IF NOT EXISTS social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    icon_type TEXT DEFAULT 'lucide',
    icon_value TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add offset columns to social_links if they don't exist
  db.run(`ALTER TABLE social_links ADD COLUMN icon_width REAL DEFAULT NULL`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding icon_width column:', err);
    }
  });
  db.run(`ALTER TABLE social_links ADD COLUMN icon_height REAL DEFAULT NULL`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding icon_height column:', err);
    }
  });
  db.run(`ALTER TABLE social_links ADD COLUMN icon_top REAL DEFAULT NULL`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding icon_top column:', err);
    }
  });
  db.run(`ALTER TABLE social_links ADD COLUMN icon_left REAL DEFAULT NULL`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding icon_left column:', err);
    }
  });

  // About profile (single row)
  db.run(`CREATE TABLE IF NOT EXISTS about_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    name TEXT,
    location TEXT,
    section_title TEXT,
    section_subtitle TEXT,
    bio_html TEXT,
    photo_url TEXT,
    birthdate TEXT,
    background_type TEXT DEFAULT 'color',
    background_color TEXT DEFAULT '#000000',
    background_image_url TEXT,
    cta_title TEXT,
    cta_description TEXT,
    cta_button_label TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const ensureAboutColumn = (definition) => {
    db.run(`ALTER TABLE about_profile ADD COLUMN ${definition}`, (err) => {
      if (err && !err.message.includes('duplicate column')) {
        console.error('Error adding column to about_profile:', err);
      }
    });
  };

  ensureAboutColumn(`background_type TEXT DEFAULT 'color'`);
  ensureAboutColumn(`background_color TEXT DEFAULT '#000000'`);
  ensureAboutColumn(`background_image_url TEXT`);
  ensureAboutColumn(`cta_title TEXT`);
  ensureAboutColumn(`cta_description TEXT`);
  ensureAboutColumn(`cta_button_label TEXT`);

  // Service sections
  db.run(`CREATE TABLE IF NOT EXISTS service_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add status column to service_sections if it doesn't exist
  db.run(`ALTER TABLE service_sections ADD COLUMN status TEXT DEFAULT 'published'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding status column to service_sections:', err);
    }
  });

  // Service items
  db.run(`CREATE TABLE IF NOT EXISTS service_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section_id INTEGER NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(section_id) REFERENCES service_sections(id) ON DELETE CASCADE
  )`);

  // Curriculum and Quote profile (single row)
  db.run(`CREATE TABLE IF NOT EXISTS curriculum_quote_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    page_name TEXT DEFAULT 'Currículo e Orçamento',
    slug TEXT,
    title TEXT,
    description TEXT,
    background_type TEXT DEFAULT 'color',
    background_color TEXT DEFAULT '#000000',
    background_image_url TEXT,
    status TEXT DEFAULT 'published',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Adicionar coluna slug se não existir
  db.run(`ALTER TABLE curriculum_quote_profile ADD COLUMN slug TEXT`, (err) => {
    // Ignorar erro se coluna já existir
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding slug column:', err);
    }
  });

  // Adicionar coluna status se não existir
  db.run(`ALTER TABLE curriculum_quote_profile ADD COLUMN status TEXT DEFAULT 'published'`, (err) => {
    // Ignorar erro se coluna já existir
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding status column:', err);
    }
  });

  // Service cards for quote page
  db.run(`CREATE TABLE IF NOT EXISTS service_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    services_list TEXT,
    value_pj TEXT,
    value_clt TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Curriculum files (PDFs)
  db.run(`CREATE TABLE IF NOT EXISTS curriculum_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    language TEXT NOT NULL,
    image_url TEXT,
    pdf_url TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Adicionar coluna status se não existir
  db.run(`ALTER TABLE service_cards ADD COLUMN status TEXT DEFAULT 'published'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding status column to service_cards:', err);
    }
  });

  db.run(`ALTER TABLE curriculum_files ADD COLUMN status TEXT DEFAULT 'published'`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding status column to curriculum_files:', err);
    }
  });

  // Adicionar novas colunas para service_cards (refatoração)
  db.run(`ALTER TABLE service_cards ADD COLUMN services TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding services column to service_cards:', err);
    }
  });
  db.run(`ALTER TABLE service_cards ADD COLUMN monthly_value_pj TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding monthly_value_pj column to service_cards:', err);
    }
  });
  db.run(`ALTER TABLE service_cards ADD COLUMN monthly_value_clt TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding monthly_value_clt column to service_cards:', err);
    }
  });
  db.run(`ALTER TABLE service_cards ADD COLUMN model TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding model column to service_cards:', err);
    }
  });
  db.run(`ALTER TABLE service_cards ADD COLUMN button_text TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding button_text column to service_cards:', err);
    }
  });
  db.run(`ALTER TABLE service_cards ADD COLUMN button_visible INTEGER DEFAULT 1`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding button_visible column to service_cards:', err);
    }
  });

  // Adicionar coluna pricings para a nova estrutura separada (refatoração)
  db.run(`ALTER TABLE service_cards ADD COLUMN pricings TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding pricings column to service_cards:', err);
    }
  });

  // Criar tabela pricings separada para gerenciamento independente
  db.run(`CREATE TABLE IF NOT EXISTS pricings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (card_id) REFERENCES service_cards(id) ON DELETE CASCADE
  )`, (err) => {
    if (err) {
      console.error('Error creating pricings table:', err);
    } else {
      console.log('[DATABASE] Tabela pricings criada com sucesso');
    }
  });

  // Criar índices para melhor performance na tabela pricings
  db.run(`CREATE INDEX IF NOT EXISTS idx_pricings_card_id ON pricings(card_id)`, (err) => {
    if (err && !err.message.includes('duplicate index')) {
      console.error('Error creating index on pricings.card_id:', err);
    }
  });
  db.run(`CREATE INDEX IF NOT EXISTS idx_pricings_sort_order ON pricings(sort_order)`, (err) => {
    if (err && !err.message.includes('duplicate index')) {
      console.error('Error creating index on pricings.sort_order:', err);
    }
  });

  // Migração: Mover preços existentes de services para pricings (se houver dados)
  db.get("SELECT COUNT(*) as count FROM service_cards WHERE services IS NOT NULL", (err, row) => {
    if (!err && row && row.count > 0) {
      console.log('[DATABASE] Migrando preços existentes para tabela pricings...');
      db.run(`
        INSERT INTO pricings (card_id, title, price, sort_order)
        SELECT 
          sc.id AS card_id,
          json_extract(s.value, '$.name') AS title,
          json_extract(s.value, '$.price') AS price,
          s.key + 1 AS sort_order
        FROM service_cards sc,
        json_each(sc.services) AS s
        WHERE json_extract(s.value, '$.price') IS NOT NULL
          AND json_extract(s.value, '$.price') != ''
          AND json_extract(s.value, '$.price') != '0'
      `, (migrationErr) => {
        if (migrationErr) {
          console.error('[DATABASE] Erro na migração de preços:', migrationErr);
        } else {
          console.log('[DATABASE] Migração de preços concluída');
        }
      });
    }
  });


  // Migração: Remover NOT NULL de image_url e pdf_url
  // SQLite não suporta ALTER COLUMN, então precisamos recriar a tabela
  db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='curriculum_files'", (err, row) => {
    if (!err && row && row.sql && row.sql.includes('image_url TEXT NOT NULL')) {
      console.log('[DATABASE] Migrando curriculum_files para permitir NULL em image_url e pdf_url...');
      db.serialize(() => {
        db.run(`CREATE TABLE curriculum_files_migration (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          language TEXT NOT NULL,
          image_url TEXT,
          pdf_url TEXT,
          sort_order INTEGER DEFAULT 0,
          status TEXT DEFAULT 'published',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        db.run(`INSERT INTO curriculum_files_migration SELECT * FROM curriculum_files`);
        db.run(`DROP TABLE curriculum_files`);
        db.run(`ALTER TABLE curriculum_files_migration RENAME TO curriculum_files`);
        console.log('[DATABASE] Migração de curriculum_files concluída');
      });
    }
  });

  // Create default categories
  const defaultCategories = [
    { name: 'Design Gráfico', slug: 'design-grafico', color: '#FFD84F', sort_order: 1 },
    { name: 'UX/UI Design', slug: 'ux-ui-design', color: '#FF6B6B', sort_order: 2 },
    { name: 'Vídeos', slug: 'videos', color: '#4ECDC4', sort_order: 3 },
    { name: '2D & 3D', slug: '2d-3d', color: '#95E1D3', sort_order: 4 },
    { name: 'Games', slug: 'games', color: '#F38181', sort_order: 5 },
    { name: 'Showroom', slug: 'showroom', color: '#AA96DA', sort_order: 6 }
  ];

  defaultCategories.forEach(cat => {
    db.run(
      `INSERT OR IGNORE INTO categories (name, slug, color, sort_order) VALUES (?, ?, ?, ?)`,
      [cat.name, cat.slug, cat.color, cat.sort_order]
    );
  });

  // Admin user será criado automaticamente na inicialização
});

// Função para inicializar o admin automaticamente
const initializeAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@thiagobahls.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Verificar se já existe admin
    const existing = await dbGet('SELECT id FROM admin_users WHERE email = ?', [adminEmail]);
    
    if (!existing) {
      console.log('🔐 Criando usuário admin automaticamente...');
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await dbRun(
        'INSERT INTO admin_users (email, password_hash) VALUES (?, ?)',
        [adminEmail, passwordHash]
      );
      console.log(`✅ Admin criado: ${adminEmail}`);
      console.log(`⚠️  IMPORTANTE: Altere a senha após o primeiro login!`);
    } else {
      console.log(`✅ Admin já existe: ${adminEmail}`);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar admin:', error);
  }
};

const initializeContentDefaults = async () => {
  try {
    // Home video default
    const defaultVideo = {
      sourceType: 'upload',
      videoUrl: '/Intro.mp4'
    };
    await dbRun(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO NOTHING`,
      ['home_video', JSON.stringify(defaultVideo)]
    ).catch(() => {});

    await dbRun(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO NOTHING`,
      ['static_pages', JSON.stringify({ pages: DEFAULT_STATIC_PAGES })]
    ).catch(() => {});

    await dbRun(
      `INSERT INTO site_settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO NOTHING`,
      ['whatsapp_settings', JSON.stringify(DEFAULT_WHATSAPP_SETTINGS)]
    ).catch(() => {});

    // Default social links
    const socialCount = await dbGet('SELECT COUNT(*) as count FROM social_links');
    if (!socialCount || socialCount.count === 0) {
      const defaultSocials = [
        {
          name: 'LinkedIn',
          url: 'https://linkedin.com/in/thiago-bahls-5b2778207/',
          icon_type: 'lucide',
          icon_value: 'linkedin'
        },
        {
          name: 'Email',
          url: 'mailto:thiagotbahls@outlook.com',
          icon_type: 'lucide',
          icon_value: 'mail'
        },
        {
          name: 'WhatsApp',
          url: 'https://api.whatsapp.com/send/?phone=5541996693399&text&type=phone_number&app_absent=0',
          icon_type: 'lucide',
          icon_value: 'whatsapp'
        }
      ];

      for (let i = 0; i < defaultSocials.length; i++) {
        const social = defaultSocials[i];
        await dbRun(
          `INSERT INTO social_links (name, url, icon_type, icon_value, sort_order)
           VALUES (?, ?, ?, ?, ?)`,
          [social.name, social.url, social.icon_type, social.icon_value, i + 1]
        );
      }
    }

    // About profile default
    await dbRun(
      `INSERT OR IGNORE INTO about_profile (
        id,
        name,
        location,
        section_title,
        section_subtitle,
        bio_html,
        photo_url,
        birthdate,
        background_type,
        background_color,
        background_image_url,
        cta_title,
        cta_description,
        cta_button_label
      )
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, 'color', '#000000', NULL, ?, ?, ?)`,
      [
        'Thiago Bahls',
        'Curitiba - PR',
        'Tudo começa com uma ideia.',
        'Talvez você queira abrir um negócio, quem sabe transformar um passatempo em algo mais sério. Ou então, tenha um projeto criativo pronto para ser compartilhado com o mundo. O que quer que seja, a forma como você conta sua história pode fazer toda a diferença.',
        `<p>SOU ESPECIALISTA EM DESIGN, PERITO NA CRIAÇÃO DE PROJETOS DE IDENTIDADE VISUAL, POSSUO TÉCNICO EM WEB DESIGN, BACHAREL EM DESIGN E PÓS-GRADUAÇÃO EM DESIGN VISUAL. SOU NATURAL DE CURITIBA, TENHO 28 ANOS E DE AMOR PELO DESIGN, FOTOGRAFIA, MÍDIAS SOCIAIS, SOFTWARES, APLICATIVOS, SITES, EDIÇÃO, MONTAGEM E CRIAÇÃO.</p>`,
        '',
        '1996-01-01',
        'Vamos conversar',
        'Envie uma mensagem e vamos transformar sua ideia em projeto.',
        'Chamar no WhatsApp'
      ]
    );

    await dbRun(
      `UPDATE about_profile
        SET background_type = COALESCE(background_type, 'color'),
            background_color = COALESCE(background_color, '#000000'),
            cta_title = COALESCE(cta_title, 'Vamos conversar'),
            cta_description = COALESCE(cta_description, 'Envie uma mensagem e vamos transformar sua ideia em projeto.'),
            cta_button_label = COALESCE(cta_button_label, 'Chamar no WhatsApp')
       WHERE id = 1`
    ).catch(() => {});

    // Default services
    const serviceCount = await dbGet('SELECT COUNT(*) as count FROM service_sections');
    if (!serviceCount || serviceCount.count === 0) {
      const defaultSections = [
        {
          title: 'DESIGN GRÁFICO',
          items: [
            'Logotipos',
            'Social Media',
            'Cartões/Agendas/Impressos',
            'Restauração de Fotografias',
            'Fotografia/Tratamento',
            'Edição e Montagem',
            'Direção de Arte',
            'Identidade Visual',
            'Manual de Marca',
            'Criação de Banners'
          ]
        },
        {
          title: 'DESIGN UX | UI',
          items: [
            'Desenvolvimento de Sites',
            'Desenvolvimento de Apps',
            'Desenvolvimento de Softwares',
            'Prototipagem (Protótipos de Projetos)',
            'Web Design',
            'Design Thinking',
            'Criação de Wireframes',
            'Design de Experiência do Usuário',
            'Design de Interface do Usuário',
            'Usabilidade',
            'Realização de Testes',
            'Solução de Problemas'
          ]
        },
        {
          title: 'MOTION',
          items: [
            'Gifs',
            'Reels',
            'Intro',
            'Vinheta',
            'Edição de Vídeos',
            'Tratamento em Vídeos',
            'Geração de FX (Efeitos)',
            'Edição de Vídeos em 3D',
            'Motion Design'
          ]
        },
        {
          title: 'DESIGN VETORIAL',
          items: [
            'Artes 2D',
            'Ilustração',
            'Desenho Técnico'
          ]
        },
        {
          title: '2D & 3D',
          items: [
            'Skins',
            'Armas',
            'Objetos',
            'Veículos',
            'Personagens'
          ]
        },
        {
          title: 'SHOWROOM | VEÍCULOS',
          items: [
            'Vinyl (Adesivos)',
            'Wraps (Ilustração)',
            'Paint (Mudança de cor)',
            'Tuning (Modificações)'
          ]
        }
      ];

      for (let sectionIndex = 0; sectionIndex < defaultSections.length; sectionIndex++) {
        const section = defaultSections[sectionIndex];
        const { id } = await dbRun(
          `INSERT INTO service_sections (title, sort_order) VALUES (?, ?)`,
          [section.title, sectionIndex + 1]
        );

        for (let itemIndex = 0; itemIndex < section.items.length; itemIndex++) {
          const item = section.items[itemIndex];
          await dbRun(
            `INSERT INTO service_items (section_id, label, sort_order) VALUES (?, ?, ?)`,
            [id, item, itemIndex + 1]
          );
        }
      }
    }
  } catch (error) {
    console.error('Erro ao inicializar conteúdo padrão:', error);
  }
};

// Inicializar admin e conteúdo padrão após as tabelas serem criadas
setImmediate(() => {
  initializeAdmin();
  initializeContentDefaults();
});

// Helper functions
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

module.exports = { db, dbAll, dbRun, dbGet };

