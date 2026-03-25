import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoalProgressRing } from "@/components/GoalProgressRing";
import { FloatingParticles } from "@/components/FloatingParticles";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { SkeletonCard } from "@/components/SkeletonCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Plus, Calendar, CheckCircle2, Circle, Sparkles, Zap,
  Rocket, Clock, Flag
} from "lucide-react";
import { api } from "@/lib/api";

/* ─── Types ─── */
interface Subtask { id: string; title: string; done: boolean; }
interface Goal {
  id: string; title: string; description: string; deadline: string;
  progress: number; xpReward: number; subtasks: Subtask[];
  priority: "high" | "medium" | "low";
}

const priorityColors = {
  high: "bg-accent/15 text-accent border-accent/30",
  medium: "bg-golden/15 text-golden border-golden/30",
  low: "bg-primary/15 text-primary border-primary/30",
};

/* ─── Animations ─── */
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };

/* ─── Empty State ─── */
const EmptyGoalsState = ({ onAdd }: { onAdd: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
    className="glass-card p-12 text-center relative overflow-hidden"
  >
    <FloatingParticles count={10} colors={["primary", "golden", "calm"]} />
    <div className="relative z-10 space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
          <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
            <Rocket className="h-12 w-12 text-primary/40" strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>
      <h2 className="font-display text-3xl font-bold text-foreground">Launch your first mission</h2>
      <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
        Goals are dreams with deadlines. Create your first life mission and break it into actionable steps.
      </p>
      <p className="font-handwritten text-xl text-muted-foreground/50 italic">"A goal without a plan is just a wish."</p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button onClick={onAdd} className="gradient-primary text-primary-foreground shadow-glow-primary rounded-xl px-8 py-5 text-base">
          <Rocket className="mr-2 h-5 w-5" /> Launch your first mission
        </Button>
      </motion.div>
    </div>
  </motion.div>
);

/* ─── Goal Card ─── */
const GoalCard = ({ goal, index, onToggleSubtask, onExpand }: {
  goal: Goal; index: number;
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  onExpand: (goal: Goal) => void;
}) => {
  const daysLeft = Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000));

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="cursor-pointer"
      onClick={() => onExpand(goal)}
    >
      <Card className="rounded-2xl border-border/30 glass-card overflow-hidden group">
        {/* Priority stripe */}
        <div className={`h-1 ${goal.priority === "high" ? "bg-accent" : goal.priority === "medium" ? "bg-golden" : "bg-primary"}`} />
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <motion.div
              className="relative"
              animate={{ boxShadow: goal.progress >= 100 ? ["0 0 15px hsl(155 45% 43% / 0.3)", "0 0 30px hsl(155 45% 43% / 0.5)", "0 0 15px hsl(155 45% 43% / 0.3)"] : "none" }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <GoalProgressRing progress={goal.progress} size={64} strokeWidth={4}>
                <span className="text-xs font-bold">{goal.progress}%</span>
              </GoalProgressRing>
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1.5 gap-2">
                <h3 className="font-display font-semibold text-lg text-foreground leading-tight">{goal.title}</h3>
                <Badge className={`shrink-0 text-[10px] border ${priorityColors[goal.priority]}`}>
                  <Flag className="h-2.5 w-2.5 mr-1" /> {goal.priority}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{goal.description}</p>

              {/* Milestone markers */}
              <div className="flex items-center gap-1 mb-3">
                {goal.subtasks.map((st) => (
                  <motion.div
                    key={st.id}
                    className={`h-2 flex-1 rounded-full ${st.done ? "bg-primary" : "bg-muted/40"}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3 }}
                  />
                ))}
                {goal.subtasks.length === 0 && <div className="h-2 w-full rounded-full bg-muted/30" />}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {daysLeft}d left
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                    {goal.subtasks.filter(s => s.done).length}/{goal.subtasks.length}
                  </span>
                </div>
                <Badge className="bg-golden/15 text-golden border-0 text-[10px]">
                  <Zap className="h-2.5 w-2.5 mr-0.5" /> +{goal.xpReward} XP
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

/* ─── Goal Detail Panel ─── */
const GoalDetailPanel = ({ goal, open, onClose, onToggleSubtask, onAddSubtask }: {
  goal: Goal | null; open: boolean; onClose: () => void;
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  onAddSubtask: (goalId: string, title: string) => void;
}) => {
  const [newSubtask, setNewSubtask] = useState("");
  if (!goal) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg glass-card border-border/30 p-0 overflow-hidden max-h-[85vh] overflow-y-auto">
        {/* Header with gradient */}
        <div className={`h-2 ${goal.priority === "high" ? "bg-accent" : goal.priority === "medium" ? "bg-golden" : "bg-primary"}`} />
        <div className="p-6 space-y-5">
          <div className="flex items-start gap-4">
            <GoalProgressRing progress={goal.progress} size={72} strokeWidth={4}>
              <AnimatedCounter value={goal.progress} suffix="%" className="text-sm font-bold" />
            </GoalProgressRing>
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">{goal.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs"><Calendar className="h-3 w-3 mr-1" /> {new Date(goal.deadline).toLocaleDateString()}</Badge>
                <Badge className="bg-golden/15 text-golden border-0 text-xs"><Zap className="h-3 w-3 mr-1" /> +{goal.xpReward} XP</Badge>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{goal.progress}%</span>
            </div>
            <Progress value={goal.progress} className="h-2" />
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Milestones
            </h4>
            {goal.subtasks.map((st) => (
              <motion.button
                key={st.id}
                whileHover={{ x: 4 }}
                onClick={() => onToggleSubtask(goal.id, st.id)}
                className="flex items-center gap-3 text-sm w-full text-left p-2 rounded-lg hover:bg-muted/20 transition-colors"
              >
                {st.done ? (
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                )}
                <span className={st.done ? "line-through text-muted-foreground" : "text-foreground"}>{st.title}</span>
              </motion.button>
            ))}
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add a milestone..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                className="rounded-xl bg-muted/20 border-border/40 text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSubtask.trim()) {
                    onAddSubtask(goal.id, newSubtask.trim());
                    setNewSubtask("");
                  }
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl shrink-0"
                onClick={() => {
                  if (newSubtask.trim()) {
                    onAddSubtask(goal.id, newSubtask.trim());
                    setNewSubtask("");
                  }
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Main Goals Page ─── */
const mapGoal = (goal: any): Goal => ({
  id: goal.id || goal._id,
  title: goal.title,
  description: goal.description || "",
  deadline: goal.deadline ? String(goal.deadline).slice(0, 10) : new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
  progress: Number(goal.progress || 0),
  xpReward: Number(goal.xpReward || 25),
  subtasks: (goal.subtasks || []).map((subtask: any) => ({ id: String(subtask.id), title: subtask.title, done: Boolean(subtask.done) })),
  priority: goal.priority || "medium",
});

const Goals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<Goal | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("medium");

  useEffect(() => {
    const load = async () => {
      const data = await api.get<any[]>("/goals");
      setGoals(data.map(mapGoal));
    };
    void load();
  }, []);

  const totalXp = goals.reduce((sum, g) => sum + (g.progress >= 100 ? g.xpReward : 0), 0);
  const completedGoals = goals.filter(g => g.progress >= 100).length;

  const handleAddGoal = async () => {
    if (!newTitle.trim()) return;
    const created = await api.post<any>("/goals", {
      title: newTitle,
      description: newDesc,
      deadline: newDeadline || new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      priority: newPriority,
      xpReward: newPriority === "high" ? 50 : newPriority === "medium" ? 30 : 15,
    });
    setGoals((prev) => [mapGoal(created), ...prev]);
    setNewTitle(""); setNewDesc(""); setNewDeadline(""); setNewPriority("medium");
    setShowAddDialog(false);
  };

  const toggleSubtask = async (goalId: string, subtaskId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const subtasks = goal.subtasks.map((s) => (s.id === subtaskId ? { ...s, done: !s.done } : s));
    const progress = subtasks.length > 0 ? Math.round((subtasks.filter((s) => s.done).length / subtasks.length) * 100) : 0;
    const updated = await api.put<any>(`/goals/${goalId}`, { subtasks, progress, completed: progress === 100 });
    const next = mapGoal(updated);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? next : g)));
    if (expandedGoal?.id === goalId) setExpandedGoal(next);
  };

  const addSubtask = async (goalId: string, title: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const subtasks = [...goal.subtasks, { id: crypto.randomUUID(), title, done: false }];
    const progress = Math.round((subtasks.filter((s) => s.done).length / subtasks.length) * 100);
    const updated = await api.put<any>(`/goals/${goalId}`, { subtasks, progress, completed: progress === 100 });
    const next = mapGoal(updated);
    setGoals((prev) => prev.map((g) => (g.id === goalId ? next : g)));
    if (expandedGoal?.id === goalId) setExpandedGoal(next);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 relative">
      {/* Background particles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <FloatingParticles count={8} colors={["primary", "golden"]} />
      </div>

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Your Life <span className="text-gradient-hero">Missions</span>
          </h1>
          <p className="text-muted-foreground mt-1 font-handwritten text-lg">Turn dreams into action</p>
        </div>
        <div className="flex items-center gap-3">
          {goals.length > 0 && (
            <div className="flex items-center gap-4 mr-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Completed</p>
                <p className="font-display font-bold text-primary"><AnimatedCounter value={completedGoals} /></p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">XP Earned</p>
                <p className="font-display font-bold text-golden"><AnimatedCounter value={totalXp} /></p>
              </div>
            </div>
          )}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button onClick={() => setShowAddDialog(true)} className="gradient-primary text-primary-foreground shadow-glow-primary rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> New Mission
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {goals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="lg:col-span-2 space-y-4">
            {goals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onToggleSubtask={toggleSubtask}
                onExpand={setExpandedGoal}
              />
            ))}
          </motion.div>

          {/* AI Challenges sidebar */}
          <div>
            <Card className="rounded-2xl border-border/30 glass-card gradient-warm">
              <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber" /> AI Challenges
                </CardTitle>
                <p className="text-xs text-muted-foreground">Fun challenges to grow</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: "Bake a cake", desc: "Try a new recipe", xp: 15 },
                  { title: "Watch a sunrise", desc: "Witness the magic", xp: 20 },
                  { title: "Write a poem", desc: "Express yourself", xp: 15 },
                  { title: "Talk to a stranger", desc: "Make a connection", xp: 25 },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    whileHover={{ x: 4, scale: 1.02 }}
                    className="p-3 rounded-xl bg-card/40 hover:bg-card/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium">{s.title}</h4>
                      <Badge variant="secondary" className="text-xs">+{s.xp} XP</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyGoalsState onAdd={() => setShowAddDialog(true)} />
      )}

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md glass-card border-border/30">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Launch a new mission</DialogTitle>
            <DialogDescription>Set a meaningful goal and break it into steps.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Mission name..." value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="rounded-xl bg-muted/20 border-border/40" />
            <Textarea placeholder="Why does this mission matter to you?" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="rounded-xl min-h-[80px] bg-muted/20 border-border/40" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Deadline</label>
                <Input type="date" value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)} className="rounded-xl bg-muted/20 border-border/40" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
                <div className="flex gap-1">
                  {(["low", "medium", "high"] as const).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={newPriority === p ? "default" : "outline"}
                      onClick={() => setNewPriority(p)}
                      className={`flex-1 capitalize text-xs rounded-lg ${newPriority === p ? "gradient-primary text-primary-foreground" : "border-border/40"}`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)} className="border-border/40">Cancel</Button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleAddGoal} className="gradient-primary text-primary-foreground shadow-glow-primary" disabled={!newTitle.trim()}>
                <Rocket className="mr-2 h-4 w-4" /> Launch Mission
              </Button>
            </motion.div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Detail Panel */}
      <GoalDetailPanel
        goal={expandedGoal}
        open={!!expandedGoal}
        onClose={() => setExpandedGoal(null)}
        onToggleSubtask={toggleSubtask}
        onAddSubtask={addSubtask}
      />
    </div>
  );
};

export default Goals;