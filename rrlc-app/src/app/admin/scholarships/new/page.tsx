"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
import { createScholarship, getScholarshipById } from "@/services/scholarships";
import { CreateScholarshipData, CustomField, FormSchema } from "@/types/database";
import { useScholarshipContext } from "@/contexts/AdminContext";
import { DynamicFormBuilder } from "@/components/admin/DynamicFormBuilder";
import { DEFAULT_FORM_TEMPLATES } from "@/lib/formFields";


function NewScholarshipContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duplicateId = searchParams.get('duplicate');
  const { refreshScholarships } = useScholarshipContext();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateScholarshipData>({
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
    if (duplicateId) {
      loadScholarshipToDuplicate(duplicateId);
    } else {
      // Initialize with default template for new scholarships
      setFormSchema({ sections: DEFAULT_FORM_TEMPLATES.standard.sections });
    }
  }, [duplicateId]);

  const loadScholarshipToDuplicate = async (id: string) => {
    const { data } = await getScholarshipById(id);
    if (data) {
      setFormData({
        name: `${data.name} (Copy)`,
        description: data.description || '',
        amount: data.amount || undefined,
        deadline: data.deadline || '',
        requirements: data.requirements || '',
        status: 'active'
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
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
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
    
    const { data, error } = await createScholarship(scholarshipData);
    
    if (error) {
      alert('Failed to create scholarship: ' + error);
    } else {
      // Refresh the scholarship list to include the new scholarship
      await refreshScholarships();
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
              <h1 className="text-3xl font-bold text-primary">
                {duplicateId ? 'Duplicate Scholarship' : 'Create New Scholarship'}
              </h1>
            </div>
          </div>

          {/* Basic Information */}
          <Card className="bg-white border-2 border-accent-dark p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-medium">Scholarship Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Environmental Science Excellence Award"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
              {loading ? 'Creating...' : 'Create Scholarship'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewScholarshipPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <NewScholarshipContent />
    </ProtectedRoute>
  );
}