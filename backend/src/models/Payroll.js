import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    allowances: { hra: Number, da: Number, medical: Number, other: Number },
    deductions: { providentFund: Number, tax: Number, insurance: Number, other: Number },
    grossSalary: Number,
    netSalary: Number,
    status: { type: String, enum: ['DRAFT', 'GENERATED', 'APPROVED', 'PAID'], default: 'DRAFT' },
    paidDate: Date,
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Payroll', payrollSchema);