"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  FiArrowLeft, 
  FiSave, 
  FiPlus, 
  FiTrash2, 
  FiFileText
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { getScholarshipById, updateScholarship } from "@/services/scholarships";
import { UpdateScholarshipData, CustomField, Scholarship, FormSchema } from "@/types/database";
import { useScholarshipContext } from "@/contexts/AdminContext";
import { DynamicFormBuilder } from "@/components/admin/DynamicFormBuilder";
import { DEFAULT_FORM_TEMPLATES } from "@/lib/formFields";


function EditScholarshipContent() {
  const router = useRouter();
  const params = useParams();
  const scholarshipId = params.id as string;
  const { scholarships, updateScholarshipInCache } = useScholarshipContext();
  
  const [loading, setLoading] = useState(false);
  const [loadingScholarship, setLoadingScholarship] = useState(true);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [formData, setFormData] = useState<UpdateScholarshipData>({
    id: scholarshipId,
    name: '',
    description: '',
    amount: undefined,
    deadline: '',
    requirements: '',
    status: 'active'
  });
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [formSchema, setFormSchema] = useState<FormSchema | null>(null);
  const [extendedDescription, setExtendedDescription] = useState('');
  const [eligibilityCriteria, setEligibilityCriteria] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadScholarship();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scholarshipId, scholarships]);

  const loadScholarship = async () => {
    // First, check if we already have this scholarship in the context
    const cachedScholarship = scholarships.find(s => s.id === scholarshipId);
    if (cachedScholarship) {
      // Use cached data immediately
      populateFormWithScholarship(cachedScholarship);
      setLoadingScholarship(false);
      return;
    }

    // If not in cache, fetch from API
    setLoadingScholarship(true);
    const { data, error } = await getScholarshipById(scholarshipId);
    
    if (error || !data) {
      alert('Failed to load scholarship');
      router.push('/admin/scholarships');
      return;
    }

    populateFormWithScholarship(data);
    setLoadingScholarship(false);
  };

  const populateFormWithScholarship = (data: Scholarship) => {
    setScholarship(data);
    setFormData({
      id: scholarshipId,
      name: data.name,
      description: data.description || '',
      amount: data.amount || undefined,
      deadline: data.deadline || '',
      requirements: data.requirements || '',
      status: data.status
    });
    setCustomFields(data.custom_fields || []);
    
    // Handle form schema - use existing or create default from custom fields
    if (data.form_schema) {
      setFormSchema(data.form_schema);
    } else if (data.custom_fields && data.custom_fields.length > 0) {
      // Migrate legacy custom fields to new schema
      const migratedSchema: FormSchema = {
        sections: [
          ...DEFAULT_FORM_TEMPLATES.standard.sections,
          {
            id: 'custom',
            title: 'Scholarship Questions',
            description: 'Answer questions specific to this scholarship',
            order: 5,
            fields: data.custom_fields.map((field, index) => ({
              ...field,
              order: index + 1
            }))
          }
        ]
      };
      setFormSchema(migratedSchema);
    } else {
      // Use default template
      setFormSchema({ sections: DEFAULT_FORM_TEMPLATES.standard.sections });
    }
    
    setExtendedDescription(data.extended_description || '');
    setEligibilityCriteria(data.eligibility_criteria || []);
    setTags(data.tags || []);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Scholarship name is required';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    // Validate deadline if status is active
    if (formData.status === 'active' && formData.deadline) {
      const deadlineDate = new Date(formData.deadline);
      const now = new Date();
      now.setHours(23, 59, 59, 999); // End of today
      deadlineDate.setHours(23, 59, 59, 999);
      
      if (deadlineDate < now) {
        newErrors.deadline = 'Cannot activate scholarship with a past due date. Please set a future deadline or keep status as inactive.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    const scholarshipData: any = {
      ...formData,
      custom_fields: customFields, // Keep for backward compatibility
      form_schema: formSchema,
      extended_description: extendedDescription || null,
      eligibility_criteria: eligibilityCriteria.length > 0 ? eligibilityCriteria : null,
      tags: tags.length > 0 ? tags : null
    };
    
    const { data, error } = await updateScholarship(scholarshipData);
    
    if (error) {
      if (error.includes('database migration') || error.includes('contact your administrator')) {
        // Show a more user-friendly message for schema issues
        alert(`Update Status: ${error}\n\nTo enable the full dynamic form builder, please run the database migration script found in the project root: add-form-schema-supabase.sql`);
      } else {
        alert('Failed to update scholarship: ' + error);
      }
    } else {
      // Update the cached scholarship data
      if (data) {
        updateScholarshipInCache(data);
      }
      router.push('/admin/scholarships');
    }
    
    setLoading(false);
  };

  const addEligibilityCriteria = () => {
    setEligibilityCriteria([...eligibilityCriteria, '']);
  };

  const updateEligibilityCriteria = (index: number, value: string) => {
    const updated = [...eligibilityCriteria];
    updated[index] = value;
    setEligibilityCriteria(updated);
  };

  const removeEligibilityCriteria = (index: number) => {
    setEligibilityCriteria(eligibilityCriteria.filter((_, i) => i !== index));
  };

  const addTag = () => {
    setTags([...tags, '']);
  };

  const updateTag = (index: number, value: string) => {
    const updated = [...tags];
    updated[index] = value;
    setTags(updated);
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Only show loading skeleton if we're loading and have no scholarship data yet
  if (loadingScholarship && !scholarship) {
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/admin/scholarships')}
                className="mb-4"
              >
                <FiArrowLeft className="mr-2" />
                Back to Scholarships
              </Button>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-primary mb-2">
                  Edit Scholarship
                </h1>
                {loadingScholarship && scholarship && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                )}
              </div>
              <p className="text-primary-dark">
                {scholarship?.name}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Scholarship Name *</label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Environmental Science Excellence Award"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">Short Description *</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description that appears in scholarship listings..."
                  rows={3}
                  className={`textarea ${errors.description ? 'border-red-500' : ''}`}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="block mb-2 font-medium">Extended Description</label>
                <textarea
                  value={extendedDescription}
                  onChange={(e) => setExtendedDescription(e.target.value)}
                  placeholder="Detailed information about the scholarship, its purpose, history, etc..."
                  rows={6}
                  className="textarea"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Award Amount</label>
                  <Input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || undefined })}
                    placeholder="e.g., 5000"
                    min="0"
                    step="100"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium">Application Deadline</label>
                  <Input
                    type="date"
                    value={formData.deadline || ''}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className={errors.deadline ? 'border-red-500' : ''}
                  />
                  {errors.deadline && (
                    <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-medium">General Requirements</label>
                <textarea
                  value={formData.requirements || ''}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="General requirements and instructions for applicants..."
                  rows={4}
                  className="textarea"
                />
              </div>
            </div>
          </Card>

          {/* Eligibility Criteria */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <h2 className="text-xl font-semibold mb-4">Eligibility Criteria</h2>
            
            <div className="space-y-3">
              {eligibilityCriteria.map((criteria, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={criteria}
                    onChange={(e) => updateEligibilityCriteria(index, e.target.value)}
                    placeholder="e.g., Must be enrolled full-time"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeEligibilityCriteria(index)}
                    className="text-red-600"
                  >
                    <FiTrash2 />
                  </Button>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addEligibilityCriteria}
                size="sm"
              >
                <FiPlus className="mr-2" />
                Add Criteria
              </Button>
            </div>
          </Card>

          {/* Tags */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-accent px-3 py-1 rounded-full">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => updateTag(index, e.target.value)}
                      placeholder="Tag"
                      className="bg-transparent border-none outline-none text-sm w-20"
                    />
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTag}
                  size="sm"
                >
                  <FiPlus className="mr-1" />
                  Add Tag
                </Button>
              </div>
            </div>
          </Card>

          {/* Dynamic Form Builder */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <FiFileText className="text-primary" />
                Application Form Builder
              </h2>
              <p className="text-sm text-gray-600">
                Create a completely customized application form for this scholarship.
                Drag and drop fields to build the exact form you need.
              </p>
            </div>
            
            {formSchema && (
              <DynamicFormBuilder
                formSchema={formSchema}
                onChange={setFormSchema}
              />
            )}
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/scholarships')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:bg-primary-light"
            >
              <FiSave className="mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditScholarshipPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <EditScholarshipContent />
    </ProtectedRoute>
  );
}