import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const routeKey = event.routeKey; // 例: "GET /venues"
  
  // 認証チェック
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  try {
    // 1. 会場マスターデータ一覧取得 (GET /venues)
    if (routeKey === 'GET /venues') {
      const { Items } = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {
          ':pk': 'MASTER#VENUE', // 共通のマスターデータを想定
        },
      }));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Items || [])
      };
    }

    // 2. 特定会場の過去の参戦記録取得 (GET /venues/{venueId}/events)
    // IaCで定義した GSI-1 (グローバルセカンダリインデックス) を活用します
    if (routeKey === 'GET /venues/{venueId}/events') {
      const venueId = event.pathParameters?.venueId;
      
      const { Items } = await docClient.send(new QueryCommand({
        TableName: tableName,
        IndexName: 'GSI-1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk AND GSI1SK = :gsi1sk',
        ExpressionAttributeValues: {
          ':gsi1pk': `USER#${userId}`, // GSIのPK: 自分のデータのみ
          ':gsi1sk': `VENUE#${venueId}`, // GSIのSK: 会場IDで絞り込み
        },
      }));

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Items || [])
      };
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error: any) {
    console.error('DynamoDB Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
    };
  }
};