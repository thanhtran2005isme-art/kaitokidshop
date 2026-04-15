/**
 * Product API Service
 */

import apiClient, { getErrorMessage } from '../apiClient';
import type { ApiResponse } from '../../types/api';
import type { Product } from '../../types';

// Backend DTOs
export interface ProductDTO {
  id: number;
  name: string;
  category: string;
  gender: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  status: string;
  image: string;
  shortDescription?: string;
  sku: string;
  slug?: string;
  isNew: boolean;
  isSale: boolean;
  isBestSeller: boolean;
  rating: number;
  soldCount: number;
  colors: string[];
  sizes: string[];
}

// Mapper: ProductDTO -> Product
function mapProductDTOToProduct(dto: ProductDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    gender: dto.gender,
    price: dto.price,
    oldPrice: dto.oldPrice,
    stock: dto.stock,
    status: dto.status as 'active' | 'out-of-stock' | 'draft',
    image: dto.image,
    images: [dto.image],
    shortDescription: dto.shortDescription,
    description: dto.shortDescription || '',
    sku: dto.sku,
    slug: dto.slug,
    isNew: dto.isNew,
    isSale: dto.isSale,
    isBestSeller: dto.isBestSeller,
    rating: dto.rating,
    soldCount: dto.soldCount,
    colors: dto.colors,
    sizes: dto.sizes,
  };
}

export const productApi = {
  /**
   * Get new arrivals
   */
  async getNewArrivals(count: number = 8): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<ProductDTO[]>(`/api/products/new-arrivals?count=${count}`);
      const products = response.data.map(mapProductDTOToProduct);
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
   * Get sale products
   */
  async getSaleProducts(count: number = 8): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<ProductDTO[]>(`/api/products/sale?count=${count}`);
      const products = response.data.map(mapProductDTOToProduct);
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
   * Get best sellers
   */
  async getBestSellers(count: number = 8): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<ProductDTO[]>(`/api/products/best-sellers?count=${count}`);
      const products = response.data.map(mapProductDTOToProduct);
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
   * Get product by ID
   */
  async getById(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get<ProductDTO>(`/api/products/${id}`);
      const product = mapProductDTOToProduct(response.data);
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Get product by slug
   */
  async getBySlug(slug: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get<ProductDTO>(`/api/products/slug/${slug}`);
      const product = mapProductDTOToProduct(response.data);
      return {
        success: true,
        data: product,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error),
      };
    }
  },

  /**
   * Get related products
   */
  async getRelated(id: number, count: number = 4): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<ProductDTO[]>(`/api/products/${id}/related?count=${count}`);
      const products = response.data.map(mapProductDTOToProduct);
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
};
