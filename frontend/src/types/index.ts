export type { UserRole } from "@/lib/roles";
import type { UserRole } from "@/lib/roles";

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  clientType?: "lead" | "consultation_client" | "rental_applicant";
  assignedConsultant?: User | null;
  expertise?: string;
  notes: string[];
  isActive: boolean;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Service {
  _id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  isActive: boolean;
  order: number;
  features?: string[];
  pricing?: {
    amount: number;
    currency: string;
    interval: string;
  };
}

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  interest: string;
  status: "new" | "contacted" | "qualified" | "converted" | "closed";
  assignedConsultant?: User | null;
  notes: string[];
  convertedClient?: User | null;
  priority?: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export interface Consultation {
  _id: string;
  client: User;
  consultant: User | null;
  service: Service;
  dateTime: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "approved" | "rejected";
  interest?: string;
  notes?: string;
  followUpDate?: string;
  feedback?: string;
  rating?: number;
  meetingLink?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RentalApplication {
  _id: string;
  applicant: User;
  personalInfo: {
    fullName: string;
    dob: string;
    currentAddress: string;
    phone: string;
    email: string;
  };
  employment: {
    employerName: string;
    position: string;
    monthlyIncome: number;
    employmentType: string;
  };
  references: {
    name: string;
    relationship: string;
    phone: string;
  }[];
  documents: string[];
  status: "submitted" | "under_review" | "info_requested" | "approved" | "rejected" | "cancelled";
  reviewedBy?: User | null;
  comments: string[];
  internalNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  _id: string;
  title: string;
  slug: string;
  body: string;
  metaDescription?: string;
  featuredImage?: string;
  published: boolean;
  author?: User | null;
  contentType: "page" | "blog" | "testimonial" | "service_extra";
  tags?: string[];
  viewCount: number;
  updatedAt: string;
  createdAt: string;
}

export interface AdvisorApplication {
  _id: string;
  applicant: User;
  fullName: string;
  email: string;
  phone: string;
  currentOccupation: string;
  motivation: string;
  insuranceInterest: string;
  status: "submitted" | "under_review" | "approved" | "rejected" | "enrolled";
  assignedMentor?: User | null;
  trainingModules: {
    moduleName: string;
    completed: boolean;
    score?: number;
    completedAt?: string;
    notes?: string;
  }[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RentalGuarantee {
  _id: string;
  applicant: User;
  rentalApplication?: RentalApplication;
  propertyAddress: string;
  propertyType: string;
  landlordName: string;
  landlordEmail: string;
  landlordPhone?: string;
  monthlyRent: number;
  guaranteeFee: number;
  leaseStartDate: string;
  leaseEndDate?: string;
  status: "pending" | "active" | "expired" | "cancelled" | "renewed";
  termsAccepted: boolean;
  paymentHistory: {
    month: string;
    amount: number;
    paid: boolean;
    paidDate?: string;
  }[];
  documents: string[];
  notes: string[];
}

export interface AuditLog {
  _id: string;
  user: User;
  action: string;
  details?: string;
  resourceType?: string;
  resourceId?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClients?: number;
  totalLeads?: number;
  newLeads?: number;
  pendingApplications?: number;
  conversionRate?: number;
  consultationsThisMonth?: number;
  activeAdvisors?: number;
  recentActivity?: string[];
  myLeads?: number;
  upcomingConsultations?: number;
  myApplications?: number;
  nextAppointment?: string | null;
  upcomingConsultationsList?: Consultation[];
}