const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 📌 한국 시간 함수 정의
function getKoreaTime() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });
}

// CORS + JSON
const cors = require('cors');
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.options('*', cors()); // ✅ preflight OPTIONS 응답 허용
app.use(express.json());

// db.json 연동
const { Low, JSONFile } = require('lowdb');
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { logs: [] };

// 📥 트래킹 API (view + complete 공통 구조)
app.post('/track/view', async (req, res) => {
  const {
    ad_adv,
    ad_campaign,
    ad_media,
    ad_user,
    ad_source,
    ad_format,
    event
  } = req.body;

  const timestamp = getKoreaTime();
  console.log("📥 view 받은 데이터:", ad_media, ad_user);

  db.data.logs.push({
    ad_adv,
    ad_campaign,
    ad_media,
    ad_user,
    ad_source,
    ad_format,
    event: event || 'view',
    timestamp
  });

  await db.write();
  res.status(200).send({ ok: true });
});

app.post('/track/complete', async (req, res) => {
  const {
    ad_adv,
    ad_campaign,
    ad_media,
    ad_user,
    ad_source,
    ad_format,
    event
  } = req.body;

  const timestamp = getKoreaTime();
  console.log("📥 complete 받은 데이터:", ad_media, ad_user);

  db.data.logs.push({
    ad_adv,
    ad_campaign,
    ad_media,
    ad_user,
    ad_source,
    ad_format,
    event: event || 'complete',
    timestamp
  });

  await db.write();
  res.status(200).send({ ok: true });
});

// 로그 조회
app.get('/track/logs', (req, res) => {
  res.json(db.data.logs);
});

app.listen(port, () => {
  console.log(`🚀 Tracker API running at ${port}`);
});

