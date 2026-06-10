export const EXAM_TYPES = [
  { id: "CPNS", name: "Ujian CPNS (SKD)", code: "id" },
  { id: "SKB", name: "Ujian SKB (Teknis)", code: "id" },
  { id: "SKB_PENATA_PERTANAHAN", name: "SKB Penata Pertanahan (BPN/ATR)", code: "id" },
];

export const SECTIONS = [
  { id: "TWK", name: "TWK", icon: "history_edu" },
  { id: "TIU", name: "TIU", icon: "psychology" },
  { id: "TKP", name: "TKP", icon: "groups" },
  { id: "Teknis", name: "Teknis", icon: "engineering" },
  { id: "Pertanahan_Dasar", name: "Pertanahan & Agraria", icon: "landscape" },
  { id: "Pengukuran_Kadastral", name: "Pengukuran & Pemetaan Kadastral", icon: "map" },
  { id: "Pendaftaran_Tanah", name: "Pendaftaran Tanah & Sertipikat", icon: "assignment" },
  { id: "Pengadaan_Tanah", name: "Pengadaan Tanah & Ganti Rugi", icon: "real_estate_agent" },
  { id: "Pengendalian_Pertanahan", name: "Pengendalian & Penertiban Tanah", icon: "policy" },
  { id: "Penilaian_Tanah", name: "Penilaian Tanah & Properti", icon: "price_check" },
];

export const FORMATS = [
  { id: "multiple_choice", name: "Multiple Choice", allowedExams: ["CPNS", "SKB"] },
  { id: "true_false_not_given", name: "Benar / Salah", allowedExams: ["CPNS", "SKB"] },
  { id: "fill_blank", name: "Isian Singkat", allowedExams: ["CPNS", "SKB"] },
  { id: "synonym", name: "Sinonim / Kosakata", allowedExams: ["CPNS", "SKB"] },
  { id: "grammar_in_context", name: "Tata Bahasa", allowedExams: ["CPNS", "SKB"] },
  { id: "sentence_completion", name: "Melengkapi Kalimat", allowedExams: ["CPNS", "SKB"] },
  { id: "cloze", name: "Cloze Test", allowedExams: ["CPNS", "SKB"] },
  { id: "reference", name: "Rujukan Kata", allowedExams: ["CPNS", "SKB"] },
  { id: "author_view", name: "Pandangan Penulis", allowedExams: ["CPNS", "SKB"] },
  { id: "matching_headings", name: "Mencocokkan Judul", allowedExams: ["CPNS", "SKB"] },
  { id: "matching_information", name: "Mencocokkan Informasi", allowedExams: ["CPNS", "SKB"] },
  { id: "summary_completion", name: "Melengkapi Ringkasan", allowedExams: ["CPNS", "SKB"] },
  { id: "matching_pairs", name: "Mencocokkan Pasangan", allowedExams: ["CPNS", "SKB"] },
  { id: "error_recognition", name: "Analisis Kesalahan", allowedExams: ["CPNS", "SKB"] },
  { id: "sentence_arrangement", name: "Menyusun Kalimat", allowedExams: ["CPNS", "SKB"] },
];

