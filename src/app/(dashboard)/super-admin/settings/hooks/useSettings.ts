'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  getBranding,
  getApiToken,
  getCommunicationSettings,
  updateBranding,
  updateGradeGovernance,
  updateCommunicationSettings,
  updateAdminProfile,
  regenerateApiToken
} from '@/services/superAdmin';
import { settingsSchema, SettingsFormValues } from '../schemas';
import { DEFAULT_BRANDING, DEFAULT_COMM_SETTINGS } from '../constants';
import { useAuth } from '@/contexts/AuthContext';

export function useSettings() {
  const { user } = useAuth();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      profile: {
        full_name: user?.full_name || '',
        email: user?.email || '',
        password: '',
        confirm_password: '',
      },
      branding: DEFAULT_BRANDING,
      gradeGov: {
        ca_weight: 40,
        exam_weight: 60,
        local_autonomy: false,
      },
      communications: DEFAULT_COMM_SETTINGS,
    },
  });

  const loadSettings = useCallback(async () => {
    setFetching(true);
    try {
      const [brandRes, tokenRes, commRes] = await Promise.all([
        getBranding(),
        getApiToken(),
        getCommunicationSettings()
      ]);

      if (brandRes) {
        form.setValue('branding', {
          primary_header: brandRes.primary_header || DEFAULT_BRANDING.primary_header,
          sub_header: brandRes.sub_header || DEFAULT_BRANDING.sub_header,
          footer_text: brandRes.footer_text || DEFAULT_BRANDING.footer_text,
        });
        if (brandRes.institutional_logo) {
          setLogoPreview(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${brandRes.institutional_logo}`);
        }
      }

      if (tokenRes) setApiToken(tokenRes.token);

      if (commRes) {
        form.setValue('communications', {
          ...DEFAULT_COMM_SETTINGS,
          ...commRes
        });
      }
    } catch (err) {
      toast.error('Failed to load settings');
    } finally {
      setFetching(false);
    }
  }, [form]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSyncAll = async (values: SettingsFormValues) => {
    setLoading(true);
    try {
      const brandingData = new FormData();
      brandingData.append('primary_header', values.branding.primary_header);
      brandingData.append('sub_header', values.branding.sub_header);
      brandingData.append('footer_text', values.branding.footer_text);
      if (logoFile) brandingData.append('logo', logoFile);

      // Perform updates in parallel where possible
      const results = await Promise.allSettled([
        updateBranding(brandingData),
        updateGradeGovernance(values.gradeGov),
        updateCommunicationSettings(values.communications),
        updateAdminProfile({
          full_name: values.profile.full_name,
          email: values.profile.email,
          password: values.profile.password || undefined
        })
      ]);

      const rejected = results.filter(r => r.status === 'rejected');
      if (rejected.length > 0) {
        toast.error(`Partial synchronization failure. ${rejected.length} updates failed.`);
      } else {
        toast.success('Institutional Standards Synchronized Successfully.');
      }
    } catch (err) {
      toast.error('Failed to sync settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateToken = async () => {
    try {
      const res = await regenerateApiToken();
      setApiToken(res.token);
      toast.success('New API Key generated');
    } catch (err) {
      toast.error('Failed to regenerate token');
    }
  };

  return {
    form,
    fetching,
    loading,
    apiToken,
    logoPreview,
    setLogoPreview,
    setLogoFile,
    handleSyncAll,
    handleRegenerateToken
  };
}
