import Leave from '../models/Leave.js';
import emailService from '../services/emailService.js';

export const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, attachments } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'leaveType, startDate, endDate, and reason are required',
      });
    }

    // Parse dates more robustly
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date parsing
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use YYYY-MM-DD format.',
      });
    }

    // Validate date range
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before or equal to end date',
      });
    }

    // Calculate number of days
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Create leave document
    const leave = new Leave({
      employee: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays: diffDays,
      reason,
      attachments: attachments || [],
      status: 'PENDING',
    });

    await leave.save();
    await leave.populate('employee', 'firstName lastName email');

    // Send notification email
    try {
      await emailService.sendLeaveNotification(req.user.email, leave.toObject(), 'SUBMITTED');
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: leave,
    });
  } catch (error) {
    console.error('Leave application error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit leave application',
    });
  }
};

export const getLeaveApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = { employee: req.user._id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(query);

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPendingLeaves = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;
    const leaves = await Leave.find({ status: 'PENDING' })
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments({ status: 'PENDING' });

    res.status(200).json({
      success: true,
      data: leaves,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByIdAndUpdate(
      id,
      {
        status: 'APPROVED',
        approvedBy: req.user._id,
      },
      { new: true }
    )
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    // Send notification email
    try {
      await emailService.sendLeaveNotification(
        leave.employee.email,
        leave.toObject(),
        'APPROVED'
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Leave approved',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const rejectLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const leave = await Leave.findByIdAndUpdate(
      id,
      {
        status: 'REJECTED',
        approvedBy: req.user._id,
        rejectionReason,
      },
      { new: true }
    )
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    // Send notification email
    try {
      await emailService.sendLeaveNotification(
        leave.employee.email,
        leave.toObject(),
        'REJECTED'
      );
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(200).json({
      success: true,
      message: 'Leave rejected',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: 'CANCELLED' },
      { new: true }
    ).populate('employee', 'firstName lastName email');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Leave cancelled',
      data: leave,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all leaves for admin (with filters)
export const getAllLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, employeeId } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (employeeId) {
      query.employee = employeeId;
    }

    const skip = (page - 1) * limit;
    const leaves = await Leave.find(query)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Leave.countDocuments(query);

    // Get summary statistics
    const summary = {
      total: await Leave.countDocuments({}),
      pending: await Leave.countDocuments({ status: 'PENDING' }),
      approved: await Leave.countDocuments({ status: 'APPROVED' }),
      rejected: await Leave.countDocuments({ status: 'REJECTED' }),
      cancelled: await Leave.countDocuments({ status: 'CANCELLED' }),
    };

    res.status(200).json({
      success: true,
      data: leaves,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};