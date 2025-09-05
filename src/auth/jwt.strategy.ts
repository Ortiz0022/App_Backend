import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { jwtConstants } from "./jwt.constants";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
    }

  async validate(payload: any) {
    // Ajusta estos mapeos a tu payload real:
    const singleRole =
    payload.role ||
    payload.rol ||
    payload.roleName ||
    (Array.isArray(payload.roles) ? payload.roles[0] : undefined) ||
    payload?.role?.name;

    return {
      sub: payload.sub,
      email: payload.email,
      role: singleRole, // 👈 NECESARIO para RolesGuard
    };
  }
}