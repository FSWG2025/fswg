import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/global/CustomInput";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import type { User } from "@/types";
import { useNavigate, Link } from "react-router";
import { useAuth } from "@/hooks/AuthProvider";
import { Eye, EyeOff, ArrowRight, Mail, User as UserIcon, Phone, MapPin, Shield } from "lucide-react";
import { motion } from "framer-motion";

export type FormType = "login" | "create" | "update";

interface Props {
  type: FormType;
  initialData?: User | null;
  onSuccess?: () => void;
  showHeader?: boolean;
}

const createSchema = (type: FormType) => {
  return z
    .object({
      name:
        type === "login"
          ? z.string().optional()
          : z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Please enter a valid email address"),
      phone:
        type === "login"
          ? z.string().optional()
          : z.string().min(1, "Phone is required").min(7, "Enter a valid phone"),
      address:
        type === "login"
          ? z.string().optional()
          : z.string().min(1, "Address is required").min(2, "Enter your address"),
      clientType:
        type === "create"
          ? z.enum(["lead", "consultation_client", "rental_applicant"]).optional()
          : z.string().optional(),
      password:
        type === "update"
          ? z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal(""))
          : z.string().min(6, "Password must be at least 6 characters"),
      confirmPassword:
        type === "create"
          ? z.string().min(6, "Please confirm your password")
          : z.string().optional(),
    })
    .refine(
      (data) => {
        if (type === "create" && data.password !== data.confirmPassword) {
          return false;
        }
        return true;
      },
      {
        message: "Passwords don't match",
        path: ["confirmPassword"],
      }
    );
};

type FormValues = z.infer<ReturnType<typeof createSchema>>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { opacity: 1, y: 0 },
};

const PasswordField = ({
  control,
  name,
  label,
  placeholder,
  disabled,
}: {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}) => {
  const [show, setShow] = useState(false);
  return (
    <CustomInput
      control={control}
      name={name}
      label={label}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      disabled={disabled}
      rightIcon={
        <button
          type="button"
          onClick={() => setShow(!show)}
          tabIndex={-1}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C69259] transition-colors"
        >
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      }
    />
  );
};

const UniversalUserForm = ({
  type,
  initialData,
  onSuccess,
  showHeader = true,
}: Props) => {
  const isUpdate = type === "update";
  const isLogin = type === "login";
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const form = useForm<FormValues>({
    resolver: zodResolver(createSchema(type)),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      clientType: initialData?.clientType || "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (initialData && isUpdate) {
      form.reset({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || "",
        address: initialData.address || "",
        clientType: initialData.clientType || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [initialData, isUpdate, form]);

  async function onSubmit(data: FormValues) {
    try {
      const payload = { ...data };

      if (isLogin) {
        const { data: userData } = await api.post("/users/login", {
          email: data.email,
          password: data.password,
        });
        setUser(userData);
        toast.success("Logged in successfully! Welcome back 👋");
        navigate("/dashboard");
      } else if (type === "create") {
        const { data: newUser } = await api.post("/users/register", payload);
        setUser(newUser);
        toast.success("Account created successfully! 🎉");
        navigate("/dashboard");
        onSuccess?.();
      } else if (type === "update" && initialData?._id) {
        // Remove confirmPassword before sending
        delete (payload as any).confirmPassword;

        // Remove empty password on update
        if (!payload.password) {
          delete (payload as any).password;
        }

        await api.put(`/users/${initialData._id}`, payload);
        toast.success("Profile updated successfully!");
        onSuccess?.();
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(message);
    }
  }

  const pending = form.formState.isSubmitting;
  const buttonText = isLogin
    ? "Sign In"
    : isUpdate
    ? "Save Changes"
    : "Create Account";

  return (
    <div className="w-full max-w-md mx-auto">
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-full bg-white shadow-md border-2 border-[#C69259] flex items-center justify-center mx-auto mb-4 overflow-hidden">
            <img
              src="/fswgLogo.jpg"
              alt="First Step Wealth Group"
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-extrabold text-[#12213E]">
            {isLogin
              ? "Welcome Back"
              : isUpdate
              ? "Update Profile"
              : "Create Your Account"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin
              ? "Sign in to access your dashboard"
              : isUpdate
              ? "Modify your personal information"
              : "Start building your financial future"}
          </p>
        </motion.div>
      )}

      <div className="bg-white rounded-2xl p-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-5"
            >
              {/* Name Field */}
              {!isLogin && (
                <motion.div variants={itemVariants}>
                  <CustomInput
                    control={form.control}
                    name="name"
                    label="Full Name"
                    placeholder="Jane Doe"
                    disabled={pending}
                  />
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <CustomInput
                  control={form.control}
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="m@example.com"
                  disabled={pending}
                />
              </motion.div>

              {/* Phone Field */}
              {!isLogin && (
                <motion.div variants={itemVariants}>
                  <CustomInput
                    control={form.control}
                    name="phone"
                    label="Phone *"
                    placeholder="(123) 456-7890"
                    disabled={pending}
                  />
                </motion.div>
              )}

              {/* Address Field */}
              {!isLogin && (
                <motion.div variants={itemVariants}>
                  <CustomInput
                    control={form.control}
                    name="address"
                    label="Address *"
                    placeholder="Street, City"
                    disabled={pending}
                  />
                </motion.div>
              )}

              {/* Client Type Select */}
              {type === "create" && (
                <motion.div variants={itemVariants}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Type (optional)
                  </label>
                  <select
                    {...form.register("clientType")}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C69259]/50 focus:border-transparent transition-all bg-white text-gray-900"
                    disabled={pending}
                  >
                    <option value="">Select type</option>
                    <option value="lead">Lead</option>
                    <option value="consultation_client">
                      Consultation Client
                    </option>
                    <option value="rental_applicant">
                      Rental Applicant
                    </option>
                  </select>
                </motion.div>
              )}

              {/* Password Field */}
              <motion.div variants={itemVariants}>
                <PasswordField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder={
                    isUpdate
                      ? "New password (leave blank to keep current)"
                      : "Password"
                  }
                  disabled={pending}
                />
              </motion.div>

              {/* Confirm Password Field */}
              {type === "create" && (
                <motion.div variants={itemVariants}>
                  <PasswordField
                    control={form.control}
                    name="confirmPassword"
                    label="Confirm Password"
                    placeholder="Confirm Password"
                    disabled={pending}
                  />
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-2">
                <Button
                  type="submit"
                  disabled={pending}
                  className="w-full bg-gradient-to-r from-[#12213E] to-[#1E3A5F] hover:from-[#0D1A2E] hover:to-[#12213E] text-white font-semibold rounded-full py-6 shadow-lg shadow-[#12213E]/20 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {pending ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      {buttonText}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </FieldGroup>
        </form>
      </div>

      {/* Bottom Links */}
      {!isUpdate && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-500 mt-6"
        >
          {isLogin ? (
            <>
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[#C69259] hover:text-[#B07D4A] transition-colors"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#C69259] hover:text-[#B07D4A] transition-colors"
              >
                Sign in
              </Link>
            </>
          )}
        </motion.p>
      )}

      {/* Forgot Password Link */}
      {isLogin && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-3"
        >
          <Link
            to="/forgot-password"
            className="text-sm text-[#C69259] hover:text-[#B07D4A] transition-colors"
          >
            Forgot your password?
          </Link>
        </motion.p>
      )}
    </div>
  );
};

export default UniversalUserForm;