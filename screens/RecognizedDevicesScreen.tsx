
import React from 'react';
import { Link } from 'react-router-dom';
import { InformationCircleIcon } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../utils/formatters';
import Button from '../components/Button'; // Assuming Button component can handle actions

const RecognizedDevicesScreen: React.FC = () => {
  const { user, updateSecuritySettings } = useAuth(); // Assuming updateSecuritySettings can handle device removal
  const recognizedDevices = user?.recognizedDevices || [];

  const handleRemoveDevice = async (deviceId: string) => {
    if (!user) return;
    if (window.confirm("Are you sure you want to remove this device? You may need to re-verify on your next login from it.")) {
      const updatedDevices = user.recognizedDevices.filter(d => d.id !== deviceId);
      // This is a simplified update. Ideally, backend handles this.
      // For demo, we'll update the user object directly via a specialized function if it existed,
      // or just rely on a general updateSecuritySettings if it's flexible enough.
      // For now, let's assume updateSecuritySettings is not for this and we just show an alert.
      try {
        // Placeholder for actual service call for device removal
        // await serviceRemoveRecognizedDevice(user.id, deviceId); 
        // fetchLatestUserData(); // Refresh user data to reflect removal
        alert(`Device ${deviceId} removal simulated. In a real app, this device would be removed from your trusted list.`);
        // For local state update in a more complex scenario, you'd manage a local copy or refetch.
      } catch (error: any) {
        alert(`Failed to remove device: ${error.message}`);
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center space-x-3 mb-4">
        <Link to="/profile/security" className="text-primary hover:text-accent-700">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-semibold text-neutral-800">Recognized Devices</h1>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
         <p className="text-sm text-neutral-600 mb-3">
          This page lists devices that have been recognized for accessing your account.
        </p>
        {recognizedDevices.length > 0 ? (
             <ul className="divide-y divide-neutral-100">
                {recognizedDevices.map(device => (
                    <li key={device.id} className="py-2 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-neutral-800">{device.name}</p>
                            <p className="text-xs text-neutral-500">
                                Last login: {formatDate(device.lastLogin, {dateStyle: 'medium', timeStyle: 'short'})} from IP: {device.ipAddress}
                            </p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveDevice(device.id)}
                        >
                            Remove
                        </Button>
                    </li>
                ))}
            </ul>
        ) : (
             <p className="text-neutral-500">No recognized devices yet. Devices are added when you log in from them.</p>
        )}
      </div>
      <div className="text-xs text-neutral-500 p-3 bg-neutral-100 rounded-md border border-neutral-200 flex items-start space-x-2">
         <InformationCircleIcon className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" />
        <span>Manage devices that have saved login credentials or are otherwise trusted. Removing a device may require you to re-verify on next login from that device.</span>
      </div>
    </div>
  );
};

export default RecognizedDevicesScreen;
