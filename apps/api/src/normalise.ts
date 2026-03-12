export function normaliseSources(input: Record<string, any>) {
  return {
    membership: input.membership
      ? {
          valid: Boolean(input.membership.valid),
          tier: input.membership.tier ?? null,
          expiresAt: input.membership.expires_at ?? input.membership.expiresAt ?? null
        }
      : undefined,
    payment: input.payment
      ? {
          status: input.payment.status ?? "unpaid",
          transactionId: input.payment.transaction_id ?? input.payment.transactionId ?? null,
          amount: input.payment.amount ?? null,
          currency: input.payment.currency ?? null
        }
      : undefined,
    age: input.age
      ? {
          verified: Boolean(input.age.verified),
          over18: Boolean(input.age.over18),
          over21: Boolean(input.age.over21)
        }
      : undefined,
    blacklist: input.blacklist
      ? {
          blocked: Boolean(input.blacklist.blocked),
          reason: input.blacklist.reason ?? null
        }
      : undefined,
    booking: input.booking
      ? {
          valid: Boolean(input.booking.valid),
          start: input.booking.start ?? null,
          end: input.booking.end ?? null
        }
      : undefined,
    custom: input.custom ?? {}
  };
}
