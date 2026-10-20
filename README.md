# 🍯 HoneyCake — Smart Self-Ordering Café

HoneyCake adalah sistem **Smart Self-Ordering Café** berbasis web modern yang dirancang dengan **Arsitektur Decoupled** (pemisahan penuh antara Frontend dan Backend). Pelanggan dapat memesan makanan dan minuman secara mandiri langsung dari meja mereka melalui pemindaian kode QR tanpa perlu mengunduh aplikasi, sementara staf dan kasir kafe dapat mengelola antrean pesanan di dapur dan memproses pembayaran tagihan meja secara terintegrasi.

---

## 🚀 Tech Stack

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Frontend** | [Vue.js 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) | *Mobile-first* untuk pelanggan, responsif untuk staf/admin dashboard |
| **State Management** | [Pinia](https://pinia.vuejs.org/) | Reaktif untuk sesi meja, keranjang belanja, dan autentikasi |
| **Backend** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) | RESTful API terstruktur dengan middleware modular |
| **Database** | [PostgreSQL](https://www.postgresql.org/) ([Supabase](https://supabase.com/)) | Basis data relasional tangguh |
| **ORM** | [Prisma ORM](https://www.prisma.io/) | Type-safe schema modeling, migrations, dan client query builder |
| **Autentikasi** | **JWT** & **Table Session Token** | JWT untuk Staf/Admin, token sesi meja unik untuk pelanggan |

---

## 🏛️ Arsitektur Sistem (Decoupled)

```mermaid
flowchart TD
    subgraph Pelanggan ["📱 Customer Mobile Web App"]
        C1["Scan QR Meja / Buka URL"] --> C2["Katalog Menu & Keranjang"]
        C2 --> C3["Kirim Pesanan (Session Token)"]
        C3 --> C4["Lacak Status (Pending/Preparing/Ready)"]
        C4 --> C5["Minta Tagihan (E-Wallet / M-Banking / Cashier)"]
    end

    subgraph Backend ["⚡ Express.js Backend API (Port 5000)"]
        B1["Middleware verifyJWT"]
        B2["Middleware verifyTableSession"]
        B3["Controllers: Auth, Table, Menu, Order"]
        B4["Prisma ORM Client"]
        B1 --> B3
        B2 --> B3
        B3 --> B4
    end

    subgraph Database ["🐘 PostgreSQL (Supabase)"]
        D1[("users")]
        D2[("table_sessions")]
        D3[("menus")]
        D4[("orders")]
    end

    subgraph Dashboard ["💻 Staff & Admin Dashboard"]
        S1["Generator QR Meja"]
        S2["Dapur / Kitchen Kanban Board"]
        S3["Meja Kasir & Tutup Sesi"]
        S4["Kelola Menu (Admin CRUD)"]
    end

    Pelanggan <-->|REST API + Session Token| Backend
    Dashboard <-->|REST API + Bearer JWT| Backend
    B4 <--> Database
```

---

## 🗄️ Database Schema (`schema.prisma`)

Skema basis data telah didefinisikan secara lengkap di `backend/prisma/schema.prisma`:

1. **`User`**:
   - `id` (UUID), `name`, `email` (unique), `password` (bcrypt hash), `role` (`admin` / `staff`), `createdAt`.
2. **`TableSession`**:
   - `id` (UUID), `tableNumber` (Int), `sessionToken` (String unique), `status` (`ACTIVE`, `BILL_REQUESTED`, `CLOSED`), `paymentMethod` (`M-Banking`, `E-Wallet`, `Cashier`), `createdAt`, `closedAt`.
3. **`Menu`**:
   - `id` (UUID), `name`, `category`, `price` (Int), `description`, `imageUrl`, `isAvailable` (Boolean), `createdAt`.
4. **`Order`**:
   - `id` (UUID), `sessionId` (relasi Foreign Key ke `TableSession`), `tableNumber` (Int), `orderItems` (JSON array: menuId, name, price, quantity, notes), `subtotal` (Int), `orderStatus` (`PENDING`, `PREPARING`, `READY`, `DELIVERED`), `createdAt`.

---

## 📡 Daftar Endpoint RESTful API

Base URL: `http://localhost:5000/api/v1`

### 1. Autentikasi Staf / Admin
- `POST /auth/login` — Login staf atau admin, mengembalikan token JWT.
- `GET /auth/me` *(Protected JWT)* — Mengambil profil pengguna yang sedang login.

### 2. Manajemen Meja & Sesi
- `POST /tables/generate-qr` *(Protected JWT)* — Membuat token sesi meja baru dan URL QR code.
- `GET /tables/session/:token` *(Public)* — Validasi token sesi saat pelanggan memindai QR code.
- `POST /tables/request-bill` *(Protected Table Session)* — Pelanggan meminta tagihan dan memilih metode pembayaran (`E-Wallet`, `M-Banking`, `Cashier`). Mengubah status menjadi `BILL_REQUESTED` dan mengunci pemesanan baru.
- `PATCH /tables/close-session/:id` *(Protected JWT)* — Kasir memproses pembayaran dan menutup sesi meja (`CLOSED`).
- `GET /tables/active` *(Protected JWT)* — Mengambil seluruh daftar meja yang sedang aktif atau meminta tagihan.

### 3. Menu Kafe
- `GET /menus` *(Public)* — Mengambil daftar menu dan kategori.
- `GET /menus/:id` *(Public)* — Mengambil detail menu tertentu.
- `POST /menus` *(Protected JWT Admin)* — Menambahkan menu baru.
- `PUT /menus/:id` *(Protected JWT Admin)* — Memperbarui data menu.
- `DELETE /menus/:id` *(Protected JWT Admin)* — Menghapus menu.

### 4. Pesanan (Order)
- `POST /orders` *(Protected Table Session)* — Pelanggan mengirim pesanan ke dapur (otomatis ditolak jika status sesi bukan `ACTIVE`).
- `GET /orders/table/:token` *(Protected Table Session)* — Pelanggan memantau status pesanan meja dan riwayat pesanan susulan.
- `GET /orders` *(Protected JWT)* — Staf dapur melihat semua pesanan masuk untuk Kanban board.
- `PATCH /orders/:id/status` *(Protected JWT)* — Mengubah status pesanan (`PENDING` -> `PREPARING` -> `READY` -> `DELIVERED`).

---

## 📁 Struktur Direktori

```text
honeycake/
├── .gitignore                    # Git ignore untuk Node.js & Vue
├── README.md                     # Dokumentasi komprehensif proyek
├── package.json                  # Script helper monorepo
├── backend/                      # Decoupled Express.js Backend
│   ├── .env                      # Konfigurasi environment backend
│   ├── .env.example
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         # Definisi model & enum Prisma
│   │   └── seed.js               # Seeder akun admin/staf, menu, & meja demo
│   └── src/
│       ├── config/
│       │   └── prisma.js         # Singleton instance Prisma Client
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── menuController.js
│       │   ├── orderController.js
│       │   └── tableController.js
│       ├── middlewares/
│       │   ├── authMiddleware.js
│       │   ├── errorHandler.js
│       │   └── sessionMiddleware.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── menuRoutes.js
│       │   ├── orderRoutes.js
│       │   └── tableRoutes.js
│       ├── app.js                # Inisialisasi Express & CORS
│       └── server.js             # Entrypoint server backend
└── frontend/                     # Decoupled Vue.js 3 Frontend
    ├── .env
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── style.css             # Desain sistem HoneyCake (Warm Honey theme)
        ├── App.vue
        ├── main.js
        ├── services/
        │   └── api.js            # Axios client & request interceptors
        ├── stores/
        │   ├── auth.js           # Pinia store untuk staf/admin
        │   ├── cart.js           # Pinia store keranjang pelanggan
        │   └── customerSession.js# Pinia store sesi meja pelanggan
        ├── router/
        │   └── index.js          # Vue router dengan Navigation Guards
        ├── components/
        │   ├── common/Navbar.vue
        │   ├── customer/
        │   │   ├── CartDrawer.vue
        │   │   ├── MenuCard.vue
        │   │   ├── MenuItemModal.vue
        │   │   ├── OrderStatusView.vue
        │   │   └── RequestBillModal.vue
        │   └── staff/
        │       ├── KanbanCard.vue
        │       └── TableSessionCard.vue
        └── views/
            ├── customer/
            │   └── CustomerHomeView.vue
            └── staff/
                ├── CashierView.vue
                ├── LoginView.vue
                ├── MenuManagementView.vue
                ├── OrdersKanbanView.vue
                └── TableQRView.vue
```

---

## 🛠️ Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat
- **Node.js**: versi 18 atau lebih baru.
- **PostgreSQL Database**: Menggunakan [Supabase](https://supabase.com/) atau PostgreSQL lokal.

### 2. Konfigurasi Backend & Database
1. Buka file `backend/.env`, masukkan kredensial database Supabase Anda:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
   JWT_SECRET="honeycake-super-secret-jwt-key-2026"
   FRONTEND_URL="http://localhost:5173"
   ```
2. Masuk ke folder backend dan pasang dependensi:
   ```bash
   cd backend
   npm install
   ```
3. Sinkronkan skema Prisma ke database Supabase:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```
4. Jalankan database seeder untuk membuat akun staf/admin awal, menu kafe, dan meja demo:
   ```bash
   npm run prisma:seed
   ```
5. Jalankan server Backend:
   ```bash
   npm run dev
   ```
   *Backend aktif di: `http://localhost:5000`*

### 3. Konfigurasi Frontend
1. Buka terminal baru, masuk ke folder frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Jalankan server Frontend:
   ```bash
   npm run dev
   ```
   *Frontend aktif di: `http://localhost:5173`*

---

## 🔑 Akun & Meja Demo Bawaan

| Tipe | Akses / Kredensial | Keterangan |
| :--- | :--- | :--- |
| **Admin** | `admin@honeycake.com` / `admin123` | Akses penuh: QR meja, Dapur, Kasir, dan CRUD Menu |
| **Staff** | `staff@honeycake.com` / `staff123` | Akses: QR meja, Dapur (Kanban), dan Kasir |
| **Meja Demo 1** | Token: `demo-table-1` | URL: `http://localhost:5173/?token=demo-table-1` |
| **Meja Demo 2** | Token: `demo-table-2` | URL: `http://localhost:5173/?token=demo-table-2` |

---

## 📤 Instruksi Git Push ke GitHub Repository

Repository remote telah diatur ke:
`https://github.com/goldencakech/honeycake.git`

Jalankan perintah berikut di terminal root direktori untuk mengunggah implementasi kode ini:

```bash
# 1. Pastikan seluruh file telah terindeks
git add .

# 2. Buat commit awal
git commit -m "feat: initial scaffolding and implementation for HoneyCake Smart Cafe"

# 3. Pastikan branch utama bernama main
git branch -M main

# 4. Dorong ke GitHub repository
git push -u origin main
```
