import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h2>Hello </h2>
      <Button>Click Me</Button>
      <UserButton />
    </div>
  );
}
