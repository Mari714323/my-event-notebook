import { Venue, Trip } from '../types';

export const MOCK_VENUES: Record<string, Venue> = {
  'venue-osaka-jo': {
    id: 'venue-osaka-jo',
    name: '大阪城ホール',
    shortName: '城ホ',
    location: {
      lat: 34.6896,
      lng: 135.5302,
      address: '大阪府大阪市中央区大阪城3-1',
      nearestStation: 'JR大阪城公園駅 徒歩5分 / 地下鉄大阪ビジネスパーク駅 徒歩5分',
    },
    capacity: 16000,
    facilityNotes:
      '・JR大阪城公園駅からの連絡通路は終演後激混み。京橋駅まで歩いた方がスムーズ。\n・会場内トイレは個数少なめ。駅前商業施設（JO-TERRACE）で済ませておくのが鉄則。\n・ロッカーは駅構内およびホール周辺にあるが激戦。',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  'venue-yokohama-arena': {
    id: 'venue-yokohama-arena',
    name: '横浜アリーナ',
    shortName: '横アリ',
    location: {
      lat: 35.5173,
      lng: 139.6201,
      address: '神奈川県横浜市港北区新横浜3-10',
      nearestStation: '新横浜駅（JR・東急・相鉄・市営地下鉄）徒歩5分',
    },
    capacity: 17000,
    facilityNotes:
      '・横アリ特有の呼称に注意（1階が「アリーナ」、2階スタンド席が「スタンド」、通常アリーナ位置が「センター」）。\n・新横浜駅直通ルートは歩道橋経由が便利。裏手出口からの規制退場は比較的流れが早い。',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },
};

export const MOCK_TRIPS: Trip[] = [
  // -------------------------------------------------------------
  // シチュエーション1: 新幹線移動・宿泊あり・大阪城ホール（2Days）
  // -------------------------------------------------------------
  {
    id: 'trip-2026-osaka',
    title: 'Spring Live Tour 2026 大阪遠征',
    artistName: 'S-Group',
    startDate: '2026-03-20',
    endDate: '2026-03-21',
    status: 'completed',
    primaryVenueId: 'venue-osaka-jo',
    lodgingMemo: 'ホテル京阪 京橋 グランデ（京橋駅直結、終演後の徒歩移動がかなり楽だった）',
    transportMemo: 'SmartEX: 往復のぞみ（新横浜 ⇔ 新大阪）早特21利用',
    generalNotes:
      '遠征成功。ホテルを京橋にしたことで城ホールからの帰宅難民を回避できた。次回もこのルート推奨。',
    estimatedBudget: 55000,
    actualCost: 52400,
    createdAt: '2026-02-15T12:00:00Z',
    updatedAt: '2026-03-22T09:00:00Z',
    
    // タイムライン
    timeline: [
      {
        id: 'tl-101',
        tripId: 'trip-2026-osaka',
        time: '08:30',
        category: 'transport',
        title: '新幹線乗車（新横浜駅発）',
        location: '新横浜駅',
        memo: 'のぞみ号 6号車指定席',
        isCompleted: true,
        order: 1,
      },
      {
        id: 'tl-102',
        tripId: 'trip-2026-osaka',
        time: '11:00',
        category: 'lodging',
        title: 'ホテル荷物預け入れ',
        location: 'ホテル京阪 京橋',
        memo: 'チェックイン前にスーツケースを預ける',
        isCompleted: true,
        order: 2,
      },
      {
        id: 'tl-103',
        tripId: 'trip-2026-osaka',
        time: '12:30',
        category: 'goods',
        title: '会場物販受取',
        location: '大阪城ホール 北側広場',
        memo: '事前整理券枠（12:30〜13:00）',
        isCompleted: true,
        order: 3,
      },
      {
        id: 'tl-104',
        tripId: 'trip-2026-osaka',
        time: '17:00',
        category: 'live',
        title: 'Day 1 開演',
        location: '大阪城ホール',
        memo: '終演予定 19:30',
        isCompleted: true,
        order: 4,
      },
      {
        id: 'tl-105',
        tripId: 'trip-2026-osaka',
        time: '20:30',
        category: 'meal',
        title: '夕食',
        location: '京橋駅周辺',
        memo: 'お好み焼き',
        isCompleted: true,
        order: 5,
      },
    ],

    // 持ち物リスト
    packingList: [
      {
        id: 'pack-101',
        tripId: 'trip-2026-osaka',
        category: 'tickets_valuable',
        name: '電子チケット（スマホ充電・アプリ確認）',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-102',
        tripId: 'trip-2026-osaka',
        category: 'live_essentials',
        name: 'ペンライト & 予備単4電池',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-103',
        tripId: 'trip-2026-osaka',
        category: 'live_essentials',
        name: '防振双眼鏡（12倍）',
        memo: '予備CR2電池も忘れずに',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-104',
        tripId: 'trip-2026-osaka',
        category: 'live_essentials',
        name: 'ライブ用耳栓',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-105',
        tripId: 'trip-2026-osaka',
        category: 'travel_lodging',
        name: '1泊分着替え・スキンケア',
        isRequired: true,
        isChecked: true,
        isTemplate: false,
      },
    ],

    // 座席アーカイブ（2公演分）
    seatArchives: [
      {
        id: 'seat-101',
        tripId: 'trip-2026-osaka',
        venueId: 'venue-osaka-jo',
        performanceDate: '2026-03-20',
        performanceName: 'Day 1 (金・夜)',
        seat: {
          type: 'stand',
          blockOrArea: 'スタンド Hブロック',
          row: '8列',
          number: '15番',
        },
        binocularMagnification: '10〜12倍推奨',
        usedEarplugs: true,
        memo:
          '【見え方】ステージ全体と照明演出が綺麗に見渡せる良席。メンバーステージ奥に行くと表情は見えないので12倍防振が活躍。\n【音響・環境】スピーカー直撃ではないが音圧強め。耳栓使用でボーカルが非常にクリアに聴こえて耳の疲労感ゼロ。\n【退場動線】スタンド後方のため規制退場は最後から2番目。会場外に出るまで終演から約25分。',
        photos: [],
        createdAt: '2026-03-20T21:00:00Z',
        updatedAt: '2026-03-20T21:00:00Z',
      },
      {
        id: 'seat-102',
        tripId: 'trip-2026-osaka',
        venueId: 'venue-osaka-jo',
        performanceDate: '2026-03-21',
        performanceName: 'Day 2 (土・昼)',
        seat: {
          type: 'arena',
          blockOrArea: 'アリーナ 3ブロック',
          row: '5列',
          number: '8番',
        },
        binocularMagnification: '8倍または肉眼',
        usedEarplugs: true,
        memo:
          '【見え方】花道・センステが非常に近い神席。センステに来た時は肉眼で表情まで確認可能。銀テも余裕で届く位置。\n【動線】アリーナ前方は規制退場が早め。終演後10分程度で外へ脱出できた。',
        photos: [],
        createdAt: '2026-03-21T16:00:00Z',
        updatedAt: '2026-03-21T16:00:00Z',
      },
    ],
  },

  // -------------------------------------------------------------
  // シチュエーション2: 新幹線なし・日帰り・横浜アリーナ（単発）
  // -------------------------------------------------------------
  {
    id: 'trip-2026-yokohama',
    title: 'Anniversary Special Live in YOKOHAMA',
    artistName: 'N-Idol Project',
    startDate: '2026-04-12',
    endDate: '2026-04-12',
    status: 'completed',
    primaryVenueId: 'venue-yokohama-arena',
    transportMemo: '在来線利用（JR横浜線・東急新横浜線）',
    generalNotes: '日帰り近郊参戦。身軽装備で挑み、退場動線もスムーズだった。',
    estimatedBudget: 15000,
    actualCost: 13800,
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-04-13T08:00:00Z',

    // タイムライン
    timeline: [
      {
        id: 'tl-201',
        tripId: 'trip-2026-yokohama',
        time: '15:30',
        category: 'transport',
        title: '新横浜駅到着・カフェ待機',
        location: '新横浜駅ビル',
        isCompleted: true,
        order: 1,
      },
      {
        id: 'tl-202',
        tripId: 'trip-2026-yokohama',
        time: '16:30',
        category: 'admission',
        title: '入場・着席',
        location: '横浜アリーナ',
        memo: '電子チケット提示、トイレ混雑前に済ませる',
        isCompleted: true,
        order: 2,
      },
      {
        id: 'tl-203',
        tripId: 'trip-2026-yokohama',
        time: '17:30',
        category: 'live',
        title: 'ライブ本番',
        location: '横浜アリーナ',
        isCompleted: true,
        order: 3,
      },
    ],

    // 持ち物リスト
    packingList: [
      {
        id: 'pack-201',
        tripId: 'trip-2026-yokohama',
        category: 'tickets_valuable',
        name: 'スマホ（電子チケット）',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-202',
        tripId: 'trip-2026-yokohama',
        category: 'live_essentials',
        name: 'ペンライト（2本）',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-203',
        tripId: 'trip-2026-yokohama',
        category: 'live_essentials',
        name: 'コンパクト8倍双眼鏡',
        isRequired: false,
        isChecked: true,
        isTemplate: true,
      },
      {
        id: 'pack-204',
        tripId: 'trip-2026-yokohama',
        category: 'live_essentials',
        name: 'ライブ用耳栓',
        isRequired: true,
        isChecked: true,
        isTemplate: true,
      },
    ],

    // 座席アーカイブ（1公演分）
    seatArchives: [
      {
        id: 'seat-201',
        tripId: 'trip-2026-yokohama',
        venueId: 'venue-yokohama-arena',
        performanceDate: '2026-04-12',
        performanceName: '本公演',
        seat: {
          type: 'stand',
          blockOrArea: 'アリーナ Eブロック（実質2階スタンド）',
          row: '14列',
          number: '5番',
        },
        binocularMagnification: '8倍〜10倍',
        usedEarplugs: true,
        memo:
          '【見え方】横アリの「アリーナ席」は一般的なスタンド2階席相当。傾斜がしっかりあるため前の人の頭被りは全くなし。8倍双眼鏡でバストアップがしっかり捉えられる。\n【音響】横アリ特有の反響はややあるが、耳栓装着で音割れなくクリア。\n【退場】裏口側扉近くだったため規制退場の呼び出しが早く、新横浜駅まで混雑前に到達。',
        photos: [],
        createdAt: '2026-04-12T21:30:00Z',
        updatedAt: '2026-04-12T21:30:00Z',
      },
    ],
  },
];