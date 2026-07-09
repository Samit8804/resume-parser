import fs from "fs";
import path from "path";
import mammoth from "mammoth";

const { PDFParse } = require("pdf-parse");

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  address: string;
  experience: number;
  education: string;
  currentCompany: string;
  currentTitle: string;
  skills: { name: string; category: string; level: string }[];
  projects: { name: string; techStack: string; description: string; link: string }[];
  certifications: { name: string; issuer: string; year: number }[];
  summary: string;
  rawText: string;
  confidence: number;
}

const SKILL_DATABASE: { name: string; category: string }[] = [
  { name: "react", category: "frontend" }, { name: "angular", category: "frontend" },
  { name: "vue", category: "frontend" }, { name: "next.js", category: "frontend" },
  { name: "typescript", category: "language" }, { name: "javascript", category: "language" },
  { name: "python", category: "language" }, { name: "java", category: "language" },
  { name: "c#", category: "language" }, { name: "c++", category: "language" },
  { name: "go", category: "language" }, { name: "rust", category: "language" },
  { name: "swift", category: "language" }, { name: "kotlin", category: "language" },
  { name: "node.js", category: "backend" }, { name: "express", category: "backend" },
  { name: "django", category: "backend" }, { name: "flask", category: "backend" },
  { name: "spring boot", category: "backend" }, { name: "fastapi", category: "backend" },
  { name: "graphql", category: "backend" }, { name: "rest api", category: "backend" },
  { name: "postgresql", category: "database" }, { name: "mysql", category: "database" },
  { name: "mongodb", category: "database" }, { name: "redis", category: "database" },
  { name: "sql", category: "database" }, { name: "docker", category: "devops" },
  { name: "kubernetes", category: "devops" }, { name: "aws", category: "cloud" },
  { name: "azure", category: "cloud" }, { name: "gcp", category: "cloud" },
  { name: "git", category: "tool" }, { name: "ci/cd", category: "devops" },
  { name: "terraform", category: "devops" }, { name: "linux", category: "tool" },
  { name: "tailwind css", category: "frontend" }, { name: "sass", category: "frontend" },
  { name: "html", category: "frontend" }, { name: "css", category: "frontend" },
  { name: "redux", category: "frontend" }, { name: "webpack", category: "tool" },
  { name: "jest", category: "testing" }, { name: "mocha", category: "testing" },
  { name: "cypress", category: "testing" }, { name: "figma", category: "design" },
  { name: "agile", category: "soft" }, { name: "scrum", category: "soft" },
  { name: "machine learning", category: "ai" }, { name: "deep learning", category: "ai" },
  { name: "nlp", category: "ai" }, { name: "tensorflow", category: "ai" },
  { name: "pytorch", category: "ai" }, { name: "tableau", category: "tool" },
  { name: "power bi", category: "tool" },
];

const DEGREE_KEYWORDS = [
  "bachelor", "master", "phd", "b.tech", "m.tech", "b.e.", "m.e.", "b.sc", "m.sc",
  "b.a.", "m.a.", "b.com", "m.com", "b.b.a", "m.b.a", "b.c.a", "m.c.a",
  "bachelor of", "master of", "doctor of", "associate", "diploma", "high school",
];

async function extractText(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);

  if (ext === ".pdf") {
    const p = new PDFParse({ data: buffer, verbosity: 0 });
    const result = await p.getText();
    return result.text;
  } else if (ext === ".docx") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("Unsupported file format");
}

function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : "";
}

function extractPhone(text: string): string {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : "";
}

function extractName(text: string): string {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  return lines[0] || "";
}

function extractLinkedIn(text: string): string {
  const match = text.match(/linkedin\.com\/[^\s,)\]]+/i);
  return match ? match[0] : "";
}

function extractGithub(text: string): string {
  const match = text.match(/github\.com\/[^\s,)\]]+/i);
  return match ? match[0] : "";
}

function extractPortfolio(text: string): string {
  const urls = text.match(/https?:\/\/[^\s,)\]]+/g) || [];
  return urls.find(u => !u.includes("linkedin") && !u.includes("github")) || "";
}

