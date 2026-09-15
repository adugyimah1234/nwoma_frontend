'use client';

import { PageHeader } from "@/components/layout/page-header";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import schoolService from "@/services/schools";
import { type School } from "@/types/school";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Globe, Palette, Layout, Phone, Mail, Facebook, Twitter, Instagram, Loader2, UserCircle, FileText, Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SchoolWebsiteSettings() {
  const { user } = useAuth();
  const [school, setSchool] = useState<School | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', file_url: '' });

  useEffect(() => {
    if (user?.school_id) {
      loadSchool(user.school_id);
      loadDocuments(user.school_id);
    }
  }, [user]);

  async function loadSchool(id: string) {
    try {
      const data = await schoolService.getById(id);
      setSchool(data);
    } catch (error) {
      toast.error("Failed to load school details");
    } finally {
      setLoading(false);
    }
  }

  async function loadDocuments(id: string) {
    try {
        const res = await api.get(`/documents?owner_id=${id}&owner_type=school`);
        setDocuments(res.data.data);
    } catch (error) { console.error(error); }
  }

  const handleChange = (field: keyof School, value: any) => {
    if (!school) return;
    setSchool({ ...school, [field]: value });
  };

  async function handleSave() {
    if (!school) return;
    setSaving(true);
    try {
      await schoolService.update(school.id, school);
      toast.success("Website settings updated successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddDoc() {
    if (!school || !newDoc.title || !newDoc.file_url) return;
    try {
        await api.post('/documents', {
            owner_id: school.id,
            owner_type: 'school',
            ...newDoc
        });
        toast.success("Document added");
        setNewDoc({ title: '', file_url: '' });
        loadDocuments(school.id);
    } catch (error) { toast.error("Failed to add document"); }
  }

  async function handleDeleteDoc(id: string) {
    try {
        await api.delete(`/documents/${id}`);
        toast.success("Document removed");
        if (school) loadDocuments(school.id);
    } catch (error) { toast.error("Failed to remove document"); }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">School not found</h2>
        <p className="text-muted-foreground">We couldn't load your school configuration.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24">
      <PageHeader
        title="Website Management"
        description="Configure your public school website and custom domain."
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin', href: '/admin' },
          { title: 'Website' }
        ]}
      />

      <div className="grid gap-6">
        {/* Status & Domain */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-5 text-primary" />
              Domain & Visibility
            </CardTitle>
            <CardDescription>
              Control who can see your website and its address.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="website-enabled" className="flex flex-col gap-1">
                <span>Publish Website</span>
                <span className="font-normal text-muted-foreground">Make your school website live to the public.</span>
              </Label>
              <Switch
                id="website-enabled"
                checked={school.is_website_enabled}
                onCheckedChange={(val) => handleChange('is_website_enabled', val)}
              />
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="custom-domain">Custom Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-domain"
                  placeholder="e.g. 3bnschool.edu.gh"
                  value={school.custom_domain || ''}
                  onChange={(e) => handleChange('custom_domain', e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Point your domain's CNAME record to <code className="bg-muted px-1 rounded">nwoma.com</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="size-5 text-primary" />
              Appearance & Branding
            </CardTitle>
            <CardDescription>
              Set your school colors and logo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logo-url">Logo URL</Label>
              <Input
                id="logo-url"
                placeholder="https://..."
                value={school.website_logo_url || ''}
                onChange={(e) => handleChange('website_logo_url', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    className="w-12 p-1 h-9"
                    value={school.primary_color || '#0f172a'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                  />
                  <Input
                    value={school.primary_color || '#0f172a'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    className="w-12 p-1 h-9"
                    value={school.secondary_color || '#3b82f6'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                  />
                  <Input
                    value={school.secondary_color || '#3b82f6'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="size-5 text-primary" />
              Website Content
            </CardTitle>
            <CardDescription>
              The main text displayed on your homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-title">Hero Title</Label>
              <Input
                id="hero-title"
                placeholder="e.g. Welcome to 3 Infantry Battalion School"
                value={school.hero_title || ''}
                onChange={(e) => handleChange('hero_title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
              <Textarea
                id="hero-subtitle"
                placeholder="Describe your school's mission in a few words..."
                value={school.hero_subtitle || ''}
                onChange={(e) => handleChange('hero_subtitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="about-text">About Us</Label>
              <Textarea
                id="about-text"
                className="min-h-[150px]"
                placeholder="Write a detailed history or about section for your school..."
                value={school.about_text || ''}
                onChange={(e) => handleChange('about_text', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Leadership Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle className="size-5 text-primary" />
              Head of Institution Profile
            </CardTitle>
            <CardDescription>
              Introduce the headmaster or commander leading the school.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leader-name">Leader Name</Label>
                <Input
                  id="leader-name"
                  placeholder="e.g. Lt. Col. Kwame Mensah"
                  value={school.leader_name || ''}
                  onChange={(e) => handleChange('leader_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leader-title">Professional Title</Label>
                <Input
                  id="leader-title"
                  placeholder="e.g. Commanding Officer / Headmaster"
                  value={school.leader_title || ''}
                  onChange={(e) => handleChange('leader_title', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader-image">Leader Portrait URL</Label>
              <Input
                id="leader-image"
                placeholder="https://..."
                value={school.leader_image_url || ''}
                onChange={(e) => handleChange('leader_image_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leader-message">Leadership Statement</Label>
              <Textarea
                id="leader-message"
                className="min-h-[120px]"
                placeholder="A welcoming message from the head of the school..."
                value={school.leader_message || ''}
                onChange={(e) => handleChange('leader_message', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resource Library / Download Center */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              Download Center
            </CardTitle>
            <CardDescription>
              Upload PDF prospectuses, fee structures, and school policies for parents.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-bold flex items-center gap-2"><Plus className="size-4" /> Add Document</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Title</Label>
                  <Input
                    placeholder="e.g. 2024 Prospectus"
                    value={newDoc.title}
                    onChange={(e) => setNewDoc({...newDoc, title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>File URL (PDF)</Label>
                  <Input
                    placeholder="https://..."
                    value={newDoc.file_url}
                    onChange={(e) => setNewDoc({...newDoc, file_url: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddDoc} size="sm">Add to Library</Button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-tight text-slate-400">Public Documents</h4>
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
              ) : (
                <div className="grid gap-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-white group">
                      <div className="flex items-center gap-3">
                        <FileText className="size-4 text-primary" />
                        <span className="text-sm font-medium">{doc.title}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc.id)} className="text-destructive opacity-0 group-hover:opacity-100">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact & Social */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="size-5 text-primary" />
              Contact & Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Mail className="size-3.5" /> Public Email</Label>
              <Input
                placeholder="info@school.com"
                value={school.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone className="size-3.5" /> Public Phone</Label>
              <Input
                placeholder="+233 00 000 0000"
                value={school.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Facebook className="size-3.5" /> Facebook URL</Label>
              <Input
                value={school.facebook_url || ''}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Twitter className="size-3.5" /> Twitter URL</Label>
              <Input
                value={school.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Instagram className="size-3.5" /> Instagram URL</Label>
              <Input
                value={school.instagram_url || ''}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-6">
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              Save Website Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

