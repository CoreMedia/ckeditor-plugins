import type { Subscription } from "rxjs";

/**
 * A cache for subscriptions done during conversion of elements.
 *
 * Subscription will be stored for unsubscription to prevent memory leaks when
 * the subscription reference is lost.
 */
export default class SubscriptionCache {
  subscriptionCache: Map<string, Subscription[]> = new Map<string, Subscription[]>();

  addSubscription(cmId: string, subscription: Subscription): void {
    const subscriptions = this.subscriptionCache.get(cmId);
    const existingSubscription = subscriptions ?? [];
    existingSubscription.push(subscription);
    this.subscriptionCache.set(cmId, existingSubscription);
  }

  unsubscribe(cmId: string): void {
    const subscriptions = this.subscriptionCache.get(cmId);
    if (!subscriptions) {
      return;
    }
    subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptionCache.delete(cmId);
  }

  unsubscribeAll(): void {
    this.subscriptionCache.forEach((subscriptions) => {
      subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
    });
  }
}
