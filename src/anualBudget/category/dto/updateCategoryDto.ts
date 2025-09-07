
export class UpdateCategoryDto {
  name?: string;
  description?: string;
  category_amount?: string; // "1000.00"
  budgetId?: number;        // opcional si permites mover la partida a otro budget
}
