import prisma from '../config/prisma.js';

/**
 * 1. Get All Menus (Public)
 * GET /api/v1/menus
 */
export const getAllMenus = async (req, res, next) => {
  try {
    const { category, availableOnly } = req.query;

    const where = {};
    if (category && category !== 'Semua') {
      where.category = {
        equals: category,
        mode: 'insensitive'
      };
    }

    if (availableOnly === 'true') {
      where.isAvailable = true;
    }

    const menus = await prisma.menu.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });

    // Ambil juga daftar kategori unik untuk kemudahan frontend filter
    const allCategories = await prisma.menu.findMany({
      select: { category: true },
      distinct: ['category']
    });

    const categories = ['Semua', ...allCategories.map((c) => c.category)];

    return res.status(200).json({
      success: true,
      count: menus.length,
      categories,
      menus
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Get Menu by ID (Public)
 * GET /api/v1/menus/:id
 */
export const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const menu = await prisma.menu.findUnique({
      where: { id }
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu tidak ditemukan.'
      });
    }

    return res.status(200).json({
      success: true,
      menu
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Create Menu Item (Protected JWT Admin)
 * POST /api/v1/menus
 */
export const createMenu = async (req, res, next) => {
  try {
    const { name, category, price, description, imageUrl, isAvailable } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Nama, kategori, dan harga menu wajib diisi.'
      });
    }

    if (isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Harga menu harus berupa bilangan positif.'
      });
    }

    const newMenu = await prisma.menu.create({
      data: {
        name: name.trim(),
        category: category.trim(),
        price: parseInt(price, 10),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Menu baru berhasil ditambahkan.',
      menu: newMenu
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Update Menu Item (Protected JWT Admin)
 * PUT /api/v1/menus/:id
 */
export const updateMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, category, price, description, imageUrl, isAvailable } = req.body;

    const existingMenu = await prisma.menu.findUnique({
      where: { id }
    });

    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu yang ingin diubah tidak ditemukan.'
      });
    }

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (category !== undefined) data.category = category.trim();
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Harga menu harus berupa bilangan positif.'
        });
      }
      data.price = parseInt(price, 10);
    }
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (imageUrl !== undefined) data.imageUrl = imageUrl ? imageUrl.trim() : null;
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);

    const updatedMenu = await prisma.menu.update({
      where: { id },
      data
    });

    return res.status(200).json({
      success: true,
      message: 'Menu berhasil diperbarui.',
      menu: updatedMenu
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Delete Menu Item (Protected JWT Admin)
 * DELETE /api/v1/menus/:id
 */
export const deleteMenu = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingMenu = await prisma.menu.findUnique({
      where: { id }
    });

    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu tidak ditemukan.'
      });
    }

    await prisma.menu.delete({
      where: { id }
    });

    return res.status(200).json({
      success: true,
      message: 'Menu berhasil dihapus.'
    });
  } catch (error) {
    next(error);
  }
};
