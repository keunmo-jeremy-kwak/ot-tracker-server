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
app.use(require('cors')());
app.use(express.json());

// db.json 연동
const { Low, JSONFile } = require('lowdb');
const adapter = new JSONFile('db.json');
const db = new Low(adapter);
await db.read();
db.data ||= { logs: [] };

// 트래킹 API
app.post('/track/view', async (req, res) => {
  const { media, userkey } = req.body;
  const timestamp = getKoreaTime();
  console.log("📥 view 받은 데이터:", media, userkey);
  db.data.logs.push({ media, userkey, event: 'view', timestamp });
  await db.write();
  res.status(200).send({ ok: true });
});

app.post('/track/complete', async (req, res) => {
  const { media, userkey } = req.body;
  const timestamp = getKoreaTime();
  console.log("📥 complete 받은 데이터:", media, userkey);
  db.data.logs.push({ media, userkey, event: 'complete', timestamp });
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
