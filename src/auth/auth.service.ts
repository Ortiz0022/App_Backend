import { UserDto } from "src/users/dto/UserDto";

@Injectable()
export class AuthService{
constructor(
@InjectModel(UserDto.username) private readonly userModel: UserDto,
){}


register() {}

login() {}
}