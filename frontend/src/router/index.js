import { createRouter, createWebHistory } from 'vue-router';
import CustomerHomeView from '../views/customer/CustomerHomeView.vue';
import LoginView from '../views/staff/LoginView.vue';
import TableQRView from '../views/staff/TableQRView.vue';
import OrdersKanbanView from '../views/staff/OrdersKanbanView.vue';
import CashierView from '../views/staff/CashierView.vue';
import MenuManagementView from '../views/staff/MenuManagementView.vue';

const routes = [
  // Customer Routes
  {
    path: '/',
    name: 'customer-home',
    component: CustomerHomeView
  },
  {
    path: '/table/:token',
    name: 'customer-table',
    component: CustomerHomeView
  },

  // Staff Portal
  {
    path: '/staff/login',
    name: 'staff-login',
    component: LoginView
  },
  {
    path: '/staff/tables',
    name: 'staff-tables',
    component: TableQRView,
    meta: { requiresAuth: true }
  },
  {
    path: '/staff/orders',
    name: 'staff-orders',
    component: OrdersKanbanView,
    meta: { requiresAuth: true }
  },
  {
    path: '/staff/cashier',
    name: 'staff-cashier',
    component: CashierView,
    meta: { requiresAuth: true }
  },
  {
    path: '/staff/menus',
    name: 'staff-menus',
    component: MenuManagementView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  // Fallback
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  }
});

// Navigation Guard untuk Staff / Admin Area
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('honeycake_jwt');
  const user = JSON.parse(localStorage.getItem('honeycake_user') || 'null');

  if (to.meta.requiresAuth && !token) {
    next('/staff/login');
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    alert('Akses khusus administrator.');
    next('/staff/tables');
  } else {
    next();
  }
});

export default router;
