import { IsNotEmpty, IsString } from 'class-validator';

export class LocalSignInDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
