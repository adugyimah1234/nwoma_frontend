'use client';

import { PageHeader } from "@/components/layout/page-header";
import { useEffect, useState } from "react";
import { getAllGarrisons, updateGarrison, type Garrison } from "@/services/superAdmin";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Save, Globe, Palette, Layout, Phone, Mail, Loader2, Building2, Plus, Trash2, Newspaper, UserCircle, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getGarrisonNews, createGarrisonNews, deleteGarrisonNews } from "@/services/superAdmin";
import api from "@/lib/axios";

export default function GarrisonWebsiteSettings() {
  const [garrisons, setGarrisons] = useState<Garrison[]>([]);
  const [selectedGarrison, setSelectedGarrison] = useState<Garrison | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNews, setNewNews] = useState({ title: '', content: '', image_url: '' });
  const [newDoc, setNewDoc] = useState({ title: '', file_url: '' });

  useEffect(() => {
    loadGarrisons();
  }, []);

  useEffect(() => {
    if (selectedGarrison) {
      loadNews(selectedGarrison.id);
      loadDocuments(selectedGarrison.id);
    }
  }, [selectedGarrison]);

  async function loadGarrisons() {
    try {
      const data = await getAllGarrisons();
      setGarrisons(data);
      if (data.length > 0) setSelectedGarrison(data[0]);
    } catch (error) {
      toast.error("Failed to load garrisons");
    } finally {
      setLoading(false);
    }
  }

  async function loadNews(id: string) {
    try {
      const data = await getGarrisonNews(id);
      setNews(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadDocuments(id: string) {
    try {
        const res = await api.get(`/documents?owner_id=${id}&owner_type=garrison`);
        setDocuments(res.data.data);
    } catch (error) { console.error(error); }
  }

  const handleChange = (field: keyof Garrison, value: any) => {
    if (!selectedGarrison) return;
    setSelectedGarrison({ ...selectedGarrison, [field]: value });
  };

  async function handleSave() {
    if (!selectedGarrison) return;
    setSaving(true);
    try {
      await updateGarrison(selectedGarrison.id, selectedGarrison as any);
      toast.success(`${selectedGarrison.name} website settings updated`);
      loadGarrisons();
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddNews() {
    if (!selectedGarrison || !newNews.title || !newNews.content) return;
    try {
      await createGarrisonNews(selectedGarrison.id, newNews);
      toast.success("News brief published");
      setNewNews({ title: '', content: '', image_url: '' });
      loadNews(selectedGarrison.id);
    } catch (error) {
      toast.error("Failed to publish news");
    }
  }

  async function handleDeleteNews(id: string) {
    try {
      await deleteGarrisonNews(id);
      toast.success("News brief deleted");
      if (selectedGarrison) loadNews(selectedGarrison.id);
    } catch (error) {
      toast.error("Failed to delete news");
    }
  }

  async function handleAddDoc() {
    if (!selectedGarrison || !newDoc.title || !newDoc.file_url) return;
    try {
        await api.post('/documents', {
            owner_id: selectedGarrison.id,
            owner_type: 'garrison',
            ...newDoc
        });
        toast.success("Document added");
        setNewDoc({ title: '', file_url: '' });
        loadDocuments(selectedGarrison.id);
    } catch (error) { toast.error("Failed to add document"); }
  }

  async function handleDeleteDoc(id: string) {
    try {
        await api.delete(`/documents/${id}`);
        toast.success("Document removed");
        if (selectedGarrison) loadDocuments(selectedGarrison.id);
    } catch (error) { toast.error("Failed to remove document"); }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full pb-24">
      <PageHeader
        title="Garrison Command View"
        description="Configure the high-level portal for Garrison commands."
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin', href: '/admin' },
          { title: 'Garrison Website' }
        ]}
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Garrison</CardTitle>
            <CardDescription>Choose the garrison you want to configure.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedGarrison?.id}
              onValueChange={(id) => setSelectedGarrison(garrisons.find(g => g.id === id) || null)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a garrison" />
              </SelectTrigger>
              <SelectContent>
                {garrisons.map(g => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedGarrison && (
          <>
            {/* Status & Domain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="size-5 text-primary" />
                  Domain & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="website-enabled" className="flex flex-col gap-1">
                    <span>Enable Command View</span>
                    <span className="font-normal text-muted-foreground">Make this Garrison's directory public.</span>
                  </Label>
                  <Switch
                    id="website-enabled"
                    checked={selectedGarrison.is_website_enabled}
                    onCheckedChange={(val) => handleChange('is_website_enabled', val)}
                  />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <Input
                    id="custom-domain"
                    placeholder="e.g. northern-command.edu.gh"
                    value={selectedGarrison.custom_domain || ''}
                    onChange={(e) => handleChange('custom_domain', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="size-5 text-primary" />
                  Garrison Branding
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Command Logo URL</Label>
                  <Input
                    id="logo-url"
                    value={selectedGarrison.website_logo_url || ''}
                    onChange={(e) => handleChange('website_logo_url', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Command Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-12 p-1 h-9"
                        value={selectedGarrison.primary_color || '#1e293b'}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
                      />
                      <Input
                        value={selectedGarrison.primary_color || '#1e293b'}
                        onChange={(e) => handleChange('primary_color', e.target.value)}
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
                  Garrison Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="hero-title">Hero Title</Label>
                  <Input
                    id="hero-title"
                    value={selectedGarrison.hero_title || ''}
                    onChange={(e) => handleChange('hero_title', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="about-text">Garrison History</Label>
                  <Textarea
                    className="min-h-[150px]"
                    value={selectedGarrison.about_text || ''}
                    onChange={(e) => handleChange('about_text', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Garrison Leadership Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="size-5 text-primary" />
                  Command Leadership Profile
                </CardTitle>
                <CardDescription>
                  Introduce the Garrison Commander or Regional Director.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="leader-name">Commander Name</Label>
                    <Input
                      id="leader-name"
                      placeholder="e.g. Brig. Gen. Isaac Osei"
                      value={selectedGarrison.leader_name || ''}
                      onChange={(e) => handleChange('leader_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leader-title">Command Title</Label>
                    <Input
                      id="leader-title"
                      placeholder="e.g. Garrison Commander / GOC"
                      value={selectedGarrison.leader_title || ''}
                      onChange={(e) => handleChange('leader_title', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leader-image">Portrait URL</Label>
                  <Input
                    id="leader-image"
                    placeholder="https://..."
                    value={selectedGarrison.leader_image_url || ''}
                    onChange={(e) => handleChange('leader_image_url', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leader-message">Command Statement</Label>
                  <Textarea
                    id="leader-message"
                    className="min-h-[120px]"
                    placeholder="Vision statement for the garrison educational network..."
                    value={selectedGarrison.leader_message || ''}
                    onChange={(e) => handleChange('leader_message', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="size-5 text-primary" />
                  Command Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Command Email</Label>
                  <Input
                    value={selectedGarrison.contact_email || ''}
                    onChange={(e) => handleChange('contact_email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Command Phone</Label>
                  <Input
                    value={selectedGarrison.contact_phone || ''}
                    onChange={(e) => handleChange('contact_phone', e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSave} disabled={saving} className="ml-auto">
                  {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
                  <Save className="size-4 mr-2" />
                  Update Command View
                </Button>
              </CardFooter>
            </Card>

            {/* Garrison Resource Library / Download Center */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  Download Center
                </CardTitle>
                <CardDescription>
                  Upload documents applicable to the entire garrison.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2"><Plus className="size-4" /> Add Document</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Document Title</Label>
                      <Input
                        placeholder="e.g. Garrison Admission Policy"
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
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Public Garrison Documents</h4>
                  {documents.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No documents uploaded yet.</p>
                  ) : (
                    <div className="grid gap-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border bg-white group hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-3">
                            <FileText className="size-4 text-primary" />
                            <span className="text-sm font-medium">{doc.title}</span>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteDoc(doc.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Command News / Briefs Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Newspaper className="size-5 text-primary" />
                  Command Briefs (News)
                </CardTitle>
                <CardDescription>Publish news and updates for this garrison.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Plus className="size-4" /> New Brief
                  </h4>
                  <div className="grid gap-4">
                    <Input
                        placeholder="Brief Title"
                        value={newNews.title}
                        onChange={(e) => setNewNews({...newNews, title: e.target.value})}
                    />
                    <Input
                        placeholder="Image URL (optional)"
                        value={newNews.image_url}
                        onChange={(e) => setNewNews({...newNews, image_url: e.target.value})}
                    />
                    <Textarea
                        placeholder="Brief content..."
                        value={newNews.content}
                        onChange={(e) => setNewNews({...newNews, content: e.target.value})}
                    />
                    <Button onClick={handleAddNews} className="w-fit">Publish Brief</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">Published Briefs</h4>
                  {news.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No briefs published yet.</p>
                  ) : (
                    <div className="grid gap-4">
                      {news.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl border bg-white group hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Newspaper className="size-6 text-slate-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm">{item.title}</p>
                              <p className="text-[10px] text-slate-400">{new Date(item.published_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteNews(item.id)} className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
