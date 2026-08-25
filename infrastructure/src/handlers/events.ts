import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

// DynamoDBクライアントの初期化（Lambdaの実行環境外で初期化することで、次回以降の実行を高速化します）
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const routeKey = event.routeKey; // 例: "GET /events"
  
  // API Gateway の JwtAuthorizer からユーザーID (sub) を取得
  const userId = event.requestContext.authorizer.jwt.claims.sub;
  if (!userId) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }

  try {
    // 1. 遠征一覧取得 (GET /events)
    if (routeKey === 'GET /events') {
      const { Items } = await docClient.send(new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :skPrefix)',
        ExpressionAttributeValues: {
          ':pk': `USER#${userId}`,
          ':skPrefix': 'TRIP#',
        },
      }));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Items)
      };
    }

    // 2. 遠征新規作成 (POST /events)
    if (routeKey === 'POST /events') {
      const body = JSON.parse(event.body || '{}');
      const tripId = body.id || randomUUID();
      const item = {
        PK: `USER#${userId}`,
        SK: `TRIP#${tripId}`,
        id: tripId,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      return {
        statusCode: 201,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      };
    }

    // 3. 遠征詳細取得 (GET /events/{eventId})
    if (routeKey === 'GET /events/{eventId}') {
      const eventId = event.pathParameters?.eventId;
      const { Item } = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: { PK: `USER#${userId}`, SK: `TRIP#${eventId}` },
      }));
      if (!Item) {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Event not found' })
        };
      }
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Item)
      };
    }

    // 4. 遠征削除 (DELETE /events/{eventId})
    if (routeKey === 'DELETE /events/{eventId}') {
      const eventId = event.pathParameters?.eventId;
      await docClient.send(new DeleteCommand({
        TableName: tableName,
        Key: { PK: `USER#${userId}`, SK: `TRIP#${eventId}` },
      }));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Deleted successfully' })
      };
    }

    // 5. 遠征更新 (PUT /events/{eventId})
    if (routeKey === 'PUT /events/{eventId}') {
      const eventId = event.pathParameters?.eventId;
      const body = JSON.parse(event.body || '{}');
      const item = {
        PK: `USER#${userId}`,
        SK: `TRIP#${eventId}`,
        id: eventId,
        ...body,
        updatedAt: new Date().toISOString(),
      };
      await docClient.send(new PutCommand({ TableName: tableName, Item: item }));
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      };
    }

    // 該当するルートがない場合
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