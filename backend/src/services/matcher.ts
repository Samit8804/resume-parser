import { ParsedResume } from "./parser";

export interface JobRequirements {
  title: string;
  skills: { name: string; isRequired: boolean; category?: string }[];
  experienceMin?: number;
  experienceMax?: number;
  education?: string;
  description?: string;
}

export interface SubScore {
  label: string;
  weight: number;
  score: number;
  details: string[];
}

export interface MatchResult {
  overallScore: number;
  confidenceScore: number;
  confidenceReason: string;
  subScores: SubScore[];
  matchedSkills: { name: string; category: string; evidence: string }[];
  missingSkills: { name: string; isRequired: boolean }[];
  skillGapAnalysis: {
    required: { name: string; isRequired: boolean }[];
    found: string[];
    missing: { name: string; isRequired: boolean }[];
  };
  strengths: string[];
  weaknesses: string[];
  verdict: string;
}

const WEIGHTS = {
  skillMatch: 0.40,
  experience: 0.25,
  projects: 0.15,
  education: 0.10,
  certifications: 0.05,
  resumeQuality: 0.05,
};

function normalizeSkill(skill: string): string {
  return skill.toLowerCase().trim().replace(/[^a-z0-9+#.-]/g, "");
}

function computeSkillMatch(
  candidateSkills: { name: string; category: string; level: string }[],
  jobSkills: { name: string; isRequired: boolean; category?: string }[]
): { score: number; matched: { name: string; category: string; evidence: string }[]; missing: { name: string; isRequired: boolean }[] } {
  const normalizedCandidate = candidateSkills.map(s => normalizeSkill(s.name));
  const matched: { name: string; category: string; evidence: string }[] = [];
  const missing: { name: string; isRequired: boolean }[] = [];

  for (const js of jobSkills) {
    const norm = normalizeSkill(js.name);
    if (normalizedCandidate.includes(norm)) {
      const candSkill = candidateSkills.find(s => normalizeSkill(s.name) === norm);
      matched.push({
        name: js.name,
        category: candSkill?.category || js.category || "",
        evidence: `${js.name} — listed in skills`,
      });
    } else {
      missing.push({ name: js.name, isRequired: js.isRequired });
    }
  }

  if (jobSkills.length === 0) return { score: 50, matched, missing };

  const requiredSkills = jobSkills.filter(s => s.isRequired);
  const preferredSkills = jobSkills.filter(s => !s.isRequired);
  const requiredMatched = requiredSkills.filter(s =>
    normalizedCandidate.includes(normalizeSkill(s.name))
  );
  const preferredMatched = preferredSkills.filter(s =>
    normalizedCandidate.includes(normalizeSkill(s.name))
  );

  const requiredScore = requiredSkills.length > 0
    ? (requiredMatched.length / requiredSkills.length) * 100
    : 100;
  const preferredScore = preferredSkills.length > 0
    ? (preferredMatched.length / preferredSkills.length) * 100
    : 100;

  const score = Math.round(requiredScore * 0.7 + preferredScore * 0.3);
  return { score, matched, missing };
}

function computeExperienceScore(
  candidateYears: number,
  jobMin?: number,
  jobMax?: number
): { score: number; details: string[] } {
  const details: string[] = [];
  if (candidateYears === 0) {
    details.push("No experience data available");
    return { score: 30, details };
  }

  if (!jobMin && !jobMax) {
    details.push(`${candidateYears} years of experience (no requirement specified)`);
    return { score: 70, details };
  }

  const min = jobMin || 0;
  const max = jobMax || 20;

  if (candidateYears < min) {
    const gap = min - candidateYears;
    details.push(`${candidateYears} years — ${gap} years short of ${min} year minimum`);
    return { score: Math.max(20, Math.round((candidateYears / min) * 50)), details };
  }

  if (candidateYears > max + 5) {
    details.push(`${candidateYears} years — exceeds maximum by ${candidateYears - max} years (potentially overqualified)`);
    return { score: 70, details };
  }

  const ideal = (min + max) / 2;
  const ratio = candidateYears / ideal;
  const score = Math.min(100, Math.round(ratio * 85));
  details.push(`${candidateYears} years within ${min}-${max} year range`);
  return { score, details };
}

function computeProjectScore(projects: { name: string; techStack?: string }[]): { score: number; details: string[] } {
  const details: string[] = [];
  if (projects.length === 0) {
    details.push("No projects listed");
    return { score: 0, details };
  }

  const withTech = projects.filter(p => p.techStack).length;
  const score = Math.min(100, Math.round(
    (projects.length * 15) + (withTech * 10)
  ));

  details.push(`${projects.length} projects listed`);
  if (withTech > 0) details.push(`${withTech} projects with tech stack details`);
  return { score, details };
}

function computeEducationScore(
  candidateEducation: string,
  requiredEducation?: string
): { score: number; details: string[] } {
  const details: string[] = [];
  if (!candidateEducation) {
    details.push("No education data available");
    return { score: 50, details };
  }
  details.push(candidateEducation);

  if (!requiredEducation) {
    return { score: 70, details };
  }

  const reqLower = requiredEducation.toLowerCase();
  const candLower = candidateEducation.toLowerCase();

  const degreeLevels = ["phd", "master", "bachelor", "associate", "diploma", "high school"];
  const reqLevel = degreeLevels.findIndex(d => reqLower.includes(d));
  const candLevel = degreeLevels.findIndex(d => candLower.includes(d));

  let score = 70;
  if (candLevel >= 0 && reqLevel >= 0) {
    if (candLevel <= reqLevel) score = 100;
    else score = 60;
  }

  if (candLower.includes(reqLower.slice(0, 10))) score = 100;
  details.push(`Education ${score >= 80 ? "matches" : "partially matches"} requirement`);
  return { score, details };
}

function computeCertificationScore(
  certifications: { name: string }[],
  jobSkills: { name: string }[]
): { score: number; details: string[] } {
  const details: string[] = [];
  if (certifications.length === 0) {
    details.push("No certifications listed");
    return { score: 0, details };
  }

  const relevant = certifications.filter(c =>
    jobSkills.some(s => c.name.toLowerCase().includes(s.name.toLowerCase()))
  );
  const score = Math.min(100, Math.round(
    (certifications.length * 20) + (relevant.length * 15)
  ));
  details.push(`${certifications.length} certifications listed`);
  if (relevant.length > 0) details.push(`${relevant.length} certifications relevant to the role`);
  return { score, details };
}

function computeResumeQualityScore(parsed: ParsedResume): { score: number; details: string[] } {
  const details: string[] = [];
  let score = 50;
  const hasEmail = !!parsed.email; const hasPhone = !!parsed.phone;
  const hasLinkedIn = !!parsed.linkedIn; const hasGithub = !!parsed.github;
  const hasSummary = parsed.summary.length > 100;
  const hasProjects = parsed.projects.length > 0;
  const hasCertifications = parsed.certifications.length > 0;

  if (hasEmail) score += 8;
  if (hasPhone) score += 7;
  if (hasLinkedIn) score += 8;
  if (hasGithub) score += 5;
  if (hasSummary) score += 8;
  if (hasProjects) score += 7;
  if (hasCertifications) score += 7;

  if (parsed.skills.length > 10) score += 5;
  else if (parsed.skills.length > 5) score += 3;

  const contactInfo = [hasEmail, hasPhone].filter(Boolean).length;
  const professionalInfo = [hasLinkedIn, hasGithub, hasSummary, hasProjects].filter(Boolean).length;

  details.push(`Contact info: ${contactInfo}/2`);
  details.push(`Professional info: ${professionalInfo}/4`);
  return { score: Math.min(100, score), details };
}

export function matchCandidate(
  parsed: ParsedResume,
  job: JobRequirements
): MatchResult {
  const skillResult = computeSkillMatch(parsed.skills, job.skills);
  const expResult = computeExperienceScore(parsed.experience, job.experienceMin, job.experienceMax);
  const projectResult = computeProjectScore(parsed.projects);
  const eduResult = computeEducationScore(parsed.education, job.education);
  const certResult = computeCertificationScore(parsed.certifications, job.skills);
  const qualityResult = computeResumeQualityScore(parsed);

  const subScores: SubScore[] = [
    { label: "Skill Match", weight: 40, score: skillResult.score, details: skillResult.matched.map(m => m.evidence) },
    { label: "Experience", weight: 25, score: expResult.score, details: expResult.details },
    { label: "Projects", weight: 15, score: projectResult.score, details: projectResult.details },
    { label: "Education", weight: 10, score: eduResult.score, details: eduResult.details },
    { label: "Certifications", weight: 5, score: certResult.score, details: certResult.details },
    { label: "Resume Quality", weight: 5, score: qualityResult.score, details: qualityResult.details },
  ];

  const overallScore = Math.round(
    subScores.reduce((sum, s) => sum + (s.score * s.weight / 100), 0)
  );

  const totalSkills = job.skills.length;
  const matchedCount = skillResult.matched.length;
  const confidenceBase = parsed.confidence;
  const skillCoverage = totalSkills > 0 ? (matchedCount / totalSkills) * 100 : 50;
  const confidenceScore = Math.round(
    confidenceBase * 0.4 + skillCoverage * 0.3 + (parsed.experience > 0 ? 15 : 5) + (overallScore > 50 ? 10 : 0)
  );

  let confidenceReason = "";
  if (confidenceScore >= 85) {
    confidenceReason = "High confidence — resume clearly lists required skills and experience";
  } else if (confidenceScore >= 65) {
    confidenceReason = "Moderate confidence — most data extracted successfully";
  } else {
    confidenceReason = "Lower confidence — resume formatting limited extraction completeness";
  }

  const strengths: string[] = [];
  if (skillResult.matched.length > 0) strengths.push(`Matches ${skillResult.matched.length}/${job.skills.length} required skills`);
  if (parsed.experience >= (job.experienceMin || 0)) strengths.push(`${parsed.experience} years of relevant experience`);
  if (parsed.projects.length > 0) strengths.push(`${parsed.projects.length} projects demonstrating practical skills`);
  if (parsed.certifications.length > 0) strengths.push(`${parsed.certifications.length} professional certifications`);
  if (!strengths.length) strengths.push("No strong signals detected — consider manual review");

  const weaknesses: string[] = [];
  if (skillResult.missing.length > 0) weaknesses.push(`Missing ${skillResult.missing.length} skill(s): ${skillResult.missing.map(s => s.name).join(", ")}`);
  if (parsed.education && job.education) {
    if (!parsed.education.toLowerCase().includes(job.education.toLowerCase().slice(0, 8))) {
      weaknesses.push("Education does not match requirements");
    }
  }
  if (parsed.experience < (job.experienceMin || 0)) weaknesses.push(`Only ${parsed.experience} years of experience (${job.experienceMin} required)`);
  if (parsed.confidence < 60) weaknesses.push("Resume parsing had low confidence — data may be incomplete");
  if (!weaknesses.length) weaknesses.push("No significant gaps identified");

  let verdict = "";
  if (overallScore >= 80) verdict = "Strong match — recommend shortlisting";
  else if (overallScore >= 60) verdict = "Good match — consider shortlisting";
  else if (overallScore >= 40) verdict = "Partial match — review manually";
  else verdict = "Low match — likely not suitable";

  return {
    overallScore,
    confidenceScore: Math.min(100, confidenceScore),
    confidenceReason,
    subScores,
    matchedSkills: skillResult.matched,
    missingSkills: skillResult.missing,
    skillGapAnalysis: {
      required: job.skills.map(s => ({ name: s.name, isRequired: s.isRequired })),
      found: skillResult.matched.map(s => s.name),
      missing: skillResult.missing,
    },
    strengths,
    weaknesses,
    verdict,
  };
}
