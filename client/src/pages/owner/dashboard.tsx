import { useQuery } from "@tanstack/react-query";
import StatsCard from "@/components/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Star, Users } from "lucide-react";
import RatingStars from "@/components/rating-stars";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserWithRating = {
  id: number;
  name: string;
  email: string;
  rating: number;
  createdAt: string; // This will be a date string
};

type DashboardData = {
  store: {
    id: number;
    name: string;
    email: string;
    address: string;
  };
  averageRating: number;
  ratingCount: number;
  usersWithRatings: UserWithRating[];
};

export default function OwnerDashboard() {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UserWithRating;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/owner/dashboard"],
  });
  
  // Handle sorting
  const handleSort = (key: keyof UserWithRating) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === "asc" 
          ? "desc" 
          : "asc",
    });
  };
  
  // Filter and sort users with ratings
  const filteredAndSortedUsers = data?.usersWithRatings
    ? [...data.usersWithRatings]
        .filter(user => {
          if (ratingFilter === "all") return true;
          return user.rating === parseInt(ratingFilter);
        })
        .sort((a, b) => {
          if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        })
    : [];
  
  // Format date string for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">Store Dashboard</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
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
              title="Store Name"
              value={data?.store.name || ""}
              icon={Store}
              iconColor="text-accent"
              iconBgColor="bg-amber-100"
            />
            
            <StatsCard
              title="Average Rating"
              value={data?.averageRating.toFixed(1) || "0.0"}
              icon={Star}
              iconColor="text-success"
              iconBgColor="bg-green-100"
            />
            
            <StatsCard
              title="Total Reviews"
              value={data?.ratingCount || 0}
              icon={Users}
              iconColor="text-primary"
              iconBgColor="bg-blue-100"
            />
          </>
        )}
      </div>
      
      <Card>
        <CardHeader className="border-b border-slate-200 flex flex-row justify-between items-center p-4">
          <CardTitle className="text-lg">User Ratings</CardTitle>
          <Select
            value={ratingFilter}
            onValueChange={setRatingFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
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
                      User
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
                    className="text-center cursor-pointer"
                    onClick={() => handleSort("rating")}
                  >
                    <div className="flex items-center justify-center">
                      Rating
                      {sortConfig.key === "rating" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="hidden md:table-cell cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === "createdAt" && (
                        <span className="ml-1">
                          {sortConfig.direction === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Show skeleton loaders when loading
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-4 w-20 mx-auto" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Show actual users when loaded
                  filteredAndSortedUsers.length > 0 ? (
                    filteredAndSortedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-slate-50">
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center text-accent">
                            <RatingStars value={user.rating} readOnly size="sm" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-slate-500 text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-slate-500">
                        No ratings found
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination would go here */}
          {!isLoading && filteredAndSortedUsers.length > 0 && (
            <div className="p-4 border-t border-slate-200 flex justify-between">
              <div className="text-sm text-slate-500">
                Showing {filteredAndSortedUsers.length} of {data?.usersWithRatings.length || 0} ratings
              </div>
              {/* Add pagination buttons here if needed */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
