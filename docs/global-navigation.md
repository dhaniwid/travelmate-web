🗺️ The Grand Map: TravelMate Architecture
Dokumen ini menjabarkan struktur navigasi dan hierarki informasi untuk TravelMate sebagai Super App.

1️⃣ Level 1: Global Navigation (App Shell)
Menu utama yang selalu dapat diakses dari mana saja (biasanya Sidebar di Desktop / Bottom Bar di Mobile).

Menu Item,Fungsi Utama,Fitur Kunci
🏠 Home,Command Center,"Active Trip Card, Quick Actions (Check Flight), Inspiration Feed."
✈️ My Trips,Library,"Tabs: Upcoming, Drafts, Past History."
🌏 Explore,Discovery,"(Future) Curated Itineraries, World Map, Articles."
👤 Profile,Personalization,"Travel Preferences, Saved Documents (Passport/Visa), Settings."

2️⃣ Level 2: Trip Context (The Workspace)
Menu spesifik yang muncul hanya ketika User membuka sebuah Trip. Navigasi berbentuk Sticky Tabs di bawah Header Trip.

A. 📊 Overview (Ringkasan)
Fungsi: Dashboard status perjalanan.

Isi: Judul Trip, Tanggal, Budget Dial (Real vs Limit), Status Booking (Logistics Bar), Cuaca.

B. 🗓️ Itinerary (Rencana Harian)
Fungsi: Core Planner (Timeline).

Isi: Day-by-day activities, Drag & Drop, Smart Alternatives, Map Preview (kecil).

C. 🎒 Essentials (Persiapan)
Fungsi: Manajemen barang & dokumen.

Isi: Smart Packing List (Checklist), Document Vault (Tiket/Voucher), Visa Info.

D. 🏨 Logistics (Transaksi)
Fungsi: Booking & Cost Management.

Isi: Arrival Guide (Flights), Strategic Stays (Hotels), Transport Options. Disini tempat integrasi Affiliate/Payment.

E. 🗺️ Map (Geospasial)
Fungsi: Visualisasi spasial.

Isi: Full-screen map, Filter by Category, Route View.

🛠️ Atlas Technical Plan: Next.js Routing Refactor
Untuk mendukung visi ini, kita tidak bisa lagi menumpuk semua kode di satu file page.tsx. Kita harus memanfaatkan kekuatan Next.js App Router (Nested Layouts).

Berikut adalah rencana refactoring struktur folder (/src/app):

📂 Struktur Folder Baru (Proposed)

src/app/
├── (auth)/                 # Login/Register pages
├── (dashboard)/            # Level 1 Layout (Sidebar + TopNav)
│   ├── layout.tsx          # Shell Global
│   ├── home/               # /home
│   ├── explore/            # /explore
│   ├── profile/            # /profile
│   └── trips/              # /trips (List View)
│       ├── page.tsx
│       └── [tripId]/       # Level 2 Layout (Trip Context)
│           ├── layout.tsx  # Sticky Header + Tabs Navigation
│           ├── page.tsx    # Redirects to /overview
│           ├── overview/   # /trips/123/overview
│           ├── itinerary/  # /trips/123/itinerary
│           ├── logistics/  # /trips/123/logistics
│           ├── essentials/ # /trips/123/essentials
│           └── map/        # /trips/123/map
└── api/                    # Backend API Routes

🚀 M-104: ROUTING & LAYOUT IMPLEMENTATION PLAN
Ini adalah langkah-langkah teknis yang perlu disiapkan:

Phase 1: Component Splitting (Persiapan)

Pecah TripDetail.tsx yang raksasa saat ini menjadi komponen-komponen terisolasi:

TripOverviewView.tsx

TripItineraryView.tsx (Timeline)

TripLogisticsView.tsx (Arrival Guide + Budget)

TripEssentialsView.tsx (Packing + Accomm)

Phase 2: The Layout Wrapper

Buat file src/app/(dashboard)/trips/[tripId]/layout.tsx.

File ini akan memuat:

TripHeader (Compact Version) - Sesuai M-103.

StickyTabNavigation - Komponen Client Component yang berisi Link ke masing-masing sub-route.

{children} - Area dinamis untuk konten.

Phase 3: Data Fetching Strategy (Server vs Client)

Tantangan: Kita tidak mau fetch data Trip yang sama berulang kali saat pindah tab.

Solusi:

Option A (Simpel): Fetch di layout.tsx (Server Component), lalu pass data ke Context Provider (TripProvider). Semua child page mengakses data dari Context.

Option B (Robust): Gunakan TanStack Query (React Query) dengan hydration. Data di-cache di client, perpindahan tab jadi instan tanpa loading.

Phase 4: Execution

Kita mulai migrasi halaman satu per satu, dimulai dari memisahkan Itinerary dan Logistics ke URL yang berbeda agar "Deep Linking" bekerja (contoh: user bisa share link langsung ke Packing List mereka).