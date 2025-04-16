// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const koreaTime = new Date().toLocaleString("ko-KR", {
  timeZone: "Asia/Seoul",
});


// CORS 허용 + JSON 파싱
app.use(require('cors')());
app.use(express.json());

// 로그 저장 배열 (임시 DB 대용)
const logs = [];

app.post('/track/view', (req, res) => {
  const { media, userkey } = req.body;
  console.log("📥 view 받은 데이터:", media, userkey);
  logs.push({ media, userkey, event: 'view', timestamp: koreaTime() });
  res.status(200).send({ ok: true });
});

app.post('/track/complete', (req, res) => {
  const { media, userkey } = req.body;
  console.log("📥 complete 받은 데이터:", media, userkey);
  logs.push({ media, userkey, event: 'complete', timestamp: koreaTime() });
  res.status(200).send({ ok: true });
});

// 로그 전체 보기용 (테스트용)
app.get('/track/logs', (req, res) => {
  res.json(logs);
});

app.listen(port, () => {
  console.log(`🚀 Tracker API running at ${port}`);
});
