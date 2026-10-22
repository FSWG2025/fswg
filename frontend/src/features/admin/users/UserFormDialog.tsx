import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CustomInput } from "@/components/global/CustomInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ASSIGNABLE_ROLES,
  SUPER_ASSIGNABLE_ROLES,
  ROLE_LABELS,
  isPlatformAdmin,
  isSuperAdmin,
  type UserRole,
} from "@/lib/roles";
import { useMediaQuery, breakpoints } from "@/hooks/useMediaQuery";

export type UserFormValues = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  clientType?: "lead" | "consultation_client" | "rental_applicant";
  role: UserRole;
  isActive: boolean;
  expertise?: string;
  password?: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: boolean;
  form: UseFormReturn<UserFormValues>;
  currentUserRole?: string;
  /** When true, role (and self-status) cannot be changed — used for editing yourself */
  lockOwnRole?: boolean;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  onSubmit: (values: UserFormValues) => Promise<void>;
};

const MOBILE_STEPS = [
  { id: "profile", label: "Profile" },
  { id: "access", label: "Access" },
] as const;

export default function UserFormDialog({
  open,
  onOpenChange,
  editing,
  form,
  currentUserRole,
  lockOwnRole = false,
  showPassword,
  setShowPassword,
  onSubmit,
}: Props) {
  const isDesktop = useMediaQuery(breakpoints.sm);
  const [step, setStep] = useState(0);
  const currentRole = form.watch("role");
  const isAdmin = isPlatformAdmin(currentUserRole);
  const roleOptions = isSuperAdmin(currentUserRole)
    ? SUPER_ASSIGNABLE_ROLES
    : ASSIGNABLE_ROLES;
  const maxStep = MOBILE_STEPS.length - 1;
  const paginate = !isDesktop;

  useEffect(() => {
    if (open) setStep(0);
  }, [open, editing]);

  const profileFields = (
    <div className="space-y-4">
      <CustomInput control={form.control} name="name" label="Full Name" />
      <CustomInput
        control={form.control}
        name="email"
        label="Email"
        type="email"
      />
      <CustomInput control={form.control} name="phone" label="Phone *" />
      <CustomInput control={form.control} name="address" label="Address *" />
    </div>
  );

  const accessFields = (
    <div className="space-y-4">
      {lockOwnRole ? (
        <div className="rounded-2xl border border-[#C69259]/30 bg-[#FBF4EB] px-3 py-2.5 text-sm text-[#12213E]">
          Role:{" "}
          <span className="font-semibold">
            {ROLE_LABELS[currentRole] || currentRole}
          </span>
          <p className="mt-1 text-xs text-[#9A6B35]">
            You cannot change your own role. It must remain Super Admin.
          </p>
        </div>
      ) : isAdmin ? (
        <div>
          <Label className="text-sm font-semibold text-[#12213E]">Role</Label>
          <Select
            value={currentRole}
            onValueChange={(val) =>
              form.setValue("role", val as UserRole, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="mt-1.5 rounded-xl border-[#E5EAF0] bg-[#F7FBFE]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {roleOptions.map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABELS[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="rounded-2xl bg-[#F7FBFE] px-3 py-2 text-sm text-[#6B7280]">
          Role:{" "}
          <span className="font-semibold text-[#12213E]">
            {ROLE_LABELS[currentRole] || currentRole}
          </span>{" "}
          (admin only to change)
        </div>
      )}
      <div>
        <Label className="text-sm font-semibold text-[#12213E]">
          Client type
        </Label>
        <Select
          value={form.watch("clientType") || ""}
          onValueChange={(val: any) => form.setValue("clientType", val)}
        >
          <SelectTrigger className="mt-1.5 rounded-xl border-[#E5EAF0] bg-[#F7FBFE]">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="consultation_client">
              Consultation Client
            </SelectItem>
            <SelectItem value="rental_applicant">Rental Applicant</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <CustomInput control={form.control} name="expertise" label="Expertise" />
      {(isAdmin || currentRole === "client") && (
        <div className="flex items-center gap-3 rounded-2xl bg-[#F7FBFE] px-3 py-3">
          <Switch
            checked={form.watch("isActive")}
            disabled={lockOwnRole}
            onCheckedChange={(v) => form.setValue("isActive", v)}
          />
          <div>
            <Label className="text-sm font-semibold text-[#12213E]">
              Active account
            </Label>
            <p className="text-[11px] text-[#6B7280]">
              {lockOwnRole
                ? "You cannot deactivate your own account here."
                : "Inactive users cannot sign in."}
              {!lockOwnRole && !isAdmin && " Staff accounts require an admin."}
            </p>
          </div>
        </div>
      )}
      {!editing && (
        <CustomInput
          control={form.control}
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          rightIcon={
            <button
              type="button"
              tabIndex={-1}
              onClick={(e) => {
                e.preventDefault();
                setShowPassword(!showPassword);
              }}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          }
        />
      )}
    </div>
  );

  const goNext = async () => {
    if (step === 0) {
      const ok = await form.trigger(["name", "email"]);
      if (!ok) return;
    }
    setStep((s) => Math.min(maxStep, s + 1));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-0 overflow-hidden rounded-[28px] border-[#E5EAF0] p-0 sm:max-h-[85vh] sm:max-w-[520px]">
        <div className="shrink-0 border-b border-[#EEF2F6] px-5 pb-4 pt-5 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold text-[#12213E]">
              {editing ? "Edit user" : "Add user"}
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              {paginate
                ? `Step ${step + 1} of ${MOBILE_STEPS.length}: ${MOBILE_STEPS[step].label.toLowerCase()}`
                : editing
                  ? isAdmin
                    ? "Update profile, role, and access."
                    : "Update profile details. Role changes require an admin."
                  : isAdmin
                    ? "Create an account with the right role from day one."
                    : "Create a client account. Staff roles require an admin."}
            </DialogDescription>
          </DialogHeader>

          {paginate && (
            <div className="mt-4 flex gap-1.5">
              {MOBILE_STEPS.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStep(i)}
                  className={`h-1.5 flex-1 rounded-full transition ${
                    i <= step ? "bg-[#12213E]" : "bg-[#E5EAF0]"
                  }`}
                  aria-label={`Go to ${s.label}`}
                />
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            // Block implicit submits (Enter key / remounted Next→Save click)
            e.preventDefault();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
            {paginate ? (
              step === 0 ? (
                profileFields
              ) : (
                accessFields
              )
            ) : (
              <div className="space-y-4">
                {profileFields}
                {accessFields}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-[#EEF2F6] bg-[#F7FBFE] px-5 py-3.5 sm:px-6">
            {paginate ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={step === 0}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  className="h-11 rounded-2xl border-[#E5EAF0] bg-white font-semibold"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                {/* Keep Next and Save as separate buttons: swapping type="button"
                    → type="submit" in the same slot causes the Next click to submit. */}
                {step < maxStep ? (
                  <Button
                    key="next"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void goNext();
                    }}
                    className="h-11 rounded-2xl bg-[#12213E] font-semibold text-white hover:bg-[#0D1A2E]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    key="save"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void form.handleSubmit(onSubmit, (errors) => {
                        const first =
                          Object.values(errors)[0]?.message ||
                          "Please fix the highlighted fields";
                        toast.error(String(first));
                        if (errors.name || errors.email) setStep(0);
                      })();
                    }}
                    className="h-11 rounded-2xl bg-[#12213E] font-semibold text-white hover:bg-[#0D1A2E]"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting
                      ? "Saving..."
                      : editing
                        ? "Save"
                        : "Create"}
                  </Button>
                )}
              </div>
            ) : (
              <Button
                type="button"
                onClick={() =>
                  void form.handleSubmit(onSubmit, (errors) => {
                    const first =
                      Object.values(errors)[0]?.message ||
                      "Please fix the highlighted fields";
                    toast.error(String(first));
                  })()
                }
                className="h-11 w-full rounded-2xl bg-[#12213E] font-semibold text-white hover:bg-[#0D1A2E]"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create user"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
