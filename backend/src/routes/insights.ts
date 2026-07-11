import { Router, Request, Response } from "express";
import { prisma } from "../index";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/:jobId/insights", async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params as { jobId: string };
    const job = await prisma.job.findFirst({
      where: { id: jobId, creatorId: req.userId },
      include: { skills: true, candidates: { include: { skills: true } } },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });

    const candidates = job.candidates;
    const allSkills = candidates.flatMap((c: any) => c.skills.map((s: any) => s.name.toLowerCase()));
    const skillFrequency = new Map<string, number>();
    allSkills.forEach(s => skillFrequency.set(s, (skillFrequency.get(s) || 0) + 1));

    const mostCommonSkill = skillFrequency.size > 0
      ? [...skillFrequency.entries()].sort((a, b) => b[1] - a[1])[0][0]
      : null;

    const leastCommonSkill = skillFrequency.size > 0
      ? [...skillFrequency.entries()].sort((a, b) => a[1] - b[1])[0][0]
      : null;

    const avgExperience = candidates.length > 0
      ? Math.round(candidates.reduce((sum: number, c: any) => sum + (c.experience || 0), 0) / candidates.length)
      : 0;

    const missingSkillAnalysis = job.skills.map(s => {
      const missingCount = candidates.filter((c: any) =>
        !c.skills.some((cs: any) => cs.name.toLowerCase() === s.name.toLowerCase())
      ).length;
      return {
        name: s.name,
        missingCount,
        missingPercent: candidates.length > 0 ? Math.round((missingCount / candidates.length) * 100) : 0,
      };
    });

    const avgMatchScore = candidates.length > 0
      ? Math.round(candidates.reduce((sum: number, c: any) => sum + (c.matchScore || 0), 0) / candidates.length)
      : 0;

    const topCandidates = candidates
      .filter((c: any) => c.matchScore)
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 3)
      .map((c: any) => ({ id: c.id, name: c.name, score: c.matchScore }));

    const statusDistribution = candidates.reduce((acc: Record<string, number>, c: any) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      totalCandidates: candidates.length,
      avgMatchScore,
      avgExperience,
      mostCommonSkill,
      leastCommonSkill,
      skillFrequency: Object.fromEntries(skillFrequency),
      missingSkillAnalysis,
      topCandidates,
      statusDistribution,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get insights" });
  }
});

router.post("/compare", async (req: Request, res: Response) => {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length < 2 || candidateIds.length > 4) {
      return res.status(400).json({ error: "Select 2-4 candidates to compare" });
    }

    const candidates = await prisma.candidate.findMany({
      where: { id: { in: candidateIds }, job: { creatorId: req.userId } },
      include: { skills: true, projects: true, certifications: true },
    });

    const comparison = candidates.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      matchScore: c.matchScore,
      confidenceScore: c.confidenceScore,
      experience: c.experience,
      education: c.education,
      currentCompany: c.currentCompany,
      currentTitle: c.currentTitle,
      skills: c.skills.map((s: any) => s.name),
      skillCount: c.skills.length,
      projectCount: c.projects.length,
      certificationCount: c.certifications.length,
      status: c.status,
    }));

    const skillUniverse = [...new Set(comparison.flatMap(c => c.skills))];

    res.json({ comparison, skillUniverse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comparison failed" });
  }
});

export default router;