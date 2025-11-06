import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

export default async function DashboardRedirect() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.role === 'SUPERADMIN') {
    redirect('/admin/overview');
  }

  redirect('/afiliado/overview');
}
