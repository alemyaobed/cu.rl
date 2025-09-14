import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

const spinnerVariants = "text-muted-foreground animate-spin";

export const Spinner = ({ className }: { className?: string }) => {
  return <Loader className={cn(spinnerVariants, className)} />;
};
