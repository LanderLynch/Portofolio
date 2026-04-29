(function () {
  const storageKey = "portfolio-language";
  const supportedLanguages = ["id", "en"];
  let currentLanguage = "id";
  let isApplyingTranslations = false;
  let hasInjectedLanguageSwitcher = false;
  let hasInjectedStyles = false;

  const keyedTranslations = {
    id: {
      "nav-home": "Beranda",
      "nav-about": "Tentang",
      "nav-experience": "Pengalaman",
      "nav-skills": "Keahlian",
      "nav-certification": "Pencapaian",
      "nav-projects": "Proyek",
      "nav-testimonials": "Buku Tamu",
      "nav-changelog": "Changelog",
      "nav-contact": "Kontak",
      "menu-kicker": "PORTOFOLIO",
      "menu-direct": "PESAN LANGSUNG",
      "hero-download-cv": "Unduh CV",
      "hero-certification": "Sertifikasi",
      "hero-explore-projects": "Lihat Proyek",
      "changelog-brand": "Changelog Portofolio",
      "changelog-back": "",
      "changelog-kicker": "Update Terbaru",
      "changelog-title": "Changelog Hari Ini",
      "changelog-desc": "Halaman ini menyimpan recap persis dari pekerjaan hari ini dalam satu tempat, dengan perubahan portofolio terbesar yang dikelompokkan seperti preview rilis.",
      "changelog-chip-scope": "Beranda, UI mobile, buku tamu, Firebase, maskot",
      "changelog-stat-areas": "Kelompok perubahan utama",
      "changelog-stat-day": "1 hari",
      "changelog-stat-session": "Sesi update terfokus",
      "changelog-stat-exact": "Recap persis",
      "changelog-stat-recap": "Ditulis dari pekerjaan yang benar-benar diimplementasikan hari ini",
      "changelog-preview-nav-kicker": "Navigasi",
      "changelog-preview-nav-title": "Beranda + mobile disegarkan",
      "changelog-preview-nav-desc": "Sidebar, topbar, akses bahasa, dan perapian menu mobile dimajukan bersama.",
      "changelog-preview-guestbook-kicker": "Buku Tamu",
      "changelog-preview-guestbook-title": "Alur identitas lebih rapi",
      "changelog-preview-guestbook-desc": "Tata letak avatar, upload Firebase, dan avatar kustom khusus pengguna ditambahkan lalu dirapikan.",
      "changelog-preview-system-kicker": "Sistem",
      "changelog-preview-system-title": "Kontrol bersama diperluas",
      "changelog-preview-system-desc": "Perpindahan bahasa, update cursor, dan refresh service worker diterapkan ke seluruh site.",
      "changelog-preview-webmeji-kicker": "Webmeji",
      "changelog-preview-webmeji-title": "Integrasi Furina",
      "changelog-preview-webmeji-desc": "Setup maskot diganti nama, diperluas, diperbesar, dan dibuat lebih dekat dengan perilaku XML Shimeji.",
      "changelog-entry-subtitle": "Recap persis dari sesi kerja portofolio hari ini.",
      "changelog-entry-today": "Hari Ini",
      "changelog-section-homepage": "Navigasi Beranda",
      "changelog-section-mobile": "Menu Mobile",
      "changelog-section-zoom": "Zoom Dan Skala Halaman",
      "changelog-section-language": "Sistem Bahasa",
      "changelog-section-guestbook": "Buku Tamu",
      "changelog-section-storage": "Firebase Storage",
      "changelog-section-certification": "Halaman Sertifikasi",
      "changelog-section-theme": "Utilitas Tema",
      "changelog-section-cursor": "Cursor",
      "changelog-section-webmeji": "Integrasi Webmeji",
      "changelog-section-furina": "Perilaku Furina",
      "changelog-section-pagefixes": "Perbaikan Halaman",
      "changelog-footer": "Halaman ini menampilkan changelog persis untuk hari ini. Update berikutnya bisa ditambahkan sebagai entri bertanggal baru dengan struktur yang sama.",
      "changelog-li-homepage-intro": "Banyak perombakan dilakukan pada navigasi beranda:",
      "changelog-li-homepage-switching": "menambahkan perpindahan desktop <code>sidebar / topbar</code>",
      "changelog-li-homepage-order": "mengubah urutan menu sidebar",
      "changelog-li-homepage-position": "menyesuaikan posisi vertikal sidebar beberapa kali",
      "changelog-li-homepage-language": "menambahkan toggle bahasa <code>ID / ENG</code> mengambang di homepage juga",
      "changelog-li-mobile-intro": "Menu mobile dibangun ulang:",
      "changelog-li-mobile-popout": "mengganti popout lama dengan menu mobile bergaya kaca yang lebih bersih",
      "changelog-li-mobile-profile": "menghapus blok profil/nama yang terlalu besar dari menu terbuka",
      "changelog-li-mobile-heights": "mengurangi tinggi tombol mobile",
      "changelog-li-mobile-controls": "memperbaiki kontrol atas mobile agar chip dan hamburger tidak duduk di dalam kapsul besar yang rusak",
      "changelog-li-zoom-intro": "UI zoom dihapus di seluruh site:",
      "changelog-li-zoom-hide": "menyembunyikan kontrol zoom di homepage dan halaman bersama",
      "changelog-li-zoom-default": "menjaga zoom default halaman di <code>80%</code>",
      "changelog-li-zoom-mobile": "menghapus tombol zoom di mobile saja saat diminta",
      "changelog-li-language-intro": "Menambahkan perpindahan bahasa di seluruh site:",
      "changelog-li-language-shared": "membuat penanganan bahasa bersama di <code>language-controls.js</code>",
      "changelog-li-language-persist": "membuat <code>ID / ENG</code> tersimpan dengan <code>localStorage</code>",
      "changelog-li-language-common": "menerjemahkan label umum, item navigasi, dan teks halaman di homepage, sertifikasi, serta halaman proyek",
      "changelog-li-guestbook-intro": "Fitur buku tamu dirombak:",
      "changelog-li-guestbook-mobile": "memperbaiki tata letak pesan buku tamu di mobile agar avatar bisa duduk di samping chat bubble",
      "changelog-li-guestbook-right": "memperbaiki alignment pesan sisi kanan/admin-author",
      "changelog-li-guestbook-upload": "menambahkan upload avatar kustom di pemilih avatar",
      "changelog-li-guestbook-storage": "menyimpan avatar yang diunggah di Firebase Storage per UID pengguna",
      "changelog-li-guestbook-reuse": "menjaga avatar yang diunggah tetap bisa dipakai ulang untuk pengguna yang sama",
      "changelog-li-storage-intro": "Setup Firebase Storage diperbarui:",
      "changelog-li-storage-path": "mendefinisikan <code>guestbook-avatars/{userId}/{fileName}</code>",
      "changelog-li-storage-rules": "menambahkan aturan upload/hapus yang aman hanya untuk pemilik yang sedang login",
      "changelog-li-storage-limit": "membatasi upload ke file gambar di bawah <code>2 MB</code>",
      "changelog-li-certification-intro": "Halaman sertifikasi ditingkatkan:",
      "changelog-li-certification-filter": "mengganti filter klik sederhana dengan UI pencarian + jenis/kategori",
      "changelog-li-certification-layout": "menambahkan tata letak filter bertumpuk di mobile dan baris desktop",
      "changelog-li-certification-soft": "menambahkan perilaku dropdown yang lebih lembut dan interaksi filter yang lebih halus",
      "changelog-li-theme-intro": "Penempatan utilitas tema desktop diubah:",
      "changelog-li-theme-palette": "memindahkan palet keluar dari grup zoom ke bar desktop kiri atas tersendiri",
      "changelog-li-theme-separation": "menjaga perilaku desktop dan mobile lebih terpisah dengan jelas",
      "changelog-li-cursor-intro": "Cursor kustom ditambahkan dan dituning:",
      "changelog-li-cursor-support": "menghubungkan dukungan cursor kustom melalui <code>theme-palettes.css</code>",
      "changelog-li-cursor-small": "beralih ke aset cursor kamu yang lebih kecil",
      "changelog-li-cursor-same": "membuat semua state cursor memakai gambar yang sama",
      "changelog-li-cursor-fix": "memperbaiki masalah cursor hilang yang disebabkan oleh gambar sumber yang terlalu besar",
      "changelog-li-webmeji-intro": "Dukungan maskot Webmeji diintegrasikan:",
      "changelog-li-webmeji-add": "menambahkan satu maskot yang berkeliaran di homepage, sertifikasi, dan halaman proyek",
      "changelog-li-webmeji-drag": "memperbaiki perhitungan drag untuk zoom <code>80%</code> di site",
      "changelog-li-webmeji-drop": "memperbaiki perhitungan jatuh maskot ke bagian bawah",
      "changelog-li-webmeji-rename": "mengganti nama setup maskot dari <code>miku</code> menjadi <code>Furina</code>",
      "changelog-li-webmeji-chase": "menambahkan perilaku gaya <code>ChaseMouse</code> dan <code>SitAndFaceMouse</code>",
      "changelog-li-webmeji-variants": "memperluas penggunaan frame Furina dengan varian <code>v2 / v3</code> yang tersedia",
      "changelog-li-webmeji-size": "memperbesar ukuran maskot beberapa kali hingga lebih besar dari setup awal",
      "changelog-li-furina-intro": "Perilaku Furina dikerjakan ulang agar lebih dekat ke logika XML Shimeji:",
      "changelog-li-furina-actions": "menambahkan rangkaian aksi yang lebih literal untuk duduk, melihat ke atas, memutar kepala, mengayun kaki, rebahan, merayap, berlari, dash, jatuh, dan memanjat",
      "changelog-li-furina-follow": "menambahkan rantai perilaku lanjutan yang lebih terstruktur setelah duduk/mengejar/jatuh",
      "changelog-li-pagefixes-intro": "Masalah khusus halaman diperbaiki:",
      "changelog-li-pagefixes-gfx": "memperbaiki background halaman <code>Personal GFX Design Collection</code> dengan menyelaraskan perilaku background <code>html</code> dan <code>body</code>",
      "changelog-li-pagefixes-cache": "merefresh banyak aset cache lewat bump versi service worker berulang agar perubahan benar-benar muncul",
    },
    en: {
      "nav-home": "Home",
      "nav-about": "About",
      "nav-experience": "Experience",
      "nav-skills": "Skill",
      "nav-certification": "Achievements",
      "nav-projects": "Projects",
      "nav-testimonials": "Guestbook",
      "nav-changelog": "Changelog",
      "nav-contact": "Contact",
      "menu-kicker": "PORTFOLIO",
      "menu-direct": "DIRECT MESSAGE",
      "hero-download-cv": "Download CV",
      "hero-certification": "Certification",
      "hero-explore-projects": "Explore Projects",
      "changelog-brand": "Portfolio Changelog",
      "changelog-back": "",
      "changelog-kicker": "Latest Update",
      "changelog-title": "Today's Changelog",
      "changelog-desc": "This page keeps today's exact work recap in one place, with the biggest portfolio changes grouped into a clean release-style preview.",
      "changelog-chip-scope": "Homepage, mobile UI, guestbook, Firebase, mascot",
      "changelog-stat-areas": "Major change groups",
      "changelog-stat-day": "1 day",
      "changelog-stat-session": "Focused update session",
      "changelog-stat-exact": "Exact recap",
      "changelog-stat-recap": "Written from today's implemented work",
      "changelog-preview-nav-kicker": "Navigation",
      "changelog-preview-nav-title": "Homepage + mobile refresh",
      "changelog-preview-nav-desc": "Sidebar, topbar, language access, and mobile menu cleanup all moved forward together.",
      "changelog-preview-guestbook-kicker": "Guestbook",
      "changelog-preview-guestbook-title": "Better identity flow",
      "changelog-preview-guestbook-desc": "Avatar layout, Firebase uploads, and user-specific custom avatars were added and refined.",
      "changelog-preview-system-kicker": "System",
      "changelog-preview-system-title": "Shared controls expanded",
      "changelog-preview-system-desc": "Language switching, cursor updates, and service-worker refreshes were rolled across the site.",
      "changelog-preview-webmeji-kicker": "Webmeji",
      "changelog-preview-webmeji-title": "Furina integration",
      "changelog-preview-webmeji-desc": "The mascot setup was renamed, expanded, resized, and pushed closer to the Shimeji XML behavior style.",
      "changelog-entry-subtitle": "Exact recap of today's portfolio work session.",
      "changelog-entry-today": "Today",
      "changelog-section-homepage": "Homepage Navigation",
      "changelog-section-mobile": "Mobile Menu",
      "changelog-section-zoom": "Zoom And Page Scale",
      "changelog-section-language": "Language System",
      "changelog-section-guestbook": "Guestbook",
      "changelog-section-storage": "Firebase Storage",
      "changelog-section-certification": "Certification Page",
      "changelog-section-theme": "Theme Utilities",
      "changelog-section-cursor": "Cursor",
      "changelog-section-webmeji": "Webmeji Integration",
      "changelog-section-furina": "Furina Behavior",
      "changelog-section-pagefixes": "Page Fixes",
      "changelog-footer": "This page shows today's exact changelog. Future updates can be added as new dated entries with the same structure.",
      "changelog-li-homepage-intro": "Reworked the homepage navigation a lot:",
      "changelog-li-homepage-switching": "added desktop <code>sidebar / topbar</code> switching",
      "changelog-li-homepage-order": "changed the sidebar menu order",
      "changelog-li-homepage-position": "adjusted sidebar vertical position several times",
      "changelog-li-homepage-language": "added the floating <code>ID / ENG</code> language toggle on the homepage too",
      "changelog-li-mobile-intro": "Rebuilt the mobile menu:",
      "changelog-li-mobile-popout": "replaced the older popout with a cleaner glass-style mobile menu",
      "changelog-li-mobile-profile": "removed oversized profile/name blocks from the opened menu",
      "changelog-li-mobile-heights": "reduced mobile button heights",
      "changelog-li-mobile-controls": "fixed the mobile top controls so the chip and hamburger don't sit inside a broken oversized capsule",
      "changelog-li-zoom-intro": "Removed zoom UI across the site:",
      "changelog-li-zoom-hide": "hid zoom controls on homepage and shared pages",
      "changelog-li-zoom-default": "kept page zoom defaulted to <code>80%</code>",
      "changelog-li-zoom-mobile": "removed zoom buttons on mobile only where requested",
      "changelog-li-language-intro": "Added sitewide language switching:",
      "changelog-li-language-shared": "created shared language handling in <code>language-controls.js</code>",
      "changelog-li-language-persist": "made <code>ID / ENG</code> persist with <code>localStorage</code>",
      "changelog-li-language-common": "translated common labels, nav items, and page text across homepage, certification, and project pages",
      "changelog-li-guestbook-intro": "Reworked guestbook features:",
      "changelog-li-guestbook-mobile": "improved mobile guestbook message layout so avatars can sit beside chat bubbles",
      "changelog-li-guestbook-right": "fixed right-side/admin-author message alignment",
      "changelog-li-guestbook-upload": "added custom avatar upload in the avatar chooser",
      "changelog-li-guestbook-storage": "stored uploaded avatars in Firebase Storage per user UID",
      "changelog-li-guestbook-reuse": "kept uploaded avatars reusable for that same signed-in user only",
      "changelog-li-storage-intro": "Updated Firebase Storage setup:",
      "changelog-li-storage-path": "defined <code>guestbook-avatars/{userId}/{fileName}</code>",
      "changelog-li-storage-rules": "added secure upload/delete rules for signed-in owners only",
      "changelog-li-storage-limit": "limited uploads to image files under <code>2 MB</code>",
      "changelog-li-certification-intro": "Improved the certification page:",
      "changelog-li-certification-filter": "replaced simple click filters with search + type/category filter UI",
      "changelog-li-certification-layout": "added mobile-friendly stacked filter layout and desktop row layout",
      "changelog-li-certification-soft": "added softer dropdown-style behavior and smoother filter interactions",
      "changelog-li-theme-intro": "Changed desktop theme/utility placement:",
      "changelog-li-theme-palette": "moved the palette out of the zoom group and into its own top-left desktop bar",
      "changelog-li-theme-separation": "kept desktop and mobile behavior separated more clearly",
      "changelog-li-cursor-intro": "Added and tuned custom cursors:",
      "changelog-li-cursor-support": "wired custom cursor support through <code>theme-palettes.css</code>",
      "changelog-li-cursor-small": "switched to your smaller cursor assets",
      "changelog-li-cursor-same": "made all cursor states use the same image",
      "changelog-li-cursor-fix": "fixed missing cursor issues caused by oversized source images",
      "changelog-li-webmeji-intro": "Integrated Webmeji mascot support:",
      "changelog-li-webmeji-add": "added one roaming mascot across homepage, certification, and project pages",
      "changelog-li-webmeji-drag": "fixed drag math for the site's <code>80%</code> zoom",
      "changelog-li-webmeji-drop": "fixed the mascot's drop-to-bottom math",
      "changelog-li-webmeji-rename": "renamed the mascot setup from <code>miku</code> to <code>Furina</code>",
      "changelog-li-webmeji-chase": "added <code>ChaseMouse</code> and <code>SitAndFaceMouse</code>-style behavior",
      "changelog-li-webmeji-variants": "expanded Furina frame usage with <code>v2 / v3</code> variants where available",
      "changelog-li-webmeji-size": "increased mascot size a few times, currently larger than the original setup",
      "changelog-li-furina-intro": "Reworked Furina behavior closer to Shimeji XML logic:",
      "changelog-li-furina-actions": "added more literal action-style sequences for sit, look up, spin head, dangle legs, lie down, crawl, run, dash, falling, and climbing",
      "changelog-li-furina-follow": "added more structured follow-up behavior chains after sitting/chasing/falling",
      "changelog-li-pagefixes-intro": "Fixed page-specific issues:",
      "changelog-li-pagefixes-gfx": "fixed the <code>Personal GFX Design Collection</code> page background mismatch by aligning <code>html</code> and <code>body</code> background behavior",
      "changelog-li-pagefixes-cache": "refreshed multiple cached assets through repeated service worker version bumps so changes actually show up",
    },
  };

  const sectionLabels = {
    home: { id: "Beranda", en: "Home" },
    about: { id: "Tentang", en: "About" },
    projects: { id: "Proyek", en: "Projects" },
    experience: { id: "Pengalaman", en: "Experience" },
    skills: { id: "Keahlian", en: "Skills" },
    certification: { id: "Pencapaian", en: "Achievements" },
    testimonials: { id: "Buku Tamu", en: "Guestbook" },
    changelog: { id: "Changelog", en: "Changelog" },
    contact: { id: "Kontak", en: "Contact" },
  };

  const skillWords = {
    id: ["DESAINER MULTIMEDIA", "DESAIN GRAFIS", "DESAINER GFX", "DESAIN UI/UX"],
    en: ["MULTIMEDIA DESIGNER", "GRAPHIC DESIGNER", "GFX DESIGNER", "UI/UX DESIGNER"],
  };

  const exactTextMap = Object.create(null);
  const exactAttributeMap = Object.create(null);

  function addPair(english, indonesian, bucket) {
    const target = bucket || exactTextMap;
    target[english] = { en: english, id: indonesian };
    target[indonesian] = { en: english, id: indonesian };
  }

  const textPairs = [
    ["Certification - Jona Setiawan", "Sertifikasi - Jona Setiawan"],
    ["Changelog - Jona Setiawan", "Changelog - Jona Setiawan"],
    ["Photography - Redirect", "Fotografi - Pengalihan"],
    ["Personal GFX Design Collection - Jona Setiawan", "Koleksi Desain GFX Pribadi - Jona Setiawan"],
    ["Logo Design Collection - Jona Setiawan", "Koleksi Desain Logo - Jona Setiawan"],
    ["Marketing & Assistant HR - Jona Setiawan", "Marketing & Asisten HR - Jona Setiawan"],
    ["Photography - Jona Setiawan", "Fotografi - Jona Setiawan"],
    ["Event Poster Campaign - Jona Setiawan", "Kampanye Poster Acara - Jona Setiawan"],
    ["Honkai: Star Rail E-Money Transit Series - Jona Setiawan", "Seri Transit E-Money Honkai: Star Rail - Jona Setiawan"],
    ["Lariso Brand Identity - Jona Setiawan", "Identitas Merek Lariso - Jona Setiawan"],
    ["Designer Bag on IKM - Jona Setiawan", "Desainer Tas di IKM - Jona Setiawan"],
    ["Documentary Kota Tua UKK - Jona Setiawan", "Dokumenter Kota Tua UKK - Jona Setiawan"],
    ["Zoom", "Zoom"],
    ["Palette", "Palet"],
    ["Redirecting to", "Mengalihkan ke"],
    ["Achievement Archive", "Arsip Pencapaian"],
    ["Certification", "Sertifikasi"],
    ["All Certifications", "Semua Sertifikasi"],
    ["Showing all certification groups and files.", "Menampilkan semua grup dan file sertifikasi."],
    ["Graphic Design MySkill Januari 2025", "Desain Grafis MySkill Januari 2025"],
    ["Accounting Fundamentals MySkill", "Dasar-Dasar Akuntansi MySkill"],
    ["Motivation Letter and Interview for Scholarship Preparation", "Surat Motivasi dan Wawancara untuk Persiapan Beasiswa"],
    ["Brand Identity Design", "Desain Identitas Merek"],
    ["Introduction to UX Research", "Pengantar Riset UX"],
    ["Content Marketing Strategy", "Strategi Content Marketing"],
    ["Color and Typography", "Warna dan Tipografi"],
    ["TOEFL Training PDFs", "PDF Pelatihan TOEFL"],
    ["Aryaduta Trainee Website Certification", "Sertifikasi Website Trainee Aryaduta"],
    ["Certification file from the Aryaduta trainee program website work.", "File sertifikasi dari pekerjaan website program trainee Aryaduta."],
    ["Aryaduta Trainee Performance Score", "Nilai Performa Trainee Aryaduta"],
    ["Kota Tangerang Competition Award 2024", "Penghargaan Lomba Kota Tangerang 2024"],
    ["No certifications here yet", "Belum ada sertifikasi di sini"],
    ["Skill Group", "Grup Keahlian"],
    ["About Me", "Tentang Saya"],
    ["Discover my journey, passions, and the story behind my work", "Temukan perjalanan, passion, dan cerita di balik karya saya"],
    ["Who Am I", "Siapa Saya"],
    ["I'm a multimedia designer who specializes in graphic design and visual communication. With a background in multimedia design, I create engaging visual content that tells compelling stories.", "Saya adalah desainer multimedia yang berfokus pada desain grafis dan komunikasi visual. Dengan latar belakang desain multimedia, saya menciptakan konten visual yang menarik dan mampu menyampaikan cerita yang kuat."],
    ["My Approach", "Pendekatan Saya"],
    ["I focus on creative storytelling through visual design, combining technical skills with artistic vision to deliver impactful multimedia experiences that resonate with audiences.", "Saya berfokus pada storytelling kreatif melalui desain visual, menggabungkan keterampilan teknis dengan visi artistik untuk menghadirkan pengalaman multimedia yang berdampak dan relevan bagi audiens."],
    ["Personal Info", "Info Pribadi"],
    ["My Creative Portfolio", "Portofolio Kreatif Saya"],
    ["Explore my latest multimedia design projects and creative solutions", "Jelajahi proyek desain multimedia terbaru dan solusi kreatif saya"],
    ["Professional Experience", "Pengalaman Profesional"],
    ["My journey through creative roles and multimedia projects - from past to present", "Perjalanan saya melalui berbagai peran kreatif dan proyek multimedia, dari masa lalu hingga sekarang"],
    ["Skill Tree", "Pohon Keahlian"],
    ["My Creative Skill Tree", "Pohon Keahlian Kreatif Saya"],
    ["A visual map of the tools and design strengths I connect when building GFX edits, branding pieces, UI concepts, and multimedia work.", "Peta visual dari tools dan kekuatan desain yang saya hubungkan saat membuat edit GFX, karya branding, konsep UI, dan pekerjaan multimedia."],
    ["Achievement Archive", "Arsip Pencapaian"],
    ["These are the certification files I have so far, including MySkill, skill, trainee, and competition records grouped into one page.", "Ini adalah file sertifikasi yang saya miliki sejauh ini, termasuk MySkill, skill, trainee, dan catatan kompetisi yang dikelompokkan dalam satu halaman."],
    ["Quick Access", "Akses Cepat"],
    ["Open the full certification page", "Buka halaman sertifikasi lengkap"],
    ["Inside the page, I added filter options for all certifications, MySkill, skill, trainee, and competition so everything stays grouped and easy to browse.", "Di dalam halaman, saya menambahkan opsi filter untuk semua sertifikasi, MySkill, skill, trainee, dan kompetisi agar semuanya tetap terkelompok dan mudah dijelajahi."],
    ["Guestbook", "Buku Tamu"],
    ["Feel free to share your thoughts, suggestions, questions, or anything else.", "Silakan bagikan pendapat, saran, pertanyaan, atau apa pun yang ingin kamu sampaikan."],
    ["Please sign in to join the conversation. Don't worry, your data is safe with us.", "Silakan masuk untuk bergabung dalam percakapan. Tenang, data kamu aman bersama kami."],
    ["Choose Avatar", "Pilih Avatar"],
    ["Add New Project", "Tambah Proyek Baru"],
    ["Let's create something meaningful", "Mari ciptakan sesuatu yang bermakna"],
    ["Multimedia designer focused on graphic design, branding, UI/UX, and visual storytelling.", "Desainer multimedia yang berfokus pada desain grafis, branding, UI/UX, dan storytelling visual."],
    ["Admin Panel", "Panel Admin"],
    ["Manage Firestore Projects", "Kelola Proyek Firestore"],
    ["Public visitors can read your project entries. Sign in as the admin to add or delete items from Firestore.", "Pengunjung publik dapat membaca entri proyek Anda. Masuk sebagai admin untuk menambah atau menghapus item dari Firestore."],
    ["Public portfolio mode. Sign in to manage projects.", "Mode portofolio publik. Masuk untuk mengelola proyek."],
    ["Personal GFX Design Collection", "Koleksi Desain GFX Pribadi"],
    ["An ongoing personal GFX project featuring character edits, poster compositions, layered effects, and typography experiments built from my latest design work.", "Proyek GFX pribadi yang terus berkembang dengan edit karakter, komposisi poster, efek berlapis, dan eksperimen tipografi dari karya desain terbaru saya."],
    ["IKM Design Creative Project", "Proyek Kreatif Desain IKM"],
    ["The main job work project focused on IKM design tasks and creative production for brand and bag-related visual needs.", "Proyek pekerjaan utama yang berfokus pada tugas desain IKM dan produksi kreatif untuk kebutuhan visual brand dan tas."],
    ["Marketing & Assistant HR", "Marketing & Asisten HR"],
    ["Training / PKL project at Fortress focused on marketing support, social media and advertisement tasks, plus assistant HR administration organized through an Excel-based workflow.", "Proyek pelatihan / PKL di Fortress yang berfokus pada dukungan pemasaran, media sosial, tugas iklan, serta administrasi asisten HR yang diatur melalui alur kerja berbasis Excel."],
    ["Event Poster Campaign", "Kampanye Poster Acara"],
    ["Eye-catching poster designs for events and campaigns featuring bold typography, vibrant colors, and compelling visual hierarchy.", "Desain poster menarik untuk acara dan kampanye dengan tipografi tegas, warna yang hidup, dan hierarki visual yang kuat."],
    ["Photography Archive", "Arsip Fotografi"],
    ["A living archive of client photography projects, organized by year with cover highlights and gallery previews for each shoot.", "Arsip aktif proyek fotografi klien yang diatur per tahun dengan highlight sampul dan pratinjau galeri untuk setiap sesi."],
    ["Lariso Brand Identity", "Identitas Merek Lariso"],
    ["A story-driven snack brand identity project built from logo construction to pouch packaging iteration, final mockup presentation, and branded invoice collateral.", "Proyek identitas merek camilan yang digerakkan oleh cerita, mulai dari konstruksi logo, iterasi kemasan pouch, presentasi mockup final, hingga invoice bermerek."],
    ["Honkai: Star Rail E-Money Transit Series", "Seri Transit E-Money Honkai: Star Rail"],
    ["A custom public transit card series that translates Honkai: Star Rail character energy into collectible everyday merchandise with print-ready production thinking.", "Seri kartu transportasi umum kustom yang menerjemahkan energi karakter Honkai: Star Rail menjadi merchandise koleksi sehari-hari dengan pendekatan produksi siap cetak."],
    ["Documentary Kota Tua UKK", "Dokumenter Kota Tua UKK"],
    ["School project documentation created in Kota Tua for a UKK assignment, focused on promoting the area through visual storytelling, editing, and supporting design assets.", "Dokumentasi proyek sekolah yang dibuat di Kota Tua untuk tugas UKK, berfokus pada promosi kawasan melalui storytelling visual, editing, dan aset desain pendukung."],
    ["Logo Design Collection", "Koleksi Desain Logo"],
    ["A collection of unique logo designs for various clients, showcasing versatility in brand identity creation and visual storytelling.", "Kumpulan desain logo unik untuk berbagai klien yang menampilkan fleksibilitas dalam pembuatan identitas merek dan storytelling visual."],
    ["Digital Content Creator", "Kreator Konten Digital"],
    ["Led multimedia projects for school events, creating digital content for presentations and promotional materials, and won recognition for creative excellence.", "Memimpin proyek multimedia untuk acara sekolah, membuat konten digital untuk presentasi dan materi promosi, serta meraih pengakuan atas keunggulan kreatif."],
    ["Marketing and Product Sales", "Pemasaran dan Penjualan Produk"],
    ["Promoted and sold steel door products to different customer bases, developed marketing strategies to increase brand awareness and sales, maintained customer databases in Excel, and tracked customer interactions, sales, and follow-up activities.", "Mempromosikan dan menjual produk pintu baja ke berbagai segmen pelanggan, mengembangkan strategi pemasaran untuk meningkatkan awareness dan penjualan, mengelola database pelanggan di Excel, serta melacak interaksi pelanggan, penjualan, dan aktivitas tindak lanjut."],
    ["Video Production Assistant", "Asisten Produksi Video"],
    ["Supported video production teams in creating engaging multimedia content for various platforms and mastered video editing techniques.", "Mendukung tim produksi video dalam membuat konten multimedia yang menarik untuk berbagai platform dan menguasai teknik editing video."],
    ["Freelance Graphic Designer & Photographer", "Desainer Grafis & Fotografer Freelance"],
    ["Headed to making project for poster, banner, and visual design, while also working as a documentary photographer in show events and live activities.", "Mengerjakan proyek poster, banner, dan desain visual sekaligus bekerja sebagai fotografer dokumenter untuk acara pertunjukan dan aktivitas langsung."],
    ["Sport Desk Staff - Sport Desk Management", "Staf Sport Desk - Manajemen Sport Desk"],
    ["Maintained accurate records for guest participation, rental agreements, and daily reporting to support operational efficiency, while also helping promote recreational activities and events so guests clearly understood the available facilities and services.", "Menjaga catatan partisipasi tamu, perjanjian sewa, dan laporan harian secara akurat untuk mendukung efisiensi operasional, sekaligus membantu mempromosikan aktivitas rekreasi dan acara agar tamu memahami fasilitas dan layanan yang tersedia."],
    ["Employed - Design Creative", "Karyawan - Desain Kreatif"],
    ["Creating visual communication assets and creative design materials to support branding, promotion, and company presentation needs.", "Membuat aset komunikasi visual dan materi desain kreatif untuk mendukung kebutuhan branding, promosi, dan presentasi perusahaan."],
    ["Branch 01", "Cabang 01"],
    ["Branch 02", "Cabang 02"],
    ["Branch 03", "Cabang 03"],
    ["Branch 04", "Cabang 04"],
    ["Branch 05", "Cabang 05"],
    ["Branch 06", "Cabang 06"],
    ["Branding", "Branding"],
    ["UI / UX", "UI / UX"],
    ["GFX Design", "Desain GFX"],
    ["Motion & Video", "Motion & Video"],
    ["Web Layout", "Tata Letak Web"],
    ["Creative Flow", "Alur Kreatif"],
    ["Creative Workflow", "Alur Kerja Kreatif"],
    ["Graphic design sits at the center of my process, connecting visual storytelling, interface thinking, motion, and polished presentation.", "Desain grafis berada di pusat proses saya, menghubungkan storytelling visual, pemikiran antarmuka, motion, dan presentasi yang rapi."],
    ["School Project", "Proyek Sekolah"],
    ["Project Type", "Jenis Proyek"],
    ["UKK School Assignment", "Tugas Sekolah UKK"],
    ["Focus", "Fokus"],
    ["Documentation, Branding, Promotion", "Dokumentasi, Branding, Promosi"],
    ["Main Tools", "Alat Utama"],
    ["Project Video", "Video Proyek"],
    ["Open Video Link", "Buka Tautan Video"],
    ["Read Project Story", "Baca Cerita Proyek"],
    ["Opening", "Pembuka"],
    ["Opening Narrative", "Narasi Pembuka"],
    ["Closing", "Penutup"],
    ["Closing Narrative", "Narasi Penutup"],
    ["Project Outcome", "Hasil Proyek"],
    ["Explore the Full Story of Kota Tua", "Jelajahi Cerita Lengkap Kota Tua"],
    ["Watch Video", "Tonton Video"],
    ["All rights reserved.", "Semua hak dilindungi."],
    ["Graphic Design", "Desain Grafis"],
    ["Duration", "Durasi"],
    ["Role", "Peran"],
    ["Status", "Status"],
    ["Completed", "Selesai"],
    ["Project Overview", "Ringkasan Proyek"],
    ["Poster Collection", "Koleksi Poster"],
    ["Design Approach", "Pendekatan Desain"],
    ["Client Work / Transit Card Series", "Pekerjaan Klien / Seri Kartu Transit"],
    ["Date", "Tanggal"],
    ["Category", "Kategori"],
    ["Client Work", "Pekerjaan Klien"],
    ["Section 1", "Bagian 1"],
    ["Section 2", "Bagian 2"],
    ["Section 3", "Bagian 3"],
    ["Character Adaptation & Layout", "Adaptasi Karakter & Tata Letak"],
    ["Front Layout Adaptation", "Adaptasi Tata Letak Depan"],
    ["Why the Layout Needed Restraint", "Mengapa Tata Letak Perlu Pengendalian"],
    ["Visual Translation Strategy", "Strategi Penerjemahan Visual"],
    ["Character Cropping", "Pemotongan Karakter"],
    ["Transit Chip Clearance", "Ruang Chip Transit"],
    ["UI Motif Balance", "Keseimbangan Motif UI"],
    ["Designer Bag on IKM", "Desainer Tas di IKM"],
    ["This page features work of the month on IKM. Choose a year, then choose a month, and the main panel will switch to the bag design shown for that period, including pouch, totebag, backpack, and travel bag concepts I created.", "Halaman ini menampilkan karya bulanan di IKM. Pilih tahun, lalu pilih bulan, dan panel utama akan berganti ke desain tas pada periode tersebut, termasuk konsep pouch, totebag, backpack, dan travel bag yang saya buat."],
    ["Quick Summary", "Ringkasan Cepat"],
    ["Years", "Tahun"],
    ["Format", "Format"],
    ["Work of the Month", "Karya Bulanan"],
    ["Bag Design IKM", "Desain Tas IKM"],
    ["Design Count", "Jumlah Desain"],
    ["6 Pieces", "6 Karya"],
    ["This page is focused on monthly IKM bag design work, so each selection highlights one design direction and its product idea for that month.", "Halaman ini berfokus pada karya desain tas IKM bulanan, jadi setiap pilihan menyoroti satu arah desain dan ide produk untuk bulan tersebut."],
    ["Select a Year", "Pilih Tahun"],
    ["Select a Month", "Pilih Bulan"],
    ["Select a Sort", "Pilih Urutan"],
    ["Featured Bag Design", "Desain Tas Unggulan"],
    ["Files in This Sort", "File pada Urutan Ini"],
    ["Client Work / Brand Identity", "Pekerjaan Klien / Identitas Merek"],
    ["The Brief & Hero Image", "Brief & Gambar Utama"],
    ["Building the Foundation With a Chef Mascot and Flexible Logo Variations", "Membangun Fondasi dengan Maskot Koki dan Variasi Logo yang Fleksibel"],
    ["Chef Mascot Construction", "Konstruksi Maskot Koki"],
    ["Round Social Variation", "Variasi Sosial Bulat"],
    ["Main Script Logo", "Logo Script Utama"],
    ["Iteration & Packaging Concepts", "Iterasi & Konsep Kemasan"],
    ["6 Months", "6 Bulan"],
    ["Logo Designer", "Desainer Logo"],
    ["Logo Collection", "Koleksi Logo"],
    ["Training / PKL Project", "Proyek Pelatihan / PKL"],
    ["Period", "Periode"],
    ["Purpose", "Tujuan"],
    ["Training / PKL", "Pelatihan / PKL"],
    ["Company", "Perusahaan"],
    ["Marketing Social Media", "Pemasaran Media Sosial"],
    ["Advertisement", "Iklan"],
    ["Open Web Table", "Buka Tabel Web"],
    ["Download Excel File", "Unduh File Excel"],
    ["Fortress Training Archive", "Arsip Pelatihan Fortress"],
    ["Original workbook source from the Fortress internship documentation.", "Sumber workbook asli dari dokumentasi magang Fortress."],
    ["Workbook File", "File Workbook"],
    ["Primary Output", "Output Utama"],
    ["Interactive Excel-style Web Table", "Tabel Web Bergaya Excel Interaktif"],
    ["Main Focus", "Fokus Utama"],
    ["Marketing Support", "Dukungan Pemasaran"],
    ["Still Going", "Masih Berjalan"],
    ["Personal Project", "Proyek Pribadi"],
    ["On-going", "Sedang Berjalan"],
    ["Photo Manipulation", "Manipulasi Foto"],
    ["This page now acts as a single place to showcase the GFX work you added into the project folder, with a layout built to keep every image visible and easy to browse.", "Halaman ini sekarang menjadi satu tempat untuk menampilkan karya GFX yang kamu tambahkan ke folder proyek, dengan tata letak yang dibuat agar setiap gambar tetap terlihat dan mudah dijelajahi."],
    ["This collection brings together personal edits, poster-style layouts, character-focused compositions, and visual experiments created as part of an ongoing GFX journey. The work blends sharp typography, layered effects, dramatic lighting, and high-contrast color treatment.", "Koleksi ini menyatukan edit pribadi, layout bergaya poster, komposisi yang berfokus pada karakter, dan eksperimen visual yang dibuat sebagai bagian dari perjalanan GFX yang terus berjalan. Karya-karya ini memadukan tipografi tajam, efek berlapis, pencahayaan dramatis, dan pengolahan warna kontras tinggi."],
    ["Instead of a traditional brand case study, the page is now centered on the real design pieces you uploaded so visitors can immediately see the range of your graphic style in one continuous gallery.", "Alih-alih studi kasus merek tradisional, halaman ini kini berpusat pada karya desain asli yang kamu unggah sehingga pengunjung bisa langsung melihat jangkauan gaya grafismu dalam satu galeri berkelanjutan."],
    ["Visual Direction", "Arah Visual"],
    ["Anime-inspired edits, poster layouts, strong focal points, and cinematic color contrast.", "Edit bergaya anime, tata letak poster, titik fokus yang kuat, dan kontras warna sinematik."],
    ["Core Strengths", "Kekuatan Utama"],
    ["Compositing, character framing, text placement, depth, and mood-building through color.", "Compositing, framing karakter, penempatan teks, kedalaman, dan pembentukan mood melalui warna."],
    ["Current Goal", "Tujuan Saat Ini"],
    ["Keep expanding the library of polished GFX pieces while refining speed, consistency, and originality.", "Terus memperluas koleksi karya GFX yang rapi sambil meningkatkan kecepatan, konsistensi, dan orisinalitas."],
    ["Software Used", "Perangkat Lunak yang Digunakan"],
    ["The current workflow is built around these two main tools.", "Alur kerja saat ini dibangun di sekitar dua tools utama ini."],
    ["All GFX Designs", "Semua Desain GFX"],
    ["Every item below is pulled from the local image files currently inside the design-gfx folder in this project.", "Setiap item di bawah ini diambil dari file gambar lokal yang saat ini berada di folder design-gfx dalam proyek ini."],
    ["Current Direction", "Arah Saat Ini"],
    ["Want to see more of my design work?", "Ingin melihat lebih banyak karya desain saya?"],
    ["Client Photography Archive", "Arsip Fotografi Klien"],
    ["Photography", "Fotografi"],
    ["A growing archive of client-to-client photography work, from event coverage and milestone documentation to portrait moments and atmosphere-driven storytelling.", "Arsip fotografi klien yang terus berkembang, mulai dari liputan acara dan dokumentasi momen penting hingga potret dan storytelling yang dibangun lewat suasana."],
    ["Archive Direction", "Arah Arsip"],
    ["This page is built as a reusable photography hub, so new shoots can be grouped by year without turning the portfolio into a cluttered image wall.", "Halaman ini dibuat sebagai hub fotografi yang bisa digunakan ulang, sehingga sesi baru dapat dikelompokkan per tahun tanpa membuat portofolio menjadi dinding gambar yang berantakan."],
    ["Latest Added", "Terbaru Ditambahkan"],
    ["Archive Overview", "Ringkasan Arsip"],
    ["Each photography project can live under its year, keep a short summary, and expand into a thumbnail gallery without needing a custom one-off page every time.", "Setiap proyek fotografi dapat berada di bawah tahunnya, memiliki ringkasan singkat, dan berkembang menjadi galeri thumbnail tanpa perlu halaman khusus baru setiap saat."],
    ["How This Page Is Organized", "Bagaimana Halaman Ini Diatur"],
    ["The archive is split by year first, then each shoot is shown as its own client project with a cover image, date, project type, and a thumbnail gallery.", "Arsip dibagi berdasarkan tahun terlebih dahulu, lalu setiap sesi ditampilkan sebagai proyek klien tersendiri dengan gambar sampul, tanggal, jenis proyek, dan galeri thumbnail."],
    ["What Fits Here", "Apa yang Cocok di Sini"],
    ["Client event coverage and ceremonial documentation", "Liputan acara klien dan dokumentasi seremonial"],
    ["Portrait sessions, group photos, and candid storytelling", "Sesi potret, foto kelompok, dan storytelling candid"],
    ["Future jobs from 2024, 2025, and 2026 in the same archive pattern", "Pekerjaan mendatang dari 2024, 2025, dan 2026 dalam pola arsip yang sama"],
    ["Photography archive directory", "Direktori arsip fotografi"],
    ["Load More Projects", "Muat Lebih Banyak Proyek"],
    ["Want a dedicated event gallery?", "Ingin galeri acara khusus?"],
    ["This archive format is ready to scale, and the active theme now stays synchronized with the rest of the portfolio while the gallery grows.", "Format arsip ini siap dikembangkan, dan tema aktif kini tetap selaras dengan portofolio lainnya seiring galeri berkembang."],
    ["Book a Session", "Pesan Sesi"],
    ["Open Contact Section", "Buka Bagian Kontak"],
    ["Preview", "Pratinjau"],
  ];

  const attributePairs = [
    ["Open zoom controls", "Buka kontrol zoom"],
    ["Reset zoom to default", "Atur ulang zoom ke default"],
    ["Zoom out", "Perkecil"],
    ["Zoom in", "Perbesar"],
    ["Change color theme", "Ganti tema warna"],
    ["Close menu", "Tutup menu"],
    ["Toggle Menu", "Buka menu"],
    ["Open Contact Section", "Buka Bagian Kontak"],
    ["Book a Session", "Pesan Sesi"],
  ];

  const dynamicPatterns = [
    {
      regex: /^(\\d+)\\s+local artworks$/i,
      en: (match) => `${match[1]} local artworks`,
      id: (match) => `${match[1]} karya lokal`,
    },
    {
      regex: /^(\\d+)\\s+projects\\s+·\\s+(\\d+)\\s+photos$/i,
      en: (match) => `${match[1]} projects · ${match[2]} photos`,
      id: (match) => `${match[1]} proyek · ${match[2]} foto`,
    },
    {
      regex: /^Showing\\s+(\\d+)\\s+of\\s+(\\d+)\\s+certification\\s+groups\\.$/i,
      en: (match) => `Showing ${match[1]} of ${match[2]} certification groups.`,
      id: (match) => `Menampilkan ${match[1]} dari ${match[2]} grup sertifikasi.`,
    },
  ];

  textPairs.forEach(([english, indonesian]) => addPair(english, indonesian));
  attributePairs.forEach(([english, indonesian]) => addPair(english, indonesian, exactAttributeMap));

  function normalizeLanguage(language) {
    return supportedLanguages.includes(language) ? language : "id";
  }

  function getStoredLanguage() {
    try {
      return normalizeLanguage(window.localStorage.getItem(storageKey));
    } catch (error) {
      return "id";
    }
  }

  function persistLanguage(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch (error) {
      // Ignore storage failures and keep the in-memory language active.
    }
  }

  function translateKey(key, language) {
    const nextLanguage = normalizeLanguage(language || currentLanguage);
    return keyedTranslations[nextLanguage]?.[key] || keyedTranslations.id[key] || key;
  }

  function getSectionLabel(sectionId, language) {
    const nextLanguage = normalizeLanguage(language || currentLanguage);
    return sectionLabels[sectionId]?.[nextLanguage] || sectionLabels[sectionId]?.id || sectionId;
  }

  function getSkillWords(language) {
    const nextLanguage = normalizeLanguage(language || currentLanguage);
    return skillWords[nextLanguage] || skillWords.id;
  }

  function translateExactValue(value, language, map) {
    if (typeof value !== "string") {
      return value;
    }

    const nextLanguage = normalizeLanguage(language || currentLanguage);
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return value;
    }

    const exactMatch = map[trimmedValue];
    if (exactMatch) {
      return value.replace(trimmedValue, exactMatch[nextLanguage]);
    }

    for (const pattern of dynamicPatterns) {
      const match = trimmedValue.match(pattern.regex);
      if (match) {
        return value.replace(trimmedValue, pattern[nextLanguage](match));
      }
    }

    return value;
  }

  function shouldTranslateNode(node) {
    const parent = node.parentElement;
    if (!parent) {
      return false;
    }

    return !["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"].includes(parent.tagName);
  }

  function applyExactTextTranslations(root, language) {
    const scope = root || document.body;
    if (!scope) {
      return;
    }

    const walker = document.createTreeWalker(
      scope,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return shouldTranslateNode(node) && node.nodeValue.trim()
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      },
    );

    const textNodes = [];
    while (walker.nextNode()) {
      textNodes.push(walker.currentNode);
    }

    textNodes.forEach((node) => {
      const nextValue = translateExactValue(node.nodeValue, language, exactTextMap);
      if (nextValue !== node.nodeValue) {
        node.nodeValue = nextValue;
      }
    });
  }

  function applyAttributeTranslations(root, language) {
    const scope = root || document.body;
    if (!scope || typeof scope.querySelectorAll !== "function") {
      return;
    }

    const attributes = ["title", "aria-label", "placeholder", "alt"];
    scope.querySelectorAll("*").forEach((element) => {
      attributes.forEach((attributeName) => {
        const currentValue = element.getAttribute(attributeName);
        if (!currentValue) {
          return;
        }

        const nextValue = translateExactValue(currentValue, language, exactAttributeMap);
        if (nextValue !== currentValue) {
          element.setAttribute(attributeName, nextValue);
        }
      });
    });
  }

  function applyKeyedTranslations(language) {
      document.querySelectorAll("[data-i18n-key]").forEach((element) => {
        const key = element.dataset.i18nKey;
        element.textContent = translateKey(key, language);
      });

      document.querySelectorAll("[data-i18n-html-key]").forEach((element) => {
        const key = element.dataset.i18nHtmlKey;
        element.innerHTML = translateKey(key, language);
      });
    }

  function syncLanguageButtons(language) {
    const nextLanguage = normalizeLanguage(language);

    document.querySelectorAll("[data-lang-value]").forEach((button) => {
      const isActive = button.dataset.langValue === nextLanguage;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function injectLanguageStyles() {
    if (hasInjectedStyles || document.getElementById("portfolio-language-style")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "portfolio-language-style";
    style.textContent = `
      .floating-language-toggle {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 120;
        display: inline-flex;
        gap: 0.35rem;
        padding: 0.35rem;
        border-radius: 999px;
        background: color-mix(in srgb, var(--panel-bg, rgba(255,255,255,0.92)) 92%, transparent);
        border: 1px solid color-mix(in srgb, var(--border, rgba(148,163,184,0.24)) 100%, transparent);
        box-shadow: 0 16px 36px rgba(15, 23, 42, 0.18);
        backdrop-filter: blur(16px);
      }

      .floating-language-toggle .mobile-language-btn {
        min-width: 3rem;
        min-height: 2.5rem;
        padding: 0 0.85rem;
        border: 1px solid color-mix(in srgb, var(--border, rgba(148,163,184,0.24)) 100%, transparent);
        border-radius: 999px;
        background: color-mix(in srgb, var(--surface, rgba(255,255,255,0.8)) 78%, white);
        color: var(--text, #1f2a44);
        font: inherit;
        font-size: 0.82rem;
        font-weight: 800;
        letter-spacing: 0.12em;
        cursor: pointer;
      }

      .floating-language-toggle .mobile-language-btn.is-active {
        background: color-mix(in srgb, var(--accent-soft, rgba(96,165,250,0.18)) 100%, white);
        border-color: color-mix(in srgb, var(--accent, #60a5fa) 48%, var(--border, rgba(148,163,184,0.24)));
      }

      @media (max-width: 720px) {
        .floating-language-toggle {
          right: 0.85rem;
          bottom: 0.85rem;
        }

        body.mobile-menu-open .floating-language-toggle {
          opacity: 0;
          pointer-events: none;
        }
      }
    `;

    document.head.appendChild(style);
    hasInjectedStyles = true;
  }

  function injectLanguageSwitcher() {
    if (hasInjectedLanguageSwitcher || document.querySelector(".floating-language-toggle")) {
      return;
    }

    injectLanguageStyles();

    const wrapper = document.createElement("div");
    wrapper.className = "floating-language-toggle";
    wrapper.setAttribute("aria-label", "Language switcher");
    wrapper.innerHTML = `
      <button class="mobile-language-btn" type="button" data-lang-value="id">ID</button>
      <button class="mobile-language-btn" type="button" data-lang-value="en">ENG</button>
    `;

    document.body.appendChild(wrapper);
    hasInjectedLanguageSwitcher = true;
  }

  function observeMutations() {
    if (!("MutationObserver" in window) || !document.body) {
      return;
    }

    const observer = new MutationObserver((mutations) => {
      if (isApplyingTranslations) {
        return;
      }

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          isApplyingTranslations = true;
          applyExactTextTranslations(node, currentLanguage);
          applyAttributeTranslations(node, currentLanguage);
          isApplyingTranslations = false;
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function applyTranslations(language, options) {
    const nextLanguage = normalizeLanguage(language);
    const shouldPersist = options?.persist !== false;

    currentLanguage = nextLanguage;
    document.documentElement.lang = nextLanguage;

    injectLanguageSwitcher();

    isApplyingTranslations = true;
    applyKeyedTranslations(nextLanguage);
    applyExactTextTranslations(document.body, nextLanguage);
    applyAttributeTranslations(document.body, nextLanguage);
    document.title = translateExactValue(document.title, nextLanguage, exactTextMap);
    syncLanguageButtons(nextLanguage);
    isApplyingTranslations = false;

    if (shouldPersist) {
      persistLanguage(nextLanguage);
    }

    document.dispatchEvent(
      new CustomEvent("portfolio-language-change", {
        detail: { language: nextLanguage },
      }),
    );

    return nextLanguage;
  }

  function handleLanguageSelection(event) {
    const languageButton = event.target.closest("[data-lang-value]");

    if (!languageButton) {
      return;
    }

    applyTranslations(languageButton.dataset.langValue);
  }

  document.addEventListener("click", handleLanguageSelection);

  window.portfolioLanguage = {
    applyTranslations,
    getCurrentLanguage: () => currentLanguage,
    getSectionLabel,
    getSkillWords,
    normalizeLanguage,
    storageKey,
    supportedLanguages: [...supportedLanguages],
    translateKey,
    translateText: (text, language) => translateExactValue(text, language, exactTextMap),
  };

  function initLanguageControls() {
    injectLanguageSwitcher();
    applyTranslations(getStoredLanguage(), { persist: false });
    observeMutations();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLanguageControls, { once: true });
  } else {
    initLanguageControls();
  }
})();
