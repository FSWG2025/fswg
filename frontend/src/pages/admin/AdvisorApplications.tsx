import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import CustomPagination from "@/components/global/CustomPagination";
import { User, Phone, Briefcase, CheckCircle, XCircle, Eye } from "lucide-react";
import type { AdvisorApplication } from "@/types";
import { useAuth } from "@/hooks/AuthProvider";
import { APPROVE_APPLICATION_ROLES, hasRole } from "@/lib/roles";

const STAFF_STATUS_OPTIONS = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
];

const ADMIN_STATUS_OPTIONS = [
  ...STAFF_STATUS_OPTIONS,
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "enrolled", label: "Enrolled" },
];

const AdvisorApplications = () => {
  const { user } = useAuth();
  const canApprove = hasRole(user?.role, APPROVE_APPLICATION_ROLES);
  const statusOptions = canApprove
    ? ADMIN_STATUS_OPTIONS
    : [
        ...STAFF_STATUS_OPTIONS,
        { value: "approved", label: "Request approve" },
        { value: "rejected", label: "Request reject" },
        { value: "enrolled", label: "Request enroll" },
      ];

  const [apps, setApps] = useState<AdvisorApplication[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AdvisorApplication | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/advisor-applications?page=${page}&limit=10`);
      setApps(data.applications);
      setTotalPages(data.pagination.pages);
    } catch {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [page]);

  const updateStatus = async (id: string, status: string) => {
    const critical = ["approved", "rejected", "enrolled"].includes(status);
    if (critical && !canApprove) {
      const app = apps.find((a) => a._id === id);
      const name = app?.fullName || "Applicant";
      const typeMap: Record<string, string> = {
        approved: "advisor_approve",
        rejected: "advisor_reject",
        enrolled: "advisor_enroll",
      };
      try {
        await api.post("/approvals", {
          type: typeMap[status],
          resourceType: "advisor_application",
          resourceId: id,
          title: `${status.replace("_", " ")} advisor: ${name}`,
          summary: `Staff recommended status "${status}" for ${name} (${app?.email || "no email"}).`,
          payload: { status },
        });
        toast.success("Sent to admin approval queue");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to submit approval request",
        );
      }
      return;
    }
    try {
      await api.patch(`/advisor-applications/${id}`, { status });
      toast.success("Status updated");
      fetchApps();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update status",
      );
    }
  };

  const statusColors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-amber-100 text-amber-700",
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    enrolled: "bg-violet-100 text-violet-700",
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold text-[#12213E] flex items-center gap-2">
          Advisor Applications
        </h1>
        <p className="text-gray-500 mt-1">
          Review and manage advisor network applications.
          {!canApprove && (
            <span className="ml-1 text-[#C69259]">
              Approve / reject / enroll goes to the admin queue.
            </span>
          )}
        </p>
      </motion.div>

      <Card className="border border-gray-100 shadow-sm rounded-2xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-[#C69259]" />
                    {app.fullName}
                  </TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>
                    {app.insuranceInterest.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[app.status]}`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedApp(app);
                          setDetailOpen(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Select
                        value={app.status}
                        onValueChange={(val) => updateStatus(app._id, val)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CustomPagination
        loading={loading}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
      />

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[#12213E]">
              Application Details
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-[#C69259]" />
                <div>
                  <p className="font-bold">{selectedApp.fullName}</p>
                  <p className="text-sm text-gray-500">{selectedApp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C69259]" />
                <p>{selectedApp.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[#C69259]" />
                <p>{selectedApp.currentOccupation || "Not specified"}</p>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Insurance Interest</p>
                <p className="text-gray-600">
                  {selectedApp.insuranceInterest.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Motivation</p>
                <p className="text-gray-600 text-sm">{selectedApp.motivation}</p>
              </div>
              {selectedApp.notes.length > 0 && (
                <div>
                  <p className="font-semibold text-sm mb-1">Notes</p>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {selectedApp.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="font-semibold text-sm mb-1">Training Progress</p>
                <div className="space-y-1">
                  {selectedApp.trainingModules.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span>
                        {m.completed ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-400" />
                        )}
                      </span>
                      <span
                        className={
                          m.completed ? "text-emerald-700" : "text-gray-500"
                        }
                      >
                        {m.moduleName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvisorApplications;
