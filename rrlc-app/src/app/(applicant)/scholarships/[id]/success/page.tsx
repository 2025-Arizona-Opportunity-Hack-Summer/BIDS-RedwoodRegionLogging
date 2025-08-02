"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  FiCheckCircle, 
  FiFileText, 
  FiMail,
  FiHome,
  FiArrowRight
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { supabase } from "@/lib/supabaseClient";
import { Scholarship } from "@/types/database";

function SuccessPageContent() {
  const params = useParams();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);

  const scholarshipId = params.id as string;

  useEffect(() => {
    if (scholarshipId) {
      fetchScholarship();
    }
  }, [scholarshipId]);

  const fetchScholarship = async () => {
    try {
      const { data } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .single();

      if (data) {
        setScholarship(data);
      }
    } catch (err) {
      console.error('Error fetching scholarship:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <div className="h-96 bg-gray-300 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Success Message */}
          <Card className="bg-white border-2 border-green-200">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <FiCheckCircle className="mx-auto text-green-500" size={64} />
              </div>
              
              <h1 className="text-3xl font-bold text-green-800 mb-4">
                Application Submitted Successfully!
              </h1>
              
              <p className="text-lg text-green-700 mb-6">
                Your application for <strong>{scholarship?.name || 'this scholarship'}</strong> has been submitted successfully.
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-green-800 mb-3">What happens next?</h2>
                <div className="text-left space-y-3">
                  <div className="flex items-start gap-3">
                    <FiMail className="text-green-600 mt-1" size={18} />
                    <div>
                      <h3 className="font-medium text-green-800">Confirmation Email</h3>
                      <p className="text-green-700 text-sm">
                        You'll receive a confirmation email shortly with your application details.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FiFileText className="text-green-600 mt-1" size={18} />
                    <div>
                      <h3 className="font-medium text-green-800">Review Process</h3>
                      <p className="text-green-700 text-sm">
                        Our scholarship committee will review your application along with all other submissions.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 mt-1" size={18} />
                    <div>
                      <h3 className="font-medium text-green-800">Status Updates</h3>
                      <p className="text-green-700 text-sm">
                        You can check your application status anytime in your applications dashboard.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/applications">
              <Card className="bg-white border-2 border-accent-dark hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FiFileText className="mx-auto mb-3 text-primary" size={32} />
                  <h3 className="font-semibold text-primary mb-2">Track Applications</h3>
                  <p className="text-sm text-gray-600">
                    Monitor the status of all your scholarship applications
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/scholarships">
              <Card className="bg-white border-2 border-accent-dark hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FiArrowRight className="mx-auto mb-3 text-primary" size={32} />
                  <h3 className="font-semibold text-primary mb-2">More Scholarships</h3>
                  <p className="text-sm text-gray-600">
                    Browse and apply for additional scholarship opportunities
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/home">
              <Card className="bg-white border-2 border-accent-dark hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FiHome className="mx-auto mb-3 text-primary" size={32} />
                  <h3 className="font-semibold text-primary mb-2">Dashboard</h3>
                  <p className="text-sm text-gray-600">
                    Return to your student dashboard and overview
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Additional Information */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-primary mb-4">Important Reminders</h2>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  • <strong>Keep your contact information updated:</strong> Make sure we can reach you if you're selected.
                </p>
                <p>
                  • <strong>Check your email regularly:</strong> Important updates will be sent to your registered email address.
                </p>
                <p>
                  • <strong>Application deadline:</strong> {scholarship?.deadline ? 
                    `This scholarship's deadline is ${new Date(scholarship.deadline).toLocaleDateString()}` :
                    'Check the scholarship details for deadline information'
                  }.
                </p>
                <p>
                  • <strong>Questions?</strong> Contact our scholarship office if you have any questions about your application.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <ProtectedRoute requireApplicant={true}>
      <SuccessPageContent />
    </ProtectedRoute>
  );
}