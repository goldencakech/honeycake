import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('honeycake_cart') || '[]')
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) => state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0
  },

  actions: {
    persistCart() {
      localStorage.setItem('honeycake_cart', JSON.stringify(this.items));
    },

    addItem(menu, quantity = 1, notes = '') {
      const existingIndex = this.items.findIndex(
        (item) => item.menuId === menu.id && (item.notes || '') === (notes || '')
      );

      if (existingIndex > -1) {
        this.items[existingIndex].quantity += quantity;
      } else {
        this.items.push({
          menuId: menu.id,
          name: menu.name,
          price: menu.price,
          quantity,
          notes: notes.trim(),
          imageUrl: menu.imageUrl
        });
      }

      this.persistCart();
    },

    updateQuantity(index, newQty) {
      if (newQty <= 0) {
        this.removeItem(index);
      } else {
        this.items[index].quantity = newQty;
        this.persistCart();
      }
    },

    removeItem(index) {
      this.items.splice(index, 1);
      this.persistCart();
    },

    clearCart() {
      this.items = [];
      localStorage.removeItem('honeycake_cart');
    }
  }
});
