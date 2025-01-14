import { Injectable } from '@nestjs/common';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { ApiProperty } from '@nestjs/swagger';
import { nanoid } from 'nanoid';

const USER_TABLE_NAME = process.env.DYNAMODB_USER_TABLE_NAME || 'user';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-2';

// export class ShopInterface {
//   shopId: string;
//   shopUid: string;
//   createdAt?: Date;
//   updatedAt?: Date;
// }

export class ShopEntity {
  @ApiProperty()
  shopId: string;
  @ApiProperty()
  shopUid: string;
  @ApiProperty()
  createdAt?: Date;
  @ApiProperty()
  updatedAt?: Date;

  constructor(partial: Partial<ShopEntity> | Record<string, unknown>) {
    if (partial.shopId) {
      Object.assign(this, partial);
    } else {
      Object.assign(
        this,
        Converter.unmarshall(partial as Record<string, unknown>),
      );
    }
  }
}

@Injectable()
export class ShopService {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  constructor() {
    this.client = new DynamoDBClient({
      region: AWS_REGION,
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  generateId() {
    return nanoid();
  }

  async create(createShopDto: CreateShopDto) {
    const generatedId = this.generateId();
    await this.docClient.send(
      new PutCommand({
        TableName: USER_TABLE_NAME,
        Item: {
          shopId: generatedId,
          shopUid: createShopDto.shopUid,
          createdAt: new Date().toISOString(),
          // updatedAt: new Date().toISOString(),
        },
      }),
    );
    return this.findOne(generatedId);
  }

  async findAll() {
    console.log('table', USER_TABLE_NAME);
    const response = await this.docClient.send(
      new ScanCommand({
        TableName: USER_TABLE_NAME,
      }),
    );
    return response?.Items?.map((item) => new ShopEntity(item));
  }

  async findOne(id: string) {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: USER_TABLE_NAME,
        Key: {
          shopId: id,
        },
      }),
    );
    return new ShopEntity(response.Item);
  }

  update(uid: string, updateShopDto: UpdateShopDto) {
    throw new Error('Method not implemented.');
  }

  async remove(id: string) {
    await this.docClient.send(
      new DeleteCommand({
        TableName: USER_TABLE_NAME,
        Key: {
          shopId: id,
        },
      }),
    );
    return {};
  }
}
