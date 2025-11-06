import { ProtectedLayout } from '@/components/layout/protected-layout';

export default function AffiliateLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
