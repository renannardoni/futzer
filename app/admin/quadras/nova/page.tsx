'use client';

import { QuadraForm } from '@/components/quadra-form';
import { AdminGuard } from '@/components/admin-guard';

export default function NovaQuadraPage() {
  return <AdminGuard><QuadraForm mode="criar" /></AdminGuard>;
}
