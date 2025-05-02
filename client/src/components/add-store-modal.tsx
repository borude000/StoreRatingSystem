import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertStore, insertStoreSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AddStoreModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AddStoreModal({ isOpen, onClose }: AddStoreModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertStore & { ownerEmail?: string }>({
    resolver: zodResolver(insertStoreSchema.extend({
      ownerEmail: insertStoreSchema.shape.email.optional(),
    })),
    defaultValues: {
      name: "",
      email: "",
      address: "",
      ownerEmail: "",
    },
  });
  
  const createStoreMutation = useMutation({
    mutationFn: async (storeData: InsertStore & { ownerEmail?: string }) => {
      const res = await apiRequest("POST", "/api/admin/stores", storeData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Store created",
        description: "The store has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Store creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: InsertStore & { ownerEmail?: string }) => {
    createStoreMutation.mutate(data);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Store name" />
                  </FormControl>
                  <p className="text-xs text-slate-500">Must be between 20 and 60 characters</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="store@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Store address" />
                  </FormControl>
                  <p className="text-xs text-slate-500">Maximum 400 characters</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Owner Email (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="owner@example.com" />
                  </FormControl>
                  <p className="text-xs text-slate-500">If the owner already exists, they will be associated with this store</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createStoreMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createStoreMutation.isPending}
              >
                {createStoreMutation.isPending ? "Creating..." : "Add Store"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
