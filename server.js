const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const app = express();
const port = process.env.PORT || 3000;

// 한국 시간 함수
function getKoreaTime() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul"
  });
}

// CORS + JSON 파싱
app.use(cors({ origin: '*', methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'] }));
app.options('*', cors());
app.use(express.json());

// DB 연결
const adapter = new JSONFile('db.json');
const db = new Low(adapter);

// 공통 라우터
function registerTrackingRoute(endpoint, defaultEventType) {
  app.post(endpoint, async (req, res) => {
    console.log("📨 [RAW] req.body 전체:", req.body);

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
      console.warn("❗ 필수 파라미터 누락:", req.body);
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

// 서버 실행
async function startServer() {
  await db.read();
  db.data ||= { logs: [] };

  registerTrackingRoute('/track/view', 'view');
  registerTrackingRoute('/track/complete', 'complete');

  app.get('/track/logs', (req, res) => {
    res.json([...db.data.logs].reverse());
  });

  app.listen(port, () => {
    console.log(`🚀 Tracker API running at ${port}`);
  });
}

startServer();
