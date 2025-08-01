"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function AdminScholarshipsContent() {
  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-2">
                Scholarship Management
              </h1>
              <p className="text-lg text-primary-dark">
                Create and manage scholarship opportunities
              </p>
            </div>
            
            <Link href="/admin/scholarships/new">
              <Button className="bg-primary text-white hover:bg-primary-light">
                Create New Scholarship
              </Button>
            </Link>
          </div>
          
          <div className="bg-white border-2 border-accent-dark rounded-lg p-8 text-center">
            <p className="text-primary-dark">
              Scholarship management features coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminScholarshipsPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminScholarshipsContent />
    </ProtectedRoute>
  );
}