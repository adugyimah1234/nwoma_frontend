'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    markRegistrationSynced,
  removeOfflineRegistration,
} from '@/lib/offlineRegistrations';
import registrationService from '@/services/registrations';
import { getOfflineRegistrations } from '@/lib/saveOfflineRegistration';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasOfflineData, setHasOfflineData] = useState(false);

  const checkOfflineData = async () => {
    const offline = await getOfflineRegistrations();
    setHasOfflineData(offline.length > 0);
  };

  const syncOfflineData = async () => {
    setIsSyncing(true);
    try {
      const offlineData = await getOfflineRegistrations();

      if (!offlineData.length) {
        toast.info('No offline data to sync.');
        return;
      }

      for (const entry of offlineData) {
        try {
          await registrationService.create(entry);
          await removeOfflineRegistration(entry.tempId!);
        await markRegistrationSynced(entry.tempId); // or removeOfflineRegistration
        } catch (err) {
          console.error('Failed to sync one entry:', err);
        }
      }

      toast.success('All offline registrations synced.');
    } catch (error) {
      toast.error('Sync failed.');
    } finally {
      setIsSyncing(false);
      await checkOfflineData();
    }
  };

  useEffect(() => {
    checkOfflineData();

    const handleOnline = async () => {
      if (navigator.onLine) {
        await syncOfflineData();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  return (
    <Button
      onClick={syncOfflineData}
      disabled={!hasOfflineData || isSyncing}
      variant="outline"
    >
      {isSyncing ? 'Syncing...' : 'Sync Now'}
    </Button>
  );
}

