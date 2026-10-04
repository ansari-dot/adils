import mongoose from 'mongoose';

const calculatorConfigSchema = new mongoose.Schema(
  {
    defaultLaborCost: { type: Number, default: 45 },
    defaultPackagingCost: { type: Number, default: 18 },
    defaultProfitMargin: { type: Number, default: 35 },
    taxRate: { type: Number, default: 5 },
    deliveryFee: { type: Number, default: 20 },
    currency: { type: String, default: 'AED' },
  },
  { timestamps: true }
);

const calculationLogSchema = new mongoose.Schema(
  {
    recipe: { type: String, required: true },
    servings: { type: Number, default: 24 },
    estimatedCost: { type: Number, required: true },
    suggestedPrice: { type: Number, required: true },
    laborHours: { type: Number, default: 1 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const CalculatorConfig = mongoose.model('CalculatorConfig', calculatorConfigSchema);
export const CalculationLog = mongoose.model('CalculationLog', calculationLogSchema);
