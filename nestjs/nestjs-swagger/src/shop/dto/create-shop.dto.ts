import { ApiProperty } from '@nestjs/swagger';

export class CreateShopDto {
  @ApiProperty()
  shopUid: string;
}