function extractSkills(text: string): { name: string; category: string; level: string }[] {
  const lower = text.toLowerCase();
  const found: { name: string; category: string; level: string }[] = [];
  const seen = new Set<string>();

  for (const skill of SKILL_DATABASE) {
    if (seen.has(skill.name)) continue;
    const regex = new RegExp(`\\b${skill.name.replace(/[.+^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (regex.test(lower)) {
      const level = lower.includes(`expert`) || lower.includes(`advanced`) ? "expert" :
                    lower.includes(`intermediate`) ? "intermediate" : "beginner";
      found.push({ name: skill.name, category: skill.category, level });
      seen.add(skill.name);
    }
  }

  return found;
}

function extractExperience(text: string): { years: number; currentCompany: string; currentTitle: string } {
  const years: number[] = [];
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches) {
    const sorted = yearMatches.map(Number).sort();
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    if (last - first > 0 && last - first < 50) {
      years.push(last - first);
    }
  }

  const expPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
    /experience\s*(?:of\s*)?(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs?\s*(?:of\s*)?exp/i,
  ];
  for (const pattern of expPatterns) {
    const match = text.match(pattern);
    if (match) {
      const val = parseInt(match[1]);
      if (val > 0 && val < 50) { years.push(val); break; }
    }
  }

  const skillsCount = extractSkills(text).length;
  const estimatedYears = Math.max(1, Math.min(Math.round(skillsCount / 3), 20));
  const expYears = years.length > 0 ? Math.max(...years) : estimatedYears;

  let currentCompany = "";
  let currentTitle = "";
  const companySection = text.match(/(?:experience|work|employment|professional)[^]*?(?=education|projects|skills|certifications|$)/i);
  if (companySection) {
    const lines = companySection[0].split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) currentTitle = lines[1];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].includes("at") || lines[i].includes("@") || lines[i].includes(" - ")) {
        currentCompany = lines[i];
        break;
      }
    }
    if (!currentCompany && lines.length > 2) currentCompany = lines[2];
  }

  return { years: expYears, currentCompany, currentTitle };
}

function extractEducation(text: string): string {
  const lines = text.split("\n").map(l => l.trim());
  let education = "";
  let inEducation = false;

  for (const line of lines) {
    if (/education|academic|qualification/i.test(line) && !inEducation) {
      inEducation = true;
      continue;
    }
    if (inEducation) {
      if (DEGREE_KEYWORDS.some(k => line.toLowerCase().includes(k))) {
        education = (education ? education + "; " : "") + line;
      }
      if (/experience|projects|skills|certifications|work/i.test(line) && education) break;
    }
  }

  if (!education) {
    for (const line of lines) {
      if (DEGREE_KEYWORDS.some(k => line.toLowerCase().includes(k))) {
        education = (education ? education + "; " : "") + line;
      }
    }
  }

  return education || "";
}

function extractProjects(text: string): { name: string; techStack: string; description: string; link: string }[] {
  const projects: { name: string; techStack: string; description: string; link: string }[] = [];
  const projectSection = text.match(/(?:projects|project work|key projects)[^]*?(?=experience|education|skills|certifications|$)/i);
  if (!projectSection) return [];

  const lines = projectSection[0].split("\n").map(l => l.trim()).filter(Boolean);
  let current: any = {};

  for (const line of lines) {
    if (/projects|project work|key projects/i.test(line)) continue;
    if (!current.name) {
      current.name = line;
      continue;
    }
    if (!current.techStack && /stack|tech|using|react|angular|vue|node|python|java/i.test(line)) {
      current.techStack = line;
      continue;
    }
    if (!current.description && line.length > 20) {
      current.description = line;
      continue;
    }
    if (line.match(/https?:\/\//)) {
      current.link = line;
    }
    if (projects.length > 0 || (current.name && current.name.length > 0)) {
      if (current.name) projects.push({ name: current.name, techStack: current.techStack || "", description: current.description || "", link: current.link || "" });
      current = {};
    }
  }
  if (current.name) projects.push({ name: current.name, techStack: current.techStack || "", description: current.description || "", link: current.link || "" });

  return projects;
}

function extractCertifications(text: string): { name: string; issuer: string; year: number }[] {
  const certs: { name: string; issuer: string; year: number }[] = [];
  const certSection = text.match(/(?:certifications|certificates|certified)[^]*?(?=experience|education|projects|skills|$)/i);
  if (!certSection) return [];

  const lines = certSection[0].split("\n").map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (/certifications|certificates|certified/i.test(line)) continue;
    const yearMatch = line.match(/\b(19|20)\d{2}\b/);
    const year = yearMatch ? parseInt(yearMatch[0]) : 0;
    const parts = line.replace(/\b(19|20)\d{2}\b/g, "").split(/[-–—|,]+/).map(s => s.trim()).filter(Boolean);
    certs.push({
      name: parts[0] || line,
      issuer: parts[1] || "",
      year: year > 2000 ? year : 0,
    });
  }

  return certs;
}

export async function parseResume(filePath: string): Promise<ParsedResume> {
  const rawText = await extractText(filePath);
  const name = extractName(rawText);
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const linkedIn = extractLinkedIn(rawText);
  const github = extractGithub(rawText);
  const portfolio = extractPortfolio(rawText);
  const skills = extractSkills(rawText);
  const { years: experience, currentCompany, currentTitle } = extractExperience(rawText);
  const education = extractEducation(rawText);
  const projects = extractProjects(rawText);
  const certifications = extractCertifications(rawText);

  const fieldsExtracted = [name, email, phone, linkedIn, education, currentCompany, currentTitle].filter(Boolean).length;
  const confidence = Math.min(100, Math.round((fieldsExtracted / 7) * 60 + (skills.length > 0 ? 20 : 0) + (projects.length > 0 ? 10 : 0) + (certifications.length > 0 ? 10 : 0)));

  return {
    name, email, phone, linkedIn, github, portfolio, address: "",
    experience, education, currentCompany, currentTitle,
    skills, projects, certifications,
    summary: rawText.slice(0, 500),
    rawText,
    confidence,
  };
}
