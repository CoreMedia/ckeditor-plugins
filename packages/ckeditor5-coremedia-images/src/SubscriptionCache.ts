import { Subscription } from "rxjs";

export default class SubscriptionCache {
  subscriptionCache: Map<string, Array<Subscription>> = new Map<string, Array<Subscription>>();

  addSubscription(cmId: string, subscription: Subscription): void {
    const subscriptions = this.subscriptionCache.get(cmId);
    const existingSubscription = subscriptions ? subscriptions : [];
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
