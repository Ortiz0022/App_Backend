import { Extraordinary } from "../entities/extraordinary.entity";

export type ExtraordinaryResponse = Extraordinary & { canEditAmount: boolean };