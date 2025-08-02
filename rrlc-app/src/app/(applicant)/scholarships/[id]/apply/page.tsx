"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiArrowLeft,
  FiSave,
  FiSend,
  FiAlertCircle,
  FiCheckCircle
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { Scholarship } from "@/types/database";

interface ApplicationForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  school: string;
  graduation_year: number;
  gpa: number;
  major: string;
  career_goals: string;
  financial_need: string;
  community_involvement: string;
}

function ScholarshipApplyContent() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const scholarshipId = params.id as string;

  const [form, setForm] = useState<ApplicationForm>({
    first_name: '',
    last_name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    school: '',
    graduation_year: new Date().getFullYear(),
    gpa: 0,
    major: '',
    career_goals: '',
    financial_need: '',
    community_involvement: ''
  });

  useEffect(() => {
    if (scholarshipId && user) {
      fetchScholarship();
      checkExistingApplication();
      prefillUserData();
    }
  }, [scholarshipId, user]);

  const fetchScholarship = async () => {
    try {
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .eq('id', scholarshipId)
        .eq('status', 'active')
        .single();

      if (error) {
        setError(error.message);
      } else {
        setScholarship(data);
      }
    } catch (err) {
      setError('Failed to load scholarship details');
    } finally {
      setLoading(false);
    }
  };

  const checkExistingApplication = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('applications')
        .select('*')
        .eq('scholarship_id', scholarshipId)
        .eq('applicant_id', user.id)
        .single();

      if (data) {
        setHasApplied(true);
        // Pre-fill form with existing application data
        setForm({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          zip: data.zip || '',
          school: data.school || '',
          graduation_year: data.graduation_year || new Date().getFullYear(),
          gpa: data.gpa || 0,
          major: data.major || '',
          career_goals: data.career_goals || '',
          financial_need: data.financial_need || '',
          community_involvement: data.community_involvement || ''
        });
      }
    } catch (err) {
      // No existing application found
    }
  };

  const prefillUserData = () => {
    if (profile?.full_name) {
      const nameParts = profile.full_name.split(' ');
      setForm(prev => ({
        ...prev,
        first_name: nameParts[0] || '',
        last_name: nameParts.slice(1).join(' ') || '',
        email: user?.email || ''
      }));
    }
  };

  const handleInputChange = (field: keyof ApplicationForm, value: string | number) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!form.first_name.trim()) errors.push('First name is required');
    if (!form.last_name.trim()) errors.push('Last name is required');
    if (!form.email.trim()) errors.push('Email is required');
    if (!form.school.trim()) errors.push('School is required');
    if (!form.major.trim()) errors.push('Major is required');
    if (!form.career_goals.trim()) errors.push('Career goals are required');
    if (!form.financial_need.trim()) errors.push('Financial need statement is required');
    if (!form.community_involvement.trim()) errors.push('Community involvement is required');
    
    if (form.gpa < 0 || form.gpa > 4.0) errors.push('GPA must be between 0.0 and 4.0');
    if (form.graduation_year < 2020 || form.graduation_year > 2030) {
      errors.push('Graduation year must be between 2020 and 2030');
    }

    return errors;
  };

  const handleSaveDraft = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const applicationData = {
        scholarship_id: scholarshipId,
        applicant_id: user.id,
        status: 'draft',
        ...form
      };

      const { error } = await supabase
        .from('applications')
        .upsert(applicationData, { 
          onConflict: 'scholarship_id,applicant_id'
        });

      if (error) {
        setError('Failed to save draft');
      } else {
        // Show success message briefly
        setError(null);
      }
    } catch (err) {
      setError('Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setSubmitting(true);
    try {
      const applicationData = {
        scholarship_id: scholarshipId,
        applicant_id: user.id,
        status: 'submitted',
        submission_date: new Date().toISOString(),
        ...form
      };

      const { error } = await supabase
        .from('applications')
        .upsert(applicationData, { 
          onConflict: 'scholarship_id,applicant_id'
        });

      if (error) {
        setError('Failed to submit application');
      } else {
        router.push(`/scholarships/${scholarshipId}/success`);
      }
    } catch (err) {
      setError('Failed to submit application');
    } finally {
      setSubmitting(false);
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

  if (!scholarship) {
    return (
      <div className="min-h-screen bg-accent p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-white border-2 border-accent-dark p-8 text-center">
            <FiAlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h1 className="text-2xl font-bold text-primary mb-4">
              Scholarship Not Found
            </h1>
            <p className="text-primary-dark mb-6">
              The scholarship you're trying to apply for doesn't exist or is no longer available.
            </p>
            <Link href="/scholarships">
              <Button className="bg-primary text-white hover:bg-primary-light">
                Browse Scholarships
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent p-6">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Back Button */}
          <Link 
            href={`/scholarships/${scholarshipId}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
          >
            <FiArrowLeft size={20} />
            <span>Back to Scholarship</span>
          </Link>

          {/* Header */}
          <Card className="bg-white border-2 border-accent-dark">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                {hasApplied ? (
                  <FiCheckCircle className="text-green-500" size={24} />
                ) : (
                  <FiSend className="text-primary" size={24} />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-primary">
                    {hasApplied ? 'Update Application' : 'Apply for Scholarship'}
                  </h1>
                  <p className="text-primary-dark">
                    {scholarship.name}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Application Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Personal Information */}
              <Card className="bg-white border-2 border-accent-dark">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-primary">Personal Information</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        value={form.first_name}
                        onChange={(e) => handleInputChange('first_name', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input
                        value={form.last_name}
                        onChange={(e) => handleInputChange('last_name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <Input
                      value={form.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <Input
                        value={form.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <Input
                        value={form.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <Input
                        value={form.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card className="bg-white border-2 border-accent-dark">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-primary">Academic Information</h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School/University *
                    </label>
                    <Input
                      value={form.school}
                      onChange={(e) => handleInputChange('school', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Major *
                      </label>
                      <Input
                        value={form.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Graduation Year
                      </label>
                      <Input
                        type="number"
                        min="2020"
                        max="2030"
                        value={form.graduation_year}
                        onChange={(e) => handleInputChange('graduation_year', parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        GPA
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={form.gpa}
                        onChange={(e) => handleInputChange('gpa', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Essay Questions */}
              <Card className="bg-white border-2 border-accent-dark">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-primary">Essay Questions</h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Career Goals * (500 words max)
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[120px]"
                      value={form.career_goals}
                      onChange={(e) => handleInputChange('career_goals', e.target.value)}
                      placeholder="Describe your career goals and how this scholarship will help you achieve them..."
                      maxLength={3000}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Need * (500 words max)
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[120px]"
                      value={form.financial_need}
                      onChange={(e) => handleInputChange('financial_need', e.target.value)}
                      placeholder="Explain your financial need and how this scholarship would help..."
                      maxLength={3000}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Community Involvement * (500 words max)
                    </label>
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-lg resize-y min-h-[120px]"
                      value={form.community_involvement}
                      onChange={(e) => handleInputChange('community_involvement', e.target.value)}
                      placeholder="Describe your community involvement and volunteer activities..."
                      maxLength={3000}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <FiAlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saving || submitting}
                  className="flex items-center gap-2"
                >
                  <FiSave size={16} />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || saving}
                  className="bg-primary text-white hover:bg-primary-light flex items-center gap-2 flex-1"
                >
                  <FiSend size={16} />
                  {submitting ? 'Submitting...' : hasApplied ? 'Update Application' : 'Submit Application'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ScholarshipApplyPage() {
  return (
    <ProtectedRoute requireApplicant={true}>
      <ScholarshipApplyContent />
    </ProtectedRoute>
  );
}