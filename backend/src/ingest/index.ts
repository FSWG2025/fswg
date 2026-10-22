import { Inngest } from "inngest";

// Initialize Inngest client
export const inngest = new Inngest({
  id: "fswg-platform",
  name: "First Step Wealth Group",
  retryFunction: async (attempt: number) => ({
    delay: Math.pow(2, attempt) * 1000, // Exponential backoff
    maxAttempts: 3,
  }),
});

// ============================================================
// Helper function to create audit log
// ============================================================
const createAuditLog = async (userId: string, action: string, details: string) => {
  try {
    // Dynamic import to avoid circular dependencies
    const AuditLog = (await import("../models/AuditLog")).default;
    await AuditLog.create({
      user: userId,
      action,
      details,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
};

// ============================================================
// Function 1: Send Welcome Email to New Users
// ============================================================
const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/registered" },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    // Step 1: Log the event
    await step.run("log-registration", async () => {
      console.log(`📧 Preparing welcome email for ${name} (${email})`);
      return { success: true };
    });

    // Step 2: Create audit log
    await step.run("create-audit-log", async () => {
      await createAuditLog(
        userId,
        "Welcome Email Sent",
        `Welcome email triggered for ${email}`
      );
      return { audited: true };
    });

    // Step 3: Send email (placeholder - integrate with email service)
    await step.run("send-email", async () => {
      // TODO: Integrate with Resend, SendGrid, or AWS SES
      // Example:
      // await resend.emails.send({
      //   from: 'hello@firststepwealth.ca',
      //   to: email,
      //   subject: 'Welcome to First Step Wealth Group! 🎉',
      //   html: `<h1>Welcome ${name}!</h1><p>Your wealth journey starts now.</p>`
      // });

      console.log(`✅ Welcome email sent to ${email}`);
      return { emailSent: true, email };
    });

    return {
      success: true,
      message: `Welcome email processed for ${name}`,
    };
  }
);

// ============================================================
// Function 2: New Lead Notification to Admin
// ============================================================
const notifyNewLead = inngest.createFunction(
  { id: "notify-new-lead" },
  { event: "lead/created" },
  async ({ event, step }) => {
    const { leadId, firstName, lastName, email, interest, source } = event.data;

    // Step 1: Log the lead
    await step.run("log-lead", async () => {
      console.log(`🔔 New lead: ${firstName} ${lastName} - ${interest}`);
      return { logged: true };
    });

    // Step 2: Send notification to admin (placeholder)
    await step.run("notify-admin", async () => {
      // TODO: Send Slack notification, email, or push notification
      // Example Slack webhook:
      // await fetch(process.env.SLACK_WEBHOOK_URL!, {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     text: `🔔 New Lead!\nName: ${firstName} ${lastName}\nEmail: ${email}\nInterest: ${interest}\nSource: ${source}`
      //   })
      // });

      console.log(` Admin notified about lead: ${firstName} ${lastName}`);
      return { notified: true };
    });

    // Step 3: Auto-assign lead if criteria met (example: high-value interest)
    await step.run("auto-assign-lead", async () => {
      const highPriorityInterests = ["insurance", "real_estate"];

      if (highPriorityInterests.includes(interest?.toLowerCase())) {
        const User = (await import("../models/User")).default;
        const availableConsultants = await User.find({
          role: "consultant",
          isActive: true,
        }).limit(1);

        if (availableConsultants.length > 0) {
          const Lead = (await import("../models/Lead")).default;
          await Lead.findByIdAndUpdate(leadId, {
            assignedConsultant: availableConsultants[0]._id,
            status: "contacted",
          });
          console.log(`🤖 Auto-assigned lead to consultant: ${availableConsultants[0].name}`);
          return { assigned: true, consultant: availableConsultants[0].name };
        }
      }
      return { assigned: false };
    });

    return {
      success: true,
      message: `Lead notification processed for ${firstName} ${lastName}`,
    };
  }
);

// ============================================================
// Function 3: Consultation Reminder
// ============================================================
const sendConsultationReminder = inngest.createFunction(
  { id: "send-consultation-reminder" },
  { event: "consultation/reminder" },
  async ({ event, step }) => {
    const { consultationId, clientEmail, clientName, consultantName, dateTime } = event.data;

    // Step 1: Log reminder
    await step.run("log-reminder", async () => {
      console.log(`⏰ Sending consultation reminder to ${clientName}`);
      return { logged: true };
    });

    // Step 2: Send email reminder (placeholder)
    await step.run("send-reminder-email", async () => {
      // TODO: Send reminder email
      // await resend.emails.send({
      //   from: 'hello@firststepwealth.ca',
      //   to: clientEmail,
      //   subject: 'Reminder: Your Consultation Tomorrow',
      //   html: `<h1>Hi ${clientName}!</h1><p>Your consultation with ${consultantName} is scheduled for ${new Date(dateTime).toLocaleString()}.</p>`
      // });

      console.log(`✅ Reminder sent to ${clientEmail}`);
      return { emailSent: true };
    });

    // Step 3: Create audit log
    await step.run("audit-reminder", async () => {
      await createAuditLog(
        "system",
        "Consultation Reminder Sent",
        `Reminder sent for consultation ${consultationId}`
      );
      return { audited: true };
    });

    return {
      success: true,
      message: `Reminder processed for consultation ${consultationId}`,
    };
  }
);

// ============================================================
// Function 4: Advisor Application Review
// ============================================================
const processAdvisorApplication = inngest.createFunction(
  { id: "process-advisor-application" },
  { event: "advisor/application-submitted" },
  async ({ event, step }) => {
    const { applicationId, fullName, email, insuranceInterest } = event.data;

    // Step 1: Log application
    await step.run("log-application", async () => {
      console.log(`📋 New advisor application from ${fullName}`);
      return { logged: true };
    });

    // Step 2: Auto-respond with acknowledgment (placeholder)
    await step.run("send-acknowledgment", async () => {
      // TODO: Send acknowledgment email
      console.log(`✅ Acknowledgment sent to ${email}`);
      return { acknowledged: true };
    });

    // Step 3: Notify admin team
    await step.run("notify-admin-team", async () => {
      // TODO: Notify admin team via Slack/email
      console.log(`🔔 Admin team notified about application from ${fullName}`);
      return { notified: true };
    });

    // Step 4: Create audit log
    await step.run("audit-application", async () => {
      await createAuditLog(
        "system",
        "Advisor Application Received",
        `Application ${applicationId} from ${fullName} (${insuranceInterest})`
      );
      return { audited: true };
    });

    return {
      success: true,
      message: `Advisor application processed for ${fullName}`,
    };
  }
);

// ============================================================
// Function 5: Rental Application Status Update Notification
// ============================================================
const notifyRentalApplicationUpdate = inngest.createFunction(
  { id: "notify-rental-update" },
  { event: "rental/status-updated" },
  async ({ event, step }) => {
    const { applicationId, applicantEmail, applicantName, status, reviewerNotes } = event.data;

    // Step 1: Log status change
    await step.run("log-status-change", async () => {
      console.log(`📊 Rental application ${applicationId} status updated to: ${status}`);
      return { logged: true };
    });

    // Step 2: Send notification to applicant
    await step.run("notify-applicant", async () => {
      // TODO: Send email notification to applicant
      const statusMessages: Record<string, string> = {
        under_review: "Your application is now under review.",
        approved: "Congratulations! Your application has been approved! 🎉",
        rejected: "Unfortunately, your application was not approved at this time.",
        info_requested: "We need additional information to process your application.",
      };

      const message = statusMessages[status] || `Your application status has been updated to: ${status}`;

      console.log(`📧 Notification to ${applicantEmail}: ${message}`);
      return { notified: true };
    });

    // Step 3: Create audit log
    await step.run("audit-status-change", async () => {
      await createAuditLog(
        "system",
        "Rental Application Updated",
        `Application ${applicationId} status changed to ${status}`
      );
      return { audited: true };
    });

    return {
      success: true,
      message: `Status update notification sent for application ${applicationId}`,
    };
  }
);

// ============================================================
// Function 6: Daily Lead Summary (Cron Job)
// ============================================================
const dailyLeadSummary = inngest.createFunction(
  { id: "daily-lead-summary" },
  { cron: "0 9 * * *" }, // Runs every day at 9:00 AM
  async ({ step }) => {
    // Step 1: Fetch today's leads
    const todayLeads = await step.run("fetch-today-leads", async () => {
      const Lead = (await import("../models/Lead")).default;
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const leads = await Lead.find({
        createdAt: { $gte: startOfDay },
      }).countDocuments();

      return { count: leads };
    });

    // Step 2: Fetch pending applications
    const pendingApps = await step.run("fetch-pending-apps", async () => {
      const RentalApplication = (await import("../models/RentalApplication")).default;
      const count = await RentalApplication.countDocuments({
        status: "submitted",
      });
      return { count };
    });

    // Step 3: Fetch upcoming consultations
    const upcomingConsultations = await step.run("fetch-upcoming-consultations", async () => {
      const Consultation = (await import("../models/Consultation")).default;
      const count = await Consultation.countDocuments({
        dateTime: { $gte: new Date() },
        status: "scheduled",
      });
      return { count };
    });

    // Step 4: Send summary (placeholder)
    await step.run("send-summary", async () => {
      console.log("📊 Daily Summary:");
      console.log(`   - New Leads Today: ${todayLeads.count}`);
      console.log(`   - Pending Applications: ${pendingApps.count}`);
      console.log(`   - Upcoming Consultations: ${upcomingConsultations.count}`);

      // TODO: Send summary email to admin
      return { summarySent: true };
    });

    return {
      success: true,
      summary: {
        todayLeads: todayLeads.count,
        pendingApplications: pendingApps.count,
        upcomingConsultations: upcomingConsultations.count,
      },
    };
  }
);

// ============================================================
// Function 7: Clean Up Expired Tokens (Cron Job)
// ============================================================
const cleanupExpiredTokens = inngest.createFunction(
  { id: "cleanup-expired-tokens" },
  { cron: "0 2 * * *" }, // Runs every day at 2:00 AM
  async ({ step }) => {
    const result = await step.run("cleanup-tokens", async () => {
      const User = (await import("../models/User")).default;

      const updateResult = await User.updateMany(
        { resetPasswordExpires: { $lt: new Date() } },
        {
          $unset: {
            resetPasswordToken: "",
            resetPasswordExpires: "",
          },
        }
      );

      console.log(`🧹 Cleaned up ${updateResult.modifiedCount} expired reset tokens`);
      return { cleanedCount: updateResult.modifiedCount };
    });

    return {
      success: true,
      cleanedTokens: result.cleanedCount,
    };
  }
);

// ============================================================
// Function 8: Consultation Follow-up (Cron Job)
// ============================================================
const consultationFollowUp = inngest.createFunction(
  { id: "consultation-follow-up" },
  { cron: "0 10 * * 1" }, // Runs every Monday at 10:00 AM
  async ({ step }) => {
    const completedConsultations = await step.run(
      "fetch-completed-consultations",
      async () => {
        const Consultation = (await import("../models/Consultation")).default;

        // Find consultations completed in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const consultations = await Consultation.find({
          status: "completed",
          updatedAt: { $gte: sevenDaysAgo },
        })
          .populate("client", "name email")
          .populate("consultant", "name")
          .limit(50);

        return consultations;
      }
    );

    await step.run("process-follow-ups", async () => {
      for (const consultation of completedConsultations) {
        const client = consultation.client as any;
        if (client?.email) {
          console.log(`📧 Sending follow-up to ${client.email}`);
          // TODO: Send follow-up email
        }
      }

      return {
        processed: completedConsultations.length,
      };
    });

    return {
      success: true,
      followUpsSent: completedConsultations.length,
    };
  }
);

// ============================================================
// Export all functions
// ============================================================
export const functions = [
  sendWelcomeEmail,
  notifyNewLead,
  sendConsultationReminder,
  processAdvisorApplication,
  notifyRentalApplicationUpdate,
  dailyLeadSummary,
  cleanupExpiredTokens,
  consultationFollowUp,
];

// ============================================================
// Helper function to trigger events from controllers
// ============================================================
export const triggerEvent = async (eventName: string, data: any) => {
  try {
    await inngest.send({
      name: eventName,
      data,
    });
    console.log(`✅ Event triggered: ${eventName}`);
  } catch (error) {
    console.error(`❌ Failed to trigger event: ${eventName}`, error);
  }
};

export default inngest;