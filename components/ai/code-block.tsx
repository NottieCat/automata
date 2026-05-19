import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// 🌟 FIXED: Only importing the two components that actually exist in your file!
import CodeBlock from "@/components/ai/code-block"
import CodeBlockCopyButton from "@/components/ai/code-block"

type Props = {
    openDialog: boolean,
    setOpenDialog: (open: boolean) => void
}

function PublishCode({openDialog, setOpenDialog}: Props) {
  // A dummy code string to test the component
  const sampleCode = `const agent = new Agent({
  name: "Weather Agent",
  tools: [weatherApiTool]
});`;

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Get Code</DialogTitle>
          <DialogDescription>
            Copy the code below to integrate this agent into your application.
          </DialogDescription>
        </DialogHeader>
        
        {/* 🌟 NEW USAGE: This is how you use your specific version of the Code Block */}
        <div className="mt-4">
          <CodeBlock code={sampleCode} language="typescript" showLineNumbers>
            <CodeBlockCopyButton />
          </CodeBlock>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default PublishCode;