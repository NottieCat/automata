import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react"; // Using Lucide for the copy icon

type Props = {
    openDialog: boolean,
    setOpenDialog: (open: boolean) => void
}

function PublishCode({ openDialog, setOpenDialog }: Props) {
  const sampleCode = `function MyComponent(props) {
  return (
    <div>
      <h1>Hello, {props.name}!</h1>
      <p>This is an example React component.</p>
    </div>
  );
}`;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Get Code</DialogTitle>
          <DialogDescription>
            Copy the code below to integrate this component into your application.
          </DialogDescription>
        </DialogHeader>
        
        {/* Custom Tailwind Code Block (Bypasses the broken component!) */}
        <div className="mt-4 w-full rounded-md border bg-muted/30 overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b px-4 py-2 bg-muted/50">
            <span className="text-xs font-mono text-muted-foreground flex items-center gap-2">
               MyComponent.jsx
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
              <span>jsx</span>
              <button 
                onClick={() => navigator.clipboard.writeText(sampleCode)}
                className="hover:text-foreground transition-colors"
                title="Copy code"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Code Content */}
          <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground">
            <code>{sampleCode}</code>
          </pre>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default PublishCode;