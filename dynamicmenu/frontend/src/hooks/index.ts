/**
 * Custom Hooks Index
 * 
 * Central export point for all custom hooks.
 */

// Existing hooks
export { useIsMobile } from './use-mobile';

// New data fetching hooks
export { useRestaurant, type UseRestaurantReturn } from './useRestaurant';
export {
  useMenu,
  useCurrentMenu,
  useFeaturedItems,
  usePopularItems,
  type UseMenuReturn,
  type UseCurrentMenuReturn,
  type UseFeaturedItemsReturn,
  type UsePopularItemsReturn,
} from './useMenu';

// QR Code hooks
export {
  useQRCode,
  useQRRedirect,
  useQRCodes,
  useQRCodeDetail,
  useQRGenerator,
  type UseQRCodeReturn,
  type UseQRRedirectReturn,
  type UseQRCodesReturn,
  type UseQRCodeDetailReturn,
  type UseQRGeneratorReturn,
} from './useQR';