export const TOPICS = [
  // SKD - TWK
  "Nasionalisme", "Integritas", "Bela Negara", "Pilar Negara", "Bahasa Indonesia",
  // SKD - TIU
  "Analogi", "Silogisme", "Analitis", "Deret Angka", "Perbandingan Kuantitatif", "Soal Cerita", "Figural",
  // SKD - TKP
  "Pelayanan Publik", "Jejaring Kerja", "Sosial Budaya", "TIK", "Profesionalisme", "Anti Radikalisme",
  // SKB Teknis Umum
  "Manajemen Pemerintahan", "Hukum Administrasi Negara", "Kebijakan Publik",

  // ── SKB Penata Pertanahan ─────────────────────────────────────────────
  // 1. Hukum Agraria & Regulasi Pertanahan
  "Undang-Undang Pokok Agraria (UUPA No. 5 Tahun 1960)",
  "Hak Milik, Hak Guna Usaha, Hak Guna Bangunan, Hak Pakai",
  "Hak atas Tanah Adat dan Konversi Hak Lama",
  "Peraturan Pemerintah No. 24 Tahun 1997 tentang Pendaftaran Tanah",
  "Peraturan Pemerintah No. 18 Tahun 2021 tentang Hak Pengelolaan",
  "Peraturan Pemerintah No. 20 Tahun 2021 tentang Penertiban Kawasan dan Tanah Terlantar",
  "Peraturan Menteri ATR/BPN tentang Pendaftaran Tanah",
  "Kepala Badan Pertanahan Nasional dan Struktur Organisasi BPN",
  "Reforma Agraria dan Redistribusi Tanah",
  "Tanah Negara, Tanah Adat, dan Tanah Ulayat",
  "Pengaturan Pemilikan dan Penguasaan Tanah",
  "Larangan Pemilikan Tanah secara Absentee",

  // 2. Pendaftaran Tanah & Sertipikat
  "Sistem Pendaftaran Tanah Stelsel Negatif Bertendensi Positif",
  "Proses Pensertipikatan Tanah: Sporadis dan Sistematis",
  "Pendaftaran Tanah Sistematis Lengkap (PTSL)",
  "Buku Tanah dan Surat Ukur sebagai Produk Pendaftaran",
  "Sertipikat Hak Atas Tanah sebagai Tanda Bukti Hak",
  "Pemeliharaan Data Pendaftaran Tanah (Pembaruan Data)",
  "Balik Nama, Pemisahan, Pemecahan, dan Penggabungan Sertipikat",
  "Sertipikat Tanah Elektronik",
  "Pendaftaran Peralihan Hak Karena Jual Beli, Hibah, dan Waris",
  "Roya Hak Tanggungan dan Pencatatan Hak Tanggungan",
  "Pengumuman dan Penerbitan Sertipikat pada PTSL",
  "Kegiatan Pengumpulan Data Fisik dan Yuridis",

  // 3. Pengukuran & Pemetaan Kadastral
  "Dasar-Dasar Ilmu Ukur Tanah (Survei & Pemetaan)",
  "Pengukuran Batas Bidang Tanah dan Penentuan Batas",
  "Peta Bidang Tanah dan Gambar Situasi",
  "Peta Dasar Pendaftaran dan Peta Pendaftaran",
  "Sistem Koordinat Nasional (TM3)",
  "Penggunaan GPS/GNSS untuk Pengukuran Kadastral",
  "Drone dan Fotogrametri dalam Pemetaan Pertanahan",
  "Kadaster dan Sistem Informasi Pertanahan",
  "KKP (Komputerisasi Kegiatan Pertanahan) dan BHUMI",
  "Peta Tematik Pertanahan",
  "Peta Zona Nilai Tanah (ZNT)",
  "Identifikasi dan Delineasi Bidang Tanah",
  "Pengukuran Keliling dan Luas Bidang Tanah",
  "Rekonstruksi Batas Bidang Tanah",
  "Survei Kadastral Berbasis Partisipasi Masyarakat",

  // 4. Pengadaan Tanah & Ganti Rugi
  "Undang-Undang No. 2 Tahun 2012 tentang Pengadaan Tanah untuk Kepentingan Umum",
  "Peraturan Presiden No. 71 Tahun 2012 dan Perubahannya",
  "Tahapan Pengadaan Tanah: Perencanaan, Persiapan, Pelaksanaan, Penyerahan",
  "Penetapan Lokasi Pembangunan",
  "Inventarisasi dan Identifikasi Bidang Tanah yang Terkena Pengadaan",
  "Penilaian Ganti Kerugian oleh Penilai Publik",
  "Musyawarah Penetapan Bentuk Ganti Kerugian",
  "Penitipan Ganti Kerugian di Pengadilan (Konsignasi)",
  "Pengadaan Tanah untuk Proyek Strategis Nasional (PSN)",
  "Hak Pemegang Hak Atas Tanah dalam Pengadaan Tanah",
  "Ganti Rugi: Uang, Tanah Pengganti, Pemukiman Kembali, dan Kepemilikan Saham",
  "Pengadaan Tanah Skala Kecil (di bawah 5 hektar)",

  // 5. Pengendalian & Penertiban Tanah
  "Tanah Terlantar dan Proses Penertiban",
  "Penetapan Tanah Terlantar sesuai PP No. 20 Tahun 2021",
  "Redistribusi Tanah Terlantar sebagai Tanah Cadangan Umum Negara",
  "Penertiban Penguasaan Tanah Absentee",
  "Monitoring dan Evaluasi Penggunaan Tanah",
  "Pengendalian Alih Fungsi Lahan Pertanian",
  "Pemantauan Pemanfaatan Ruang dan Kesesuaian Tata Ruang",
  "Tata Cara Penyelesaian Sengketa Pertanahan",
  "Mediasi dan Pengaduan Sengketa Pertanahan di BPN",
  "Sengketa, Konflik, dan Perkara Pertanahan",
  "Pemberdayaan Tanah Masyarakat",

  // 6. Penilaian Tanah & Properti
  "Zona Nilai Tanah (ZNT) dan Nilai Indikasi Rata-Rata (NIR)",
  "Metode Penilaian Tanah: Perbandingan Data Pasar, Biaya, Pendapatan",
  "Peta ZNT sebagai Basis NJOP dan Pajak",
  "Penilai Publik dan Penilai Internal BPN",
  "Nilai Pasar dan Nilai Ganti Rugi",
  "Faktor-Faktor yang Mempengaruhi Nilai Tanah",
  "Penilaian Tanah untuk PTSL dan Pendaftaran",

  // 7. Tata Ruang & Rencana Penggunaan Tanah
  "Undang-Undang No. 26 Tahun 2007 tentang Penataan Ruang",
  "RTRW (Rencana Tata Ruang Wilayah) Nasional, Provinsi, Kabupaten/Kota",
  "Kesesuaian Tata Ruang dalam Penerbitan Izin dan Hak Atas Tanah",
  "Rencana Detail Tata Ruang (RDTR)",
  "Izin Peruntukan Penggunaan Tanah (IPPT)",
  "Pertanian Pangan Berkelanjutan dan Perlindungan Lahan Sawah",
  "Kawasan Lindung, Kawasan Budidaya, dan Kawasan Strategis",

  // 8. Teknologi Informasi Pertanahan
  "Aplikasi KKP (Komputerisasi Kegiatan Pertanahan)",
  "Layanan BHUMI dan Informasi Publik Pertanahan",
  "Sistem Informasi Geografis (SIG) dalam Pertanahan",
  "Electronic Land Registration System",
  "Data Spasial dan Non-Spasial Pertanahan",
  "Integrasi Data Pertanahan dengan OSS (Online Single Submission)",

  // 9. Etika & Pelayanan Publik Pertanahan
  "Standar Pelayanan Pertanahan di Kantor Pertanahan",
  "Penanganan Pengaduan Pelayanan Pertanahan",
  "Maklumat Pelayanan dan SOP BPN",
  "Integritas dan Anti-Korupsi dalam Pelayanan Pertanahan",
  "Jabatan Fungsional Penata Pertanahan: Tugas dan Kewenangan",
  "Angka Kredit dan Jenjang Jabatan Penata Pertanahan",
];
export const DIFFICULTIES = ["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];

export const QUESTION_COUNT_PRESETS = [
  { value: 5, label: "5 Soal", desc: "Drill cepat" },
  { value: 10, label: "10 Soal", desc: "Latihan fokus" },
  { value: 20, label: "20 Soal", desc: "Mini test" },
  { value: 40, label: "40 Soal", desc: "Full test" },
];
