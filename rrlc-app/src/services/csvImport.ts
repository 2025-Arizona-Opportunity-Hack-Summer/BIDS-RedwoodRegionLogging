import Papa from 'papaparse';
import { supabase } from '@/lib/supabaseClient';
import { CreateApplicationData } from '@/types/database';

export interface CSVRow {
  [key: string]: string;
}

export interface ParsedApplication extends CreateApplicationData {
  _rowNumber: number;
  _errors: string[];
}

export interface ImportResult {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  message: string;
  data?: any;
}

// Expected CSV headers (mapping from CSV header to database field)
export const CSV_FIELD_MAPPINGS = {
  // Personal Information
  'first_name': 'first_name',
  'last_name': 'last_name',
  'email': 'email',
  'phone': 'phone',
  'address': 'address',
  'city': 'city',
  'state': 'state',
  'zip': 'zip',
  'date_of_birth': 'date_of_birth',
  
  // Academic Information
  'school': 'school',
  'graduation_year': 'graduation_year',
  'gpa': 'gpa',
  'major': 'major',
  'academic_level': 'academic_level',
  
  // Essay Responses
  'career_goals': 'career_goals',
  'financial_need': 'financial_need',
  'community_involvement': 'community_involvement',
  'why_deserve_scholarship': 'why_deserve_scholarship',
  
  // Additional Information
  'work_experience': 'work_experience',
  'extracurricular_activities': 'extracurricular_activities',
  'awards_and_honors': 'awards_and_honors',
  
  // Scholarship ID (required)
  'scholarship_id': 'scholarship_id'
};

// Required fields for import
const REQUIRED_FIELDS = [
  'scholarship_id',
  'first_name',
  'last_name', 
  'email',
  'school',
  'major'
];

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone format
function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Parse CSV file
export function parseCSVFile(file: File): Promise<{ data: CSVRow[]; errors: string[] }> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Normalize header names (lowercase, replace spaces with underscores)
        return header.toLowerCase().trim().replace(/\s+/g, '_');
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          results.errors.forEach(error => {
            errors.push(`Row ${error.row}: ${error.message}`);
          });
        }
        
        resolve({
          data: results.data as CSVRow[],
          errors
        });
      },
      error: (error) => {
        errors.push(`Failed to parse CSV: ${error.message}`);
        resolve({ data: [], errors });
      }
    });
  });
}

