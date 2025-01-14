import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [UserModule, ShopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
