import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, GetCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
// S3用のモジュールを追加
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME!;

// S3クライアントとバケット名を初期化
const s3Client = new S3Client({});
const bucketName = process.env.BUCKET_NAME || 'my-expedition-images--ap-northeast-1';

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
    // 6. 画像アップロード用Presigned URL発行 (POST /events/{eventId}/upload-url)
    if (routeKey === 'POST /events/{eventId}/upload-url') {
      const eventId = event.pathParameters?.eventId;
      const body = JSON.parse(event.body || '{}');
      const contentType = body.contentType || 'image/jpeg';
      const fileExtension = contentType.split('/')[1] || 'jpg';
      
      // S3オブジェクトキーの生成 (users/{userId}/trips/{eventId}/seat_{randomUUID}.{ext})
      const objectKey = `users/${userId}/trips/${eventId}/seat_${randomUUID()}.${fileExtension}`;
      
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
      });

      // 有効期限300秒でURL発行
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadUrl, objectKey })
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