import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const markAttendance = async (req, res) => {
  try {
    const { date, status, checkInTime, checkOutTime, notes } = req.body;

    if (!date || !status) {
      return res.status(400).json({
        success: false,
        message: 'date and status are required',
      });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    parsedDate.setHours(0, 0, 0, 0);

    const employeeId = req.user._id;

    const normalizeDateTime = (baseDate, timeStr) => {
      if (!timeStr) return null;
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
      const dateTime = new Date(baseDate);
      dateTime.setHours(hours, minutes, 0, 0);
      return dateTime;
    };

    const checkInDate = normalizeDateTime(parsedDate, checkInTime);
    const checkOutDate = normalizeDateTime(parsedDate, checkOutTime);

    let workingHours = 0;
    if (checkInDate && checkOutDate) {
      const diffMs = checkOutDate - checkInDate;
      workingHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: parsedDate,
    });

    if (attendance) {
      // Update existing record
      attendance.status = status;
      attendance.checkInTime = checkInDate || attendance.checkInTime;
      attendance.checkOutTime = checkOutDate || attendance.checkOutTime;
      attendance.workingHours = workingHours || attendance.workingHours;
      attendance.notes = notes || attendance.notes;
    } else {
      // Create new record
      attendance = new Attendance({
        employee: employeeId,
        date: parsedDate,
        status,
        checkInTime: checkInDate,
        checkOutTime: checkOutDate,
        workingHours,
        notes,
      });
    }

    await attendance.save();
    await attendance.populate('employee', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { employeeId, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

    if (employeeId) {
      query.employee = employeeId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName email department')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    // Calculate summary statistics
    const stats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: records,
      stats: stats,
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

export const getEmployeeAttendance = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = { employee: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const start = new Date(startDate);
        query.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const skip = (page - 1) * limit;
    const records = await Attendance.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    const stats = await Attendance.aggregate([
      { $match: { employee: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalWorkingHours = records.reduce((sum, record) => sum + (record.workingHours || 0), 0);

    res.status(200).json({
      success: true,
      data: records,
      stats: stats,
      totalWorkingHours: parseFloat(totalWorkingHours.toFixed(2)),
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

export const approveAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { approvedBy: req.user._id },
      { new: true }
    )
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance approved',
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await Attendance.findByIdAndDelete(id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted',
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};