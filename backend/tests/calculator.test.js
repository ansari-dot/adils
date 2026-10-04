import { CalculatorService } from '../src/modules/calculator/calculator.service.js';

describe('Calculator Module - Unit Tests', () => {
  it('should accurately calculate bakery item costs and suggested price', () => {
    const input = {
      ingredients: [
        { name: 'Flour', quantity: 1, unit: 'kg', costPerUnit: 2.5 },
        { name: 'Sugar', quantity: 0.5, unit: 'kg', costPerUnit: 1.5 },
        { name: 'Butter', quantity: 0.25, unit: 'kg', costPerUnit: 4.0 },
      ],
      laborHours: 2,
      hourlyLaborRate: 15,
      overheadPercentage: 20,
      desiredProfitMarginPercentage: 30,
    };

    const result = CalculatorService.calculateCost(input);

    // Ingredients cost = 2.5 + 0.75 + 1.0 = 4.25
    // Labor cost = 2 * 15 = 30
    // Direct cost = 34.25
    // Overhead = 34.25 * 0.20 = 6.85
    // Total cost = 41.10
    // Profit = 41.10 * 0.30 = 12.33
    // Suggested price = 53.43

    expect(result.breakdown.ingredientsCost).toBe(4.25);
    expect(result.breakdown.laborCost).toBe(30);
    expect(result.breakdown.directCost).toBe(34.25);
    expect(result.breakdown.overheadCost).toBe(6.85);
    expect(result.breakdown.totalCost).toBe(41.1);
    expect(result.suggestedPrice).toBe(53.43);
  });
});
