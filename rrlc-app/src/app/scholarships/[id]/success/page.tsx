"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ScholarshipSuccessPage() {
  const params = useParams();
  const router = useRouter();
  const scholarshipId = params.id;

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg border-2 border-accent-dark p-8 text-center">
        <div className="flex flex-col gap-6">
          <div className="text-6xl">🎉</div>
          
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Application Submitted!
            </h1>
            <p className="text-primary-dark">
              Your scholarship application has been successfully submitted.
            </p>
          </div>
          
          <div className="bg-accent-light rounded-lg p-4">
            <p className="text-sm text-primary-dark">
              You will receive an email confirmation shortly. 
              Our team will review your application and contact you with updates.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <Link href="/scholarships">
              <Button className="w-full bg-primary text-white hover:bg-primary-light">
                Browse More Scholarships
              </Button>
            </Link>
            
            <Link href="/home">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}