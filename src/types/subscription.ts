
export interface Subscription {
  status: 'active' | 'canceled' | 'expired' | null;
  currentPeriodEnd: string | null;
  numberOfBeds: number;
  pricePerBed?: number;
  numberOfProperties?: number;
}
