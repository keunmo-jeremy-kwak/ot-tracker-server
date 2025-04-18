const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node'); // Node 환경에서 JSONFile 불러올 때 이걸로 해야 함

const app = express();
const port = process.env.PORT || 3000;

// ✅ 한국 시간 함수
function getKoreaTime() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul"
  });
}

// ✅ CORS + JSON 파싱
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors());
app.use(express.json());

// ✅ DB 연결
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// ✅ 공통 라우터 등록 함수
function registerTrackingRoute(endpoint, defaultEventType) {
  app.post(endpoint, async (req, res) => {
    console.log("📨 [RAW] req.body 전체:", req.body); // 디버깅용

    const {
      ad_adv,
      ad_campaign,
      ad_media,
      ad_user,
      ad_source,
      ad_format,
      event
    } = req.body;

    // 필수 파라미터 체크
    if (!ad_media || !ad_user) {
      console.warn("❗ 필수 파라미터 누락됨:", req.body);
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
    res.status(200).send({ ok: true });
  });
}

// ✅ view / complete 등록
registerTrackingRoute('/track/view', 'view');
registerTrackingRoute('/track/complete', 'complete');

// ✅ 로그 전체 조회
app.get('/track/logs', (req, res) => {
  res.json(db.data.logs);
});

// ✅ 서버 시작
async function startServer() {
  await db.read();
  db.data ||= { logs: [] };

  app.listen(port, () => {
    console.log(`🚀 Tracker API running at ${port}`);
  });
}

startServer();
