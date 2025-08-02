import { FormField } from '@/types/database';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiCalendar, 
  FiHash, 
  FiFileText, 
  FiType,
  FiList,
  FiCheckSquare,
  FiUpload,
  FiDollarSign,
  FiUsers,
  FiAward,
  FiBriefcase
} from 'react-icons/fi';

export interface FieldTemplate {
  id: string;
  type: FormField['type'];
  label: string;
  category: 'personal' | 'academic' | 'essay' | 'contact' | 'custom';
  icon: React.ElementType;
  defaultLabel: string;
  description: string;
  defaultProps: Partial<FormField>;
}

// Comprehensive library of all available form fields
export const FIELD_LIBRARY: FieldTemplate[] = [
  // Personal Information Fields
  {
    id: 'first_name',
    type: 'text',
    label: 'First Name',
    category: 'personal',
    icon: FiUser,
    defaultLabel: 'First Name',
    description: 'Applicant\'s first name',
    defaultProps: {
      required: true
    }
  },
  {
    id: 'last_name',
    type: 'text',
    label: 'Last Name',
    category: 'personal',
    icon: FiUser,
    defaultLabel: 'Last Name',
    description: 'Applicant\'s last name',
    defaultProps: {
      required: true
    }
  },
  {
    id: 'date_of_birth',
    type: 'date',
    label: 'Date of Birth',
    category: 'personal',
    icon: FiCalendar,
    defaultLabel: 'Date of Birth',
    description: 'Applicant\'s birth date',
    defaultProps: {
      required: false
    }
  },

  // Contact Information Fields
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    category: 'contact',
    icon: FiMail,
    defaultLabel: 'Email Address',
    description: 'Primary email address',
    defaultProps: {
      required: true
    }
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone Number',
    category: 'contact',
    icon: FiPhone,
    defaultLabel: 'Phone Number',
    description: 'Primary phone number',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'address',
    type: 'text',
    label: 'Street Address',
    category: 'contact',
    icon: FiMapPin,
    defaultLabel: 'Street Address',
    description: 'Full street address',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'city',
    type: 'text',
    label: 'City',
    category: 'contact',
    icon: FiMapPin,
    defaultLabel: 'City',
    description: 'City of residence',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'state',
    type: 'text',
    label: 'State/Province',
    category: 'contact',
    icon: FiMapPin,
    defaultLabel: 'State/Province',
    description: 'State or province',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'zip',
    type: 'text',
    label: 'ZIP/Postal Code',
    category: 'contact',
    icon: FiMapPin,
    defaultLabel: 'ZIP/Postal Code',
    description: 'ZIP or postal code',
    defaultProps: {
      required: false
    }
  },

  // Academic Information Fields
  {
    id: 'school',
    type: 'text',
    label: 'School/University',
    category: 'academic',
    icon: FiCalendar,
    defaultLabel: 'School/University',
    description: 'Name of educational institution',
    defaultProps: {
      required: true
    }
  },
  {
    id: 'graduation_year',
    type: 'number',
    label: 'Graduation Year',
    category: 'academic',
    icon: FiCalendar,
    defaultLabel: 'Graduation Year',
    description: 'Expected or actual graduation year',
    defaultProps: {
      required: true,
      validation: { 
        min: new Date().getFullYear() - 10, 
        max: new Date().getFullYear() + 10 
      }
    }
  },
  {
    id: 'major',
    type: 'text',
    label: 'Major/Field of Study',
    category: 'academic',
    icon: FiCalendar,
    defaultLabel: 'Major/Field of Study',
    description: 'Primary area of study',
    defaultProps: {
      required: true
    }
  },
  {
    id: 'gpa',
    type: 'number',
    label: 'GPA',
    category: 'academic',
    icon: FiHash,
    defaultLabel: 'GPA',
    description: 'Grade Point Average (0.0-4.0)',
    defaultProps: {
      required: false,
      validation: { min: 0, max: 4 }
    }
  },
  {
    id: 'academic_level',
    type: 'select',
    label: 'Academic Level',
    category: 'academic',
    icon: FiCalendar,
    defaultLabel: 'Academic Level',
    description: 'Current level of education',
    defaultProps: {
      required: true,
      options: ['High School', 'Undergraduate', 'Graduate', 'Doctoral', 'Other']
    }
  },

  // Essay/Long-form Fields
  {
    id: 'career_goals',
    type: 'textarea',
    label: 'Career Goals',
    category: 'essay',
    icon: FiFileText,
    defaultLabel: 'Career Goals',
    description: 'Describe your career aspirations',
    defaultProps: {
      required: false,
      validation: { minLength: 50 }
    }
  },
  {
    id: 'financial_need',
    type: 'textarea',
    label: 'Financial Need',
    category: 'essay',
    icon: FiDollarSign,
    defaultLabel: 'Financial Need',
    description: 'Explain your financial circumstances',
    defaultProps: {
      required: false,
      validation: { minLength: 25 }
    }
  },
  {
    id: 'community_involvement',
    type: 'textarea',
    label: 'Community Involvement',
    category: 'essay',
    icon: FiUsers,
    defaultLabel: 'Community Involvement',
    description: 'Describe your community service and involvement',
    defaultProps: {
      required: false,
      validation: { minLength: 25 }
    }
  },
  {
    id: 'why_deserve_scholarship',
    type: 'textarea',
    label: 'Why do you deserve this scholarship?',
    category: 'essay',
    icon: FiAward,
    defaultLabel: 'Why do you deserve this scholarship?',
    description: 'Explain why you should receive this scholarship',
    defaultProps: {
      required: false,
      validation: { minLength: 25 }
    }
  },
  {
    id: 'work_experience',
    type: 'textarea',
    label: 'Work Experience',
    category: 'essay',
    icon: FiBriefcase,
    defaultLabel: 'Work Experience',
    description: 'Describe your work and internship experience',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'extracurricular_activities',
    type: 'textarea',
    label: 'Extracurricular Activities',
    category: 'essay',
    icon: FiUsers,
    defaultLabel: 'Extracurricular Activities',
    description: 'List your clubs, sports, and activities',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'awards_and_honors',
    type: 'textarea',
    label: 'Awards and Honors',
    category: 'essay',
    icon: FiAward,
    defaultLabel: 'Awards and Honors',
    description: 'List any awards, honors, or recognition received',
    defaultProps: {
      required: false
    }
  },

  // Custom Field Types
  {
    id: 'custom_text',
    type: 'text',
    label: 'Text Input',
    category: 'custom',
    icon: FiType,
    defaultLabel: 'Text Field',
    description: 'Single-line text input',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'custom_textarea',
    type: 'textarea',
    label: 'Text Area',
    category: 'custom',
    icon: FiFileText,
    defaultLabel: 'Long Text',
    description: 'Multi-line text input',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'custom_number',
    type: 'number',
    label: 'Number Input',
    category: 'custom',
    icon: FiHash,
    defaultLabel: 'Number Field',
    description: 'Numeric input field',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'custom_date',
    type: 'date',
    label: 'Date Picker',
    category: 'custom',
    icon: FiCalendar,
    defaultLabel: 'Date Field',
    description: 'Date selection field',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'custom_select',
    type: 'select',
    label: 'Dropdown',
    category: 'custom',
    icon: FiList,
    defaultLabel: 'Select Option',
    description: 'Dropdown selection field',
    defaultProps: {
      required: false,
      options: ['Option 1', 'Option 2', 'Option 3']
    }
  },
  {
    id: 'custom_checkbox',
    type: 'checkbox',
    label: 'Checkbox',
    category: 'custom',
    icon: FiCheckSquare,
    defaultLabel: 'Checkbox',
    description: 'Single checkbox field',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'custom_file',
    type: 'file',
    label: 'File Upload',
    category: 'custom',
    icon: FiUpload,
    defaultLabel: 'Upload File',
    description: 'File upload field',
    defaultProps: {
      required: false,
      acceptedFormats: ['.pdf', '.doc', '.docx'],
      maxSize: 5 * 1024 * 1024 // 5MB
    }
  },
  {
    id: 'custom_email',
    type: 'email',
    label: 'Email Field',
    category: 'custom',
    icon: FiMail,
    defaultLabel: 'Email Address',
    description: 'Email input with validation',
    defaultProps: {
      required: false
    }
  },
  {
    id: 'custom_phone',
    type: 'phone',
    label: 'Phone Field',
    category: 'custom',
    icon: FiPhone,
    defaultLabel: 'Phone Number',
    description: 'Phone number input with formatting',
    defaultProps: {
      required: false
    }
  }
];

