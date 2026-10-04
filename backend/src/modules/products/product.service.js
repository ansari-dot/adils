import { Product } from './product.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPagination, getPagingData } from '../../utils/pagination.js';

export class ProductService {
  static async createProduct(productData) {
    if (!productData.name && productData.title) {
      productData.name = productData.title;
    }
    if (!productData.title && productData.name) {
      productData.title = productData.name;
    }
    if (productData.inStock !== undefined) {
      productData.isAvailable = productData.inStock;
    }
    return await Product.create(productData);
  }

  static async getAllProducts(queryParams) {
    const { page, limit, skip, sort } = getPagination(queryParams);
    const filter = {};

    if (queryParams.category && queryParams.category !== 'All') {
      if (queryParams.category === 'Bread' || queryParams.category === 'Breads') {
        filter.category = { $in: ['Bread', 'Breads'] };
      } else {
        filter.category = queryParams.category;
      }
    }

    if (queryParams.isAvailable !== undefined) {
      filter.isAvailable = queryParams.isAvailable === 'true';
    }

    if (queryParams.isPopular !== undefined) {
      filter.isPopular = queryParams.isPopular === 'true';
    }

    if (queryParams.search) {
      const searchRegex = new RegExp(queryParams.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { bakerName: searchRegex },
      ];
    }

    if (queryParams.minPrice || queryParams.maxPrice) {
      filter.price = {};
      if (queryParams.minPrice) filter.price.$gte = Number(queryParams.minPrice);
      if (queryParams.maxPrice) filter.price.$lte = Number(queryParams.maxPrice);
    }

    const products = await Product.find(filter).sort(sort).skip(skip).limit(limit);
    const totalItems = await Product.countDocuments(filter);

    return getPagingData(products, page, limit, totalItems);
  }

  static async getProductById(productId) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  static async updateProduct(productId, updateData) {
    if (updateData.title && !updateData.name) {
      updateData.name = updateData.title;
    }
    if (updateData.name && !updateData.title) {
      updateData.title = updateData.name;
    }
    if (updateData.inStock !== undefined) {
      updateData.isAvailable = updateData.inStock;
    }
    const product = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }

  static async deleteProduct(productId) {
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }
    return product;
  }
}
