// src/common/interceptors/fiscal-year-context.interceptor.ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FiscalYearService } from 'src/anualBudget/fiscalYear/fiscal-year.service';
import { FiscalYear } from 'src/anualBudget/fiscalYear/entities/fiscal-year.entity';

@Injectable()
export class FiscalYearContextInterceptor implements NestInterceptor {
  constructor(private readonly fyService: FiscalYearService) {}

  async intercept(ctx: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const req = ctx.switchToHttp().getRequest();

    const codeHeader = (req.headers['x-fiscal-year'] as string | undefined)?.toString();
    const idHeader = (req.headers['x-fiscal-year-id'] as string | undefined)?.toString();

    // 👇 TIPAR explícitamente
    let fy: FiscalYear | null = null;

    if (idHeader) {
      fy = await this.fyService.findByIdSafe(Number(idHeader) || idHeader);
    }
    if (!fy && codeHeader) {
      fy = await this.fyService.findByCodeSafe(codeHeader);
    }
    if (!fy) {
      fy = await this.fyService.getActiveOrCurrent();
    }

    // 👇 Evitar que TS se queje del tipo en Request
    (req as any).fiscalYear = fy;

    return next.handle();
  }
}
