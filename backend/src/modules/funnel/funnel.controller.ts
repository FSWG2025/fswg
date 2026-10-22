import { type Request, type Response } from "express";
import Lead from '../../models/Lead';
import AdvisorApplication from '../../models/AdvisorApplication';
import Consultation from '../../models/Consultation';
import User from '../../models/User';

// @desc    Get funnel overview stats (admin)
// @route   GET /api/funnel/overview
// @access  Private/Admin
export const getFunnelOverview = async (req: Request, res: Response) => {
  try {
    // Lead funnel stages
    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: "new" });
    const contactedLeads = await Lead.countDocuments({ status: "contacted" });
    const qualifiedLeads = await Lead.countDocuments({ status: "qualified" });
    const convertedLeads = await Lead.countDocuments({ status: "converted" });
    const closedLeads = await Lead.countDocuments({ status: "closed" });

    // Insurance interested
    const insuranceInterested = await Lead.countDocuments({
      interest: { $regex: /insurance/i },
    });
    const realEstateInterested = await Lead.countDocuments({
      interest: { $regex: /real_estate|rental/i },
    });
    const financialEducationInterested = await Lead.countDocuments({
      interest: { $regex: /financial_education/i },
    });
    const entrepreneurshipInterested = await Lead.countDocuments({
      interest: { $regex: /entrepreneurship/i },
    });

    // Advisor applications funnel
    const totalAdvisorApps = await AdvisorApplication.countDocuments();
    const submittedAdvisorApps = await AdvisorApplication.countDocuments({ status: "submitted" });
    const underReviewAdvisorApps = await AdvisorApplication.countDocuments({ status: "under_review" });
    const approvedAdvisorApps = await AdvisorApplication.countDocuments({ status: "approved" });
    const enrolledAdvisorApps = await AdvisorApplication.countDocuments({ status: "enrolled" });
    const rejectedAdvisorApps = await AdvisorApplication.countDocuments({ status: "rejected" });

    // Consultation funnel
    const totalConsultations = await Consultation.countDocuments();
    const scheduledConsultations = await Consultation.countDocuments({ status: "scheduled" });
    const completedConsultations = await Consultation.countDocuments({ status: "completed" });
    const cancelledConsultations = await Consultation.countDocuments({ status: "cancelled" });

    // Conversion rates
    const leadConversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const advisorApprovalRate = totalAdvisorApps > 0 ? Math.round((approvedAdvisorApps / totalAdvisorApps) * 100) : 0;

    // Monthly trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyLeads = await Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyConsultations = await Consultation.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      leads: {
        total: totalLeads,
        new: newLeads,
        contacted: contactedLeads,
        qualified: qualifiedLeads,
        converted: convertedLeads,
        closed: closedLeads,
        conversionRate: leadConversionRate,
        monthlyTrend: monthlyLeads,
      },
      interests: {
        insurance: insuranceInterested,
        realEstate: realEstateInterested,
        financialEducation: financialEducationInterested,
        entrepreneurship: entrepreneurshipInterested,
      },
      advisorApplications: {
        total: totalAdvisorApps,
        submitted: submittedAdvisorApps,
        underReview: underReviewAdvisorApps,
        approved: approvedAdvisorApps,
        enrolled: enrolledAdvisorApps,
        rejected: rejectedAdvisorApps,
        approvalRate: advisorApprovalRate,
      },
      consultations: {
        total: totalConsultations,
        scheduled: scheduledConsultations,
        completed: completedConsultations,
        cancelled: cancelledConsultations,
        monthlyTrend: monthlyConsultations,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get lead source analytics
// @route   GET /api/funnel/sources
// @access  Private/Admin
export const getLeadSources = async (req: Request, res: Response) => {
  try {
    const sources = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get consultant performance
// @route   GET /api/funnel/consultant-performance
// @access  Private/Admin
export const getConsultantPerformance = async (req: Request, res: Response) => {
  try {
    const consultants = await User.find({ role: "consultant", isActive: true }).select("name email");

    const performance = await Promise.all(
      consultants.map(async (consultant) => {
        const leadsAssigned = await Lead.countDocuments({ assignedConsultant: consultant._id });
        const leadsConverted = await Lead.countDocuments({
          assignedConsultant: consultant._id,
          status: "converted",
        });
        const consultationsDone = await Consultation.countDocuments({
          consultant: consultant._id,
          status: "completed",
        });

        return {
          consultant: {
            _id: consultant._id,
            name: consultant.name,
            email: consultant.email,
          },
          leadsAssigned,
          leadsConverted,
          consultationsDone,
          conversionRate: leadsAssigned > 0 ? Math.round((leadsConverted / leadsAssigned) * 100) : 0,
        };
      })
    );

    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};