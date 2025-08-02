'use client';

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function AdminAnalyticsContent() {
  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Analytics Dashboard
            </h1>
          </div>
          
          <div className="bg-white border-2 border-accent-dark rounded-lg p-8 text-center">
            <p className="text-primary-dark">
              Analytics dashboard coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}