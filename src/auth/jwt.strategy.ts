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
  return {
    id: payload.id,     
    role: payload.role, 
    jti: payload.jti,
  };
}

}