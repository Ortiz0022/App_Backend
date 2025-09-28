export type ExtraRow = {
    id: number;
    name?: string | null;
    date?: string | null;
    amount: number;
    used: number;
    remaining: number;
    usedPct: number;
    remainingPct: number;
};