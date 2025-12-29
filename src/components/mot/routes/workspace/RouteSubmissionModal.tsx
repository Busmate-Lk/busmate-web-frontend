'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RouteSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RouteSubmissionModal({ isOpen, onClose }: RouteSubmissionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Route Submission</DialogTitle>
        </DialogHeader>
        <p>This is a demo message for route submission.</p>
      </DialogContent>
    </Dialog>
  );
}
