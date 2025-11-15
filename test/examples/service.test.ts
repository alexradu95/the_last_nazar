/**
 * Example Service Test: Order Processing
 *
 * Demonstrates:
 * - Testing business logic
 * - Testing with immutable data
 * - Testing edge cases
 * - Testing error handling
 * - Achieving 100% coverage through behavior
 */

import { describe, it, expect } from 'vitest';

/**
 * Order types
 */
type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  shippingCost: number;
  discount?: number;
  userId: string;
};

type ProcessedOrder = Order & {
  itemsTotal: number;
  finalShippingCost: number;
  discountAmount: number;
  total: number;
};

/**
 * Business logic constants
 */
const FREE_SHIPPING_THRESHOLD = 50;
const MAX_DISCOUNT_PERCENT = 50;

/**
 * Helper functions (implementation details - not tested directly)
 */
const calculateItemsTotal = (items: OrderItem[]): number => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
};

const calculateShipping = (itemsTotal: number, baseShipping: number): number => {
  return itemsTotal > FREE_SHIPPING_THRESHOLD ? 0 : baseShipping;
};

const calculateDiscountAmount = (
  itemsTotal: number,
  discountPercent?: number
): number => {
  if (!discountPercent) return 0;

  const validDiscount = Math.min(discountPercent, MAX_DISCOUNT_PERCENT);
  return itemsTotal * (validDiscount / 100);
};

/**
 * Public API - Process order
 */
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = calculateItemsTotal(order.items);
  const finalShippingCost = calculateShipping(itemsTotal, order.shippingCost);
  const discountAmount = calculateDiscountAmount(itemsTotal, order.discount);

  const total = itemsTotal + finalShippingCost - discountAmount;

  return {
    ...order,
    itemsTotal,
    finalShippingCost,
    discountAmount,
    total,
  };
};

/**
 * Factory for creating test orders
 */
const createTestOrder = (overrides?: Partial<Order>): Order => {
  return {
    id: 'order-123',
    userId: 'user-456',
    items: [
      {
        id: 'item-1',
        name: 'Test Product',
        price: 10,
        quantity: 1,
      },
    ],
    shippingCost: 5,
    ...overrides,
  };
};

/**
 * Tests - Testing behavior through public API
 */
