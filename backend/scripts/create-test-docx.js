const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

async function createTestDocx() {
  const zip = new JSZip();

  zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>John Doe</w:t></w:r></w:p>
    <w:p><w:r><w:t>john.doe@email.com | +1-555-123-4567</w:t></w:r></w:p>
    <w:p><w:r><w:t>linkedin.com/in/johndoe | github.com/johndoe</w:t></w:r></w:p>
    <w:p><w:r><w:t>Senior Frontend Engineer | TechCorp | 2020-2024</w:t></w:r></w:p>
    <w:p><w:r><w:t>Led development of React-based dashboard serving 1M+ users. Built REST APIs with Node.js and Express. Managed PostgreSQL databases. Implemented CI/CD pipelines using Docker and AWS.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Frontend Developer | StartupXYZ | 2018-2020</w:t></w:r></w:p>
    <w:p><w:r><w:t>Developed responsive UIs with React, TypeScript, and Tailwind CSS. Worked with Next.js and GraphQL.</w:t></w:r></w:p>
    <w:p><w:r><w:t>Bachelor of Science in Computer Science, MIT, 2018</w:t></w:r></w:p>
    <w:p><w:r><w:t>Skills: React, TypeScript, JavaScript, Node.js, Express, Next.js, PostgreSQL, Docker, Kubernetes, AWS, Git, CI/CD, Tailwind CSS, HTML, CSS, Redux, Python, GraphQL, REST API, MongoDB, Redis, Agile, Scrum</w:t></w:r></w:p>
    <w:p><w:r><w:t>Projects: E-commerce Platform (React, Node.js, PostgreSQL) - Full-stack marketplace application</w:t></w:r></w:p>
    <w:p><w:r><w:t>Certifications: AWS Certified Solutions Architect (2023), Certified Kubernetes Administrator (2022)</w:t></w:r></w:p>
  </w:body>
</w:document>`);

  zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file("_rels/.rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  const buffer = await zip.generateAsync({ type: "nodebuffer" });
  const filePath = path.join("E:/resume ai parser/backend/uploads", "john-doe-resume.docx");
  fs.writeFileSync(filePath, buffer);
  console.log("Created test DOCX at:", filePath);
  console.log("File size:", buffer.length, "bytes");
}

createTestDocx().catch(console.error);
