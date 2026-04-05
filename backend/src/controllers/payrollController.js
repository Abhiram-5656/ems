import Payroll from '../models/Payroll.js';
import User from '../models/User.js';

export const createPayroll = async (req, res) => {
  try {
    const { employeeId, month, year, baseSalary, allowances, deductions, notes } = req.body;

    if (!employeeId || !month || !year || !baseSalary) {
      return res.status(400).json({
        success: false,
        message: 'employeeId, month, year, and baseSalary are required',
      });
    }

    // Check if employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const existingPayroll = await Payroll.findOne({
      employee: employeeId,
      month,
      year,
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll for this employee and month already exists',
      });
    }

    const totalAllowances = allowances
      ? Object.values(allowances).reduce((sum, val) => sum + (val || 0), 0)
      : 0;

    const totalDeductions = deductions
      ? Object.values(deductions).reduce((sum, val) => sum + (val || 0), 0)
      : 0;

    const grossSalary = baseSalary + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    const payroll = new Payroll({
      employee: employeeId,
      month,
      year,
      baseSalary,
      allowances: allowances || {},
      deductions: deductions || {},
      grossSalary,
      netSalary,
      notes,
    });

    await payroll.save();
    await payroll.populate('employee', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPayroll = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 10, employeeId } = req.query;

    const query = {};

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (employeeId) query.employee = employeeId;

    const skip = (page - 1) * limit;
    const payrolls = await Payroll.find(query)
      .populate('employee', 'firstName lastName email department salary')
      .populate('approvedBy', 'firstName lastName')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payroll.countDocuments(query);

    // Calculate summary
    const summary = await Payroll.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalGross: { $sum: '$grossSalary' },
          totalNet: { $sum: '$netSalary' },
          totalDeductions: {
            $sum: {
              $add: [
                { $ifNull: ['$deductions.providentFund', 0] },
                { $ifNull: ['$deductions.tax', 0] },
                { $ifNull: ['$deductions.insurance', 0] },
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: payrolls,
      summary: summary[0] || { totalGross: 0, totalNet: 0, totalDeductions: 0 },
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

export const getEmployeePayroll = async (req, res) => {
  try {
    const { month, year, page = 1, limit = 10 } = req.query;

    const query = { employee: req.user._id };

    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);

    const skip = (page - 1) * limit;
    const payrolls = await Payroll.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Payroll.countDocuments(query);

    res.status(200).json({
      success: true,
      data: payrolls,
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

export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const { baseSalary, allowances, deductions, notes } = req.body;

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found',
      });
    }

    if (payroll.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Can only update payroll in DRAFT status',
      });
    }

    if (baseSalary) payroll.baseSalary = baseSalary;
    if (allowances) payroll.allowances = allowances;
    if (deductions) payroll.deductions = deductions;
    if (notes) payroll.notes = notes;

    const totalAllowances = Object.values(payroll.allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
    const totalDeductions = Object.values(payroll.deductions || {}).reduce((sum, val) => sum + (val || 0), 0);

    payroll.grossSalary = payroll.baseSalary + totalAllowances;
    payroll.netSalary = payroll.grossSalary - totalDeductions;

    await payroll.save();
    await payroll.populate('employee', 'firstName lastName email');

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approvePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndUpdate(
      id,
      {
        status: 'APPROVED',
        approvedBy: req.user._id,
      },
      { new: true }
    )
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll approved',
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markPayrollAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findByIdAndUpdate(
      id,
      {
        status: 'PAID',
        paidDate: new Date(),
      },
      { new: true }
    )
      .populate('employee', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll marked as paid',
      data: payroll,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const payroll = await Payroll.findById(id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found',
      });
    }

    if (payroll.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete payroll in DRAFT status',
      });
    }

    await Payroll.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Payroll deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};