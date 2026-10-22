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
import type { Service } from "@/types";
import { Plus, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import CustomAlert from "@/components/global/CustomAlert";

const serviceSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  category: z.enum(["financial_education", "insurance", "real_estate", "wealth_building", "entrepreneurship"]),
  icon: z.string().optional(),
  isActive: z.boolean(),
  order: z.coerce.number().min(0).default(0),
});

interface Props { activeFilter?: "all" | "active" | "inactive"; }

const ServiceManagement = ({ activeFilter = "all" }: Props) => {
  const [services, setServices] = useState<Service[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm({ resolver: zodResolver(serviceSchema), defaultValues: { title: "", description: "", category: "financial_education" as const, icon: "", isActive: true, order: 0 } });

  const fetchServices = async () => {
    try {
      const { data } = await api.get("/services");
      const filtered = activeFilter === "active" ? data.filter((s: Service) => s.isActive) : activeFilter === "inactive" ? data.filter((s: Service) => !s.isActive) : data;
      setServices(filtered);
    } catch { toast.error("Failed"); }
  };

  useEffect(() => { fetchServices(); }, [activeFilter]);

  const handleEdit = (item: Service) => { setEditingService(item); form.reset({ title: item.title, description: item.description, category: item.category as any, icon: item.icon || "", isActive: item.isActive, order: item.order ?? 0 }); setFormOpen(true); };
  const handleCreate = () => { setEditingService(null); form.reset({ title: "", description: "", category: "financial_education", icon: "", isActive: true, order: 0 }); setFormOpen(true); };

  const onSubmit = async (values: any) => {
    try {
      if (editingService) { await api.patch(`/services/${editingService._id}`, values); toast.success("Updated"); }
      else { await api.post("/services", values); toast.success("Created"); }
      setFormOpen(false); fetchServices();
    } catch (e: any) { toast.error(e.response?.data?.message || "Error"); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try { await api.delete(`/services/${deleteId}`); toast.success("Deleted"); fetchServices(); }
    catch { toast.error("Failed"); }
    finally { setDeleteOpen(false); setDeleteId(null); }
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-extrabold text-[#12213E] flex items-center gap-2">Services</h1><p className="text-gray-500 mt-1">{activeFilter === "active" ? "Active" : activeFilter === "inactive" ? "Inactive" : "All"} services</p></div>
        <Button onClick={handleCreate} className="bg-[#C69259] hover:bg-[#B07D4A] text-white rounded-full px-5 py-2.5 flex items-center gap-2"><Plus className="w-4 h-4" /> New</Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {services.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{item.category.replace("_", " ")}</TableCell>
                <TableCell>{item.order}</TableCell>
                <TableCell>{item.isActive ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-400" />}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => { setDeleteId(item._id); setDeleteOpen(true); }}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingService ? "Edit" : "Create"} Service</DialogTitle><DialogDescription>Manage service details.</DialogDescription></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <CustomInput control={form.control} name="title" label="Title" />
            <div><Label>Description</Label><Textarea {...form.register("description")} rows={4} className="mt-1" /></div>
            <div><Label>Category</Label>
              <Select value={form.watch("category")} onValueChange={(v: any) => form.setValue("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="financial_education">Financial Education</SelectItem><SelectItem value="insurance">Insurance</SelectItem><SelectItem value="real_estate">Real Estate</SelectItem><SelectItem value="wealth_building">Wealth Building</SelectItem><SelectItem value="entrepreneurship">Entrepreneurship</SelectItem></SelectContent>
              </Select>
            </div>
            <CustomInput control={form.control} name="icon" label="Icon (optional)" />
            <div><Label>Order</Label><input type="number" {...form.register("order", { valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.watch("isActive")} onCheckedChange={(v) => form.setValue("isActive", v)} /><Label>Active</Label></div>
            <Button type="submit" className="w-full bg-[#12213E] hover:bg-[#0D1A2E] text-white rounded-full py-3">{form.formState.isSubmitting ? "Saving..." : "Save"}</Button>
          </form>
        </DialogContent>
      </Dialog>

      <CustomAlert isOpen={deleteOpen} setIsOpen={setDeleteOpen} handleDelete={handleDelete} title="Delete Service" description="This cannot be undone." />
    </div>
  );
};

export default ServiceManagement;