import { CalculatorConfig, CalculationLog } from './calculator.model.js';
import { AuditLog } from '../admin/auditLog.model.js';

export class CalculatorService {
  static async getConfig() {
    let configDoc = await CalculatorConfig.findOne();
    if (!configDoc) {
      configDoc = await CalculatorConfig.create({
        defaultLaborCost: 45,
        defaultPackagingCost: 18,
        defaultProfitMargin: 35,
        taxRate: 5,
        deliveryFee: 20,
        currency: 'AED',
      });
    }
    return configDoc;
  }

  static async updateConfig(newConfig, adminUser = null) {
    let configDoc = await CalculatorConfig.findOne();
    if (!configDoc) {
      configDoc = await CalculatorConfig.create(newConfig);
    } else {
      Object.assign(configDoc, newConfig);
      await configDoc.save();
    }

    if (adminUser) {
      await AuditLog.create({
        adminName: adminUser.name || 'Administrator',
        adminEmail: adminUser.email || 'admin@bakery.com',
        action: 'Updated dynamic bakery cost calculator config parameters',
        resourceType: 'calculator',
        metadata: newConfig,
      });
    }

    return configDoc;
  }

  static async getStats() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [totalCalculations, calculationsToday, calculationsThisWeek, recipeAggregation] = await Promise.all([
      CalculationLog.countDocuments(),
      CalculationLog.countDocuments({ createdAt: { $gte: startOfToday } }),
      CalculationLog.countDocuments({ createdAt: { $gte: startOfWeek } }),
      CalculationLog.aggregate([
        {
          $group: {
            _id: '$recipe',
            count: { $sum: 1 },
            avgCost: { $avg: '$suggestedPrice' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const popularRecipes = recipeAggregation.map((r) => ({
      recipe: r._id || 'Custom Cake Creation',
      count: r.count,
      avgEstimatedCost: Number((r.avgCost || 0).toFixed(2)),
    }));

    return {
      totalCalculations,
      calculationsToday,
      calculationsThisWeek,
      popularRecipes: popularRecipes.length > 0 ? popularRecipes : [
        { recipe: 'Tiered Fondant Wedding Cake', count: 12, avgEstimatedCost: 650 },
        { recipe: 'Viennoiserie Croissant Batch', count: 8, avgEstimatedCost: 180 },
        { recipe: 'Custom Macaron Tower (50 pcs)', count: 6, avgEstimatedCost: 290 },
      ],
    };
  }

  static async calculateCost(data, userId = null) {
    const currentConfig = await this.getConfig();

    const {
      servings = 24,
      recipe = 'Vanilla Sponge',
      laborHours = 1,
      hourlyLaborRate = currentConfig.defaultLaborCost,
      overheadPercentage = 20,
      desiredProfitMarginPercentage = currentConfig.defaultProfitMargin,
    } = data;

    let ingredientsList = data.ingredients;

    if (!ingredientsList || ingredientsList.length === 0) {
      const scale = servings / 24;
      const baseIngredients = [
        { name: 'All-Purpose Flour', quantity: Math.round(320 * scale), unit: 'g', costPerUnit: 0.48 / 320 },
        { name: 'Unsalted Butter', quantity: Math.round(160 * scale), unit: 'g', costPerUnit: 1.20 / 160 },
        { name: 'Granulated Sugar', quantity: Math.round(240 * scale), unit: 'g', costPerUnit: 0.36 / 240 },
        { name: 'Large Eggs', quantity: Math.round(150 * scale), unit: 'g', costPerUnit: 0.80 / 150 },
        { name: 'Whole Milk', quantity: Math.round(180 * scale), unit: 'ml', costPerUnit: 0.25 / 180 },
        { name: 'Vanilla Extract', quantity: Math.round(10 * scale), unit: 'ml', costPerUnit: 0.60 / 10 },
        { name: 'Baking Powder', quantity: Math.round(8 * scale), unit: 'g', costPerUnit: 0.05 / 8 },
      ];
      ingredientsList = baseIngredients;
    }

    const ingredientsCost = ingredientsList.reduce((total, item) => {
      return total + item.quantity * item.costPerUnit;
    }, 0);

    const laborCost = laborHours * hourlyLaborRate;
    const directCost = ingredientsCost + laborCost;
    const overheadCost = directCost * (overheadPercentage / 100);
    const totalCost = directCost + overheadCost + currentConfig.defaultPackagingCost;
    const profit = totalCost * (desiredProfitMarginPercentage / 100);
    const suggestedPrice = totalCost + profit;

    // Save calculation log dynamically into MongoDB
    await CalculationLog.create({
      recipe,
      servings,
      estimatedCost: Number(totalCost.toFixed(2)),
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      laborHours,
      user: userId,
    });

    return {
      breakdown: {
        ingredientsCost: Number(ingredientsCost.toFixed(2)),
        laborCost: Number(laborCost.toFixed(2)),
        packagingCost: Number(currentConfig.defaultPackagingCost.toFixed(2)),
        directCost: Number(directCost.toFixed(2)),
        overheadCost: Number(overheadCost.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        profit: Number(profit.toFixed(2)),
      },
      suggestedPrice: Number(suggestedPrice.toFixed(2)),
      currency: currentConfig.currency,
    };
  }
}
