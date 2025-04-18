// ✅ lowdb v3 + express server (ESM 아님, commonjs 기준)
const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node'); // v3에서는 이 방식!

const app = express();
const port = process.env.PORT || 3000;

// ✅ 한국 시간 포맷 함수
function getKoreaTime() {
  return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
}

// ✅ JSON 파싱 + CORS 설정
app.use(cors());
app.use(express.json());

// ✅ lowdb 연결
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// ✅ 초기화
async function initDB() {
  await db.read();
  db.data ||= { logs: [] };
  await db.write();
}
await initDB();

// ✅ 공통 트래킹 라우터
function registerTrackingRoute(endpoint, defaultEventType) {
  app.post(endpoint, async (req, res) => {
    const {
      ad_adv,
      ad_campaign,
      ad_media,
      ad_user,
      ad_source,
      ad_format,
      event
    } = req.body;

    if (!ad_media || !ad_user) {
      console.warn('❗ 필수 파라미터 누락:', req.body);
      return res.status(400).json({ ok: false, error: 'Missing ad_media or ad_user' });
    }

    const timestamp = getKoreaTime();
    console.log(`📥 ${defaultEventType} 수신:`, ad_media, ad_user);

    db.data.logs.push({
      ad_adv,
      ad_campaign,
      ad_media,
      ad_user,
      ad_source,
      ad_format,
      event: event || defaultEventType,
      timestamp
    });

    await db.write();
    res.status(200).json({ ok: true });
  });
}

registerTrackingRoute('/track/view', 'view');
registerTrackingRoute('/track/complete', 'complete');

// ✅ 로그 전체 조회
app.get('/track/logs', async (req, res) => {
  await db.read();
  res.json(db.data.logs);
});

// ✅ 서버 시작
app.listen(port, () => {
  console.log(`🚀 Tracker API running at ${port}`);
});
