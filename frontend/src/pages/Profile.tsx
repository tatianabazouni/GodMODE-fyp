import { useState } from "react";
import { motion } from "framer-motion";
import { getLevelInfo } from "@/lib/mock-data";
import type { Badge as BadgeType, Memory, Friend } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { FloatingParticles } from "@/components/FloatingParticles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Settings, Trophy, Star, Users, Sparkles, Heart, Camera, UserPlus, Calendar, MapPin, Zap, Target } from "lucide-react";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

interface Milestone { id: string; title: string; date: string; emoji: string; }

const Profile = () => {
  const [userName] = useState("Explorer");
  const [userBio] = useState("Your story begins here ✨");
  const [userAvatar] = useState("");
  const [userXp] = useState(0);
  const [badges] = useState<BadgeType[]>([]);
  const [memories] = useState<Memory[]>([]);
  const [friends] = useState<Friend[]>([]);
  const [milestones] = useState<Milestone[]>([]);

  const levelInfo = getLevelInfo(userXp);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-4xl mx-auto space-y-6 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <FloatingParticles count={6} colors={["primary", "golden", "calm"]} />
      </div>

      {/* Profile header with glowing ring */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border-border/30 glass-card overflow-hidden">
          {/* Animated gradient background */}
          <motion.div
            className="h-36 relative"
            animate={{
              background: [
                "linear-gradient(135deg, hsl(155 45% 43% / 0.15), hsl(228 67% 41% / 0.1))",
                "linear-gradient(225deg, hsl(228 67% 41% / 0.15), hsl(155 45% 43% / 0.1))",
                "linear-gradient(135deg, hsl(155 45% 43% / 0.15), hsl(228 67% 41% / 0.1))",
              ],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            <FloatingParticles count={5} colors={["primary", "golden"]} />
          </motion.div>
          <CardContent className="p-6 -mt-14">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar with glowing ring */}
              <motion.div
                className="relative"
                animate={{ boxShadow: ["0 0 15px hsl(155 45% 43% / 0.2)", "0 0 30px hsl(155 45% 43% / 0.4)", "0 0 15px hsl(155 45% 43% / 0.2)"] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ borderRadius: "50%" }}
              >
                <Avatar className="h-24 w-24 border-4 border-card shadow-cinematic">
                  {userAvatar ? <AvatarImage src={userAvatar} /> : null}
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-calm/20">{userName[0]}</AvatarFallback>
                </Avatar>
              </motion.div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{userName}</h1>
                <p className="text-muted-foreground">{userBio}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <Badge className="bg-golden/15 text-amber border-0"><Trophy className="h-3 w-3 mr-1" /> {levelInfo.current.title}</Badge>
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 text-primary" /> <AnimatedCounter value={userXp} /> XP
                  </span>
                  <span className="text-sm text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> {friends.length} friends</span>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="sm" className="border-border/40 rounded-xl"><Settings className="mr-2 h-4 w-4" />Edit Profile</Button>
              </motion.div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              {[
                { label: "Life Level", value: levelInfo.current.level, icon: Trophy, color: "text-golden" },
                { label: "Goal Rate", value: 0, suffix: "%", icon: Target, color: "text-primary" },
                { label: "Memories", value: memories.length, icon: Camera, color: "text-accent" },
              ].map((stat) => (
                <motion.div key={stat.label} whileHover={{ y: -2 }} className="text-center p-3 rounded-xl bg-muted/20">
                  <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
                  <p className="font-display text-xl font-bold"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Level progress */}
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

      {/* Life Timeline */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-foreground">
          <Calendar className="h-5 w-5 text-calm" /> Life Timeline
        </h2>
        {milestones.length > 0 ? (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 to-transparent" />
            {milestones.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 4 }}
                className="flex gap-4 mb-4 ml-1"
              >
                <div className="w-7 h-7 rounded-full bg-card border-2 border-primary/30 flex items-center justify-center text-sm z-10">{m.emoji}</div>
                <div className="flex-1 glass-card p-3 rounded-xl">
                  <p className="font-display font-semibold text-sm text-foreground">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{m.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-border/30 glass-card">
            <CardContent className="p-8 text-center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <MapPin className="h-10 w-10 mx-auto text-calm/30 mb-3" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Your timeline will fill as you document your journey</p>
              <p className="font-handwritten text-base text-muted-foreground/50 mt-1">Every milestone tells your story ✦</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Badges */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-foreground">
          <Star className="h-5 w-5 text-golden" /> Achievement Gallery
        </h2>
        {badges.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {badges.map((b) => (
              <motion.div
                key={b.id}
                whileHover={{ scale: 1.1, y: -4 }}
                className="cursor-pointer"
              >
                <Card className={`rounded-2xl border-border/30 text-center ${b.earned ? "glass-card shadow-glow-golden" : "bg-muted/20 opacity-40"}`}>
                  <CardContent className="p-3">
                    <span className="text-3xl">{b.icon}</span>
                    <p className="text-xs font-medium mt-1">{b.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="rounded-2xl border-border/30 glass-card">
            <CardContent className="p-8 text-center">
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                <Star className="h-10 w-10 mx-auto text-golden/30 mb-3" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Complete quests and goals to earn badges</p>
              <p className="font-handwritten text-base text-muted-foreground/50 mt-1">Every achievement tells a story ✦</p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Memories */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-bold mb-3 text-foreground">📸 Memories</h2>
        <Card className="rounded-2xl border-border/30 glass-card">
          <CardContent className="p-8 text-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Camera className="h-10 w-10 mx-auto text-accent/30 mb-3" />
            </motion.div>
            <p className="text-sm text-muted-foreground">Your memory gallery is waiting</p>
            <p className="font-handwritten text-base text-muted-foreground/50 mt-1">Capture moments that define you ✦</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Friends */}
      <motion.div variants={itemVariants}>
        <h2 className="font-display text-xl font-bold mb-3 flex items-center gap-2 text-foreground">
          <Users className="h-5 w-5 text-calm" /> Friends
        </h2>
        <Card className="rounded-2xl border-border/30 glass-card">
          <CardContent className="p-8 text-center">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Heart className="h-10 w-10 mx-auto text-primary/30 mb-3" />
            </motion.div>
            <p className="text-sm text-muted-foreground">No connections yet</p>
            <p className="font-handwritten text-base text-muted-foreground/50 mt-1">Great journeys are better together ✦</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm" className="mt-3 rounded-xl border-border/40">
                <UserPlus className="mr-2 h-4 w-4" /> Invite friends
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Profile;