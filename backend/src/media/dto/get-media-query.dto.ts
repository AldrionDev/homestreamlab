import { IsEnum, IsOptional, IsString } from 'class-validator';
import { MediaType } from '@prisma/client';

export class GetMediaQueryDto {
  @IsOptional()
  @IsEnum(MediaType)
  type?: MediaType;

  @IsOptional()
  @IsString()
  search?: string;
}
