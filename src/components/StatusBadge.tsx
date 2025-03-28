
import { Badge } from "@/components/ui/badge";
import { Status } from "@/types";

interface StatusBadgeProps {
  status: Status;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const getStatusStyles = () => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <Badge variant="outline" className={`${getStatusStyles()} font-medium`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

export default StatusBadge;
