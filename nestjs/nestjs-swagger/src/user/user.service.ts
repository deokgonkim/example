import { Injectable } from '@nestjs/common';
import { Converter } from 'aws-sdk/clients/dynamodb';
import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const USER_TABLE_NAME = process.env.DYNAMODB_USER_TABLE_NAME || 'user';
const AWS_REGION = process.env.AWS_REGION || 'ap-northeast-2';

@Injectable()
export class UserService {
  private client: DynamoDBClient;
  private docClient: DynamoDBDocumentClient;
  constructor() {
    this.client = new DynamoDBClient({
      region: AWS_REGION,
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
  }

  async getAllUsers() {
    console.log('table', USER_TABLE_NAME);
    const response = await this.docClient.send(
      new ScanCommand({
        TableName: USER_TABLE_NAME,
      }),
    );
    return response?.Items?.map((item) => Converter.unmarshall(item));
  }
}
