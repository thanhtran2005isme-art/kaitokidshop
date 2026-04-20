/**
 * API Services Index
 */

export { authApi } from './authApi';
export { productApi } from './productApi';
export { adminApi } from './adminApi';
export { orderApi } from './orderApi';
export { categoryApi } from './categoryApi';
export { attributeApi, type AttributeDTO } from './attributeApi';
export { inventoryApi, type InventoryAdjustPayload, type InventoryAdjustmentType, type InventoryHistoryDTO } from './inventoryApi';
export { couponApi, type CouponDTO, type CouponValidateRequest, type CouponValidateResult } from './couponApi';
export { promotionApi, type PromotionDTO } from './promotionApi';
export { flashSaleApi, type FlashSaleDTO, type FlashSaleItemDTO } from './flashSaleApi';
export { adminProductsApi } from './adminProductsApi';
export { customerApi } from './customerApi';
