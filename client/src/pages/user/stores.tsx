import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import StoreCard from "@/components/store-card";
import { Skeleton } from "@/components/ui/skeleton";

type Store = {
  id: number;
  name: string;
  address: string;
  averageRating: number;
  userRating?: number;
};

export default function UserStores() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });
  
  // Filter stores based on search term
  const filteredStores = stores 
    ? stores.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-xl font-bold">Browse Stores</h2>
          <div className="flex w-full md:w-auto">
            <Input
              type="text"
              placeholder="Search stores..."
              className="rounded-r-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="default" className="rounded-l-none">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        // Show skeleton loaders when loading
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center space-x-1">
                  {Array(5).fill(0).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-4 rounded-full" />
                  ))}
                  <Skeleton className="h-4 w-12 ml-2" />
                </div>
                <div className="pt-4 mt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex space-x-1">
                      {Array(5).fill(0).map((_, j) => (
                        <Skeleton key={j} className="h-4 w-4 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full mt-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show actual stores when loaded
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                id={store.id}
                name={store.name}
                address={store.address}
                averageRating={store.averageRating}
                ratingCount={store.ratingCount || 0}
                userRating={store.userRating}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-slate-500">
              No stores found matching your search criteria
            </div>
          )}
        </div>
      )}
      
      {/* Pagination would go here */}
      {!isLoading && filteredStores.length > 0 && (
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-1">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