describe('Order Processing Service', () => {
  describe('Basic Order Calculation', () => {
    it('should calculate total with single item and shipping', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 30, quantity: 1 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(30);
      expect(processed.finalShippingCost).toBe(5);
      expect(processed.total).toBe(35);
    });

    it('should calculate total with multiple items', () => {
      const order = createTestOrder({
        items: [
          { id: '1', name: 'Product A', price: 20, quantity: 2 },
          { id: '2', name: 'Product B', price: 15, quantity: 1 },
        ],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(55); // (20 * 2) + 15
      expect(processed.total).toBe(60); // 55 + 5
    });

    it('should handle items with quantities greater than 1', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 10, quantity: 5 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(50);
      expect(processed.total).toBe(55);
    });
  });

  describe('Free Shipping Logic', () => {
    it('should apply free shipping for orders over threshold', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 60, quantity: 1 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.finalShippingCost).toBe(0);
      expect(processed.total).toBe(60);
    });

    it('should charge shipping for orders exactly at threshold', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 50, quantity: 1 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.finalShippingCost).toBe(5);
      expect(processed.total).toBe(55);
    });

    it('should charge shipping for orders below threshold', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 49.99, quantity: 1 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.finalShippingCost).toBe(5);
      expect(processed.total).toBeCloseTo(54.99, 2);
    });

    it('should apply free shipping when multiple items exceed threshold', () => {
      const order = createTestOrder({
        items: [
          { id: '1', name: 'Product A', price: 30, quantity: 1 },
          { id: '2', name: 'Product B', price: 25, quantity: 1 },
        ],
        shippingCost: 7.99,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(55);
      expect(processed.finalShippingCost).toBe(0);
      expect(processed.total).toBe(55);
    });
  });

  describe('Discount Logic', () => {
    it('should apply discount to order total', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        shippingCost: 10,
        discount: 10, // 10% discount
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(100);
      expect(processed.discountAmount).toBe(10);
      expect(processed.total).toBe(100); // 100 + 10 shipping - 10 discount
    });

    it('should not apply discount when not provided', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        shippingCost: 10,
      });

      const processed = processOrder(order);

      expect(processed.discountAmount).toBe(0);
      expect(processed.total).toBe(110);
    });

    it('should cap discount at maximum allowed percentage', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        shippingCost: 10,
        discount: 75, // 75% discount (should be capped at 50%)
      });

      const processed = processOrder(order);

      expect(processed.discountAmount).toBe(50); // Capped at 50%
      expect(processed.total).toBe(60); // 100 + 10 - 50
    });

    it('should apply discount only to items, not shipping', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 40, quantity: 1 }],
        shippingCost: 10,
        discount: 25, // 25% discount
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(40);
      expect(processed.discountAmount).toBe(10); // 25% of items only
      expect(processed.finalShippingCost).toBe(10);
      expect(processed.total).toBe(40); // 40 + 10 - 10
    });
  });

  describe('Combined Scenarios', () => {
    it('should apply free shipping and discount together', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        shippingCost: 10,
        discount: 20, // 20% discount
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(100);
      expect(processed.finalShippingCost).toBe(0); // Free shipping
      expect(processed.discountAmount).toBe(20); // 20% discount
      expect(processed.total).toBe(80); // 100 - 20
    });

    it('should handle complex multi-item order with discount', () => {
      const order = createTestOrder({
        items: [
          { id: '1', name: 'Product A', price: 25, quantity: 2 },
          { id: '2', name: 'Product B', price: 30, quantity: 1 },
          { id: '3', name: 'Product C', price: 15, quantity: 3 },
        ],
        shippingCost: 8.99,
        discount: 15,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(125); // (25*2) + 30 + (15*3)
      expect(processed.finalShippingCost).toBe(0); // Over $50
      expect(processed.discountAmount).toBe(18.75); // 15% of 125
      expect(processed.total).toBeCloseTo(106.25, 2); // 125 - 18.75
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty items array', () => {
      const order = createTestOrder({
        items: [],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(0);
      expect(processed.finalShippingCost).toBe(5);
      expect(processed.total).toBe(5);
    });

    it('should handle zero-price items', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Free Item', price: 0, quantity: 1 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBe(0);
      expect(processed.total).toBe(5);
    });

    it('should handle decimal prices correctly', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 19.99, quantity: 3 }],
        shippingCost: 4.99,
      });

      const processed = processOrder(order);

      expect(processed.itemsTotal).toBeCloseTo(59.97, 2);
      expect(processed.total).toBeCloseTo(64.96, 2);
    });

    it('should handle zero shipping cost', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 30, quantity: 1 }],
        shippingCost: 0,
      });

      const processed = processOrder(order);

      expect(processed.finalShippingCost).toBe(0);
      expect(processed.total).toBe(30);
    });

    it('should handle zero discount', () => {
      const order = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 100, quantity: 1 }],
        shippingCost: 10,
        discount: 0,
      });

      const processed = processOrder(order);

      expect(processed.discountAmount).toBe(0);
      expect(processed.total).toBe(110);
    });
  });

  describe('Immutability', () => {
    it('should not mutate the original order', () => {
      const original = createTestOrder({
        items: [{ id: '1', name: 'Product', price: 50, quantity: 1 }],
        shippingCost: 5,
      });

      const originalCopy = { ...original, items: [...original.items] };

      processOrder(original);

      expect(original).toEqual(originalCopy);
    });

    it('should not mutate items array', () => {
      const items = [{ id: '1', name: 'Product', price: 50, quantity: 1 }];
      const order = createTestOrder({ items });

      processOrder(order);

      expect(items).toEqual([
        { id: '1', name: 'Product', price: 50, quantity: 1 },
      ]);
    });
  });

  describe('Data Integrity', () => {
    it('should preserve all original order fields', () => {
      const order = createTestOrder({
        id: 'custom-id',
        userId: 'custom-user',
        items: [{ id: '1', name: 'Product', price: 50, quantity: 1 }],
        shippingCost: 5,
      });

      const processed = processOrder(order);

      expect(processed.id).toBe('custom-id');
      expect(processed.userId).toBe('custom-user');
      expect(processed.items).toEqual(order.items);
    });

    it('should add calculated fields without removing original fields', () => {
      const order = createTestOrder();

      const processed = processOrder(order);

      expect(processed).toHaveProperty('itemsTotal');
      expect(processed).toHaveProperty('finalShippingCost');
      expect(processed).toHaveProperty('discountAmount');
      expect(processed).toHaveProperty('total');
      expect(processed).toHaveProperty('id');
      expect(processed).toHaveProperty('userId');
      expect(processed).toHaveProperty('items');
      expect(processed).toHaveProperty('shippingCost');
    });
  });
});