// Helper function to get fields by category
export function getFieldsByCategory(category: FieldTemplate['category']): FieldTemplate[] {
  return FIELD_LIBRARY.filter(field => field.category === category);
}

// Helper function to create a new field instance with guaranteed unique ID
export function createFieldFromTemplate(template: FieldTemplate, customId?: string): FormField {
  const uniqueId = customId || `${template.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    id: uniqueId,
    type: template.type,
    label: template.defaultLabel,
    required: template.defaultProps.required || false,
    order: 1,
    ...template.defaultProps
  };
}

// Default form templates
export const DEFAULT_FORM_TEMPLATES = {
  standard: {
    name: 'Standard Application',
    description: 'Complete application form with all standard fields',
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        description: 'Tell us about yourself',
        order: 1,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'first_name')!, 'first_name'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'last_name')!, 'last_name'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'email')!, 'email'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'phone')!, 'phone'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'address')!, 'address'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'city')!, 'city'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'state')!, 'state'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'zip')!, 'zip'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'date_of_birth')!, 'date_of_birth')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      },
      {
        id: 'academic',
        title: 'Academic Background',
        description: 'Share your educational journey',
        order: 2,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'school')!, 'school'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'graduation_year')!, 'graduation_year'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'major')!, 'major'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'gpa')!, 'gpa'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'academic_level')!, 'academic_level')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      },
      {
        id: 'essays',
        title: 'Essay Questions',
        description: 'Help us understand your goals and motivations',
        order: 3,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'career_goals')!, 'career_goals'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'financial_need')!, 'financial_need'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'community_involvement')!, 'community_involvement'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'why_deserve_scholarship')!, 'why_deserve_scholarship')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      },
      {
        id: 'additional',
        title: 'Additional Information',
        description: 'Share more about your experiences',
        order: 4,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'work_experience')!, 'work_experience'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'extracurricular_activities')!, 'extracurricular_activities'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'awards_and_honors')!, 'awards_and_honors')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      }
    ]
  },
  
  minimal: {
    name: 'Minimal Application',
    description: 'Basic application with essential fields only',
    sections: [
      {
        id: 'basic',
        title: 'Basic Information',
        description: 'Essential information about you',
        order: 1,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'first_name')!, 'first_name'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'last_name')!, 'last_name'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'email')!, 'email'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'school')!, 'school'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'major')!, 'major')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      },
      {
        id: 'essay',
        title: 'Personal Statement',
        description: 'Tell us about yourself',
        order: 2,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'why_deserve_scholarship')!, 'why_deserve_scholarship')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      }
    ]
  },

  academic: {
    name: 'Academic Focus',
    description: 'Emphasis on academic achievements and goals',
    sections: [
      {
        id: 'contact',
        title: 'Contact Information',
        description: 'How to reach you',
        order: 1,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'first_name')!, 'first_name'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'last_name')!, 'last_name'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'email')!, 'email')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      },
      {
        id: 'academic',
        title: 'Academic Information',
        description: 'Your educational background and achievements',
        order: 2,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'school')!, 'school'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'graduation_year')!, 'graduation_year'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'major')!, 'major'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'gpa')!, 'gpa'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'academic_level')!, 'academic_level')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      },
      {
        id: 'achievements',
        title: 'Academic Achievements',
        description: 'Your accomplishments and future goals',
        order: 3,
        fields: [
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'awards_and_honors')!, 'awards_and_honors'),
          createFieldFromTemplate(FIELD_LIBRARY.find(f => f.id === 'career_goals')!, 'career_goals')
        ].map((field, index) => ({ ...field, order: index + 1 }))
      }
    ]
  }
};