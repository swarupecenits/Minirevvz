import { Product, Settings } from './types';

export const defaultSettings: Settings = {
  whatsappNumber: '15551234567',
  instagram: '@diecastgarage',
  email: 'hello@diecastgarage.com',
  location: 'Mumbai, India',
  businessHours: 'Mon–Sat, 10am–8pm'
};

export const seedProducts: Product[] = [
{
  id: 'prod-1',
  name: 'Nissan Skyline GT-R (R34) Nismo Z-Tune',
  brand: 'Hot Wheels Premium',
  category: 'Premiums',
  price: 45,
  availability: 'Available',
  images: [
  'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=800'],

  shortDescription:
  'Highly detailed premium release of the iconic R34 Z-Tune.',
  description:
  'This premium Hot Wheels release features full metal-on-metal construction, Real Riders rubber tires, and exquisite detailing. The Nismo Z-Tune is a holy grail for JDM collectors, featuring the signature silver paint and accurate aerodynamic parts.',
  scale: '1:64',
  series: 'Car Culture',
  year: '2023',
  packagingCondition: 'Mint on Card (MOC)',
  featured: true,
  isNewArrival: true,
  isPremium: true,
  createdAt: new Date().toISOString()
},
{
  id: 'prod-2',
  name: 'Porsche 911 GT3 RS',
  brand: 'Bburago',
  category: 'Bburago',
  price: 65,
  availability: 'Limited Stock',
  images: [
  'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?auto=format&fit=crop&q=80&w=800'],

  shortDescription:
  'Stunning 1:24 scale replica of the track-focused 911 GT3 RS.',
  description:
  'Bburago brings the precision of German engineering to your shelf with this 1:24 scale Porsche 911 GT3 RS. Features opening doors, detailed interior, and accurate engine bay. The vibrant paint job and realistic decals make it a standout piece.',
  scale: '1:24',
  series: 'Race & Play',
  year: '2022',
  packagingCondition: 'New in Box (NIB)',
  featured: true,
  isNewArrival: false,
  isPremium: false,
  createdAt: new Date(Date.now() - 86400000).toISOString()
},
{
  id: 'prod-3',
  name: 'Ferrari F40 Competizione',
  brand: 'Hot Wheels',
  category: 'Imported Hot Wheels',
  price: 120,
  availability: 'Sold Out',
  images: [
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800'],

  shortDescription: 'Rare imported edition of the legendary Ferrari F40.',
  description:
  'A highly sought-after imported Hot Wheels model. The Ferrari F40 Competizione features racing livery, wide body kit, and exceptional attention to detail. This model is out of production and extremely hard to find in this condition.',
  scale: '1:64',
  series: 'Ferrari Series',
  year: '2014',
  packagingCondition: 'Near Mint',
  featured: false,
  isNewArrival: false,
  isPremium: true,
  createdAt: new Date(Date.now() - 172800000).toISOString()
},
{
  id: 'prod-4',
  name: 'Lamborghini Countach LPI 800-4',
  brand: 'CCA',
  category: 'CCA',
  price: 35,
  availability: 'Available',
  images: [
  'https://images.unsplash.com/photo-1669023030485-573b6ac99761?auto=format&fit=crop&q=80&w=800'],

  shortDescription: 'Modern re-imagining of the classic Countach by CCA.',
  description:
  'CCA delivers an excellent budget-friendly yet detailed model of the new Countach LPI 800-4. Features crisp lines, accurate proportions, and a beautiful pearl white finish.',
  scale: '1:32',
  series: 'Supercars',
  year: '2023',
  packagingCondition: 'New in Box',
  featured: false,
  isNewArrival: true,
  isPremium: false,
  createdAt: new Date(Date.now() - 259200000).toISOString()
},
{
  id: 'prod-5',
  name: 'Fast & Furious 5-Car Set',
  brand: 'Hot Wheels',
  category: 'Special Sets',
  price: 85,
  availability: 'Available',
  images: [
  'https://images.unsplash.com/photo-1532581140115-3e38f4fd89f3?auto=format&fit=crop&q=80&w=800'],

  shortDescription:
  'Complete set of 5 iconic cars from the Fast & Furious franchise.',
  description:
  "This premium box set includes five of the most recognizable vehicles from the Fast & Furious movies. Includes Dom's Charger, Brian's Supra, and more. All feature Real Riders and metal bases.",
  scale: '1:64',
  series: 'Fast & Furious Premium',
  year: '2023',
  packagingCondition: 'Mint in Box',
  featured: true,
  isNewArrival: true,
  isPremium: true,
  createdAt: new Date(Date.now() - 345600000).toISOString()
},
{
  id: 'prod-6',
  name: 'McLaren P1',
  brand: 'Bburago',
  category: 'Bburago',
  price: 55,
  availability: 'Available',
  images: [
  'https://images.unsplash.com/photo-1620882814836-98a2bc9944ce?auto=format&fit=crop&q=80&w=800'],

  shortDescription: 'Volcano Yellow McLaren P1 hypercar.',
  description:
  'Detailed 1:24 scale model of the hybrid hypercar. Features opening dihedral doors and a detailed engine cover.',
  scale: '1:24',
  series: 'Hypercars',
  year: '2021',
  packagingCondition: 'New in Box',
  featured: false,
  isNewArrival: false,
  isPremium: false,
  createdAt: new Date(Date.now() - 432000000).toISOString()
},
{
  id: 'prod-7',
  name: 'Datsun Bluebird 510 Wagon',
  brand: 'Hot Wheels',
  category: 'Limited Edition',
  price: 150,
  availability: 'Limited Stock',
  images: [
  'https://images.unsplash.com/photo-1611821064430-0d40221e4e03?auto=format&fit=crop&q=80&w=800'],

  shortDescription: 'Super Treasure Hunt (STH) Datsun 510 Wagon.',
  description:
  "Extremely rare Super Treasure Hunt edition featuring Spectraflame paint, Real Riders, and the hidden 'TH' logo. A must-have for serious Hot Wheels collectors.",
  scale: '1:64',
  series: 'Mainline STH',
  year: '2022',
  packagingCondition: 'Mint on Card + Protector',
  featured: true,
  isNewArrival: false,
  isPremium: true,
  createdAt: new Date(Date.now() - 518400000).toISOString()
},
{
  id: 'prod-8',
  name: 'Ford Mustang Shelby GT500',
  brand: 'CCA',
  category: 'CCA',
  price: 40,
  availability: 'Available',
  images: [
  'https://images.unsplash.com/photo-1584345604476-8ec5e12e42a5?auto=format&fit=crop&q=80&w=800'],

  shortDescription: 'Aggressive styling and classic muscle car presence.',
  description:
  "CCA's take on the modern Shelby GT500. Features racing stripes, detailed grille, and accurate wheels.",
  scale: '1:32',
  series: 'Muscle Cars',
  year: '2022',
  packagingCondition: 'New in Box',
  featured: false,
  isNewArrival: true,
  isPremium: false,
  createdAt: new Date(Date.now() - 604800000).toISOString()
}];