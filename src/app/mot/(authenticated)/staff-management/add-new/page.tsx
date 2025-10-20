'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '@/components/shared/layout';
import TimekeeperForm from '@/components/mot/users/timekeeper/timekeeper-form';

// Define the same interface used in your form
interface TimekeeperResponse {
  id: string;
  fullname: string;
  phonenumber: string;
  email: string;
  assign_stand: string;
  nic: string;
  province: string;
  user_id?: string;
  createdAt?: string;
}

export default function AddNewTimekeeperPage() {
  const router = useRouter();

  const handleSuccess = (timekeeper: TimekeeperResponse) => {
    // After creation, go to details or list page
    if (timekeeper?.id) {
      router.push(`/mot/staff-management/${timekeeper.id}`);
    } else {
      router.push('/mot/staff-management');
    }
  };

  const handleCancel = () => {
    router.push('/mot/staff-management');
  };

  return (
    <Layout
      activeItem="timekeepers"
      pageTitle="Add New Timekeeper"
      pageDescription="Create a new timekeeper with company and operational information"
      role="mot"
    >
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col items-start gap-4">
          <button
            onClick={() => router.push('/mot/staff-management')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Timekeepers
          </button>
        </div>

        {/* Form */}
        <TimekeeperForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </Layout>
  );
}
