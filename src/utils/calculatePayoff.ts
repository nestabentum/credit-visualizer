export interface ExtraPayment {
  amount: number;
  atMonth: number;
}

export interface PayoffInput {
  creditAmount: number;
  annualRatePercent: number;
  monthlyPayment: number;
  startDate: Date;
  extraPayment?: ExtraPayment;
}

export interface PayoffRow {
  month: number;
  date: Date;
  payment: number;
  interest: number;
  principal: number;
  remainingBalance: number;
}

export interface PayoffResult {
  rows: PayoffRow[];
  totalInterest: number;
  totalPaid: number;
}

export type ValidationError =
  | { type: 'payment_too_low'; minPayment: number }
  | { type: 'invalid_input' };

/** Adds one month to a date, always landing on the 1st of the target month. */
function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Calculates the minimum monthly payment that covers at least the first month's interest.
 */
export function minMonthlyPayment(creditAmount: number, annualRatePercent: number): number {
  return creditAmount * (annualRatePercent / 100 / 12);
}

/**
 * Runs the full payoff schedule calculation.
 * Returns a ValidationError if inputs are invalid.
 */
export function calculatePayoff(input: PayoffInput): PayoffResult | ValidationError {
  const { creditAmount, annualRatePercent, monthlyPayment, startDate, extraPayment } = input;

  if (creditAmount <= 0 || monthlyPayment <= 0) {
    return { type: 'invalid_input' };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  const firstInterest = creditAmount * monthlyRate;

  if (monthlyPayment <= firstInterest) {
    return { type: 'payment_too_low', minPayment: firstInterest };
  }

  const rows: PayoffRow[] = [];
  let balance = creditAmount;
  let month = 0;
  let totalInterest = 0;

  while (balance > 0.005) {
    month++;
    const date = addMonths(startDate, month - 1);

    // Apply one-time extra payment (fully to principal) before this month's interest
    if (extraPayment && month === extraPayment.atMonth) {
      balance = Math.max(0, balance - extraPayment.amount);
    }

    if (balance <= 0.005) break;

    const interest = balance * monthlyRate;
    const rawPrincipal = monthlyPayment - interest;
    // Last payment: only pay what's remaining
    const principal = Math.min(rawPrincipal, balance);
    const payment = interest + principal;
    balance = Math.max(0, balance - principal);

    totalInterest += interest;

    rows.push({
      month,
      date,
      payment,
      interest,
      principal,
      remainingBalance: balance,
    });

    // Safety cap: 1200 months (100 years) to prevent infinite loops
    if (month >= 1200) break;
  }

  return {
    rows,
    totalInterest,
    totalPaid: creditAmount + totalInterest,
  };
}

export function isValidationError(result: PayoffResult | ValidationError): result is ValidationError {
  return 'type' in result;
}
