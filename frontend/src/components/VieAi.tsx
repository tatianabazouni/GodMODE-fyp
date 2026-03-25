import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

const suggestions = [
  "✨ What if you wrote a letter to your future self today?",
  "🌅 Challenge: photograph something beautiful on your walk today",
  "💭 Reflection: What are you most grateful for this week?",
  "🎯 Try breaking one of your dreams into 3 small steps",
];

export function VieAiButton() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80"
          >
            <Card className="glass rounded-2xl shadow-warm overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm">Vie.ai</p>
                    <p className="text-xs text-muted-foreground">Your life companion</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  Hi! 👋 I'm Vie, your AI life companion. Here are some ideas for today:
                </p>
                {suggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-sm p-2.5 rounded-xl bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                  >
                    {s}
                  </motion.div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  placeholder="Ask Vie anything..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="text-sm h-9"
                />
                <Button size="icon" className="h-9 w-9 shrink-0 bg-primary">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-glow-teal flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
              <Sparkles className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
