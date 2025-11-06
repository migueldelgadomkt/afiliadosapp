import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const APP_NAME = 'Invitado Afiliados';

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  admin: {
    overview: '/admin/overview',
    affiliates: '/admin/afiliados',
    invitations: '/admin/invitaciones',
    orders: '/admin/pedidos',
    resources: '/admin/recursos'
  },
  affiliate: {
    overview: '/afiliado/overview',
    inventory: '/afiliado/inventario',
    orders: '/afiliado/pedidos',
    profile: '/afiliado/perfil',
    resources: '/afiliado/recursos'
  }
} as const;
