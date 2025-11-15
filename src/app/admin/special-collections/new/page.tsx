"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Upload, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { SimplifiedImage } from "@/components/ui/simplified-image";

export default function NewSpecialCollectionPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    image_url: "",
    badge: "",
    badge_color: "bg-gradient-to-r from-blue-500 to-purple-500",
    icon_name: "",
    is_active: true,
    sort_order: 0,
  });

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('Lütfen bir resim dosyası seçin');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Image upload failed');
    }
    
    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;
      
      // If file mode and file selected, upload to Supabase
      if (imageMode === 'file' && selectedFile) {
        setUploading(true);
        try {
          finalImageUrl = await uploadImageToSupabase(selectedFile);
          toast.success('Resim başarıyla yüklendi');
        } catch (uploadError) {
          throw new Error('Resim yüklenirken hata oluştu');
        } finally {
          setUploading(false);
        }
      }
      
      const response = await fetch("/api/admin/special-collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image_url: finalImageUrl,
          slug: formData.slug || generateSlug(formData.title),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create collection");
      }

      toast.success("Koleksiyon başarıyla oluşturuldu");
      router.push("/admin/special-collections");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/special-collections">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Geri Dön
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Yeni Özel Koleksiyon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Otomatik oluşturulur"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-4 md:col-span-2">
                <Label>Görsel</Label>
                
                {/* Image Mode Selector */}
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={imageMode === 'url' ? 'default' : 'outline'}
                    onClick={() => setImageMode('url')}
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    URL Gir
                  </Button>
                  <Button
                    type="button"
                    variant={imageMode === 'file' ? 'default' : 'outline'}
                    onClick={() => setImageMode('file')}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Dosya Yükle
                  </Button>
                </div>

                {/* URL Input Mode */}
                {imageMode === 'url' && (
                  <div className="space-y-2">
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                )}

                {/* File Upload Mode */}
                {imageMode === 'file' && (
                  <div className="space-y-4">
                    <div
                      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600">
                        {selectedFile ? selectedFile.name : 'Resim seçmek için tıklayın'}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        PNG, JPG, GIF (Max 5MB)
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                )}

                {/* Image Preview */}
                {((imageMode === 'url' && formData.image_url) || (imageMode === 'file' && previewUrl)) && (
                  <div className="mt-4">
                    <Label>Önizleme</Label>
                    <div className="mt-2 relative w-full h-48 border rounded-lg overflow-hidden">
                      <SimplifiedImage
                        src={imageMode === 'url' ? formData.image_url : previewUrl}
                        alt="Görsel önizleme"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Rozet Metni</Label>
                <Input
                  id="badge"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="Yeni, Popüler, vb."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge_color">Rozet Rengi</Label>
                <select
                  id="badge_color"
                  className="w-full p-2 border rounded-md"
                  value={formData.badge_color}
                  onChange={(e) => setFormData({ ...formData, badge_color: e.target.value })}
                >
                  <option value="bg-gradient-to-r from-blue-500 to-purple-500">Mavi-Mor</option>
                  <option value="bg-gradient-to-r from-green-500 to-teal-500">Yeşil-Turkuaz</option>
                  <option value="bg-gradient-to-r from-red-500 to-orange-500">Kırmızı-Turuncu</option>
                  <option value="bg-gradient-to-r from-yellow-500 to-amber-500">Sarı-Amber</option>
                  <option value="bg-gradient-to-r from-pink-500 to-rose-500">Pembe-Gül</option>
                  <option value="bg-gradient-to-r from-indigo-500 to-purple-500">İndigo-Mor</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sort_order">Sıralama</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Aktif</Label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/special-collections">
                <Button type="button" variant="outline">İptal</Button>
              </Link>
              <Button type="submit" disabled={loading || uploading}>
                {uploading ? "Resim Yükleniyor..." : loading ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
