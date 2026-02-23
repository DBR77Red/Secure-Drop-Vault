import { HTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface VaultCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function VaultCard({ children, title, description, className = "", ...props }: VaultCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`w-full max-w-xl mx-auto ${className}`}
      {...props}
    >
      <div className="glass-panel rounded-2xl vault-shadow overflow-hidden relative">
        {/* Subtle top highlight */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="p-6 md:p-8">
          {(title || description) && (
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 border border-primary/20">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              {title && <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>}
              {description && <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function VaultButton({ 
  children, 
  variant = "primary", 
  isLoading = false,
  className = "",
  ...props 
}: HTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger", isLoading?: boolean, disabled?: boolean }) {
  
  const baseStyles = "relative w-full py-4 px-6 rounded-xl font-mono font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_-5px_hsl(var(--primary))] hover:shadow-[0_0_30px_-5px_hsl(var(--primary))]",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5",
    danger: "bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Glare effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg]" />
      
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          PROCESSING...
        </span>
      ) : children}
    </button>
  );
}

