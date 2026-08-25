'use client';

import { Amplify } from 'aws-amplify';
// ★追加: 言語設定用のモジュールをインポート
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || '',
    },
  },
  API: {
    REST: {
      myExpeditionApi: {
        endpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || '',
        region: process.env.NEXT_PUBLIC_AWS_REGION || '',
      },
    },
  },
});

// ★追加: Amplify UIを日本語に設定
I18n.putVocabularies(translations);
I18n.setLanguage('ja');

export default function ConfigureAmplify() {
  return null;
}