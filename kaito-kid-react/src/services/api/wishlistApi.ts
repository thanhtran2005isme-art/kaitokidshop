/**
 * Wishlist API Service
 */

import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';
import type { Product } from '../../types';

// Backend WishlistDTO
export interface WishlistItemDTO {
  id: number;
  productId: number;
  productName: string;
  price: number;
  oldPrice?: number;
  image: string;
  createdAt: string;
}

// Mapper: WishlistItemDTO -> Product (partial)
function mapWishlistItemToProduct(dto: WishlistItemDTO): Product {
  return {
    id: dto.productId,
    name: dto.productName,
    image: dto.image,
    price: dto.price,
    oldPrice: dto.oldPrice ?? null,
    category: '',
    stock: 1,
    gender: '',
    status: 'active',
    description: '',
    sku: '',
    isNew: false,
    isSale: !!dto.oldPrice,
    isBestSeller: false,
    rating: 0,
    soldCount: 0,
    colors: [],
    sizes: [],
  };
}

export const wishlistApi = {
  /**
   * Lấy danh sách yêu thích của user
   * GET /api/wishlist
   */
  async getWishlist(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<WishlistItemDTO[]>('/api/wishlist');
      const products = response.data.map(mapWishlistItemToProduct);
      return {
        success: true,
        data: products,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Thêm sản phẩm vào wishlist
   * POST /api/wishlist/{productId}
   */
  async addToWishlist(productId: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.post(`/api/wishlist/${productId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Xóa sản phẩm khỏi wishlist
   * DELETE /api/wishlist/{productId}
   */
  async removeFromWishlist(productId: number): Promise<ApiResponse<void>> {
    try {
      await apiClient.delete(`/api/wishlist/${productId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },
};
