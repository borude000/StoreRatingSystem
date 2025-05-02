import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Users, Star } from "lucide-react";
import RatingStars from "@/components/rating-stars";
import { useState } from "react";

type StoreWithRating = {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
};

export default function AdminDashboard() {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StoreWithRating;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
  });
  
  const { 
    data: stores, 
    isLoading: isLoadingStores 
  } = useQuery<StoreWithRating[]>({
    queryKey: ["/api/admin/stores"],
  });
  
  // Handle sorting
  const handleSort = (key: keyof StoreWithRating) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === "asc" 
          ? "desc" 
          : "asc",
    });
  };
  
  // Sort stores based on current config
  const sortedStores = stores ? [...stores].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  }) : [];
  
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoadingStats ? (
          // Show skeleton loaders when loading
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          // Show actual stats when loaded
          <>
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              iconColor="text-primary"
              iconBgColor="bg-blue-100"
              trend={{ value: 12, isIncrease: true }}
            />
            
            <StatsCard
              title="Total Stores"
              value={stats?.totalStores || 0}
              icon={Store}
              iconColor="text-accent"
              iconBgColor="bg-amber-100"
              trend={{ value: 8, isIncrease: true }}
            />
            
            <StatsCard
              title="Total Ratings"
              value={stats?.totalRatings || 0}
              icon={Star}
              iconColor="text-success"
              iconBgColor="bg-green-100"
              trend={{ value: 24, isIncrease: true }}
            />
          </>
        )}
      </div>
      
      <Card>
        <CardHeader className="border-b border-slate-200 flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Recent Stores</CardTitle>
          <a 
            href="/admin/stores" 
            className="text-primary hover:text-sky-700 text-sm font-medium"
          >
            View All
          </a>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name 
                      {sortConfig.key === "name" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {sortConfig.key === "email" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden md:table-cell cursor-pointer"
                    onClick={() => handleSort("address")}
                  >
                    <div className="flex items-center">
                      Address
                      {sortConfig.key === "address" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort("averageRating")}
                  >
                    <div className="flex items-center">
                      Rating
                      {sortConfig.key === "averageRating" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingStores ? (
                  // Show skeleton loaders when loading
                  Array(4).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Show actual stores when loaded
                  sortedStores.slice(0, 5).map((store) => (
                    <TableRow key={store.id} className="hover:bg-slate-50">
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{store.address}</TableCell>
                      <TableCell className="text-accent">
                        <div className="flex items-center">
                          <RatingStars value={store.averageRating} readOnly size="sm" />
                          <span className="ml-2">{store.averageRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {!isLoadingStores && sortedStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                      No stores found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
