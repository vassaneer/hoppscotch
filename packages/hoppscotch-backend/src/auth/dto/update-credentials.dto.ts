import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsOptional()
  currentPassword?: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
