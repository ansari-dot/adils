import { CartService } from './cart.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await CartService.getCart(req.user._id);
  res.status(200).json(new ApiResponse(200, cart, 'Cart fetched successfully'));
});

export const addItemToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) throw new ApiError(400, 'Product ID is required');

  const cart = await CartService.addItem(req.user._id, productId, quantity || 1);
  res.status(200).json(new ApiResponse(200, cart, 'Item added to cart'));
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.productId;
  
  if (quantity === undefined) throw new ApiError(400, 'Quantity is required');

  const cart = await CartService.updateItemQuantity(req.user._id, productId, quantity);
  res.status(200).json(new ApiResponse(200, cart, 'Cart updated'));
});

export const removeItemFromCart = asyncHandler(async (req, res) => {
  const cart = await CartService.removeItem(req.user._id, req.params.productId);
  res.status(200).json(new ApiResponse(200, cart, 'Item removed from cart'));
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await CartService.clearCart(req.user._id);
  res.status(200).json(new ApiResponse(200, cart, 'Cart cleared'));
});
