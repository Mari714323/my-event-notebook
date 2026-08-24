import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigwv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as authorizers from 'aws-cdk-lib/aws-apigatewayv2-authorizers';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. Cognito User Pool & App Client
    const userPool = new cognito.UserPool(this, 'MyExpeditionUserPool', {
      userPoolName: 'my-expedition-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: { minLength: 8 },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 開発・検証用（本番はRETAIN推奨）
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'MyExpeditionAppClient', {
      userPool,
      userPoolClientName: 'my-expedition-web-client',
      generateSecret: false, // パブリッククライアント
    });

    // 2. DynamoDB Table (シングルテーブル設計)
    const table = new dynamodb.Table(this, 'MyExpeditionTable', {
      tableName: 'MyExpeditionTable',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Pay-per-requestモード
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 開発・検証用
    });

    table.addGlobalSecondaryIndex({
      indexName: 'GSI-1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // 3. S3 Bucket (画像保存用)
    const bucket = new s3.Bucket(this, 'MyExpeditionStorage', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [{
        allowedHeaders: ['*'],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
        allowedOrigins: ['http://localhost:3000'], // 本番稼働時はドメインを追加
        maxAge: 3000,
      }],
      lifecycleRules: [{
        id: 'AbortIncompleteMultipartUploads',
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7), // コスト肥大化防止の基本ルール
      }],
      removalPolicy: cdk.RemovalPolicy.DESTROY, // 開発・検証用
      autoDeleteObjects: true,
    });

    // 4. API Gateway (HTTP API)
    const authorizer = new authorizers.HttpJwtAuthorizer('JwtAuthorizer', userPool.userPoolProviderUrl, {
      jwtAudience: [userPoolClient.userPoolClientId],
    });

    const httpApi = new apigwv2.HttpApi(this, 'MyExpeditionApi', {
      apiName: 'my-expedition-api',
      corsPreflight: {
        allowHeaders: ['Content-Type', 'Authorization'],
        allowMethods: [
          apigwv2.CorsHttpMethod.GET,
          apigwv2.CorsHttpMethod.POST,
          apigwv2.CorsHttpMethod.PUT,
          apigwv2.CorsHttpMethod.DELETE,
          apigwv2.CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: ['http://localhost:3000'], // 本番稼働時はドメインを追加
      },
    });

    // ※ ルーティング定義（スケルトン）
    // CDKの仕様上、addRoutesにはLambdaなどの統合先(Integration)が必須です。
    // 今回はStep2.1の制約に基づき、次ステップで有効化できるようコメントアウトで設計意図を残しています。
    /*
    httpApi.addRoutes({ path: '/events', methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST], integration: dummyLambdaIntegration });
    httpApi.addRoutes({ path: '/events/{eventId}', methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.PUT, apigwv2.HttpMethod.DELETE], integration: dummyLambdaIntegration });
    httpApi.addRoutes({ path: '/venues', methods: [apigwv2.HttpMethod.GET], integration: dummyLambdaIntegration });
    httpApi.addRoutes({ path: '/venues/{venueId}/events', methods: [apigwv2.HttpMethod.GET], integration: dummyLambdaIntegration });
    httpApi.addRoutes({ path: '/uploads/presigned-url', methods: [apigwv2.HttpMethod.POST], integration: dummyLambdaIntegration });
    */
  }
}