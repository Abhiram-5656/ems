import User from '../models/User.js';

export const getAllEmployees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const employees = await User.find(query)
      .populate('role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: employees,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, department, position, salary, role } = req.body;

    const existingEmployee = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingEmployee) {
      return res.status(400).json({ success: false, message: 'Email or phone already exists' });
    }

    const employee = new User({
      firstName,
      lastName,
      email,
      phone,
      password,
      department,
      position,
      salary,
      role,
    });

    await employee.save();
    await employee.populate('role');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.password;
    delete updateData._id;

    const employee = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate('role');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findByIdAndUpdate(id, { isActive: false }, { new: true });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.status(200).json({ success: true, message: 'Employee deactivated', data: employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// cat >> backend/src/controllers/employeeController.js << 'EOF'

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id).populate('role');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getEmployeeStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ isActive: true });
    const totalDepartments = await User.distinct('department', { isActive: true });
    
    const employeesByRole = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $lookup: { from: 'roles', localField: '_id', foreignField: '_id', as: 'roleInfo' } },
    ]);

    const employeesByDepartment = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments: totalDepartments.length,
        employeesByRole,
        employeesByDepartment,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// EOF