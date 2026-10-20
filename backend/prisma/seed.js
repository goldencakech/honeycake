import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data HoneyCake...');

  // 1. Seed Users (Admin & Staff)
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordStaff = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@honeycake.com' },
    update: {},
    create: {
      name: 'Manager HoneyCake',
      email: 'admin@honeycake.com',
      password: hashedPasswordAdmin,
      role: 'admin'
    }
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@honeycake.com' },
    update: {},
    create: {
      name: 'Barista / Staff HoneyCake',
      email: 'staff@honeycake.com',
      password: hashedPasswordStaff,
      role: 'staff'
    }
  });

  console.log(`👤 Pengguna berhasil dibuat:`);
  console.log(`   - Admin: admin@honeycake.com (password: admin123)`);
  console.log(`   - Staff: staff@honeycake.com (password: staff123)`);

  // 2. Seed Sample Menus
  const sampleMenus = [
    {
      name: 'Signature Honey Layer Cake (Medovik)',
      category: 'Signature Cakes',
      price: 48000,
      description: 'Kue lapis madu khas Eropa Timur dengan cream keju asam lembut dan taburan remah madu karamel.',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Basque Burnt Cheesecake',
      category: 'Signature Cakes',
      price: 45000,
      description: 'Cheesecake panggang dengan permukaan karamel gosong harum dan tekstur tengah yang creamy lumer.',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Matcha Mille Crêpe',
      category: 'Signature Cakes',
      price: 42000,
      description: 'Dua puluh lapis crepe tipis dengan cream matcha Uji Jepang premium dan rasa manis yang seimbang.',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Honey Lavender Latte',
      category: 'Coffee & Drinks',
      price: 36000,
      description: 'Espresso arabika dengan susu oat lembut, madu organik bunga liar, dan aroma lavender yang menenangkan.',
      imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Spanish Cinnamon Latte',
      category: 'Coffee & Drinks',
      price: 38000,
      description: 'Espresso ganda dengan susu kental manis dan taburan kayu manis segar di atas busa susu.',
      imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Yuzu Peach Sparkling Cold Brew',
      category: 'Coffee & Drinks',
      price: 35000,
      description: 'Cold brew kopi pilihan dipadukan dengan sari buah Yuzu Jepang dan irisan persik segar berbuih.',
      imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Truffle Mushroom Artisan Croissant',
      category: 'Savory Pastries',
      price: 40000,
      description: 'Croissant mentega renyah dengan isian tumis jamur champignon, saus bechamel, dan minyak truffle wangi.',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Smoked Beef & Cheddar Danish',
      category: 'Savory Pastries',
      price: 38000,
      description: 'Pastry renyah berlapis dengan keju red cheddar meleleh dan irisan daging asap gurih pilihan.',
      imageUrl: 'https://images.unsplash.com/photo-1621236378699-8597fee6a1ce?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    },
    {
      name: 'Earl Grey Royal Milk Tea',
      category: 'Tea & Refreshment',
      price: 32000,
      description: 'Seduhan daun teh Earl Grey bergamot dengan susu segar manis gurih dan boba madu lembut.',
      imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
      isAvailable: true
    }
  ];

  console.log('🍰 Menambahkan daftar menu kafe...');
  for (const menu of sampleMenus) {
    const existing = await prisma.menu.findFirst({ where: { name: menu.name } });
    if (!existing) {
      await prisma.menu.create({ data: menu });
    }
  }

  // 3. Seed Sample Table Sessions (Table 1, Table 2)
  console.log('🪑 Menyiapkan sesi meja demo awal...');
  const table1 = await prisma.tableSession.upsert({
    where: { sessionToken: 'demo-table-1' },
    update: {},
    create: {
      tableNumber: 1,
      sessionToken: 'demo-table-1',
      status: 'ACTIVE'
    }
  });

  const table2 = await prisma.tableSession.upsert({
    where: { sessionToken: 'demo-table-2' },
    update: {},
    create: {
      tableNumber: 2,
      sessionToken: 'demo-table-2',
      status: 'ACTIVE'
    }
  });

  console.log('✅ Seeding HoneyCake selesai dengan sukses!');
  console.log(`   - Meja 1 Token Demo: demo-table-1`);
  console.log(`   - Meja 2 Token Demo: demo-table-2`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
