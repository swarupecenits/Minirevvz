export const BRAND_NAME = 'Diecast Garage';

export const CATEGORIES = [
'Imported Hot Wheels',
'Bburago',
'CCA',
'Premiums',
'Special Sets',
'New Arrivals',
'Limited Edition'] as
const;

export type Category = (typeof CATEGORIES)[number];

export const AVAILABILITY_STATUSES = [
'Available',
'Limited Stock',
'Sold Out'] as
const;

export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];