const http = require('http');

// กำหนดพอร์ตที่เซิร์ฟเวอร์จะใช้งาน
const PORT = process.env.PORT || 3000;

// สร้างเซิร์ฟเวอร์
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write("I'm alive");
  res.end();
});

// เปิดเซิร์ฟเวอร์และกำหนดพอร์ต
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ใช้ setInterval เพื่อให้โค้ดทำงานเป็นระยะๆ และไม่จบการทำงานเพื่อให้เซิร์ฟเวอร์อยู่ในสถานะออนไลน์ตลอดเวลา
setInterval(() => {
  console.log("Server is still running...");
}, 60 * 1000); // ตรวจสอบสถานะทุก 60 วินาที
