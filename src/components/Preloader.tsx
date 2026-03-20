import { useEffect } from 'react';
import { MENU_ITEMS, GALLERY_IMAGES } from '../data';

export default function Preloader() {
  useEffect(() => {
    // Preload the most important images first
    const imagesToPreload = [
      ...MENU_ITEMS.slice(0, 10).map(item => item.image),
      ...GALLERY_IMAGES.map(img => img.url)
    ];

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null;
}
