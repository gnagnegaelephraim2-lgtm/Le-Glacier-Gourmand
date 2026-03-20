import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  runTransaction,
  addDoc
} from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { Review, ProductStats } from '../types';

export const ReviewService = {
  // Add a review and update product stats atomically
  async addReview(productId: string, rating: number, comment: string, userName: string) {
    if (!auth.currentUser) throw new Error('User must be authenticated');

    const reviewData = {
      productId,
      rating,
      comment,
      userId: auth.currentUser.uid,
      userName,
      createdAt: serverTimestamp(),
    };

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Add the review
        const reviewRef = doc(collection(db, 'reviews'));
        transaction.set(reviewRef, reviewData);

        // 2. Update product stats
        const statsRef = doc(db, 'productStats', productId);
        const statsDoc = await transaction.get(statsRef);

        if (!statsDoc.exists()) {
          transaction.set(statsRef, {
            averageRating: rating,
            reviewCount: 1,
          });
        } else {
          const currentStats = statsDoc.data() as ProductStats;
          const newCount = currentStats.reviewCount + 1;
          const newAverage = ((currentStats.averageRating * currentStats.reviewCount) + rating) / newCount;
          
          transaction.update(statsRef, {
            averageRating: newAverage,
            reviewCount: newCount,
          });
        }
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reviews/${productId}`);
    }
  },

  // Get product stats
  subscribeToProductStats(productId: string, callback: (stats: ProductStats | null) => void) {
    const statsRef = doc(db, 'productStats', productId);
    return onSnapshot(statsRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as ProductStats);
      } else {
        callback(null);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `productStats/${productId}`);
    });
  },

  // Get reviews for a product
  subscribeToProductReviews(productId: string, callback: (reviews: Review[]) => void) {
    const reviewsRef = collection(db, 'reviews');
    const q = query(
      reviewsRef, 
      where('productId', '==', productId), 
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().createdAt?.toDate()?.toLocaleDateString() || 'Just now'
      } as Review));
      callback(reviews);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'reviews');
    });
  }
};
