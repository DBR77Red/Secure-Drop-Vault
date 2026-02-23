import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useMessage } from "@/hooks/use-messages";
import { VaultCard, VaultButton } from "@/components/VaultCard";
import { AlertTriangle, ShieldCheck, Download, ExternalLink, Skull } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Secret() {
  const params = useParams();
  const id = params.id as string;
  const [hasRevealed, setHasRevealed] = useState(false);

  // We only enable the query when the user explicitly clicks Reveal
  const { data, isLoading, error, isError } = useMessage(id, hasRevealed);

  // Prevention mechanism: if they navigate away or refresh after revealing, it's gone.
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasRevealed && data) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasRevealed, data]);

  const handleReveal = () => {
    setHasRevealed(true);
  };

  const renderContent = () => {
    if (!data) return null;

    switch (data.type) {
      case "text":
        return (
          <div className="bg-black/60 border border-white/10 rounded-xl p-6 relative group">
            <div className="absolute top-0 right-0 p-2 opacity-50 font-mono text-[10px] uppercase tracking-widest text-primary">
              Decrypted_Text
            </div>
            <pre className="font-mono text-sm whitespace-pre-wrap break-words text-foreground pt-4">
              {data.content}
            </pre>
          </div>
        );
      case "url":
        return (
          <div className="bg-black/60 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <ExternalLink className="w-8 h-8 text-primary" />
            </div>
            <p className="font-mono text-sm text-muted-foreground mb-2 uppercase tracking-wider">Decrypted URL Target</p>
            <p className="font-mono text-lg text-foreground mb-8 break-all max-w-[90%]">
              {data.content}
            </p>
            <a 
              href={data.content || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-mono font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_-5px_hsl(var(--primary))]"
            >
              Open Link
            </a>
          </div>
        );
      case "file":
        return (
          <div className="bg-black/60 border border-white/10 rounded-xl p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-6">
              <Download className="w-8 h-8 text-primary" />
            </div>
            <p className="font-mono text-sm text-muted-foreground mb-2 uppercase tracking-wider">Decrypted File</p>
            <p className="font-mono text-lg text-foreground mb-8 break-all max-w-[90%] line-clamp-2">
              {data.fileName}
            </p>
            <a 
              href={data.fileData || '#'} 
              download={data.fileName || 'secret-file'}
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-xl font-mono font-bold text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_-5px_hsl(var(--primary))]"
            >
              Download File
            </a>
          </div>
        );
      default:
        return <p className="text-destructive font-mono">Unknown secret format.</p>;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <AnimatePresence mode="wait">
        {!hasRevealed ? (
          <VaultCard 
            key="warning"
            className="border-primary/20"
          >
            <div className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-yellow-500/10 border border-yellow-500/20 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)] relative">
                <AlertTriangle className="w-10 h-10 text-yellow-500" />
                <div className="absolute inset-0 rounded-full animate-ping border border-yellow-500/50 opacity-20" />
              </div>
              
              <h2 className="text-3xl font-mono font-bold text-foreground mb-4">RESTRICTED DATA</h2>
              
              <p className="text-muted-foreground mb-8 max-w-md text-sm leading-relaxed">
                You are about to access a self-destructing message. 
                <strong className="text-foreground block mt-2">
                  Once viewed, it will be permanently deleted from the vault. It cannot be recovered.
                </strong>
              </p>

              <VaultButton onClick={handleReveal} variant="danger" className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10">
                Reveal Secret Now
              </VaultButton>
            </div>
          </VaultCard>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl mx-auto"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-12 text-primary">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin" />
                  <div className="absolute inset-2 rounded-full border-r-2 border-primary/50 animate-[spin_1.5s_linear_infinite_reverse]" />
                  <div className="absolute inset-4 rounded-full border-b-2 border-primary/20 animate-spin" />
                  <ShieldCheck className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <p className="font-mono tracking-widest text-sm uppercase">Decrypting Vault...</p>
              </div>
            ) : isError ? (
              <VaultCard>
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-destructive/20">
                    <Skull className="w-10 h-10 text-destructive" />
                  </div>
                  <h2 className="text-2xl font-bold font-mono text-destructive mb-4">NOT FOUND OR DESTROYED</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    {error?.message || "This secret does not exist. It may have already been viewed and destroyed, or the link is invalid."}
                  </p>
                </div>
              </VaultCard>
            ) : (
              <VaultCard className="border-primary/30 shadow-[0_0_40px_-15px_hsl(var(--primary))]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <h2 className="font-mono font-bold text-lg text-foreground tracking-wider">VAULT DECRYPTED</h2>
                  </div>
                  <span className="font-mono text-xs text-destructive animate-pulse bg-destructive/10 px-3 py-1 rounded-full border border-destructive/20">
                    DESTROYED ON SERVER
                  </span>
                </div>
                
                {renderContent()}

                <div className="mt-8 text-center">
                  <p className="text-xs text-muted-foreground font-mono bg-secondary/50 py-3 rounded-lg border border-white/5">
                    This data exists only in your current browser memory. Refreshing will lose it permanently.
                  </p>
                </div>
              </VaultCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
