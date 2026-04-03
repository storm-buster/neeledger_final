import {
  Dialog as AriaDialog,
  DialogTrigger,
  Modal,
  ModalOverlay,
  Heading,
  type DialogProps as AriaDialogProps,
} from 'react-aria-components';
import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface DialogProps extends AriaDialogProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  trigger?: ReactNode;
}

export const Dialog = ({ isOpen, onOpenChange, title, description, children, trigger }: DialogProps) => {
  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      {trigger}
      <ModalOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0">
        <Modal className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[entering]:zoom-in-95 data-[exiting]:zoom-out-95 data-[entering]:slide-in-from-left-1/2 data-[entering]:slide-in-from-top-[48%] data-[exiting]:slide-out-to-left-1/2 data-[exiting]:slide-out-to-top-[48%]">
          <AriaDialog className="rounded-xl border bg-white p-6 shadow-lg">
            {({ close }) => (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    {title && (
                      <Heading slot="title" className="text-lg font-semibold leading-none tracking-tight">
                        {title}
                      </Heading>
                    )}
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={close}
                    className="rounded-full p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">{children}</div>
              </>
            )}
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
};
