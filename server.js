import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node'; // v5 이상에서 이 방식 사용

const app = express();
const port = process.env.PORT || 3000;

// ✅ 한국 시간
function getKoreaTime() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul"
  });
}

// ✅ DB 연결
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { logs: [] };

// ✅ 미들웨어
app.use(cors());
app.use(express.json());

// ✅ 공통 트래커 등록 함수
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
    console.log(`📥 ${defaultEventType} 받은 데이터:`, ad_media, ad_user);

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

// ✅ 라우트 등록
registerTrackingRoute('/track/view', 'view');
registerTrackingRoute('/track/complete', 'complete');

// ✅ 로그 조회
app.get('/track/logs', (req, res) => {
  res.json(db.data.logs);
});

// ✅ 서버 시작
app.listen(port, () => {
  console.log(`🚀 Tracker API running at ${port}`);
});
