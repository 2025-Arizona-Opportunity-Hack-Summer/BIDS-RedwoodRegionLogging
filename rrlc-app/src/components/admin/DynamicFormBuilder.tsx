"use client";

import { useState, useCallback } from "react";
import { 
  FiPlus, 
  FiTrash2, 
  FiMove, 
  FiEdit3,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiFolder,
  FiSettings
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { FormSchema, FormSection, FormField } from "@/types/database";
import { 
  FIELD_LIBRARY, 
  FieldTemplate, 
  getFieldsByCategory, 
  createFieldFromTemplate,
  DEFAULT_FORM_TEMPLATES 
} from "@/lib/formFields";

interface DynamicFormBuilderProps {
  formSchema: FormSchema | null;
  onChange: (schema: FormSchema) => void;
  onPreview?: () => void;
}

interface DragState {
  draggedField: FieldTemplate | null;
  draggedSection: number | null;
  draggedFieldIndex: { sectionIndex: number; fieldIndex: number } | null;
}

export function DynamicFormBuilder({ formSchema, onChange, onPreview }: DynamicFormBuilderProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [editingField, setEditingField] = useState<{ sectionIndex: number; fieldIndex: number } | null>(null);
  const [dragState, setDragState] = useState<DragState>({
    draggedField: null,
    draggedSection: null,
    draggedFieldIndex: null
  });
  const [showTemplates, setShowTemplates] = useState(!formSchema?.sections?.length);

  const currentSchema = formSchema || { sections: [] };

  // Template selection
  const loadTemplate = useCallback((templateKey: keyof typeof DEFAULT_FORM_TEMPLATES) => {
    const template = DEFAULT_FORM_TEMPLATES[templateKey];
    onChange({
      sections: template.sections as FormSection[]
    });
    setShowTemplates(false);
  }, [onChange]);

  // Section management
  const addSection = useCallback(() => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: 'New Section',
      description: 'Section description',
      order: currentSchema.sections.length + 1,
      fields: []
    };
    
    onChange({
      sections: [...currentSchema.sections, newSection]
    });
  }, [currentSchema.sections, onChange]);

  const updateSection = useCallback((sectionIndex: number, updates: Partial<FormSection>) => {
    const updatedSections = [...currentSchema.sections];
    updatedSections[sectionIndex] = { ...updatedSections[sectionIndex], ...updates };
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  const removeSection = useCallback((sectionIndex: number) => {
    const updatedSections = currentSchema.sections.filter((_, index) => index !== sectionIndex);
    // Update order
    updatedSections.forEach((section, index) => {
      section.order = index + 1;
    });
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  const moveSection = useCallback((fromIndex: number, toIndex: number) => {
    const updatedSections = [...currentSchema.sections];
    const [movedSection] = updatedSections.splice(fromIndex, 1);
    updatedSections.splice(toIndex, 0, movedSection);
    
    // Update order
    updatedSections.forEach((section, index) => {
      section.order = index + 1;
    });
    
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  // Field management
  const addFieldToSection = useCallback((sectionIndex: number, fieldTemplate: FieldTemplate) => {
    const updatedSections = [...currentSchema.sections];
    const section = updatedSections[sectionIndex];
    
    // Generate a truly unique ID by combining template type, timestamp, section index, and random string
    const uniqueId = `${fieldTemplate.type}_${sectionIndex}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newField = createFieldFromTemplate(fieldTemplate, uniqueId);
    newField.order = section.fields.length + 1;
    
    section.fields.push(newField);
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  const updateField = useCallback((sectionIndex: number, fieldIndex: number, updates: Partial<FormField>) => {
    const updatedSections = [...currentSchema.sections];
    updatedSections[sectionIndex].fields[fieldIndex] = {
      ...updatedSections[sectionIndex].fields[fieldIndex],
      ...updates
    };
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  const removeField = useCallback((sectionIndex: number, fieldIndex: number) => {
    const updatedSections = [...currentSchema.sections];
    updatedSections[sectionIndex].fields = updatedSections[sectionIndex].fields.filter((_, index) => index !== fieldIndex);
    
    // Update order
    updatedSections[sectionIndex].fields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  const moveField = useCallback((fromSection: number, fromField: number, toSection: number, toField: number) => {
    const updatedSections = [...currentSchema.sections];
    
    // Remove field from source
    const [movedField] = updatedSections[fromSection].fields.splice(fromField, 1);
    
    // Add field to destination
    updatedSections[toSection].fields.splice(toField, 0, movedField);
    
    // Update order in both sections
    updatedSections[fromSection].fields.forEach((field, index) => {
      field.order = index + 1;
    });
    updatedSections[toSection].fields.forEach((field, index) => {
      field.order = index + 1;
    });
    
    onChange({ sections: updatedSections });
  }, [currentSchema.sections, onChange]);

  // Drag and drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: any, type: string) => {
    e.dataTransfer.effectAllowed = 'move';
    
    if (type === 'field-template') {
      setDragState(prev => ({ ...prev, draggedField: item as FieldTemplate }));
    } else if (type === 'section') {
      setDragState(prev => ({ ...prev, draggedSection: item as number }));
    } else if (type === 'field') {
      setDragState(prev => ({ ...prev, draggedFieldIndex: item }));
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, target: any, type: string) => {
    e.preventDefault();
    
    if (type === 'section' && dragState.draggedField) {
      // Add field to section
      addFieldToSection(target.sectionIndex, dragState.draggedField);
    } else if (type === 'section-reorder' && dragState.draggedSection !== null) {
      // Reorder sections
      if (dragState.draggedSection !== target.sectionIndex) {
        moveSection(dragState.draggedSection, target.sectionIndex);
      }
    } else if (type === 'field-reorder' && dragState.draggedFieldIndex) {
      // Reorder fields
      const { sectionIndex: fromSection, fieldIndex: fromField } = dragState.draggedFieldIndex;
      const { sectionIndex: toSection, fieldIndex: toField } = target;
      
      if (fromSection !== toSection || fromField !== toField) {
        moveField(fromSection, fromField, toSection, toField);
      }
    }
    
    setDragState({ draggedField: null, draggedSection: null, draggedFieldIndex: null });
  }, [dragState, addFieldToSection, moveSection, moveField]);

  // Field categories for the sidebar
  const fieldCategories = [
    { key: 'personal', label: 'Personal', icon: FiEdit3 },
    { key: 'contact', label: 'Contact', icon: FiEdit3 },
    { key: 'academic', label: 'Academic', icon: FiEdit3 },
    { key: 'essay', label: 'Essays', icon: FiEdit3 },
    { key: 'custom', label: 'Custom', icon: FiEdit3 }
  ] as const;

  if (showTemplates) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-primary mb-2">Choose a Form Template</h2>
          <p className="text-gray-600">Start with a pre-built template or create from scratch</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {Object.entries(DEFAULT_FORM_TEMPLATES).map(([key, template]) => (
            <Card 
              key={key}
              className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary"
              onClick={() => loadTemplate(key as keyof typeof DEFAULT_FORM_TEMPLATES)}
            >
              <CardContent className="p-6 text-center">
                <FiFolder className="mx-auto mb-4 text-3xl text-primary" />
                <h3 className="text-lg font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="text-xs text-gray-500">
                  {template.sections.length} sections • {template.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange({ sections: [] });
              setShowTemplates(false);
            }}
            className="border-gray-300"
          >
            Start from Scratch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold mb-2">Dynamic Form Builder</h2>
          <p className="text-sm text-gray-600">
            Drag fields from the library to build your custom application form
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTemplates(true);
            }}
          >
            <FiRefreshCw className="mr-2" />
            Templates
          </Button>
          {onPreview && (
            <Button 
              type="button"
              variant="outline" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPreview();
              }}
            >
              <FiEye className="mr-2" />
              Preview
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Field Library Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <FiSettings />
                Field Library
              </h3>
              
              {fieldCategories.map(category => (
                <div key={category.key} className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <category.icon size={14} />
                    {category.label}
                  </h4>
                  <div className="space-y-1">
                    {getFieldsByCategory(category.key).map(field => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, field, 'field-template')}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded cursor-grab hover:bg-gray-100 active:cursor-grabbing"
                        title={field.description}
                      >
                        <field.icon size={16} className="text-primary" />
                        <span className="text-xs">{field.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Form Builder Main Area */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {currentSchema.sections.map((section, sectionIndex) => (
              <Card 
                key={section.id}
                className="border-2 border-gray-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, { sectionIndex }, 'section')}
              >
                <CardContent className="p-4">
                  {/* Section Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={section.title}
                        onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                        className="font-semibold"
                        placeholder="Section Title"
                      />
                      <Input
                        value={section.description}
                        onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                        className="text-sm"
                        placeholder="Section Description"
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        draggable
                        onDragStart={(e) => handleDragStart(e, sectionIndex, 'section')}
                        className="cursor-grab"
                      >
                        <FiMove />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeSection(sectionIndex);
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <FiTrash2 />
                      </Button>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="space-y-2">
                    {section.fields.map((field, fieldIndex) => (
                      <div
                        key={field.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, { sectionIndex, fieldIndex }, 'field')}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, { sectionIndex, fieldIndex }, 'field-reorder')}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200 cursor-grab hover:bg-gray-100"
                      >
                        <FiMove className="text-gray-400" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.label}</span>
                            {field.required && <span className="text-red-500 text-xs">*</span>}
                            <span className="text-xs text-gray-500 px-2 py-1 bg-white rounded">
                              {field.type}
                            </span>
                          </div>
                          {field.placeholder && (
                            <p className="text-xs text-gray-500 mt-1">{field.placeholder}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingField({ sectionIndex, fieldIndex });
                            }}
                          >
                            <FiEdit3 size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeField(sectionIndex, fieldIndex);
                            }}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <FiTrash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    {/* Drop zone for new fields */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, { sectionIndex }, 'section')}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-primary hover:text-primary transition-colors"
                    >
                      {section.fields.length === 0 ? (
                        <>Drag fields here to add them to this section</>
                      ) : (
                        <>Drop fields here to add more</>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Section Button */}
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addSection();
              }}
              className="w-full border-dashed border-2 border-gray-300 h-16 hover:border-primary"
            >
              <FiPlus className="mr-2" />
              Add New Section
            </Button>
          </div>
        </div>
      </div>

      {/* Field Editor Modal - Simplified for now */}
      {editingField && (
        <div className="fixed inset-0 bg-black bg-opacity-15 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <CardContent className="p-6">
              {(() => {
                const field = currentSchema.sections[editingField.sectionIndex].fields[editingField.fieldIndex];
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Edit Field</h3>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Label</label>
                      <Input
                        value={field.label}
                        onChange={(e) => updateField(editingField.sectionIndex, editingField.fieldIndex, { label: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Placeholder</label>
                      <Input
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(editingField.sectionIndex, editingField.fieldIndex, { placeholder: e.target.value })}
                        placeholder="Optional placeholder text"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(editingField.sectionIndex, editingField.fieldIndex, { required: e.target.checked })}
                      />
                      <label className="text-sm">Required field</label>
                    </div>
                    
                    {field.type === 'select' && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Options (one per line)</label>
                        <Textarea
                          value={field.options?.join('\n') || ''}
                          onChange={(e) => updateField(editingField.sectionIndex, editingField.fieldIndex, { 
                            options: e.target.value.split('\n').filter(o => o.trim()) 
                          })}
                          rows={4}
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button"
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingField(null);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingField(null);
                        }}
                      >
                        <FiSave className="mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}