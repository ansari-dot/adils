import { Cart } from './cart.model.js';
import { Product } from '../products/product.model.js';
import { ApiError } from '../../utils/ApiError.js';

export class CartService {
  static async getCart(userId) {
    let cart = await Cart.findOne({ user: userId }).populate({
      path: 'items.product'
    });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  static async addItem(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return await cart.populate({ path: 'items.product' });
  }

  static async updateItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'Cart not found');

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
      await cart.save();
    }
    return await cart.populate({ path: 'items.product' });
  }

  static async removeItem(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    return await cart.populate({ path: 'items.product' });
  }

  static async clearCart(userId) {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    return cart;
  }
}