// Validate and transform CSV row to application data
export function validateAndTransformRow(row: CSVRow, rowNumber: number): ParsedApplication {
  const errors: string[] = [];
  const application: Partial<CreateApplicationData> = {};

  // Check for required fields
  REQUIRED_FIELDS.forEach(field => {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Transform and validate each field
  Object.entries(CSV_FIELD_MAPPINGS).forEach(([csvField, dbField]) => {
    const value = row[csvField]?.trim();
    
    if (value) {
      switch (dbField) {
        case 'email':
          if (!isValidEmail(value)) {
            errors.push(`Invalid email format: ${value}`);
          } else {
            (application as any)[dbField] = value;
          }
          break;
          
        case 'phone':
          if (!isValidPhone(value)) {
            errors.push(`Invalid phone format: ${value}`);
          } else {
            (application as any)[dbField] = value;
          }
          break;
          
        case 'graduation_year':
          const year = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (isNaN(year) || year < currentYear - 10 || year > currentYear + 10) {
            errors.push(`Invalid graduation year: ${value}`);
          } else {
            (application as any)[dbField] = year;
          }
          break;
          
        case 'gpa':
          if (value) {
            const gpa = parseFloat(value);
            if (isNaN(gpa) || gpa < 0 || gpa > 4.0) {
              errors.push(`Invalid GPA: ${value} (must be between 0.0 and 4.0)`);
            } else {
              (application as any)[dbField] = gpa;
            }
          }
          break;
          
        case 'academic_level':
          const validLevels = ['high_school', 'undergraduate', 'graduate', 'other'];
          if (!validLevels.includes(value)) {
            errors.push(`Invalid academic level: ${value} (must be one of: ${validLevels.join(', ')})`);
          } else {
            (application as any)[dbField] = value;
          }
          break;
          
        default:
          (application as any)[dbField] = value;
          break;
      }
    }
  });

  // Set default values
  if (!application.academic_level) {
    application.academic_level = 'undergraduate';
  }
  
  if (!application.status) {
    application.status = 'submitted';
  }

  return {
    ...application as CreateApplicationData,
    _rowNumber: rowNumber,
    _errors: errors
  };
}

// Validate parsed applications
export function validateParsedApplications(applications: ParsedApplication[]): {
  valid: ParsedApplication[];
  invalid: ParsedApplication[];
  errors: ImportError[];
} {
  const valid: ParsedApplication[] = [];
  const invalid: ParsedApplication[] = [];
  const errors: ImportError[] = [];

  applications.forEach(app => {
    if (app._errors.length === 0) {
      valid.push(app);
    } else {
      invalid.push(app);
      app._errors.forEach(error => {
        errors.push({
          row: app._rowNumber,
          message: error,
          data: app
        });
      });
    }
  });

  return { valid, invalid, errors };
}

// Check for duplicate emails in the batch
export function checkDuplicateEmails(applications: ParsedApplication[]): ImportError[] {
  const errors: ImportError[] = [];
  const emailMap = new Map<string, number[]>();

  applications.forEach(app => {
    if (app.email) {
      if (!emailMap.has(app.email)) {
        emailMap.set(app.email, []);
      }
      emailMap.get(app.email)!.push(app._rowNumber);
    }
  });

  emailMap.forEach((rows, email) => {
    if (rows.length > 1) {
      rows.forEach(row => {
        errors.push({
          row,
          message: `Duplicate email in batch: ${email} (also found in rows: ${rows.filter(r => r !== row).join(', ')})`
        });
      });
    }
  });

  return errors;
}

// Check for existing applications in database
export async function checkExistingApplications(applications: ParsedApplication[]): Promise<ImportError[]> {
  const errors: ImportError[] = [];
  
  try {
    const emails = applications.map(app => app.email).filter(Boolean);
    const scholarshipIds = [...new Set(applications.map(app => app.scholarship_id))];
    
    if (emails.length === 0 || scholarshipIds.length === 0) {
      return errors;
    }

    // Check for existing applications for these scholarships and emails
    const { data: existingApps, error } = await supabase
      .from('applications')
      .select('email, scholarship_id')
      .in('email', emails)
      .in('scholarship_id', scholarshipIds);

    if (error) {
      console.error('Error checking existing applications:', error);
      return errors;
    }

    if (existingApps) {
      const existingMap = new Map<string, Set<string>>();
      existingApps.forEach(app => {
        if (!existingMap.has(app.email)) {
          existingMap.set(app.email, new Set());
        }
        existingMap.get(app.email)!.add(app.scholarship_id);
      });

      applications.forEach(app => {
        if (app.email && app.scholarship_id) {
          const userScholarships = existingMap.get(app.email);
          if (userScholarships && userScholarships.has(app.scholarship_id)) {
            errors.push({
              row: app._rowNumber,
              message: `Application already exists for email ${app.email} and this scholarship`
            });
          }
        }
      });
    }
  } catch (error) {
    console.error('Error checking existing applications:', error);
  }

  return errors;
}

// Import applications to database
export async function importApplications(applications: ParsedApplication[]): Promise<ImportResult> {
  let successCount = 0;
  let errorCount = 0;
  const errors: ImportError[] = [];

  try {
    // Remove internal fields before inserting
    const cleanApplications = applications.map(app => {
      const { _rowNumber, _errors, ...cleanApp } = app;
      return {
        ...cleanApp,
        status: 'submitted',
        submission_date: new Date().toISOString()
      };
    });

    // Insert applications in batches to avoid overwhelming the database
    const batchSize = 50;
    for (let i = 0; i < cleanApplications.length; i += batchSize) {
      const batch = cleanApplications.slice(i, i + batchSize);
      const originalBatch = applications.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from('applications')
        .insert(batch)
        .select('id');

      if (error) {
        // If batch insert fails, try individual inserts to identify specific errors
        for (let j = 0; j < batch.length; j++) {
          const { error: individualError } = await supabase
            .from('applications')
            .insert([batch[j]])
            .select('id');

          if (individualError) {
            errors.push({
              row: originalBatch[j]._rowNumber,
              message: `Database error: ${individualError.message}`,
              data: originalBatch[j]
            });
            errorCount++;
          } else {
            successCount++;
          }
        }
      } else {
        successCount += batch.length;
      }
    }
  } catch (error) {
    console.error('Import error:', error);
    errors.push({
      row: 0,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    errorCount = applications.length;
  }

  return {
    success: successCount > 0,
    processedCount: applications.length,
    successCount,
    errorCount,
    errors
  };
}

// Generate CSV template for download
export function generateCSVTemplate(): string {
  const headers = Object.keys(CSV_FIELD_MAPPINGS);
  const sampleRow = {
    scholarship_id: 'your-scholarship-id-here',
    first_name: 'John',
    last_name: 'Doe', 
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    address: '123 Main St',
    city: 'Portland',
    state: 'OR',
    zip: '97201',
    school: 'Oregon State University',
    graduation_year: '2025',
    gpa: '3.5',
    major: 'Forestry',
    academic_level: 'undergraduate',
    career_goals: 'I want to work in sustainable forestry management...',
    financial_need: 'I need financial assistance to complete my education...',
    community_involvement: 'I volunteer with local environmental groups...'
  };

  const rows = [headers, headers.map(header => sampleRow[header as keyof typeof sampleRow] || '')];
  
  return Papa.unparse(rows);
}