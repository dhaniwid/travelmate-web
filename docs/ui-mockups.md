# Koleksi Mockup UI TravelMate

Dokumen ini berisi kumpulan mockup UI yang telah dikembangkan untuk proyek TravelMate, berfokus pada estetika premium, editorial, dan pengalaman pengguna yang intuitif.

---

## 🔒 1. Premium Login Experience
Konsep login dengan estetika premium yang menggunakan tipografi elegan dan visual yang imersif.

![Premium Login Parallax](./images/mockups/login_parallax.png)
*Desktop Concept: Menggunakan efek parallax dan tipografi serif yang elegan untuk kesan premium.*

![Mobile Login Vibe](./images/mockups/login_mobile.png)
*Mobile Concept: Fokus pada kemudahan akses dan visual yang membangkitkan keinginan untuk traveling.*

---

## 🛠️ 2. Advanced Trip Customization (TravelMate Copilot)
Fitur sinkronisasi logistik dan personalisasi itinerary berdasarkan preferensi user.

### A. Customization Modal
![Customization Modal](./images/mockups/customization_modal.png)
*Global Preferences: Modal untuk mengatur budget tier (Low/Med/High), gaya aktivitas, dan pantangan makanan.*

### B. Inline Activity Actions
![Inline Actions](./images/mockups/inline_actions.png)
*Direct Interaction: User dapat mengganti (Replace), menghapus (Delete), atau menambah aktivitas langsung dari timeline.*

### C. Activity Replacement Drawer
![Replacement Drawer](./images/mockups/replacement_drawer.png)
*Hybrid Engine: Drawer yang muncul untuk memberikan alternatif aktivitas cerdas jika user ingin mengganti itinerary.*

---

## 🎫 3. Trip Overview Card (V2)
Evolusi desain kartu ringkasan trip untuk efisiensi informasi dan estetika magazine-style.

![Overview Card V2](./images/mockups/overview_card_v2.png)
*V2 Concept: Menggunakan layout split dengan image latar belakang yang lebih dramatis dan badge status.*

![Overview Minimal](./images/mockups/overview_minimal.png)
*Minimal Option: Fokus pada tipografi dan keterbacaan tinggi dengan pembersihan elemen dekoratif yang berlebih.*

![Full Trip Detail](./images/mockups/full_trip_detail.png)
*Integration: Bagaimana kartu ringkasan berpadu dengan layout detail perjalanan secara keseluruhan.*

---

## 📖 4. Editorial Trip Story (Core Concepts)
Konsep awal narasi perjalanan yang membagi itinerary ke dalam beberapa "Phase".

![The Promise](./images/mockups/uploaded_media_1770251882600.png)
*Phase 1: The Promise - Kartu hero dengan Journey Arc dan statistik utama.*

![The Highlights](./images/mockups/uploaded_media_1770252890519.png)
*Phase 2: The Highlights - Menampilkan 3 pengalaman tak terlupakan.*

![The Blueprint](./images/mockups/uploaded_media_1770253105739.png)
*Phase 3: The Blueprint - Penjelasan tema per hari yang interaktif.*

---

## 🎨 Design Tokens & UI Specs (Developer Reference)

### Colors
- **Primary Teal:** `#0f766e` (teal-700)
- **Accent Mint:** `#14b8a6` (teal-500)
- **Dark Surface:** `#0f172a` (slate-900)
- **Glass Backdrop:** `rgba(255, 255, 255, 0.7)` with `backdrop-blur-md`

### Components Location
- **Itinerary Timeline:** `src/components/business/ItineraryTimeline.tsx`
- **Trip Results:** `src/components/business/TripResult.tsx`
- **Overview Card:** `src/components/common/TripOverviewCard.tsx`
