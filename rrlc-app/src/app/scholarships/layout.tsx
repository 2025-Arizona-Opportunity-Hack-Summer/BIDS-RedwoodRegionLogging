"use client";

import { PublicScholarshipProvider } from '@/contexts/PublicScholarshipContext';

export default function PublicScholarshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicScholarshipProvider>
      {children}
    </PublicScholarshipProvider>
  );
}