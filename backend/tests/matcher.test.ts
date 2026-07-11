import { describe, it, expect } from "vitest";

const emptyCandidate = {
  name: "Test", email: "", phone: "", linkedIn: "", github: "", portfolio: "", address: "",
  skills: [],
  experience: 0, education: "", currentCompany: "", currentTitle: "",
  projects: [], certifications: [], summary: "",
};

const skilledCandidate = {
  ...emptyCandidate,
  skills: [
    { name: "React", category: "frontend", level: "advanced" },
    { name: "TypeScript", category: "language", level: "advanced" },
    { name: "Node.js", category: "backend", level: "intermediate" },
  ],
  experience: 5,
  education: "B.Tech",
};

const reactSkill = { name: "React", category: "frontend", level: "advanced" };
const tsSkill = { name: "TypeScript", category: "language", level: "advanced" };
const nodeSkill = { name: "Node.js", category: "backend", level: "intermediate" };
const graphqlSkill = { name: "GraphQL", category: "backend", level: "beginner" };
const dockerSkill = { name: "Docker", category: "devops", level: "intermediate" };

describe("matchCandidate", () => {
  it("has no matched skills for empty candidate", async () => {
    const { matchCandidate } = await import("../src/services/matcher");
    const result = matchCandidate(
      { ...emptyCandidate, skills: [] },
      { title: "Engineer", skills: [{ name: "React", isRequired: true }] }
    );
    expect(result.matchedSkills).toHaveLength(0);
    expect(result.missingSkills).toHaveLength(1);
    expect(result.missingSkills[0].name).toBe("React");
  });

  it("scores high when all required skills match", async () => {
    const { matchCandidate } = await import("../src/services/matcher");
    const result = matchCandidate(
      { ...skilledCandidate, skills: [reactSkill, tsSkill, nodeSkill] },
      {
        title: "Engineer",
        skills: [
          { name: "React", isRequired: true },
          { name: "TypeScript", isRequired: true },
          { name: "Node.js", isRequired: true },
        ],
      }
    );
    expect(result.overallScore).toBeGreaterThanOrEqual(30);
    expect(result.matchedSkills).toHaveLength(3);
    expect(result.missingSkills).toHaveLength(0);
  });

  it("identifies missing skills as gaps", async () => {
    const { matchCandidate } = await import("../src/services/matcher");
    const result = matchCandidate(
      { ...skilledCandidate, skills: [reactSkill] },
      {
        title: "Engineer",
        skills: [
          { name: "React", isRequired: true },
          { name: "GraphQL", isRequired: false },
          { name: "Docker", isRequired: true },
        ],
      }
    );
    expect(result.missingSkills.map((s) => s.name)).toContain("Docker");
    expect(result.missingSkills.map((s) => s.name)).toContain("GraphQL");
  });
});
