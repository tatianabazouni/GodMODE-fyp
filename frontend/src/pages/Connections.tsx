import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FloatingParticles } from "@/components/FloatingParticles";
import { Search, UserPlus, Trophy, Users } from "lucide-react";
import { connectionApi } from "@/api/connectionApi";

interface Friend {
  id: string;
  name: string;
  email: string;
  status: "accepted" | "pending_sent" | "pending_received";
  type?: "friend" | "mentor" | "family";
}

interface UserSearchResult { id: string; name: string; email: string }

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const typeColors: Record<string, string> = {
  friend: "bg-calm/15 text-calm",
  mentor: "bg-golden/15 text-golden",
  family: "bg-accent/15 text-accent",
};

const Connections = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);

  const loadConnections = async () => {
    const data = await connectionApi.getConnections() as Friend[];
    setFriends(data);
  };

  useEffect(() => {
    void loadConnections();
  }, []);

  useEffect(() => {
    const lookup = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      const data = await connectionApi.searchUsers(searchQuery.trim()) as UserSearchResult[];
      setSearchResults(data);
    };
    const t = setTimeout(() => void lookup(), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const acceptedFriends = useMemo(() => friends.filter((f) => f.status === "accepted"), [friends]);

  const sendRequest = async (userId: string) => {
    await connectionApi.requestConnection(userId);
    await loadConnections();
    setSearchResults((prev) => prev.filter((u) => u.id !== userId));
  };

  const accept = async (connectionId: string) => {
    await connectionApi.acceptConnection(connectionId);
    await loadConnections();
  };

  const decline = async (connectionId: string) => {
    await connectionApi.declineConnection(connectionId);
    await loadConnections();
  };

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
        <Input placeholder="Search users by name/email..." className="pl-10 rounded-xl bg-card/50 border-border/40 backdrop-blur-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      {searchResults.length > 0 && (
        <Card className="rounded-2xl border-border/30 glass-card">
          <CardContent className="p-4 space-y-3">
            {searchResults.map((result) => (
              <div key={result.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{result.name}</p>
                  <p className="text-xs text-muted-foreground">{result.email}</p>
                </div>
                <Button size="sm" onClick={() => void sendRequest(result.id)} className="rounded-xl"><UserPlus className="mr-1 h-3 w-3" />Connect</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {friends.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {friends.map((friend) => (
            <motion.div key={friend.id} variants={itemVariants} whileHover={{ y: -4, scale: 1.01 }}>
              <Card className="rounded-2xl border-border/30 glass-card cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                      <AvatarFallback className="bg-primary/10">{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-display font-semibold">{friend.name}</h3>
                      <p className="text-sm text-muted-foreground">{friend.email}</p>
                    </div>
                    {friend.type && (
                      <Badge className={`ml-auto text-xs ${typeColors[friend.type] || ""} border-0`}>{friend.type}</Badge>
                    )}
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground items-center justify-between">
                    <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5 text-golden" /> {friend.status.replace("_", " ")}</span>
                    {friend.status === "pending_received" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void accept(friend.id)}>Accept</Button>
                        <Button size="sm" variant="outline" onClick={() => void decline(friend.id)}>Decline</Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div className="glass-card p-10 text-center">
          <Users className="h-16 w-16 mx-auto text-calm/40" strokeWidth={1} />
          <h2 className="font-display text-3xl font-bold">Life is better shared</h2>
        </motion.div>
      )}

      {acceptedFriends.length === 0 && null}
    </div>
  );
};

export default Connections;
