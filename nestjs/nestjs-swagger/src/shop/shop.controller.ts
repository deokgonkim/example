import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ShopEntity, ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) { }

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }

  @Get()
  @ApiResponse({ status: 200, type: [ShopEntity] })
  findAll(): Promise<ShopEntity[]> {
    return this.shopService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.shopService.findOne(uid);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(uid, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shopService.remove(id);
  }
}
