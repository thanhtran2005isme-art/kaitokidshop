/**
 * API Services Index
 */

export { authApi } from './authApi';
export { productApi } from './productApi';
export { adminApi } from './adminApi';
export { orderApi } from './orderApi';
export { categoryApi, type CategoryDTO } from './categoryApi';
export { attributeApi, type AttributeDTO } from './attributeApi';
export { inventoryApi, type InventoryAdjustPayload, type InventoryAdjustmentType, type InventoryHistoryDTO } from './inventoryApi';
export { couponApi, type CouponDTO, type CouponValidateRequest, type CouponValidateResult } from './couponApi';
export { promotionApi, type PromotionDTO } from './promotionApi';
export { flashSaleApi, type FlashSaleDTO, type FlashSaleItemDTO, type PublicFlashSale, type PublicFlashSaleItem } from './flashSaleApi';
export { reviewApi, type ReviewDTO, type ReviewListResponse } from './reviewApi';
export { reportApi, type RevenueDataPoint, type TopProductItem, type OrderStatItem, type DashboardData } from './reportApi';
export { homepageApi, type HomepageSectionDTO } from './homepageApi';
export { bannerApi, type BannerDTO } from './bannerApi';
export { pageApi, type PageDTO } from './pageApi';
export { menuApi, type MenuDTO } from './menuApi';
export { collectionApi, type CollectionDTO, type PublicCollectionDTO } from './collectionApi';
export { lookbookApi, type LookbookDTO, type PublicLookbookDTO } from './lookbookApi';
export { settingsApi, type SettingDTO, type UpsertSettingDTO } from './settingsApi';
export { cartApi, type CartItemDTO as CartItemBackendDTO, type AddToCartPayload } from './cartApi';
export { customerOrderApi, customerReviewApi, type CustomerOrderDTO, type CustomerOrderItemDTO, type CreateReviewPayload } from './customerOrderApi';
export { accountApi, type AccountDTO, type UpdateAccountPayload, type ChangePasswordPayload } from './accountApi';
export { addressApi, type AddressDTO, type CreateAddressPayload } from './addressApi';
export { adminProductsApi } from './adminProductsApi';
export { customerApi } from './customerApi';
export { wishlistApi, type WishlistItemDTO } from './wishlistApi';
export { locationApi, type Province, type District, type Ward } from './locationApi';
export { supplierApi, type SupplierDTO, type CreateSupplierPayload } from './supplierApi';
export { stockReceiptApi, type StockReceiptDTO, type StockReceiptItemDTO, type StockReceiptListItem, type CreateStockReceiptPayload, type CreateStockReceiptItemPayload } from './stockReceiptApi';
export { variantStockApi, type VariantStockDTO, type ProductVariantSummary } from './variantStockApi';
