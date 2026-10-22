import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomInput } from "@/components/global/CustomInput";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Content } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import CustomAlert from "@/components/global/CustomAlert";

const contentSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z.string().min(2, "Slug is required"),
  body: z.string().min(1, "Body is required"),
  metaDescription: z.string().optional(),
  contentType: z.enum(["page", "blog", "testimonial", "service_extra"]),
  published: z.boolean(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface Props {
  contentTypeFilter?: "all" | "page" | "blog" | "testimonial";
}

const ContentManagement = ({ contentTypeFilter = "all" }: Props) => {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: "",
      slug: "",
      body: "",
      metaDescription: "",
      contentType: "page",
      published: false,
    },
  });

  const fetchContents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/content?published=false");

      // Handle different API response shapes
      let items: Content[] = [];

      if (Array.isArray(data)) {
        // Direct array
        items = data;
      } else if (data.content && Array.isArray(data.content)) {
        // Object with content array
        items = data.content;
      } else if (data.data && Array.isArray(data.data)) {
        // Object with data array
        items = data.data;
      } else {
        items = [];
      }

      // Filter by content type if needed
      const filtered =
        contentTypeFilter === "all"
          ? items
          : items.filter((c: Content) => c.contentType === contentTypeFilter);

      setContents(filtered);
    } catch (error) {
      console.error("Failed to load content:", error);
      toast.error("Failed to load content");
      setContents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [contentTypeFilter]);

  const handleEdit = (item: Content) => {
    setEditingContent(item);
    form.reset({
      title: item.title,
      slug: item.slug,
      body: item.body,
      metaDescription: item.metaDescription || "",
      contentType: (item.contentType as ContentFormValues["contentType"]) || "page",
      published: item.published,
    });
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingContent(null);
    form.reset({
      title: "",
      slug: "",
      body: "",
      metaDescription: "",
      contentType: "page",
      published: false,
    });
    setFormOpen(true);
  };

  const onSubmit = async (values: ContentFormValues) => {
    try {
      if (editingContent) {
        await api.patch(`/content/${editingContent._id}`, values);
        toast.success("Content updated successfully!");
      } else {
        await api.post("/content", values);
        toast.success("Content created successfully!");
      }
      setFormOpen(false);
      fetchContents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error saving content");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/content/${deleteId}`);
      toast.success("Content deleted successfully!");
      fetchContents();
    } catch (error) {
      toast.error("Failed to delete content");
    } finally {
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-10 w-10 border-4 border-[#C69259] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#12213E] flex items-center gap-2">
            Content Management          </h1>
          <p className="text-gray-500 mt-1">
            {contentTypeFilter === "all"
              ? "All content types"
              : contentTypeFilter === "page"
                ? "Pages"
                : contentTypeFilter === "blog"
                  ? "Blog posts"
                  : "Testimonials"}
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-[#C69259] hover:bg-[#B07D4A] text-white rounded-full px-5 py-2.5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Content
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No content found. Create your first piece of content!
                </TableCell>
              </TableRow>
            ) : (
              contents.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="capitalize">{item.contentType}</TableCell>
                  <TableCell>{item.published ? "✅ Published" : "❌ Draft"}</TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setDeleteId(item._id);
                        setDeleteOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingContent ? "Edit Content" : "Create Content"}</DialogTitle>
            <DialogDescription>
              Manage your website pages, blog posts, and testimonials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomInput control={form.control} name="title" label="Title" placeholder="Enter title" />
            <CustomInput control={form.control} name="slug" label="Slug" placeholder="unique-slug" />
            <div>
              <Label>Body</Label>
              <Textarea {...form.register("body")} rows={8} placeholder="HTML content..." className="mt-1" />
            </div>
            <CustomInput control={form.control} name="metaDescription" label="Meta Description" placeholder="SEO description" />
            <div>
              <Label>Content Type</Label>
              <Select
                value={form.watch("contentType")}
                onValueChange={(val: ContentFormValues["contentType"]) =>
                  form.setValue("contentType", val)
                }
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Page</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="testimonial">Testimonial</SelectItem>
                  <SelectItem value="service_extra">Service Extra</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={form.watch("published")}
                onCheckedChange={(val) => form.setValue("published", val)}
              />
              <Label>Published</Label>
            </div>
            <Button
              type="submit"
              className="w-full bg-[#12213E] hover:bg-[#0D1A2E] text-white rounded-full py-3"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? "Saving..." : editingContent ? "Save Changes" : "Create Content"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <CustomAlert
        isOpen={deleteOpen}
        setIsOpen={setDeleteOpen}
        handleDelete={handleDelete}
        title="Delete Content"
        description="Are you sure you want to delete this content? This action cannot be undone."
      />
    </div>
  );
};

export default ContentManagement;