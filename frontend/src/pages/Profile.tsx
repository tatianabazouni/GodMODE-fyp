import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FloatingParticles } from "@/components/FloatingParticles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { authApi } from "@/api/authApi";
import { dashboardApi } from "@/api/dashboardApi";
import { analyticsApi } from "@/api/analyticsApi";
import { gamificationApi } from "@/api/gamificationApi";
import { api } from "@/lib/api";
import { Settings, Trophy, Star, Users, Camera, Calendar, MapPin, Zap, Target } from "lucide-react";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

interface Milestone { id: string; title: string; date: string; emoji: string; }
interface Connection { id: string; status: string; }

const getLevelInfo = (xp: number) => {
  const level = Math.max(1, Math.floor(xp / 100) + 1);
  const currentLevelXp = (level - 1) * 100;
  const nextLevelXp = level * 100;
  const progress = ((xp - currentLevelXp) / Math.max(1, nextLevelXp - currentLevelXp)) * 100;
  return {
    current: { level, title: `Level ${level}` },
    next: { title: `Level ${level + 1}` },
    progress: Math.max(0, Math.min(100, progress)),
  };
};

const Profile = () => {
  const [userName, setUserName] = useState("Explorer");
  const [userBio, setUserBio] = useState("Your story begins here ✨");
  const [userXp, setUserXp] = useState(0);
  const [badges, setBadges] = useState<string[]>([]);
  const [memoryCount, setMemoryCount] = useState(0);
  const [friends, setFriends] = useState<Connection[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [goalRate, setGoalRate] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [profileData, dashboard, analytics, gamification, connections] = await Promise.all([
        authApi.getProfile() as Promise<any>,
        dashboardApi.getSummary() as Promise<any>,
        analyticsApi.getOverview() as Promise<any>,
        gamificationApi.getSnapshot() as Promise<any>,
        api.get<Connection[]>("/connections"),
      ]);

      setUserName(profileData?.user?.name || "Explorer");
      setUserBio(profileData?.profile?.bio || "Your story begins here ✨");
      setUserXp(Number(gamification?.xp ?? dashboard?.xp ?? 0));
      const safeBadges = Array.isArray(gamification?.badges) ? gamification.badges : [];
      setBadges(safeBadges.map((b: string) => String(b)));
      setMemoryCount(Number(analytics?.summary?.memoryCount || 0));
      setFriends(Array.isArray(connections) ? connections : []);

      const completed = Number(dashboard?.goalsCompleted || 0);
      const total = Number(dashboard?.goalsTotal || 0);
      setGoalRate(total > 0 ? Math.round((completed / total) * 100) : 0);

      const safeRecentActivity = Array.isArray(dashboard?.recentActivity) ? dashboard.recentActivity : [];
      setMilestones(safeRecentActivity.slice(0, 6).map((item: any) => ({
        id: String(item.id),
        title: item.title || "Activity",
        date: new Date(item.date).toLocaleDateString(),
        emoji: item.type === "goal" ? "🎯" : "📝",
      })));
    };

    void load();
  }, []);

  const levelInfo = useMemo(() => getLevelInfo(userXp), [userXp]);
  const acceptedFriends = friends.filter((friend) => friend.status === "accepted").length;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <FloatingParticles count={6} colors={["primary", "golden", "calm"]} />
      </div>

      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border-border/30 glass-card overflow-hidden">
          <div className="h-36 bg-gradient-to-r from-primary/15 via-calm/10 to-golden/10" />
          <CardContent className="p-6 -mt-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-card shadow-cinematic">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-calm/20">{userName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{userName}</h1>
                <p className="text-muted-foreground">{userBio}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge className="bg-golden/15 text-amber border-0"><Trophy className="h-3 w-3 mr-1" /> {levelInfo.current.title}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> <AnimatedCounter value={userXp} /> XP</span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {acceptedFriends} friends</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-border/40 rounded-xl"><Settings className="mr-2 h-4 w-4" />Edit Profile</Button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Life Level", value: levelInfo.current.level, icon: Trophy, color: "text-golden" },
                { label: "Goal Rate", value: goalRate, suffix: "%", icon: Target, color: "text-primary" },
                { label: "Memories", value: memoryCount, icon: Camera, color: "text-accent" },
              ].map((stat) => (
                <motion.div key={stat.label} whileHover={{ y: -2 }} className="text-center p-3 rounded-xl bg-muted/20">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="font-display text-xl font-bold"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Level {levelInfo.current.level}</span>
                <span>{Math.round(levelInfo.progress)}% to {levelInfo.next.title}</span>
              </div>
              <Progress value={levelInfo.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-foreground"><Calendar className="h-5 w-5 text-calm" /> Life Timeline</h2>
        {milestones.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 to-transparent" />
            {milestones.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-4 mb-4 ml-1">
                <div className="w-7 h-7 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center text-sm z-10">{m.emoji}</div>
                <div className="flex-1 glass-card p-3 rounded-xl">
                  <p className="font-display font-semibold text-sm text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-border/30 glass-card"><CardContent className="p-8 text-center"><MapPin className="h-10 w-10 mx-auto text-calm/30 mb-3" /><p className="text-sm text-muted-foreground">Your timeline will fill as you document your journey</p></CardContent></Card>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-foreground"><Star className="h-5 w-5 text-golden" /> Achievement Gallery</h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {badges.map((badge, i) => (
              <Card key={`${badge}-${i}`} className="rounded-2xl border-border/30 text-center glass-card"><CardContent className="p-3"><span className="text-3xl">🏅</span><p className="text-xs font-medium mt-1">{badge}</p></CardContent></Card>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-border/30 glass-card"><CardContent className="p-8 text-center"><Star className="h-10 w-10 mx-auto text-golden/30 mb-3" /><p className="text-sm text-muted-foreground">Complete quests and goals to earn badges</p></CardContent></Card>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Profile;
