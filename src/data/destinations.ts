export interface DestinationData {
    slug: string
    name: string
    tagline: string
    landmark: string // primary landmark name, used for SVG generation prompt
    vibeCards: { emoji: string; title: string; subtitle: string }[]
    quickFacts: { bestTime: string; budget: string; duration: string }
    surprisingFact: string
    sejarah: string
    tipsLokal: { text: string; tags: string[] }[]
    hiddenGems: string // PRO only
}

const DESTINATIONS: Record<string, DestinationData> = {
    semarang: {
        slug: 'semarang',
        name: 'Semarang',
        tagline: 'Kota kolonial yang belum ditemukan banyak orang.',
        landmark: 'Lawang Sewu',
        vibeCards: [
            { emoji: '🏛️', title: 'Kolonial yang Hidup', subtitle: 'Arsitektur Belanda berdampingan dengan Chinatown yang ramai' },
            { emoji: '🍜', title: 'Surganya Lumpia', subtitle: 'Kuliner ikonik yang tidak akan kamu temukan seenak ini di kota lain' },
            { emoji: '🌊', title: 'Kota Pantai', subtitle: 'Antara laut Jawa dan bukit-bukit hijau di selatan' },
        ],
        quickFacts: {
            bestTime: 'April – Oktober',
            budget: 'Rp 250–400rb/hari',
            duration: '2–3 hari',
        },
        surprisingFact: 'Semarang punya lebih banyak bangunan kolonial yang masih berdiri daripada Batavia (Jakarta) — karena perang kemerdekaan tidak separah di sana. Kota Lama Semarang disebut "Little Netherlands" oleh wisatawan Eropa.',
        sejarah: 'Semarang berdiri sejak abad ke-15 sebagai pelabuhan penting di pesisir utara Jawa. Di bawah VOC Belanda, kota ini berkembang menjadi pusat perdagangan strategis yang menghubungkan Batavia dengan Surabaya. Lawang Sewu — yang berarti "seribu pintu" dalam bahasa Jawa — dibangun tahun 1907 sebagai kantor pusat perusahaan kereta api Belanda NIS. Arsitektur twin gothic towers-nya menjadi simbol ambisi kolonial yang kini menjadi ikon kota.',
        tipsLokal: [
            { text: 'Datang ke Lawang Sewu sebelum jam 9 pagi. Setelah itu akan penuh rombongan wisata dan panas terik.', tags: ['Lawang Sewu', 'Pagi hari'] },
            { text: 'Parkir di Stasiun Tawang, lalu jalan kaki ke semua spot Kota Lama. Jarak antar landmark tidak sampai 500 meter.', tags: ['Kota Lama', 'Jalan kaki'] },
            { text: 'Lumpia terenak bukan di tempat wisata. Cari warung lumpia di Gang Lombok — antri 20 menit tapi worth it.', tags: ['Kuliner', 'Gang Lombok'] },
        ],
        hiddenGems: 'Kampung Pelangi tersembunyi di balik bukit Semarang Selatan — 300-an rumah dicat warna-warni sebagai bagian dari program revitalisasi. Hampir tidak ada turis asing di sini. Terbaik dikunjungi Sabtu pagi saat warga berjemur dan aktivitas kampung ramai.',
    },

    yogyakarta: {
        slug: 'yogyakarta',
        name: 'Yogyakarta',
        tagline: 'Di mana budaya Jawa berdenyut paling kencang.',
        landmark: 'Borobudur',
        vibeCards: [
            { emoji: '🏯', title: 'Warisan Dunia', subtitle: 'Borobudur dan Prambanan — dua keajaiban dunia dalam satu kota' },
            { emoji: '🎭', title: 'Seni Hidup', subtitle: 'Batik, wayang, gamelan — bukan museum, tapi keseharian' },
            { emoji: '🌋', title: 'Bayang Merapi', subtitle: 'Gunung berapi aktif yang menjadi penjaga spiritual kota' },
        ],
        quickFacts: {
            bestTime: 'Mei – September',
            budget: 'Rp 200–350rb/hari',
            duration: '3–4 hari',
        },
        surprisingFact: 'Yogyakarta adalah satu-satunya provinsi di Indonesia yang dipimpin oleh seorang Sultan sebagai Gubernur — bukan karena warisan sejarah semata, tapi karena undang-undang khusus yang disahkan tahun 2012. Sultan Hamengkubuwono X memegang dua jabatan sekaligus: kepala kerajaan dan kepala pemerintahan daerah.',
        sejarah: 'Kerajaan Mataram Islam mendirikan Yogyakarta pada 1755 setelah Perjanjian Giyanti yang membelah kerajaan Jawa menjadi dua. Keraton Yogyakarta menjadi pusat budaya Jawa yang bertahan sampai hari ini. Saat revolusi kemerdekaan, Yogyakarta menjadi ibu kota Republik Indonesia sementara ketika Belanda menduduki Jakarta — peran historis yang membuat kota ini selalu punya tempat istimewa dalam identitas nasional.',
        tipsLokal: [
            { text: 'Sunrise Borobudur bukan tur biasa — kamu harus booking paket khusus Manohara Hotel. Tapi lihat Merapi dari atas stupa saat fajar adalah pengalaman yang tidak tergantikan.', tags: ['Borobudur', 'Sunrise'] },
            { text: 'Jalan Malioboro terbaik bukan malam hari saat ramai. Datanglah jam 7 pagi saat pedagang baru buka dan jalanan masih sepi.', tags: ['Malioboro', 'Pagi hari'] },
            { text: 'Beli batik langsung di workshop, bukan toko souvenir. Jetis dan Prawirotaman adalah area pembuat batik autentik. Harga bisa 40% lebih murah.', tags: ['Batik', 'Jetis', 'Prawirotaman'] },
        ],
        hiddenGems: 'Tebing Breksi — bekas tambang batu kapur yang telah diubah menjadi amphitheater alam dengan ukiran raksasa di dindingnya. Hanya 20 menit dari Prambanan, tapi hampir tidak ada di itinerary turis standar. Sunset dari tebing ini menghadap langsung ke siluet Merapi.',
    },

    bali: {
        slug: 'bali',
        name: 'Bali',
        tagline: 'Lebih dalam dari yang terlihat di Instagram.',
        landmark: 'Pura Tanah Lot',
        vibeCards: [
            { emoji: '🌺', title: 'Spiritual & Sakral', subtitle: 'Ribuan pura dan ritual harian yang masih dijalankan sepenuh hati' },
            { emoji: '🌊', title: 'Ombak & Ketenangan', subtitle: 'Dari surfing Kuta hingga meditasi di Ubud dalam satu pulau' },
            { emoji: '🍃', title: 'Sawah & Sunyi', subtitle: 'Terasering Tegalalang — arsitektur pertanian tertua di dunia' },
        ],
        quickFacts: {
            bestTime: 'April – Oktober',
            budget: 'Rp 350–700rb/hari',
            duration: '5–7 hari',
        },
        surprisingFact: 'Bali punya kalender sendiri — Pawukon — dengan siklus 210 hari, bukan 365. Setiap 210 hari ada hari raya Galungan yang merayakan kemenangan dharma atas adharma. Jika perjalananmu bertepatan dengan Galungan, kamu akan melihat seluruh pulau dipenuhi penjor — bambu melengkung berhias janur kuning setinggi 5 meter.',
        sejarah: 'Ketika kerajaan-kerajaan Jawa jatuh ke tangan Islam pada abad ke-15 dan 16, banyak seniman, bangsawan, dan pendeta Hindu melarikan diri ke Bali. Inilah mengapa Bali menjadi enklave Hindu-Jawa yang bertahan — bukan karena isolasi geografis, tapi karena migrasi budaya yang terencana. Tradisi seni Bali yang kita kenal hari ini — tari Kecak, wayang kulit, arsitektur pura — sebagian besar adalah warisan dari migrasi ini.',
        tipsLokal: [
            { text: 'Hindari Kuta dan Seminyak di July-August. Penuh turis Australia dan harga naik 50%. Canggu lebih chill dengan kafe yang sama bagusnya.', tags: ['Canggu', 'High season'] },
            { text: 'Sewa motor di Ubud adalah cara terbaik. Jalur sawah antara Ubud dan Tegalalang tidak bisa dinikmati dari mobil.', tags: ['Ubud', 'Tegalalang', 'Motor'] },
            { text: 'Ceremony pura bukan pertunjukan wisata — tidak semua bisa dimasuki. Tanya dulu ke pemilik penginapan lokal sebelum masuk ke area sakral.', tags: ['Pura', 'Etiket lokal'] },
        ],
        hiddenGems: 'Desa Penglipuran di Bangli — desa adat Bali yang terjaga kerapian arsitekturnya selama ratusan tahun. Semua rumah menghadap ke arah yang sama mengikuti konsep Tri Mandala. Hanya 45 menit dari Ubud, tapi sepi pengunjung karena tidak ada di itinerary paket tur standar.',
    },

    jakarta: {
        slug: 'jakarta',
        name: 'Jakarta',
        tagline: 'Kota yang tidak pernah tidur, dan tidak pernah membosankan.',
        landmark: 'Monas',
        vibeCards: [
            { emoji: '🏙️', title: 'Megapolitan Asia', subtitle: 'Kota dengan kontrast paling dramatis — pencakar langit di atas kampung kota' },
            { emoji: '🍽️', title: 'Surga Kuliner', subtitle: 'Dari warteg Rp 15rb sampai fine dining Michelin — semua ada' },
            { emoji: '🎨', title: 'Kreatif & Kontemporer', subtitle: 'Scene seni, musik, dan mode yang paling hidup di Indonesia' },
        ],
        quickFacts: {
            bestTime: 'Juni – September',
            budget: 'Rp 400–800rb/hari',
            duration: '2–3 hari',
        },
        surprisingFact: 'Jakarta tenggelam rata-rata 25 cm per tahun — salah satu yang paling cepat di dunia. Utara Jakarta sudah 4 meter di bawah permukaan laut. Inilah yang menjadi alasan utama pemindahan ibu kota ke Nusantara di Kalimantan.',
        sejarah: 'Jakarta bermula sebagai Sunda Kelapa, pelabuhan Kerajaan Sunda pada abad ke-12. Pada 1527, Fatahillah dari Demak merebutnya dan mengubah namanya menjadi Jayakarta ("kota kemenangan"). VOC Belanda kemudian mendirikan Batavia di atasnya pada 1619 — menjadikannya pusat imperium Belanda di Asia selama 200 tahun. Nama Jakarta kembali dipakai saat Jepang menduduki kota ini pada 1942, dan terus dipertahankan setelah kemerdekaan.',
        tipsLokal: [
            { text: 'Jangan sewa mobil — Jakarta macet adalah level tersendiri. TransJakarta lebih predictable untuk ke Museum Nasional, Kota Tua, dan SCBD.', tags: ['TransJakarta', 'Transportasi'] },
            { text: 'Kota Tua terbaik pada Minggu pagi. Sudirman area sebaliknya — sepi di akhir pekan, ramai hari kerja.', tags: ['Kota Tua', 'Sudirman', 'Weekend'] },
            { text: 'Warteg terenak bukan yang paling ramai, tapi yang paling bersih. Cari yang masakannya baru — fresh food turnover tinggi.', tags: ['Warteg', 'Kuliner lokal'] },
        ],
        hiddenGems: 'Kepulauan Seribu — archipelago 110 pulau yang bisa dicapai dengan kapal cepat 2 jam dari Ancol. Pulau Tidung dan Pulau Pari punya snorkeling yang underrated. Banyak Jakartans sendiri yang tidak pernah ke sana meski tinggal seumur hidup di Jakarta.',
    },

    bandung: {
        slug: 'bandung',
        name: 'Bandung',
        tagline: 'Paris van Java yang tidak perlu dibandingkan dengan Paris.',
        landmark: 'Gedung Sate',
        vibeCards: [
            { emoji: '🧥', title: 'Fashion Capital', subtitle: 'Pusat industri kreatif dan factory outlet terbaik di Indonesia' },
            { emoji: '☕', title: 'Kafe Estetik', subtitle: 'Densitas kafe per km² tertinggi di Jawa — setiap sudut ada spot foto' },
            { emoji: '🌿', title: 'Sejuk & Segar', subtitle: 'Dikelilingi gunung dan kebun teh — alam dalam jangkauan kota' },
        ],
        quickFacts: {
            bestTime: 'Sepanjang tahun (paling sejuk Juni–Agustus)',
            budget: 'Rp 200–450rb/hari',
            duration: '2–3 hari',
        },
        surprisingFact: 'Bandung adalah kota yang pernah menjadi ibu kota "dunia" — Konferensi Asia-Afrika 1955 diselenggarakan di Gedung Merdeka, Bandung, dan mengumpulkan 29 negara baru merdeka yang menolak memihak Amerika Serikat maupun Uni Soviet. Hasilnya: Dasasila Bandung, fondasi Gerakan Non-Blok.',
        sejarah: 'Bandung mulai berkembang pesat ketika Belanda memindahkan ibu kota dari Batavia ke Bandung pada rencana yang tidak pernah sepenuhnya terwujud. Namun infrastruktur art deco yang dibangun sejak 1920-an tetap bertahan: Gedung Sate, Hotel Savoy Homann, Villa Isola. Inilah mengapa Bandung mendapat julukan "Paris van Java" — bukan karena meniru Paris, tapi karena perencanaan kota Eropa yang ambisius di tengah tanah Sunda.',
        tipsLokal: [
            { text: 'Factory outlet terbaik bukan di Jalan Riau. Cari yang di Jalan Setiabudi dan Cihampelas — stok lebih update, pengunjung lebih sedikit.', tags: ['Factory outlet', 'Setiabudi'] },
            { text: 'Kebun teh Ciwidey 2 jam dari kota. Pergi sebelum weekend — Sabtu-Minggu penuh dengan piknik keluarga dan macet parah.', tags: ['Ciwidey', 'Kebun teh', 'Weekday'] },
            { text: 'Sarapan baso tahu di pasar tradisional sebelum ke mana-mana. Pasar Kosambi buka jam 5 pagi, sudah ramai pukul 7.', tags: ['Baso tahu', 'Kosambi', 'Sarapan'] },
        ],
        hiddenGems: 'Terowongan Lampegan di Cianjur Selatan — terowongan kereta api Belanda dari 1879 yang menembus bukit hijau. Hanya 90 menit dari Bandung, hampir tidak ada di itinerary wisata. Jika beruntung, kereta barang masih melintas — momen foto yang sangat dramatis.',
    },

    lombok: {
        slug: 'lombok',
        name: 'Lombok',
        tagline: 'Bali yang lebih sunyi, Rinjani yang lebih tinggi.',
        landmark: 'Gunung Rinjani',
        vibeCards: [
            { emoji: '🌋', title: 'Rinjani yang Megah', subtitle: 'Pendakian ke puncak 3.726m dengan crater lake berwarna tosca' },
            { emoji: '🏖️', title: 'Pantai Tersembunyi', subtitle: 'Kuta Lombok, Tanjung Aan, Selong Belanak — belum seramai Bali' },
            { emoji: '🕌', title: 'Pulau Seribu Masjid', subtitle: 'Budaya Sasak yang kuat dan kerajinan tenun tradisional' },
        ],
        quickFacts: { bestTime: 'April – Oktober', budget: 'Rp 250–450rb/hari', duration: '4–6 hari' },
        surprisingFact: 'Danau Segara Anak di kaldera Rinjani berada pada ketinggian 2.008 meter di atas permukaan laut dan memiliki anak gunung yang terus tumbuh di tengahnya bernama Gunung Baru Jari — bukti bahwa Rinjani masih aktif secara vulkanik.',
        sejarah: 'Lombok pernah dikuasai oleh Kerajaan Bali (Karangasem) selama lebih dari satu abad sebelum akhirnya menjadi bagian dari koloni Belanda pada 1894. Warisan dua budaya ini — Sasak Islam dan Hindu Bali — masih terlihat dalam arsitektur, seni, dan tradisi lokal.',
        tipsLokal: [
            { text: 'Pendakian Rinjani membutuhkan minimal 2 malam 3 hari. Jangan coba one-day hike — berbahaya dan tidak worthit.', tags: ['Rinjani', 'Pendakian'] },
            { text: 'Gili Trawangan padat. Coba Gili Nanggu atau Gili Sudak di selatan — snorkeling sama bagusnya, hampir tidak ada turis.', tags: ['Gili', 'Snorkeling'] },
        ],
        hiddenGems: 'Desa Sade — kampung adat Sasak yang masih mempertahankan rumah tradisional dengan lantai yang dipel menggunakan kotoran kerbau (konon membuat lantai lebih tahan dan berkilap). Satu-satunya tempat di Lombok yang bisa melihat kehidupan Sasak autentik.',
    },

    'labuan-bajo': {
        slug: 'labuan-bajo',
        name: 'Labuan Bajo',
        tagline: 'Ujung dunia yang baru mulai ditemukan.',
        landmark: 'Pulau Padar',
        vibeCards: [
            { emoji: '🦎', title: 'Komodo Dragon', subtitle: 'Satu-satunya tempat di dunia melihat kadal terbesar yang masih hidup' },
            { emoji: '⛵', title: 'Island Hopping', subtitle: 'Pulau Pink, Manta Point, Komodo — semua dalam satu perjalanan laut' },
            { emoji: '🌅', title: 'Sunset Padar', subtitle: 'Tiga teluk berwarna berbeda dilihat dari puncak bukit — salah satu view terbaik Indonesia' },
        ],
        quickFacts: { bestTime: 'April – Desember', budget: 'Rp 500–1.200rb/hari', duration: '3–5 hari' },
        surprisingFact: 'Komodo dragon (Varanus komodoensis) adalah predator terbesar yang masih hidup di darat. Air liurnya mengandung lebih dari 50 bakteri berbahaya — seekor rusa yang digigit akan mati dalam beberapa hari meski berhasil kabur. Populasi mereka hanya sekitar 5.700 ekor di dunia.',
        sejarah: 'Labuan Bajo baru dikenal luas setelah Taman Nasional Komodo masuk UNESCO World Heritage Site pada 1991. Sebelumnya hanya desa nelayan kecil. Pemerintah Indonesia menjadikannya salah satu dari "10 Bali Baru" dengan investasi infrastruktur besar sejak 2019.',
        tipsLokal: [
            { text: 'Sewa kapal phinisi untuk 2–3 hari adalah cara terbaik menikmati Labuan Bajo. Biaya dibagi dengan grup bisa sangat terjangkau.', tags: ['Phinisi', 'Island hopping'] },
            { text: 'Hindari musim hujan (Januari–Maret). Ombak tinggi dan banyak spot tidak bisa dikunjungi.', tags: ['Musim', 'Cuaca'] },
        ],
        hiddenGems: 'Cunca Rami — air terjun di dalam hutan tropis Flores yang hanya bisa dicapai dengan treking 2 jam dari desa Warloka. Kolamnya dingin dan jernih, hampir tidak ada turis. Kombinasi sempurna dengan kunjungan Komodo.',
    },

    medan: {
        slug: 'medan',
        name: 'Medan',
        tagline: 'Pintu gerbang Sumatera yang jujur dan kuat.',
        landmark: 'Istana Maimun',
        vibeCards: [
            { emoji: '🍜', title: 'Kuliner Paling Jujur', subtitle: 'Mie Aceh, Bika Ambon, Durian Ucok — tidak ada yang bisa berdebat soal ini' },
            { emoji: '🏛️', title: 'Warisan Deli', subtitle: 'Kesultanan Deli yang meninggalkan Istana Maimun dan Mesjid Raya' },
            { emoji: '🌿', title: 'Gerbang Danau Toba', subtitle: '4 jam ke danau vulkanik terbesar di dunia' },
        ],
        quickFacts: { bestTime: 'Sepanjang tahun', budget: 'Rp 200–400rb/hari', duration: '2–3 hari' },
        surprisingFact: 'Medan adalah kota terbesar ketiga di Indonesia setelah Jakarta dan Surabaya, namun hampir tidak pernah masuk itinerary turis internasional. Paradoksnya, bandara Kualanamu menghubungkan Medan langsung ke Kuala Lumpur, Singapura, dan Bangkok — menjadikannya hub tersembunyi Asia Tenggara.',
        sejarah: 'Medan tumbuh pesat di era kolonial sebagai pusat perkebunan tembakau Deli yang melegenda. Tembakau Deli dipakai sebagai pembungkus cerutu Havana kelas atas di Eropa. Warisan ini membentuk demografi Medan yang sangat beragam: Batak, Melayu, Jawa, Tionghoa, Tamil — semua hidup berdampingan.',
        tipsLokal: [
            { text: 'Durian Ucok di Jalan Iskandar Muda adalah benchmark durian Medan. Pilih sendiri, potong di tempat, makan langsung. Jangan tanya harga — bayar sesuai yang dimakan.', tags: ['Durian', 'Kuliner'] },
            { text: 'Tujuan wisata Medan yang sebenarnya adalah Danau Toba dan Berastagi. Medan hanya transit — maksimal 1 malam.', tags: ['Danau Toba', 'Berastagi'] },
        ],
        hiddenGems: 'Tjong A Fie Mansion — rumah seorang kapitan Tionghoa abad ke-19 yang kini jadi museum. Arsitekturnya menggabungkan gaya Melayu, Tionghoa, dan Eropa dalam satu bangunan. Hampir tidak ada di panduan wisata mana pun padahal hanya 10 menit dari Istana Maimun.',
    },

    makassar: {
        slug: 'makassar',
        name: 'Makassar',
        tagline: 'Kota pelaut yang tak pernah kehilangan arahnya.',
        landmark: 'Fort Rotterdam',
        vibeCards: [
            { emoji: '🦀', title: 'Seafood Terbaik', subtitle: 'Coto Makassar, Kepiting Soka, Pallubasa — langsung dari laut' },
            { emoji: '⚓', title: 'Jiwa Pelaut', subtitle: 'Bugis adalah suku pelaut legendaris yang mencapai Australia sebelum Eropa' },
            { emoji: '🌅', title: 'Sunset Trans Studio', subtitle: 'Pantai Losari dengan jajaran warung pisang epe menghadap Selat Makassar' },
        ],
        quickFacts: { bestTime: 'April – Oktober', budget: 'Rp 200–380rb/hari', duration: '2–3 hari' },
        surprisingFact: 'Orang Bugis Makassar adalah suku pelaut paling berpengaruh di Asia Tenggara. Kata "boogeyman" dalam bahasa Inggris diyakini berasal dari "Bugis man" — karena pelaut Bugis begitu ditakuti oleh pedagang Eropa di abad ke-17 dan 18.',
        sejarah: 'Makassar (dulu Ujung Pandang) adalah ibu kota Kerajaan Gowa yang pada abad ke-17 menguasai jalur perdagangan rempah-rempah antara Maluku dan seluruh Asia Tenggara. Fort Rotterdam dibangun VOC Belanda setelah menaklukkan Kerajaan Gowa pada 1667 — namun bangunannya menggunakan material dan tenaga kerja Makassar.',
        tipsLokal: [
            { text: 'Coto Makassar terbaik di warung-warung kecil gang, bukan restoran besar. Warung Coto Nusantara di Jalan Nusantara adalah benchmark yang aman.', tags: ['Coto', 'Kuliner'] },
            { text: 'Dari Makassar, Kepulauan Spermonde bisa dijangkau dengan kapal kayu 30–45 menit. Snorkeling di sana underrated.', tags: ['Spermonde', 'Snorkeling'] },
        ],
        hiddenGems: 'Pulau Samalona — 30 menit dari dermaga Makassar, pasir putih, air hijau toska, hampir tidak ada turis internasional. Bisa day trip tanpa perlu bermalam.',
    },

    surabaya: {
        slug: 'surabaya',
        name: 'Surabaya',
        tagline: 'Kota pahlawan yang tidak perlu membuktikan apa-apa.',
        landmark: 'Jembatan Suramadu',
        vibeCards: [
            { emoji: '⚔️', title: 'Jiwa Pahlawan', subtitle: 'Kota yang pertempuran 10 November-nya mengubah arah sejarah Indonesia' },
            { emoji: '🌊', title: 'Gateway Madura', subtitle: 'Jembatan Suramadu menghubungkan ke budaya Madura yang berbeda total' },
            { emoji: '🏙️', title: 'Kota Kedua Indonesia', subtitle: 'Metropolis yang bergerak dengan ritme berbeda dari Jakarta' },
        ],
        quickFacts: { bestTime: 'April – Oktober', budget: 'Rp 200–400rb/hari', duration: '2–3 hari' },
        surprisingFact: 'Pertempuran Surabaya 10 November 1945 adalah pertempuran urban terbesar dalam sejarah Asia pasca-Perang Dunia II. Arek-arek Surabaya yang kebanyakan bersenjata bambu runcing berhasil menghentikan sementara tentara Inggris yang baru menang dari Jepang. Ini yang menjadi dasar peringatan Hari Pahlawan.',
        sejarah: 'Surabaya sudah menjadi pelabuhan penting sejak era Majapahit abad ke-14. Di era kolonial, Belanda menjadikannya pelabuhan utama ekspor gula dan tembakau dari Jawa Timur. Nama "Surabaya" berasal dari legenda pertarungan antara sura (hiu) dan baya (buaya) — simbol keberanian yang masih menjadi ikon kota.',
        tipsLokal: [
            { text: 'Rawon Setan di Jalan Embong Malang buka dari malam sampai subuh. Rawon hitam dengan telur asin paling autentik Surabaya.', tags: ['Rawon', 'Kuliner', 'Malam'] },
            { text: 'Kampung Arab di Ampel adalah destinasi yang underrated. Wisata religi, kuliner Timur Tengah, dan suasana yang unik.', tags: ['Ampel', 'Kampung Arab'] },
        ],
        hiddenGems: 'House of Sampoerna — museum rokok kretek di dalam pabrik Sampoerna yang masih beroperasi sejak 1932. Kamu bisa melihat ratusan buruh melinting kretek dengan tangan di balik kaca. Gratis masuk, di tengah kawasan Eropa kota tua Surabaya.',
    },
}

export function getDestination(slug: string): DestinationData | null {
    return DESTINATIONS[slug.toLowerCase()] ?? null
}

export function getAllDestinationSlugs(): string[] {
    return Object.keys(DESTINATIONS)
}

export const FEATURED_DESTINATIONS = [
    DESTINATIONS.semarang,
    DESTINATIONS.yogyakarta,
    DESTINATIONS.bali,
    DESTINATIONS.jakarta,
    DESTINATIONS.bandung,
]
