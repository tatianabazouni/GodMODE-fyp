import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/FloatingParticles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { SkeletonCard } from "@/components/SkeletonCard";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar,
} from "recharts";
import { Camera, Star, Globe, Flame, Trophy, Milestone, BarChart3, Brain } from "lucide-react";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";

interface LifeStat { label: string; value: number; icon: typeof Camera; color: string; }
interface BalanceDataPoint { subject: string; value: number; }
interface MoodDataPoint { month: string; happy: number; grateful: number; reflective: number; calm: number; }
interface XpDataPoint { month: string; xp: number; }

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const EmptyAnalyticsState = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
    className="glass-card p-10 text-center relative overflow-hidden"
  >
    <FloatingParticles count={8} colors={["calm", "primary", "golden"]} />
    <div className="relative z-10 space-y-5">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <BarChart3 className="h-16 w-16 mx-auto text-calm/40" strokeWidth={1} />
      </motion.div>
      <h2 className="font-display text-3xl font-bold">See how far you've come</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
        Your analytics will appear as you journal, complete goals, and capture memories.
      </p>
      <p className="font-handwritten text-xl text-muted-foreground/50 italic">"What gets measured gets managed."</p>
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        <Link to="/journal"><Button variant="outline" className="rounded-xl gap-2 border-border/40 hover:shadow-depth">Start journaling</Button></Link>
        <Link to="/goals"><Button variant="outline" className="rounded-xl gap-2 border-border/40 hover:shadow-depth">Set a goal</Button></Link>
      </div>
    </div>
  </motion.div>
);

const AiInsightCard = ({ title, insight }: { title: string; insight: string }) => (
  <motion.div
    variants={fadeIn}
    whileHover={{ y: -2, scale: 1.01 }}
    className="glass-card p-5 rounded-2xl relative overflow-hidden"
  >
    <motion.div
      className="absolute inset-0 rounded-2xl"
      animate={{ boxShadow: ["0 0 0px hsl(155 45% 43% / 0)", "0 0 20px hsl(155 45% 43% / 0.15)", "0 0 0px hsl(155 45% 43% / 0)"] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">{title}</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">{insight}</p>
    </div>
  </motion.div>
);

const Analytics = () => {
  const [stats, setStats] = useState<LifeStat[]>([
    { label: "Memories Saved", value: 0, icon: Camera, color: "text-accent" },
    { label: "Dreams Achieved", value: 0, icon: Star, color: "text-golden" },
    { label: "Countries Visited", value: 0, icon: Globe, color: "text-calm" },
    { label: "Challenges Done", value: 0, icon: Flame, color: "text-amber" },
    { label: "Milestones", value: 0, icon: Milestone, color: "text-primary" },
  ]);
  const [lifeBalanceData, setLifeBalanceData] = useState<BalanceDataPoint[]>([]);
  const [moodTrendData, setMoodTrendData] = useState<MoodDataPoint[]>([]);
  const [xpProgressData, setXpProgressData] = useState<XpDataPoint[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await api.get<any>("/analytics");
      setStats([
        { label: "Memories Saved", value: data.summary.memoryCount || 0, icon: Camera, color: "text-accent" },
        { label: "Dreams Achieved", value: data.summary.goalsCompleted || 0, icon: Star, color: "text-golden" },
        { label: "Countries Visited", value: 0, icon: Globe, color: "text-calm" },
        { label: "Challenges Done", value: data.summary.goalsCompleted || 0, icon: Flame, color: "text-amber" },
        { label: "Milestones", value: data.summary.lifeChapterCount || 0, icon: Milestone, color: "text-primary" },
      ]);
      setLifeBalanceData((data.growth || []).map((g: any) => ({ subject: g.category, value: g.value })));
      setMoodTrendData((data.moodTrends || []).map((m: any) => ({ month: m.date?.slice(5), happy: m.score, grateful: 0, reflective: 0, calm: 0 })));
      setXpProgressData([{ month: "Now", xp: data.summary.xp || 0 }]);
    };
    void load();
  }, []);

  const hasData = lifeBalanceData.length > 0 || moodTrendData.length > 0 || xpProgressData.length > 0;
  return (
    <div className="max-w-6xl mx-auto space-y-6 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <FloatingParticles count={6} colors={["calm", "primary"]} />
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Life <span className="text-gradient-hero">Insights</span>
        </h1>
        <p className="text-muted-foreground mt-1 font-handwritten text-lg">See how far you've come</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="rounded-2xl border-border/30 glass-card text-center group">
              <CardContent className="p-4">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} transition={{ type: "spring" }}>
                  <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                </motion.div>
                <p className="font-display text-2xl font-bold"><AnimatedCounter value={s.value} /></p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* AI Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AiInsightCard title="Life Insight" insight="Start journaling and setting goals to receive personalized life insights powered by AI." />
        <AiInsightCard title="Prediction" insight="As you build your life data, we'll project your future progress and suggest optimizations." />
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {lifeBalanceData.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="rounded-2xl border-border/30 glass-card">
                <CardHeader><CardTitle className="font-display text-lg">Life Balance Wheel</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <RadarChart data={lifeBalanceData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="subject" className="text-xs" />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {xpProgressData.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <Card className="rounded-2xl border-border/30 glass-card">
                <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Trophy className="h-5 w-5 text-golden" /> XP Growth</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={xpProgressData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" className="text-xs" /><YAxis className="text-xs" /><Tooltip />
                      <Area type="monotone" dataKey="xp" stroke="hsl(var(--golden))" fill="hsl(var(--golden))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
          {moodTrendData.length > 0 && (
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }} className="lg:col-span-2">
              <Card className="rounded-2xl border-border/30 glass-card">
                <CardHeader><CardTitle className="font-display text-lg">Mood Trends</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" className="text-xs" /><YAxis className="text-xs" /><Tooltip />
                      <Bar dataKey="happy" fill="hsl(var(--golden))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="grateful" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="reflective" fill="hsl(var(--calm))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="calm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      ) : (
        <EmptyAnalyticsState />
      )}
    </div>
  );
};

export default Analytics;