export const BRAND_NAME = 'Minirevvz';

export const CATEGORIES = [
'Imported Hot Wheels',
'Bburago',
'CCA',
'Premiums',
'Special Sets',
'New Arrivals',
'Limited Edition',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_IMAGES: Record<Category, string> = {
'Imported Hot Wheels':
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780693107/Imported_Hotwheels_tgxi6l.jpg',

Bburago:
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780694050/bburago23_a44xix.jpg',

CCA:
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780693107/cca_ygyweh.jpg',

Premiums:
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780693106/PREMIUM_q8y2lx.webp',

'Special Sets':
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780693106/hot-wheels-8177051_1280_nzve64.jpg',

'New Arrivals':
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780693106/arrivals_f76xsf.webp',

'Limited Edition':
'https://res.cloudinary.com/dagggqd6g/image/upload/v1780693106/mainline_vgf428.webp',
};

export const AVAILABILITY_STATUSES = [
'Available',
'Limited Stock',
'Sold Out',
] as const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];
