import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';

export const getAdminDashboard = async (req, res) => {
  try {
    // Total employees
    const totalEmployees = await User.countDocuments({ isActive: true });

    // Today's attendance
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const todayAttendance = await Attendance.aggregate([
      {
        $match: { date: todayDate },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Pending leaves
    const pendingLeaves = await Leave.countDocuments({ status: 'PENDING' });

    // Upcoming leaves
    const upcomingLeaves = await Leave.find({
      status: 'APPROVED',
      startDate: { $gt: new Date() },
    })
      .limit(5)
      .populate('employee', 'firstName lastName email')
      .sort({ startDate: 1 });

    // Recent employees
    const recentEmployees = await User.find({ isActive: true })
      .limit(5)
      .sort({ createdAt: -1 })
      .populate('role');

    // Payroll summary (current month)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const payrollSummary = await Payroll.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear,
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalNetSalary: { $sum: '$netSalary' },
        },
      },
    ]);

    // Department-wise employee distribution
    const departmentDistribution = await User.aggregate([
      {
        $match: { isActive: true },
      },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
    ]);

    // Leave type statistics
    const leaveStatistics = await Leave.aggregate([
      {
        $match: {
          status: 'APPROVED',
          startDate: { $gte: new Date(currentYear, 0, 1) },
          endDate: { $lt: new Date(currentYear + 1, 0, 1) },
        },
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        todayAttendance,
        pendingLeaves,
        upcomingLeaves,
        recentEmployees,
        payrollSummary,
        departmentDistribution,
        leaveStatistics,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Attendance stats
    const attendanceStats = await Attendance.aggregate([
      { $match: { employee: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Leave stats
    const leaveStats = await Leave.aggregate([
      { $match: { employee: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Pending leaves
    const pendingLeaves = await Leave.find({
      employee: userId,
      status: 'PENDING',
    });

    // Recent attendance
    const recentAttendance = await Attendance.find({ employee: userId })
      .limit(5)
      .sort({ date: -1 });

    // Current month payroll
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const currentPayroll = await Payroll.findOne({
      employee: userId,
      month: currentMonth,
      year: currentYear,
    });

    // Upcoming approved leaves
    const upcomingLeaves = await Leave.find({
      employee: userId,
      status: 'APPROVED',
      startDate: { $gt: new Date() },
    })
      .limit(3)
      .sort({ startDate: 1 });

    res.status(200).json({
      success: true,
      data: {
        attendanceStats,
        leaveStats,
        pendingLeaves,
        recentAttendance,
        currentPayroll,
        upcomingLeaves,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getHRDashboard = async (req, res) => {
  try {
    // Same as admin dashboard
    const result = await getAdminDashboard(req, res);
    return result;
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getManagerDashboard = async (req, res) => {
  try {
    // Get manager's team
    const manager = await User.findById(req.user._id);
    
    const teamMembers = await User.find({
      reportingManager: req.user._id,
      isActive: true,
    });

    // Team attendance stats
    const teamAttendanceStats = await Attendance.aggregate([
      {
        $match: {
          employee: { $in: teamMembers.map(m => m._id) },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Pending leave requests from team
    const pendingLeaveRequests = await Leave.find({
      employee: { $in: teamMembers.map(m => m._id) },
      status: 'PENDING',
    })
      .populate('employee', 'firstName lastName email')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        teamSize: teamMembers.length,
        teamMembers,
        teamAttendanceStats,
        pendingLeaveRequests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};