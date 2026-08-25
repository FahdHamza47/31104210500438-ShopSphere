import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-sm text-ink-500">{description}</p>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" isLoading={isLoading} onClick={onConfirm}>
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
