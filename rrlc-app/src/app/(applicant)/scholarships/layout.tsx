"use client";

import { PublicScholarshipProvider } from '@/contexts/PublicScholarshipContext';

export default function ScholarshipsLayout({
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