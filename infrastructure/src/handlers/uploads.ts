import { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyResultV2 } from 'aws-lambda';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const s3Client = new S3Client({});
const bucketName = process.env.BUCKET_NAME!;

export const handler = async (event: APIGatewayProxyEventV2WithJWTAuthorizer): Promise<APIGatewayProxyResultV2> => {
  console.log('Event:', JSON.stringify(event, null, 2));

  const routeKey = event.routeKey; // 例: "POST /uploads/presigned-url"
  
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
    if (routeKey === 'POST /uploads/presigned-url') {
      const body = JSON.parse(event.body || '{}');
      const contentType = body.contentType || 'image/jpeg';
      const fileExtension = contentType.split('/')[1] || 'jpg';
      
      // ユーザーごとにディレクトリを分けてS3の保存パス（キー）を生成
      const objectKey = `users/${userId}/images/${randomUUID()}.${fileExtension}`;

      // クライアント（フロントエンド）が直接S3へアップロードするための「署名付きURL」を生成
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        ContentType: contentType,
      });

      // URLの有効期限を5分（300秒）に設定
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          uploadUrl, 
          objectKey,
          // フロントエンドで画像を表示・DB保存するためのURLも合わせて返す
          publicUrl: `https://${bucketName}.s3.ap-northeast-1.amazonaws.com/${objectKey}` 
        })
      };
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Route not found' })
    };

  } catch (error: any) {
    console.error('S3 Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Internal Server Error', error: error.message })
    };
  }
};