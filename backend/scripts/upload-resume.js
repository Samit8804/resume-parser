const fs = require("fs");
const path = require("path");
const http = require("http");

const token = process.argv[2];
const jobId = process.argv[3];
const filePath = process.argv[4];

const boundary = "----WebKitFormBoundary" + Math.random().toString(36).slice(2);
const filename = path.basename(filePath);
const fileContent = fs.readFileSync(filePath);

// Build multipart body manually
const header = 
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="jobId"\r\n\r\n` +
  `${jobId}\r\n` +
  `--${boundary}\r\n` +
  `Content-Disposition: form-data; name="resumes"; filename="${filename}"\r\n` +
  `Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document\r\n\r\n`;

const footer = `\r\n--${boundary}--\r\n`;

const headerBuf = Buffer.from(header, "utf-8");
const footerBuf = Buffer.from(footer, "utf-8");
const body = Buffer.concat([headerBuf, fileContent, footerBuf]);

const options = {
  hostname: "localhost",
  port: 4000,
  path: "/api/upload/bulk",
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": `multipart/form-data; boundary=${boundary}`,
    "Content-Length": body.length,
  },
};

const req = http.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    console.log("Status:", res.statusCode);
    console.log("Response:", data);
    try {
      const parsed = JSON.parse(data);
      if (parsed.candidates && parsed.candidates.length > 0) {
        console.log("Candidate ID:", parsed.candidates[0].id);
      }
    } catch (e) {}
  });
});

req.on("error", (e) => console.error("Error:", e.message));
req.write(body);
req.end();
