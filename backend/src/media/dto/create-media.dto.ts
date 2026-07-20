import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { MediaType } from '@prisma/client';

export class CreateMediaDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(MediaType)
  type: MediaType;

  @IsOptional()
  @IsString()
  category?: string;
}
