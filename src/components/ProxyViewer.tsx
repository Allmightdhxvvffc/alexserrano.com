import { X, ExternalLink } from "lucide-react";

interface ProxyViewerProps {
  html: string;
  url: string;
  onClose: () => void;
}

const ProxyViewer = ({ html, url, onClose }: ProxyViewerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 px-3 py-1.5 bg-secondary rounded-md font-mono text-xs text-secondary-foreground truncate">
          {url}
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Content */}
      <iframe
        srcDoc={html}
        className="flex-1 w-full bg-white"
        sandbox="allow-same-origin allow-scripts allow-forms"
        title="Proxied content"
      />
    </div>
  );
};

export default ProxyViewer;
