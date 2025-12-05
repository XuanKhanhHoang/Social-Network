import { AdminAuthGuard } from '@/features/admin/auth/components/AdminAuthGuard';
import { AdminLayout } from '@/features/admin/components/layout/AdminLayout';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  );
}
