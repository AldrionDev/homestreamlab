import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GetMediaQueryDto } from './dto/get-media-query.dto';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: GetMediaQueryDto,
  ) {
    return this.mediaService.findAll(user.id, query);
  }
}
