"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomField } from "@/types/database";
import { FileUploadField } from "./FileUploadField";
import { FiAlertCircle } from "react-icons/fi";

interface CustomFieldRendererProps {
  field: CustomField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function CustomFieldRenderer({ field, value, onChange, error }: CustomFieldRendererProps) {
  const [touched, setTouched] = useState(false);

  const handleBlur = () => {
    setTouched(true);
  };

  const showError = error && touched;

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            id={field.id}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={showError ? 'border-red-500' : ''}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={showError ? 'border-red-500' : ''}
            rows={4}
            maxLength={field.validation?.maxLength}
          />
        );

      case 'number':
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : '')}
            onBlur={handleBlur}
            placeholder={field.placeholder}
            className={showError ? 'border-red-500' : ''}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case 'date':
        return (
          <Input
            id={field.id}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            className={showError ? 'border-red-500' : ''}
          />
        );

      case 'select':
        return (
          <Select
            value={value || ''}
            onValueChange={(newValue) => {
              onChange(newValue);
              setTouched(true);
            }}
          >
            <SelectTrigger id={field.id} className={showError ? 'border-red-500' : ''}>
              <SelectValue placeholder={field.placeholder || 'Select an option'} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              checked={value || false}
              onCheckedChange={(checked) => {
                onChange(checked);
                setTouched(true);
              }}
            />
            <Label
              htmlFor={field.id}
              className="text-sm font-normal cursor-pointer"
            >
              {field.placeholder || 'Check this box'}
            </Label>
          </div>
        );

      case 'file':
        return (
          <FileUploadField
            id={field.id}
            value={value}
            onChange={(file) => {
              onChange(file);
              setTouched(true);
            }}
            acceptedFormats={field.acceptedFormats}
            maxSize={field.maxSize}
            error={showError ? error : undefined}
          />
        );

      case 'email':
        return (
          <Input
            id={field.id}
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder || 'email@example.com'}
            className={showError ? 'border-red-500' : ''}
          />
        );

      case 'phone':
        return (
          <Input
            id={field.id}
            type="tel"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleBlur}
            placeholder={field.placeholder || '(555) 123-4567'}
            className={showError ? 'border-red-500' : ''}
          />
        );

      default:
        return (
          <div className="text-gray-500">
            Unsupported field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      {field.type !== 'checkbox' && (
        <Label htmlFor={field.id} className="text-primary">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {renderField()}
      
      {showError && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <FiAlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {field.validation && (
        <div className="text-sm text-gray-600">
          {field.validation.minLength && field.validation.minLength > 1 && (
            <span>Minimum {field.validation.minLength} characters</span>
          )}
          {field.validation.maxLength && (
            <span>Maximum {field.validation.maxLength} characters</span>
          )}
          {field.validation.min !== undefined && field.validation.max !== undefined && (
            <span>Value must be between {field.validation.min} and {field.validation.max}</span>
          )}
        </div>
      )}
    </div>
  );
}