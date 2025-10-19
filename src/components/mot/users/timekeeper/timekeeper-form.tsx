'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Loader2, AlertCircle, User } from 'lucide-react';
import { TimekeeperControllerService } from '@/lib/api-client/user-management/services/TimekeeperControllerService';
import { BusStopManagementService } from '@/lib/api-client/route-management/services/BusStopManagementService';

interface TimekeeperRequest {
  fullname: string;
  phonenumber: string;
  email: string;
  assign_stand: string;
  nic: string;
  province: string;
  password: string;
}

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

interface TimekeeperFormProps {
  timekeeperId?: string;
  onSuccess?: (timekeeper: TimekeeperResponse) => void;
  onCancel?: () => void;
}

interface FormData extends TimekeeperRequest {}
interface FormErrors {
  [key: string]: string | undefined;
}

const SRI_LANKAN_PROVINCES = [
  'Western Province', 'Central Province', 'Southern Province', 'Northern Province',
  'Eastern Province', 'North Western Province', 'North Central Province',
  'Uva Province', 'Sabaragamuwa Province',
];

export default function TimekeeperForm({ timekeeperId, onSuccess, onCancel }: TimekeeperFormProps) {
  const router = useRouter();
  const isEditMode = !!timekeeperId;

  const [formData, setFormData] = useState<FormData>({
    fullname: '', phonenumber: '', email: '', assign_stand: '',
    nic: '', province: '', password: '',
  });

  const [busStops, setBusStops] = useState<{ id: string; stopName: string }[]>([]);
  const [loadingBusStops, setLoadingBusStops] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDirty, setIsDirty] = useState(false);

  // ---------------- Input Change ----------------
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setIsDirty(true);
    setErrors(prev => ({ ...prev, [field]: undefined, general: undefined }));
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ---------------- Form Validation ----------------
  const validateForm = (): boolean => {
  const newErrors: FormErrors = {};

  if (!formData.fullname.trim()) newErrors.fullname = 'Full name is required';

  // Phone number: exactly 10 digits
  if (!/^\d{10}$/.test(formData.phonenumber))
    newErrors.phonenumber = 'Phone number must be exactly 10 digits';

  // Email validation
  if (!formData.email.trim()) newErrors.email = 'Email is required';
  else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';

  if (!formData.assign_stand.trim()) newErrors.assign_stand = 'Assigned stand is required';

  // NIC: 12 digits or 11 digits ending with v/V
  if (!/^(\d{12}|\d{11}[vV])$/.test(formData.nic))
    newErrors.nic = 'NIC must be 12 digits or 11 digits ending with V';

  if (!formData.province.trim()) newErrors.province = 'Province is required';

  // Password: min 6 chars, at least one lowercase, uppercase, number, special
  if (!isEditMode) {
    if (!formData.password) newErrors.password = 'Password is required';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}/.test(formData.password))
      newErrors.password = 'Password must be at least 6 chars, include uppercase, lowercase, number & special char';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  // ---------------- Fetch Bus Stops ----------------
  useEffect(() => {
    const fetchBusStops = async () => {
      try {
        setLoadingBusStops(true);
        const response: any = await BusStopManagementService.getAllStops();

        const stopsArray: any[] = Array.isArray(response)
          ? response
          : Array.isArray(response?.content)
          ? response.content
          : [];

        const formattedStops = stopsArray.map(stop => ({
          id: stop.id || stop.busStopId || stop.stop_id || Math.random().toString(),
          stopName: stop.stopName || stop.name || stop.stop_name || 'Unnamed Stop',
        }));

        setBusStops(formattedStops);
      } catch (error) {
        console.error('Failed to fetch bus stops:', error);
      } finally {
        setLoadingBusStops(false);
      }
    };

    fetchBusStops();
  }, []);

  // ---------------- Submit Handler ----------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      let result: TimekeeperResponse | undefined;

      if (isEditMode) {
        setErrors({ general: 'Edit feature not yet implemented for timekeepers.' });
      } else {
        result = await TimekeeperControllerService.signup(formData);
      }

      if (result) {
        onSuccess ? onSuccess(result) : router.push('/mot/users/timekeepers');
      } else {
        setErrors({ general: 'Failed to register timekeeper' });
      }
    } catch (error: any) {
      let message = 'Failed to register timekeeper';
      if (error?.status === 409) message = 'A timekeeper with this email or phone already exists';
      else if (error?.status === 400) message = 'Invalid input data';
      else if (error?.message) message = error.message;
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Cancel Handler ----------------
  const handleCancel = () => {
    onCancel ? onCancel() : router.push('/mot/users/timekeepers');
  };

  // ---------------- Render ----------------
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* General Error */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{errors.general}</p>
            </div>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" /> Timekeeper Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput label="Full Name" required value={formData.fullname} error={errors.fullname} onChange={v => handleInputChange('fullname', v)} placeholder="Enter full name" />
          <FormInput label="Phone Number" required value={formData.phonenumber} error={errors.phonenumber} onChange={v => handleInputChange('phonenumber', v)} placeholder="10 digits" />
          <FormInput label="Email" required value={formData.email} error={errors.email} onChange={v => handleInputChange('email', v)} placeholder="Enter email address" />
          <FormInput label="NIC" required value={formData.nic} error={errors.nic} onChange={v => handleInputChange('nic', v)} placeholder="11 or 12 digits, may end with V" />
          <FormSelect label="Assigned Stand" required value={formData.assign_stand} options={busStops.map(bs => ({ value: bs.stopName, label: bs.stopName }))} error={errors.assign_stand} disabled={loadingBusStops} placeholder={loadingBusStops ? 'Loading bus stops...' : 'Select a bus stop'} onChange={v => handleInputChange('assign_stand', v)} />
          <FormSelect label="Province" required value={formData.province} options={SRI_LANKAN_PROVINCES.map(p => ({ value: p, label: p }))} error={errors.province} placeholder="Select a province" onChange={v => handleInputChange('province', v)} />
          <FormInput label="Password" type="password" required={!isEditMode} value={formData.password} error={errors.password} placeholder={isEditMode ? 'Enter new password' : 'Min 6 chars, include upper/lower, number, special'} hint={isEditMode ? 'Leave blank to keep current password' : undefined} onChange={v => handleInputChange('password', v)} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <button type="button" onClick={handleCancel} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={loading || !isDirty} className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{isEditMode ? 'Updating...' : 'Creating...'}</> : <><Save className="w-4 h-4 mr-2" />{isEditMode ? 'Update Timekeeper' : 'Create Timekeeper'}</>}
        </button>
      </div>
    </form>
  );
}

// ---------------- Reusable Input Components ----------------
function FormInput({ label, value, onChange, placeholder, type = 'text', required, error, hint }: { label: string, value: string, onChange: (v:string)=>void, placeholder?: string, type?: string, required?: boolean, error?: string, hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span className="text-gray-400 text-xs ml-1">{hint}</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-300' : 'border-gray-300'}`} />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, placeholder, required, error, disabled }: { label:string, value:string, onChange:(v:string)=>void, options:{value:string,label:string}[], placeholder?:string, required?:boolean, error?:string, disabled?:boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <select value={value} onChange={e=>onChange(e.target.value)} disabled={disabled} className={`w-full px-3 py-2 border rounded-md ${error ? 'border-red-300' : 'border-gray-300'}`}>
        <option value="">{placeholder || 'Select...'}</option>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
