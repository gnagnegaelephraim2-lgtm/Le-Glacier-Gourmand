/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Category = 'Ice Cream' | 'Sorbet' | 'Desserts' | 'Drinks' | 'Breakfast' | 'Lunch';

export type LocalizedText = {
  fr: string;
  en?: string;
  cr?: string;
  ar?: string;
  hi?: string;
  zh?: string;
};

export interface MenuItem {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  price: string;
  category: Category;
  image: string;
  tags: string[];
}

export interface Review {
  id?: string;
  name: string;
  rating: number;
  comment: string;
  date?: string;
  userId?: string;
  productId?: string;
  createdAt?: any;
}

export interface ProductStats {
  averageRating: number;
  reviewCount: number;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
}
