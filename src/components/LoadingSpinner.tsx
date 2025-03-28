
import { Loader2 } from "lucide-react";

const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 z-50">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium text-muted-foreground">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
