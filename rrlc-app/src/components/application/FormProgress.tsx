"use client";

import { FiCheck, FiCircle } from "react-icons/fi";
import { FormStep } from "@/hooks/useApplicationForm";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepProgress: number;
  steps: FormStep[];
  onStepClick?: (stepIndex: number) => void;
}

export function FormProgress({
  currentStep,
  totalSteps,
  stepProgress,
  steps,
  onStepClick
}: FormProgressProps) {
  return (
    <div className="bg-white border-2 border-accent-dark rounded-lg p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-primary font-medium">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <span className="text-sm text-primary-dark">
            {Math.round(stepProgress)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Background Line */}
          <div className="absolute h-0.5 bg-gray-200" style={{ 
            left: 'calc(50% / ' + steps.length + ' * 0.6)',
            width: 'calc(100% - (100% / ' + steps.length + ' * 0.6))',
            top: '1rem'
          }}></div>
          
          {/* Progress Line */}
          <div 
            className="absolute h-0.5 bg-green-500 transition-all duration-300" 
            style={{ 
              left: 'calc(50% / ' + steps.length + ' * 0.6)',
              top: '1rem',
              width: currentStep > 0 ? `calc((100% - (100% / ${steps.length} * 0.6)) * ${currentStep / (steps.length - 1)})` : '0%'
            }}
          ></div>
          
          <div className="flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isClickable = onStepClick && index <= currentStep;

              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center relative z-10 ${
                    isClickable ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => isClickable && onStepClick(index)}
                >
                  {/* Step Circle */}
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors
                      ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-500'
                      }
                      ${isClickable ? 'hover:bg-primary-light' : ''}
                    `}
                  >
                    {isCompleted ? (
                      <FiCheck size={16} />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Title */}
                  <div className="text-center">
                    <div
                      className={`text-xs font-medium ${
                        isCurrent
                          ? 'text-primary'
                          : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Step Indicators */}
      <div className="md:hidden">
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < currentStep
                  ? 'bg-green-500'
                  : index === currentStep
                  ? 'bg-primary'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        <div className="text-center mt-3">
          <div className="text-sm font-medium text-primary">
            {steps[currentStep]?.title}
          </div>
          <div className="text-xs text-primary-dark">
            {steps[currentStep]?.description}
          </div>
        </div>
      </div>
    </div>
  );
}