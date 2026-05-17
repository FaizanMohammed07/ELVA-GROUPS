export const ADMIN_LOGIN_SLUG = import.meta.env.VITE_ADMIN_LOGIN_SLUG || 'elva-admin-x7k9m2';
export const ADMIN_LOGIN_PATH = import.meta.env.VITE_ADMIN_LOGIN_PATH || `/${ADMIN_LOGIN_SLUG}/login`;
export const ADMIN_BASE = `/${ADMIN_LOGIN_SLUG}`;

export const SUPER_ADMIN_LOGIN_SLUG = import.meta.env.VITE_SUPER_ADMIN_LOGIN_SLUG || 'elva-superadmin-p4k8r5';
export const SUPER_ADMIN_LOGIN_PATH = import.meta.env.VITE_SUPER_ADMIN_LOGIN_PATH || `/${SUPER_ADMIN_LOGIN_SLUG}/login`;
export const SUPER_BASE = `/${SUPER_ADMIN_LOGIN_SLUG}`;
