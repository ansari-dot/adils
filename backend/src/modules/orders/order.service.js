import { Order } from './order.model.js';
import { Product } from '../products/product.model.js';
import { Cart } from '../cart/cart.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';

export class OrderService {
  static async createOrder(userId, orderData) {
    let subtotal = 0;
    const itemsWithPrice = [];

    for (const item of orderData.items) {
      const quantity = item.quantity || item.qty || 1;
      const targetId = item.product || item.productId || item.id;
      let dbProduct = null;

      if (targetId && targetId.match(/^[0-9a-fA-F]{24}$/)) {
        dbProduct = await Product.findById(targetId);
      }

      if (dbProduct) {
        if (!dbProduct.isAvailable) {
          throw new ApiError(400, `Product is currently unavailable: ${dbProduct.name}`);
        }
        if (dbProduct.stock < quantity) {
          throw new ApiError(400, `Insufficient stock for product: ${dbProduct.name}`);
        }

        dbProduct.stock -= quantity;
        await dbProduct.save();

        const unitPrice = dbProduct.price;
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        itemsWithPrice.push({
          product: dbProduct._id,
          productId: dbProduct._id.toString(),
          title: dbProduct.title || dbProduct.name,
          quantity,
          qty: quantity,
          price: unitPrice,
          image: dbProduct.image || (dbProduct.images && dbProduct.images[0]) || '',
          baker: dbProduct.bakerName || 'Sarah Kim',
        });
      } else {
        // Fallback for custom or catalog items provided by frontend
        const unitPrice = item.price || 10;
        const itemTitle = item.title || 'Baked Good Item';
        const itemTotal = unitPrice * quantity;
        subtotal += itemTotal;

        itemsWithPrice.push({
          title: itemTitle,
          quantity,
          qty: quantity,
          price: unitPrice,
          image: item.image || '',
          baker: item.baker || 'Sarah Kim',
        });
      }
    }

    const deliveryFee = subtotal > 0 ? 5.0 : 0.0;
    const tax = Number((subtotal * 0.08).toFixed(2));
    const grandTotal = Number((subtotal + deliveryFee + tax).toFixed(2));

    const order = await Order.create({
      user: userId,
      items: itemsWithPrice,
      subtotal: Number(subtotal.toFixed(2)),
      deliveryFee,
      tax,
      grandTotal,
      totalAmount: grandTotal,
      shippingAddress: orderData.shippingAddress || {
        street: '123 Baker Street',
        city: 'London',
        zipCode: 'W1U 6GB',
      },
      specialNotes: orderData.specialNotes || '',
    });

    // Automatically clear backend cart for this user
    await Cart.findOneAndUpdate({ user: userId }, { items: [] });

    return await order.populate('items.product user');
  }

  static async getUserOrders(userId, queryParams) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = { user: userId };

    const orders = await Order.find(filter)
      .populate('items.product')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalItems = await Order.countDocuments(filter);
    return getPagingData(orders, page, limit, totalItems);
  }

  static async getOrderById(orderId, userId, userRole) {
    const order = await Order.findById(orderId).populate('items.product user');
    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    if (userRole !== 'admin' && order.user._id.toString() !== userId.toString()) {
      throw new ApiError(403, 'Not authorized to view this order');
    }

    return order;
  }

  static async getAllOrders(queryParams) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = {};
    if (queryParams.status) {
      filter.status = queryParams.status;
    }

    const orders = await Order.find(filter)
      .populate('items.product user')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalItems = await Order.countDocuments(filter);
    return getPagingData(orders, page, limit, totalItems);
  }

  static async updateOrderStatus(orderId, updateData) {
    const order = await Order.findByIdAndUpdate(orderId, updateData, {
      new: true,
      runValidators: true,
    }).populate('items.product user');

    if (!order) {
      throw new ApiError(404, 'Order not found');
    }

    return order;
  }
}
