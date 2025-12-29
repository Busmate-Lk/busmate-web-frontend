import { TripAssignment } from '@/components/mot/trip-assignment';
import { Metadata } from 'next';
import { Layout } from '@/components/shared/layout';

export const metadata: Metadata = {
  title: 'Trip Assignment | BusMate',
  description: 'Assign weekly schedule instances/trips to passenger service permits',
};

export default function TripAssignmentPage() {
  return (
    <div className="h-[100vh] bg-gray-50 overflow-hidden">
    <Layout 
      activeItem="trip-assignment" 
      pageTitle="Trip Assignment" 
      pageDescription="Assign weekly schedule instances/trips to passenger service permits" 
      role="MOT"
      initialSidebarCollapsed={true}
      padding={0}>
      <TripAssignment />
    </Layout>
    </div>
  );
}
