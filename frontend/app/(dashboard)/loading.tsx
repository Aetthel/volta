import { Skeleton } from "@/components/ui/volta-ui";

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 md:ml-[240px]">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
      </div>
      <Skeleton className="h-[450px] w-full rounded-2xl" />
    </div>
  );
}
