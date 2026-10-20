import prisma from '../config/prisma.js';

/**
 * 1. Buat Pesanan Baru (Protected Table Session Token)
 * POST /api/v1/orders
 * Catatan: Tolak jika status sesi meja bukan ACTIVE (misal sudah BILL_REQUESTED atau CLOSED)
 */
export const createOrder = async (req, res, next) => {
  try {
    const session = req.tableSession; // Didapat dari verifyTableSession middleware
    const { orderItems } = req.body;

    // Validasi status sesi meja: hanya boleh order jika ACTIVE
    if (session.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message:
          session.status === 'BILL_REQUESTED'
            ? 'Tidak dapat menambah pesanan karena meja ini telah meminta tagihan (Bill Requested).'
            : 'Sesi meja ini telah ditutup.'
      });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Keranjang pesanan tidak boleh kosong. Harap pilih minimal 1 menu.'
      });
    }

    // Validasi dan hitung subtotal
    let calculatedSubtotal = 0;
    const sanitizedItems = [];

    for (const item of orderItems) {
      const { menuId, name, price, quantity, notes } = item;

      if (!name || price === undefined || !quantity) {
        return res.status(400).json({
          success: false,
          message: 'Format data item pesanan tidak valid (name, price, quantity wajib ada).'
        });
      }

      const qty = parseInt(quantity, 10);
      const prc = parseInt(price, 10);

      if (qty <= 0 || prc < 0) {
        return res.status(400).json({
          success: false,
          message: 'Jumlah dan harga item pesanan harus valid.'
        });
      }

      const itemTotal = prc * qty;
      calculatedSubtotal += itemTotal;

      sanitizedItems.push({
        menuId: menuId || null,
        name: String(name).trim(),
        price: prc,
        quantity: qty,
        notes: notes ? String(notes).trim() : ''
      });
    }

    const newOrder = await prisma.order.create({
      data: {
        sessionId: session.id,
        tableNumber: session.tableNumber,
        orderItems: sanitizedItems,
        subtotal: calculatedSubtotal,
        orderStatus: 'PENDING'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dikirimkan ke dapur!',
      order: newOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Ambil Riwayat Pesanan Meja (Protected Table Session Token)
 * GET /api/v1/orders/table/:token
 */
export const getOrdersByTableToken = async (req, res, next) => {
  try {
    const session = req.tableSession;

    const orders = await prisma.order.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'desc' }
    });

    const totalSpent = orders.reduce((sum, ord) => sum + (ord.subtotal || 0), 0);

    return res.status(200).json({
      success: true,
      tableNumber: session.tableNumber,
      sessionStatus: session.status,
      paymentMethod: session.paymentMethod,
      totalOrders: orders.length,
      totalSpent,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Ambil Semua Pesanan untuk Dashboard Staff / Dapur (Protected JWT)
 * GET /api/v1/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { status } = req.query;

    const where = {};
    if (status && ['PENDING', 'PREPARING', 'READY', 'DELIVERED'].includes(status.toUpperCase())) {
      where.orderStatus = status.toUpperCase();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        session: {
          select: {
            tableNumber: true,
            status: true,
            paymentMethod: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Update Status Pesanan: PENDING -> PREPARING -> READY -> DELIVERED (Protected JWT)
 * PATCH /api/v1/orders/:id/status
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];
    if (!orderStatus || !validStatuses.includes(orderStatus.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Status pesanan tidak valid. Pilih salah satu: ${validStatuses.join(', ')}`
      });
    }

    const existingOrder = await prisma.order.findUnique({
      where: { id }
    });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Pesanan tidak ditemukan.'
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus.toUpperCase()
      }
    });

    return res.status(200).json({
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi ${orderStatus.toUpperCase()}.`,
      order: updated
    });
  } catch (error) {
    next(error);
  }
};
