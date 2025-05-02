import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import RatingStars from "@/components/rating-stars";
import AddStoreModal from "@/components/add-store-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Store = {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
};

export default function AdminStores() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Store;
    direction: "asc" | "desc";
  }>({ key: "name", direction: "asc" });
  
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ["/api/admin/stores"],
  });
  
  const deleteStoreMutation = useMutation({
    mutationFn: async (storeId: number) => {
      await apiRequest("DELETE", `/api/admin/stores/${storeId}`);
    },
    onSuccess: () => {
      toast({
        title: "Store deleted",
        description: "The store has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setStoreToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Store deletion failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle sorting
  const handleSort = (key: keyof Store) => {
    setSortConfig({
      key,
      direction: 
        sortConfig.key === key && sortConfig.direction === "asc" 
          ? "desc" 
          : "asc",
    });
  };
  
  // Filter and sort stores
  const filteredAndSortedStores = stores 
    ? [...stores]
        .filter(store => 
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
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
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Manage Stores</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Store
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="border-b border-slate-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-base font-medium">Store List</CardTitle>
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
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Show skeleton loaders when loading
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-64" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-16 mx-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  // Show actual stores when loaded
                  filteredAndSortedStores.map((store) => (
                    <TableRow key={store.id} className="hover:bg-slate-50">
                      <TableCell>{store.name}</TableCell>
                      <TableCell>{store.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{store.address}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <RatingStars value={store.averageRating} readOnly size="sm" />
                          <span className="ml-2 text-accent font-medium">{store.averageRating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button size="sm" variant="ghost" className="text-primary hover:text-sky-700" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-destructive hover:text-red-600" 
                            title="Delete"
                            onClick={() => setStoreToDelete(store)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                
                {!isLoading && filteredAndSortedStores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-slate-500">
                      No stores found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination would go here */}
          <div className="p-4 border-t border-slate-200 flex justify-between">
            <div className="text-sm text-slate-500">
              Showing {filteredAndSortedStores.length} of {stores?.length || 0} stores
            </div>
            {/* Add pagination buttons here if needed */}
          </div>
        </CardContent>
      </Card>
      
      <AddStoreModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <AlertDialog 
        open={!!storeToDelete} 
        onOpenChange={() => setStoreToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the store "{storeToDelete?.name}" and all associated ratings.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (storeToDelete) {
                  deleteStoreMutation.mutate(storeToDelete.id);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
