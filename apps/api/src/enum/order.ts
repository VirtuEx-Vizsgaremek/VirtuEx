export enum OrderStatus {
  Pending = 'pending',
  PartiallyFilled = 'partially_filled',
  Filled = 'filled',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Rejected = 'rejected'
}

export enum OrderType {
  Buy = 'buy',
  Sell = 'sell'
}
