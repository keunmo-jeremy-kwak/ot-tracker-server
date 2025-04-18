const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const port = process.env.PORT || 3000;

// ✅ 한국 시간
function getKoreaTime() {
  return new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul"
  });
}

// ✅ DB 세팅 (v1 방식)
const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ logs: [] }).write();

// ✅ CORS & JSON
app.use(cors());
app.use(express.json());

// ✅ 공통 트래커
function registerTrackingRoute(endpoint, defaultEventType) {
  app.post(endpoint, (req, res) => {
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
      console.warn("❗ 필수 파라미터 누락", req.body);
      return res.status(400).json({ ok: false, error: "Missing ad_media or ad_user" });
    }

    const timestamp = getKoreaTime();
    console.log(`📥 ${defaultEventType} 받은 데이터:`, ad_media, ad_user);

    db.get('logs')
      .push({
        ad_adv,
        ad_campaign,
        ad_media,
        ad_user,
        ad_source,
        ad_format,
        event: event || defaultEventType,
        timestamp
      })
      .write();

    res.status(200).json({ ok: true });
  });
}

registerTrackingRoute('/track/view', 'view');
registerTrackingRoute('/track/complete', 'complete');

app.get('/track/logs', (req, res) => {
  const logs = db.get('logs').value();
  res.json(logs);
});

app.listen(port, () => {
  console.log(`🚀 Tracker API running at ${port}`);
});
