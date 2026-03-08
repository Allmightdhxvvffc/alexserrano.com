import { useState } from "react";
import { Globe, ArrowRight, Shield, Zap, Eye } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ProxyInputProps {
  onResult?: (html: string, url: string) => void;
  onLoading?: (loading: boolean) => void;
}

const ProxyInput = ({ onResult, onLoading }: ProxyInputProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      toast.error("Enter a URL to proxy");
      return;
    }

    setIsLoading(true);
    onLoading?.(true);

    try {
      const { data, error } = await supabase.functions.invoke("proxy-fetch", {
        body: { url: url.trim() },
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
      } else if (data?.html) {
        toast.success(`Loaded: ${data.finalUrl}`);
        onResult?.(data.html, data.finalUrl);
      } else {
        toast.info(`Non-HTML content: ${data?.contentType} (${data?.size} bytes)`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to proxy request");
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur-sm group-focus-within:bg-primary/30 transition-all duration-300 group-focus-within:blur-md" />
        <div className="relative flex items-center bg-card border border-border rounded-lg overflow-hidden">
          <div className="pl-4 text-muted-foreground">
            <Globe className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-transparent px-3 py-4 font-mono text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-4 bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                GO <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-muted-foreground font-mono">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary/70" /> Encrypted
        </span>
        <span className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-primary/70" /> Fast
        </span>
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-primary/70" /> Anonymous
        </span>
      </div>
    </form>
  );
};

export default ProxyInput;
