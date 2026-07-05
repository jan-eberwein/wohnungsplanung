import type {
  BalanceInfo,
  Profile,
  Purchase,
  Settlement,
  SplitType,
} from "@/lib/types";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Anteile pro Person für einen Einkauf. Wird beim Abschließen berechnet und
 * als split_details am Einkauf gespeichert, damit der Saldo später stabil
 * bleibt, auch wenn sich die Split-Logik ändert.
 */
export function computeSplitDetails(
  splitType: SplitType,
  totalAmount: number,
  payerId: string,
  otherId: string,
  options?: {
    customShares?: Record<string, number>;
    fullBearerId?: string;
  }
): Record<string, number> {
  switch (splitType) {
    case "50_50": {
      const otherShare = round2(totalAmount / 2);
      return {
        [payerId]: round2(totalAmount - otherShare),
        [otherId]: otherShare,
      };
    }
    case "custom": {
      const shares = options?.customShares ?? {};
      return {
        [payerId]: round2(shares[payerId] ?? 0),
        [otherId]: round2(shares[otherId] ?? 0),
      };
    }
    case "full": {
      const bearerId = options?.fullBearerId ?? payerId;
      return {
        [payerId]: bearerId === payerId ? round2(totalAmount) : 0,
        [otherId]: bearerId === otherId ? round2(totalAmount) : 0,
      };
    }
  }
}

/**
 * Laufender Saldo zwischen den beiden Profilen.
 * Erwartet profiles sortiert (z. B. nach Username), damit das Vorzeichen
 * deterministisch ist.
 */
export function computeBalance(
  profiles: Profile[],
  purchases: Purchase[],
  settlements: Settlement[]
): BalanceInfo {
  if (profiles.length < 2) {
    return { creditor: null, debtor: null, amount: 0 };
  }
  const [a, b] = profiles;

  // net > 0: b schuldet a
  let net = 0;

  for (const purchase of purchases) {
    const other = purchase.paid_by === a.id ? b : a;
    const details = purchase.split_details as Record<string, number> | null;
    let owed: number;
    if (details && typeof details[other.id] === "number") {
      owed = details[other.id];
    } else if (purchase.split_type === "50_50") {
      owed = purchase.total_amount / 2;
    } else {
      owed = 0;
    }
    net += purchase.paid_by === a.id ? owed : -owed;
  }

  for (const settlement of settlements) {
    // Eine Zahlung von from → to reduziert die Schuld von from gegenüber to.
    net += settlement.from_profile === b.id ? -settlement.amount : settlement.amount;
  }

  const rounded = round2(net);
  if (Math.abs(rounded) < 0.01) {
    return { creditor: null, debtor: null, amount: 0 };
  }
  return rounded > 0
    ? { creditor: a, debtor: b, amount: rounded }
    : { creditor: b, debtor: a, amount: -rounded };
}
