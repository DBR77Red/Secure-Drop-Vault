import { useState, useRef } from "react";
import { useCreateMessage } from "@/hooks/use-messages";
import { VaultCard, VaultButton } from "@/components/VaultCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle2, FileText, Link as LinkIcon, UploadCloud, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type MessageType = "text" | "url" | "file";

export default function Home() {
  const [type, setType] = useState<MessageType>("text");
  const [content, setContent] = useState("");
  const [fileData, setFileData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileType, setFileType] = useState<string>("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createMessage, isPending } = useCreateMessage();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB limit for MVP
      toast({
        title: "File too large",
        description: "Please select a file smaller than 5MB.",
        variant: "destructive"
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setFileName(file.name);
    setFileType(file.type || "application/octet-stream");

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setFileData(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (type === "text" && !content.trim()) return toast({ description: "Please enter a message." });
    if (type === "url" && !content.trim()) return toast({ description: "Please enter a URL." });
    if (type === "file" && !fileData) return toast({ description: "Please select a file." });

    createMessage(
      {
        type,
        content: type !== "file" ? content : undefined,
        fileData: type === "file" ? fileData : undefined,
        fileName: type === "file" ? fileName : undefined,
        fileType: type === "file" ? fileType : undefined,
      },
      {
        onSuccess: (data) => {
          setCreatedId(data.id);
          toast({
            title: "Secret Encrypted",
            description: "Your self-destructing link is ready.",
          });
        },
        onError: (err) => {
          toast({
            title: "Encryption Failed",
            description: err.message,
            variant: "destructive"
          });
        }
      }
    );
  };

  const secretLink = createdId ? `${window.location.origin}/secret/${createdId}` : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(secretLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ description: "Link copied to clipboard!" });
    } catch (err) {
      toast({ description: "Failed to copy link.", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setCreatedId(null);
    setContent("");
    setFileData("");
    setFileName("");
    setFileType("");
    setType("text");
    setCopied(false);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
      <AnimatePresence mode="wait">
        {!createdId ? (
          <VaultCard 
            key="create-form"
            title="Secure Vault" 
            description="Share sensitive data via a self-destructing link. It will be permanently deleted after one view."
          >
            <Tabs 
              value={type} 
              onValueChange={(v) => {
                setType(v as MessageType);
                setContent("");
                setFileData("");
                setFileName("");
              }} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-black/50 border border-white/5 p-1 rounded-xl">
                <TabsTrigger value="text" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-primary font-mono text-xs">
                  <FileText className="w-4 h-4 mr-2" /> TEXT
                </TabsTrigger>
                <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-primary font-mono text-xs">
                  <LinkIcon className="w-4 h-4 mr-2" /> URL
                </TabsTrigger>
                <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-secondary data-[state=active]:text-primary font-mono text-xs">
                  <UploadCloud className="w-4 h-4 mr-2" /> FILE
                </TabsTrigger>
              </TabsList>

              <div className="min-h-[200px] mb-8">
                <TabsContent value="text" className="mt-0 h-full">
                  <Textarea
                    placeholder="Enter your secret message here..."
                    className="min-h-[200px] resize-none bg-black/50 border-white/10 focus-visible:ring-primary/50 font-mono text-sm p-4 rounded-xl placeholder:text-muted-foreground/50"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="url" className="mt-0 h-full flex flex-col justify-center">
                  <Label className="mb-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">Secret URL</Label>
                  <Input
                    type="url"
                    placeholder="https://..."
                    className="bg-black/50 border-white/10 focus-visible:ring-primary/50 font-mono h-14 rounded-xl px-4"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </TabsContent>

                <TabsContent value="file" className="mt-0 h-full flex flex-col items-center justify-center bg-black/30 border border-dashed border-white/10 rounded-xl relative group hover:border-primary/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                  />
                  <div className="text-center p-6 flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    {fileName ? (
                      <>
                        <p className="font-mono text-sm text-primary mb-1 break-all line-clamp-1">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Click to replace</p>
                      </>
                    ) : (
                      <>
                        <p className="font-mono text-sm text-foreground mb-1">Select a file to encrypt</p>
                        <p className="text-xs text-muted-foreground max-w-[200px]">Drag and drop or click to browse. Max 5MB.</p>
                      </>
                    )}
                  </div>
                </TabsContent>
              </div>

              <VaultButton 
                onClick={handleSubmit} 
                isLoading={isPending}
                disabled={isPending || (type === 'text' && !content) || (type === 'url' && !content) || (type === 'file' && !fileData)}
              >
                Generate Secret Link
              </VaultButton>
              
              <div className="mt-6 flex items-start gap-3 text-xs text-muted-foreground bg-secondary/30 p-4 rounded-xl border border-white/5">
                <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
                <p>All encryption happens dynamically. The moment the generated link is opened, the data is permanently wiped from our servers.</p>
              </div>
            </Tabs>
          </VaultCard>
        ) : (
          <VaultCard 
            key="success-form"
            className="text-center"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30 shadow-[0_0_30px_-5px_hsl(var(--primary))]"
            >
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </motion.div>
            
            <h2 className="text-2xl font-bold font-mono mb-2">SECRET GENERATED</h2>
            <p className="text-muted-foreground mb-8 text-sm">
              Copy this link and share it securely. It will work exactly once.
            </p>

            <div className="flex items-center gap-2 bg-black/50 p-2 rounded-xl border border-white/10 mb-8">
              <Input 
                readOnly 
                value={secretLink} 
                className="bg-transparent border-none focus-visible:ring-0 font-mono text-sm text-primary"
              />
              <VaultButton 
                variant="secondary" 
                className="w-auto px-4 py-3 shrink-0"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "COPIED" : "COPY"}
              </VaultButton>
            </div>

            <button 
              onClick={resetForm}
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
            >
              Create another secret
            </button>
          </VaultCard>
        )}
      </AnimatePresence>
    </div>
  );
}
