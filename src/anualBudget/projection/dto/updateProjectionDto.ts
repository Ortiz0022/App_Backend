
import { ProjectionState } from "../entities/projection.entity";

export class UpdateProjectionDto {
  year?: number;
  total_amount?: string;     // "0.00"
  state?: ProjectionState;       // 'OPEN' | 'CLOSED'
}
