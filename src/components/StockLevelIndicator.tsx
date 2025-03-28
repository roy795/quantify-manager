
import { Progress } from "@/components/ui/progress";

interface StockLevelIndicatorProps {
  current: number;
  minimum: number;
  showText?: boolean;
}

const StockLevelIndicator = ({ 
  current, 
  minimum, 
  showText = true 
}: StockLevelIndicatorProps) => {
  // Calculate percentage (if we consider min as 0% and double min as 100%)
  const maxLevel = minimum * 3; // Arbitrary max level for visualization
  let percentage = (current / maxLevel) * 100;
  percentage = Math.min(100, Math.max(0, percentage)); // Clamp between 0-100
  
  const getColorClass = () => {
    if (current <= minimum) return "bg-red-500";
    if (current <= minimum * 1.5) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <div className="w-full">
      <Progress value={percentage} className={getColorClass()} />
      {showText && (
        <div className="flex justify-between mt-1 text-xs">
          <span className={current <= minimum ? "low-stock-alert" : ""}>
            Current: {current}
          </span>
          <span>Min: {minimum}</span>
        </div>
      )}
    </div>
  );
};

export default StockLevelIndicator;
