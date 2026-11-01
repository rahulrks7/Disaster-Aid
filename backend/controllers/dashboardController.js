const DisasterReport = require('../models/DisasterReport');
const HelpRequest = require('../models/HelpRequest');
const VolunteerProfile = require('../models/VolunteerProfile');
const ResponseTask = require('../models/ResponseTask');
const Resource = require('../models/Resource');
const Shelter = require('../models/Shelter');
const Alert = require('../models/Alert');
const User = require('../models/User');

// @desc    Get comprehensive admin dashboard summary stats
// @route   GET /api/v1/dashboard/summary
// @access  Private (Admin)
const getAdminSummary = async (req, res, next) => {
  try {
    const [
      totalReports,
      pendingReports,
      verifiedReports,
      resolvedReports,
      totalHelpRequests,
      pendingHelpRequests,
      totalVolunteers,
      availableVolunteers,
      activeTasks,
      totalResources,
      allResources,
      totalShelters,
      activeAlertsCount,
    ] = await Promise.all([
      DisasterReport.countDocuments(),
      DisasterReport.countDocuments({ verificationStatus: 'pending' }),
      DisasterReport.countDocuments({ verificationStatus: 'verified', responseStatus: { $ne: 'resolved' } }),
      DisasterReport.countDocuments({ responseStatus: 'resolved' }),
      HelpRequest.countDocuments(),
      HelpRequest.countDocuments({ status: 'pending' }),
      VolunteerProfile.countDocuments({ status: 'active' }),
      VolunteerProfile.countDocuments({ status: 'active', availability: 'available' }),
      ResponseTask.countDocuments({ status: { $in: ['open', 'assigned', 'accepted', 'in_progress'] } }),
      Resource.countDocuments(),
      Resource.find(),
      Shelter.countDocuments(),
      Alert.countDocuments({ isActive: true, expiryTime: { $gt: new Date() } }),
    ]);

    // Low stock warnings
    const lowStockResources = allResources.filter((r) => r.availableQuantity <= r.minStockLevel);

    // Recent items for quick admin review
    const recentReports = await DisasterReport.find()
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingQueue = await DisasterReport.find({ verificationStatus: 'pending' })
      .populate('reporter', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentHelpRequests = await HelpRequest.find()
      .populate('requester', 'name phone')
      .sort({ createdAt: -1 })
      .limit(5);

    const criticalIncidents = await DisasterReport.find({
      severity: 'critical',
      responseStatus: { $ne: 'resolved' },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalReports,
          pendingReports,
          verifiedActiveReports: verifiedReports,
          resolvedReports,
          totalHelpRequests,
          pendingHelpRequests,
          totalVolunteers,
          availableVolunteers,
          activeTasks,
          totalResources,
          lowStockCount: lowStockResources.length,
          totalShelters,
          activeAlerts: activeAlertsCount,
        },
        pendingQueue,
        recentReports,
        recentHelpRequests,
        criticalIncidents,
        lowStockResources: lowStockResources.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard analytics charts
// @route   GET /api/v1/dashboard/analytics
// @access  Private (Admin)
const getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. Disasters by Category
    const categoryAgg = await DisasterReport.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    // 2. Incidents by Severity
    const severityAgg = await DisasterReport.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    // 3. Help Requests by Type
    const requestTypeAgg = await HelpRequest.aggregate([
      { $group: { _id: '$requestType', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    // 4. Tasks Status Distribution
    const taskStatusAgg = await ResponseTask.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', count: 1, _id: 0 } },
    ]);

    // 5. Monthly incident trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyAgg = await DisasterReport.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          reports: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$responseStatus', 'resolved'] }, 1, 0] },
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = monthlyAgg.map((item) => ({
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      reports: item.reports,
      resolved: item.resolved,
    }));

    res.status(200).json({
      success: true,
      data: {
        disastersByCategory: categoryAgg,
        incidentsBySeverity: severityAgg,
        helpRequestsByType: requestTypeAgg,
        tasksByStatus: taskStatusAgg,
        monthlyTrends,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get citizen personalized dashboard metrics
// @route   GET /api/v1/dashboard/citizen
// @access  Private (Citizen)
const getCitizenSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [myReportsCount, myHelpRequestsCount, activeAlerts, recentMyReports, recentMyRequests] =
      await Promise.all([
        DisasterReport.countDocuments({ reporter: userId }),
        HelpRequest.countDocuments({ requester: userId }),
        Alert.find({ isActive: true, expiryTime: { $gt: new Date() } }).limit(4),
        DisasterReport.find({ reporter: userId }).sort({ createdAt: -1 }).limit(3),
        HelpRequest.find({ requester: userId }).sort({ createdAt: -1 }).limit(3),
      ]);

    res.status(200).json({
      success: true,
      data: {
        myReportsCount,
        myHelpRequestsCount,
        activeAlerts,
        recentMyReports,
        recentMyRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer dashboard summary
// @route   GET /api/v1/dashboard/volunteer
// @access  Private (Volunteer)
const getVolunteerSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const profile = await VolunteerProfile.findOne({ user: userId });

    const [availableTasksCount, myAssignedCount, inProgressCount, completedCount, activeAlerts] =
      await Promise.all([
        ResponseTask.countDocuments({ status: 'open' }),
        ResponseTask.countDocuments({ assignedVolunteers: userId, status: 'assigned' }),
        ResponseTask.countDocuments({ assignedVolunteers: userId, status: { $in: ['accepted', 'in_progress'] } }),
        ResponseTask.countDocuments({ assignedVolunteers: userId, status: 'completed' }),
        Alert.find({ isActive: true, expiryTime: { $gt: new Date() } }).limit(3),
      ]);

    const myCurrentTasks = await ResponseTask.find({
      assignedVolunteers: userId,
      status: { $in: ['assigned', 'accepted', 'in_progress'] },
    })
      .populate('disasterReport', 'title category severity locationName')
      .populate('helpRequest', 'requestType priority')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        profile,
        availableTasksCount,
        myAssignedCount,
        inProgressCount,
        completedCount,
        myCurrentTasks,
        activeAlerts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminSummary,
  getAdminAnalytics,
  getCitizenSummary,
  getVolunteerSummary,
};
