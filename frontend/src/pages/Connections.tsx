import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Search, UserPlus, Trophy, Target, Users, Sparkles, Heart } from "lucide-react";

interface Friend {
  id: string; name: string; avatar: string; level: number; levelTitle: string; sharedChallenges: number;
  type?: "friend" | "mentor" | "family";
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const typeColors: Record<string, string> = {
  friend: "bg-calm/15 text-calm",
  mentor: "bg-golden/15 text-golden",
  family: "bg-accent/15 text-accent",
};

const EmptyConnectionsState = () => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
    className="glass-card p-10 text-center relative overflow-hidden"
  >
    <FloatingParticles count={10} colors={["calm", "primary", "golden"]} />

    {/* Constellation dots */}
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
          style={{ left: `${15 + i * 10}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}
      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {[...Array(5)].map((_, i) => (
          <motion.line
            key={i}
            x1={`${20 + i * 10}%`} y1={`${25 + (i % 3) * 20}%`}
            x2={`${30 + i * 12}%`} y2={`${35 + ((i + 1) % 3) * 20}%`}
            stroke="hsl(var(--primary) / 0.1)"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
          />
        ))}
      </svg>
    </div>

    <div className="relative z-10 space-y-5">
      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
        <Users className="h-16 w-16 mx-auto text-calm/40" strokeWidth={1} />
      </motion.div>
      <h2 className="font-display text-3xl font-bold">Life is better shared</h2>
      <p className="text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
        Connect with friends, mentors, and family. Build your constellation of meaningful relationships.
      </p>
      <p className="font-handwritten text-xl text-muted-foreground/50 italic">"We rise by lifting others."</p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button className="gradient-primary text-primary-foreground shadow-glow-primary rounded-xl">
          <UserPlus className="mr-2 h-4 w-4" /> Invite your first connection
        </Button>
      </motion.div>
    </div>
  </motion.div>
);

const Connections = () => {
  const [friends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredFriends = friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <FloatingParticles count={6} colors={["calm", "primary"]} />
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          <span className="text-gradient-hero">Connections</span>
        </h1>
        <p className="text-muted-foreground mt-1 font-handwritten text-lg">Your constellation of people</p>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search connections..." className="pl-10 rounded-xl bg-card/50 border-border/40 backdrop-blur-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {friends.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredFriends.map((friend) => (
            <motion.div key={friend.id} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }}>
              <Card className="rounded-2xl border-border/30 glass-card cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback className="bg-primary/10">{friend.name[0]}</AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <h3 className="font-display font-semibold">{friend.name}</h3>
                      <p className="text-sm text-muted-foreground">{friend.levelTitle} · Lvl {friend.level}</p>
                    </div>
                    {friend.type && (
                      <Badge className={`ml-auto text-xs ${typeColors[friend.type] || ""} border-0`}>{friend.type}</Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-golden" /> {friend.sharedChallenges} shared</span>
                    <span className="flex items-center gap-1"><Target className="h-3.5 w-3.5 text-primary" /> Active</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <EmptyConnectionsState />
      )}
    </div>
  );
};

export default Connections;