import { FiAlertTriangle } from "react-icons/fi";
import { Modal, ModalFooter } from "./modal";
import { Button } from "./button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "danger"
}: ConfirmationModalProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconColor: "text-red-600",
          confirmButtonClass: "bg-red-600 hover:bg-red-700 text-white",
          titleClass: "text-red-900"
        };
      case "warning":
        return {
          iconColor: "text-yellow-600",
          confirmButtonClass: "bg-yellow-600 hover:bg-yellow-700 text-white",
          titleClass: "text-yellow-900"
        };
      case "info":
      default:
        return {
          iconColor: "text-blue-600",
          confirmButtonClass: "bg-blue-600 hover:bg-blue-700 text-white",
          titleClass: "text-blue-900"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <FiAlertTriangle className={`h-6 w-6 ${styles.iconColor}`} />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className={`text-lg font-semibold mb-2 ${styles.titleClass}`}>
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        <ModalFooter className="justify-center space-x-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 ${styles.confirmButtonClass}`}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}