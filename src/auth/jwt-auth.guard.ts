import { Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { ExecutionContext } from "@nestjs/common";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt'){
    constructor(private reflector: Reflector) { super(); }

    canActivate(context: ExecutionContext) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) {
        return true; // skip auth SOLO en endpoints marcados
      }
      return super.canActivate(context);
    }
}