'use client';

import React, { useState } from 'react';
import PackingListWidget from '@/components/business/trip-result/PackingListWidget';
import AccommodationCard from '@/components/business/trip-result/AccommodationCard';
import { Trip, TripPlan } from '@/types';
import {
    FileText, CreditCard, Shirt, Bus, Clock, Utensils, HandCoins,
    Droplets, Phone, Cross, Sun, CloudRain, Package, Bed, ChevronDown, ChevronUp, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EssentialsViewProps {
    trip: Trip;
    plan: TripPlan;
}

interface SectionCardProps {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    items: { label: string; detail?: string }[];
}

function SectionCard({ icon, iconBg, title, items }: SectionCardProps) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-3 mb-1">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
                    {icon}
                </div>
                <h4 className="font-black text-slate-800 text-sm">{title}</h4>
            </div>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-2 shrink-0" />
                        <div>
                            <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                            {item.detail && (
                                <span className="text-xs text-slate-400 ml-1.5">{item.detail}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="w-2.5 h-10 bg-teal-600 rounded-full" />
                {title}
            </h2>
            <p className="text-slate-500 mt-2 font-medium">{subtitle}</p>
        </div>
    );
}

export default function EssentialsView({ trip, plan }: EssentialsViewProps) {
    const [showAccommodation, setShowAccommodation] = useState(false);

    const isInternational = trip.destination &&
        !['bali', 'lombok', 'yogyakarta', 'solo', 'jakarta', 'bandung', 'surabaya',
          'semarang', 'malang', 'medan', 'makassar', 'manado', 'flores', 'raja ampat',
          'komodo', 'labuan bajo'].some(d => trip.destination.toLowerCase().includes(d));

    const visaInfo = plan.arrival_guide?.visa_info;
    const localTransport = plan.arrival_guide?.primary_transport;

    const docItems = [
        isInternational
            ? { label: 'Paspor', detail: 'min. 6 bulan berlaku dari tanggal berangkat' }
            : { label: 'KTP / Identitas', detail: 'wajib untuk check-in hotel & tiket masuk' },
        ...(isInternational ? [{ label: 'Visa', detail: visaInfo || 'cek persyaratan visa sebelum berangkat' }] : []),
        { label: 'SIM', detail: 'jika berencana menyewa kendaraan' },
        { label: 'Kartu BPJS / Asuransi', detail: 'untuk keadaan darurat medis' },
        { label: 'Booking confirmation', detail: 'hotel, tiket, dan transportasi' },
    ];

    const moneyItems = [
        { label: 'Uang tunai (IDR)', detail: 'warung & pasar tradisional sering cash-only' },
        { label: 'Kartu debit/kredit', detail: 'ATM BCA/Mandiri tersedia di pusat kota' },
        { label: 'E-wallet (GoPay/OVO)', detail: 'untuk ojek online & QR payment' },
        { label: 'Budget darurat', detail: 'siapkan 10-15% ekstra dari total budget' },
    ];

    const clothingItems = [
        { label: 'Pakaian kasual + nyaman', detail: `${trip.trip_days} hari di ${trip.destination}` },
        { label: 'Sandal + sepatu tertutup', detail: 'untuk aktivitas outdoor & temple visit' },
        { label: 'Jas hujan / payung', detail: 'antisipasi hujan mendadak' },
        { label: 'Sunscreen + topi', detail: 'proteksi UV terutama siang hari' },
        ...(isInternational ? [{ label: 'Adaptor listrik', detail: 'cek tipe colokan negara tujuan' }] : []),
    ];

    const localTransportItems = [
        ...(localTransport ? [{ label: localTransport, detail: 'transport utama menuju destinasi' }] : []),
        { label: 'Ojek online (Gojek/Grab)', detail: 'tersedia di sebagian besar kota besar Indonesia' },
        { label: 'Taksi / rental mobil', detail: 'untuk kelompok atau dengan banyak barang' },
        { label: 'Angkutan umum lokal', detail: `sesuaikan dengan kondisi di ${trip.destination}` },
    ];

    const practicalItems = [
        { label: 'Jam buka tempat wisata', detail: 'umumnya 08.00–17.00, cek jadwal lokal' },
        { label: 'Hari libur nasional', detail: 'pantau kalender libur, bisa lebih ramai' },
        { label: 'Kultur tipping', detail: 'bukan wajib di Indonesia, tapi diapresiasi' },
        { label: 'Koneksi internet', detail: 'beli SIM lokal atau aktifkan roaming' },
    ];

    const safetyItems = [
        { label: 'Air minum', detail: 'gunakan air kemasan, hindari air keran langsung' },
        { label: 'Nomor darurat', detail: '112 (nasional), 119 (ambulans), 110 (polisi)' },
        { label: 'Fasilitas kesehatan', detail: `RS/klinik terdekat di ${trip.destination}` },
        { label: 'Obat-obatan pribadi', detail: 'bawa stok cukup + resep dokter jika perlu' },
        { label: 'Simpan nomor hotel', detail: 'dan nomor penting di kontak HP kamu' },
    ];

    return (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* 1. Persiapan Trip */}
            <section>
                <SectionHeader
                    title="Persiapan Trip"
                    subtitle={`Hal yang perlu kamu siapkan sebelum berangkat ke ${trip.destination}`}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SectionCard
                        icon={<FileText className="w-4 h-4 text-blue-600" />}
                        iconBg="bg-blue-50"
                        title="Dokumen"
                        items={docItems}
                    />
                    <SectionCard
                        icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
                        iconBg="bg-emerald-50"
                        title="Uang & Pembayaran"
                        items={moneyItems}
                    />
                    <SectionCard
                        icon={<Shirt className="w-4 h-4 text-purple-600" />}
                        iconBg="bg-purple-50"
                        title="Pakaian & Perlengkapan"
                        items={clothingItems}
                    />
                </div>
            </section>

            {/* 2. Info Praktis Kota Tujuan */}
            <section>
                <SectionHeader
                    title="Info Praktis"
                    subtitle={`Yang perlu kamu tahu saat sudah berada di ${trip.destination}`}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SectionCard
                        icon={<Bus className="w-4 h-4 text-orange-600" />}
                        iconBg="bg-orange-50"
                        title="Transportasi Lokal"
                        items={localTransportItems}
                    />
                    <SectionCard
                        icon={<Clock className="w-4 h-4 text-slate-600" />}
                        iconBg="bg-slate-100"
                        title="Hal Praktis Lainnya"
                        items={practicalItems}
                    />
                </div>
            </section>

            {/* 3. Keamanan & Kesehatan */}
            <section>
                <SectionHeader
                    title="Keamanan & Kesehatan"
                    subtitle="Tips penting agar perjalananmu aman dan nyaman"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SectionCard
                        icon={<Droplets className="w-4 h-4 text-sky-600" />}
                        iconBg="bg-sky-50"
                        title="Air & Makanan"
                        items={[
                            { label: 'Selalu minum air kemasan', detail: 'hindari air keran & es batu tidak jelas' },
                            { label: 'Pilih tempat makan ramai', detail: 'indikator makanan segar & banyak pembeli' },
                            { label: 'Bawa antimo & obat diare', detail: 'untuk antisipasi perut sensitif' },
                        ]}
                    />
                    <SectionCard
                        icon={<Phone className="w-4 h-4 text-red-600" />}
                        iconBg="bg-red-50"
                        title="Kontak Darurat"
                        items={safetyItems}
                    />
                </div>
            </section>

            {/* 4. Packing Checklist */}
            <section>
                <SectionHeader
                    title="Packing Checklist"
                    subtitle={`Daftar bawaan yang disarankan untuk ${trip.destination}`}
                />
                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <PackingListWidget packingList={plan.packing_list || []} className="p-4 md:p-8" />
                </div>
            </section>

            {/* 5. Strategic Stays — collapsible, will move to Logistics in MT-92 */}
            {plan.strategic_accommodation && plan.strategic_accommodation.length > 0 && (
                <section>
                    <button
                        onClick={() => setShowAccommodation(v => !v)}
                        className="flex items-center gap-3 w-full text-left mb-6 group"
                    >
                        <div className="flex items-center gap-3 flex-1">
                            <span className="w-2.5 h-10 bg-slate-300 group-hover:bg-teal-400 rounded-full transition-colors" />
                            <div>
                                <h2 className="text-3xl font-black text-slate-400 group-hover:text-slate-700 tracking-tight transition-colors">
                                    Strategic Stays
                                </h2>
                                <p className="text-slate-400 mt-1 text-sm font-medium">Rekomendasi area menginap</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold pr-1">
                            <Info className="w-3.5 h-3.5" />
                            Segera pindah ke Logistics
                            {showAccommodation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                    </button>

                    {showAccommodation && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                            {plan.strategic_accommodation.map((opt, i) => (
                                <AccommodationCard
                                    key={i}
                                    option={opt}
                                    tripContext={{
                                        destination: trip.destination,
                                        startDate: trip.start_date,
                                        days: trip.trip_days
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
