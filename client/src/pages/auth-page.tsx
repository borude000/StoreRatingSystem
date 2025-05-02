import { useState, useEffect } from "react";
import { useAuth, useRedirectByRole } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { InsertUser, UserRole, insertUserSchema } from "@shared/schema";
import { Star, Store, UserCheck } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  const homeRoute = user ? useRedirectByRole(user) : "/auth";
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(homeRoute);
    }
  }, [user, navigate, homeRoute]);
  
  // Login form schema
  const loginSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
  });
  
  // Register form schema with validation from schema.ts
  const registerSchema = insertUserSchema.extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      address: "",
      role: UserRole.USER,
    },
  });
  
  // Login handler
  const onLogin = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };
  
  // Register handler
  const onRegister = (data: z.infer<typeof registerSchema>) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData as InsertUser);
  };
  
  // If still checking auth status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Hero/Info Section */}
        <div className="lg:w-1/2 bg-primary p-12 text-white flex flex-col justify-center">
          <div className="mb-8 flex items-center">
            <Star className="h-10 w-10 text-white" />
            <h1 className="text-3xl font-bold ml-3">StoreRatings</h1>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Welcome to the Store Rating Platform
          </h2>
          
          <p className="text-lg mb-8 text-blue-100">
            A place where users can discover and rate stores, owners can manage 
            their store profiles, and administrators can oversee the platform.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <UserCheck className="h-6 w-6 mr-4 text-blue-200" />
              <div>
                <h3 className="font-medium">For Users</h3>
                <p className="text-blue-100">Discover and rate your favorite stores</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Store className="h-6 w-6 mr-4 text-blue-200" />
              <div>
                <h3 className="font-medium">For Store Owners</h3>
                <p className="text-blue-100">Monitor customer ratings and feedback</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Auth Forms */}
        <div className="lg:w-1/2 p-12">
          <Tabs 
            defaultValue="login" 
            className="w-full" 
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access the platform
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging in...
                          </>
                        ) : (
                          "Sign In"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                
                <CardFooter className="flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 mt-2">
                    Don't have an account?{" "}
                    <a 
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => setActiveTab("register")}
                    >
                      Register here
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create a new account</CardTitle>
                  <CardDescription>
                    Fill in your details to register on the platform
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <p className="text-xs text-slate-500">
                              Must be between 20 and 60 characters
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input placeholder="Choose a username" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="you@example.com" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter your address" 
                                {...field} 
                              />
                            </FormControl>
                            <p className="text-xs text-slate-500">
                              Maximum 400 characters
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                              </FormControl>
                              <p className="text-xs text-slate-500">
                                8-16 characters, at least 1 uppercase letter and 1 special character
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <div className="flex space-x-4">
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="role-user"
                                  value={UserRole.USER}
                                  checked={field.value === UserRole.USER}
                                  onChange={() => field.onChange(UserRole.USER)}
                                  className="mr-2"
                                />
                                <label htmlFor="role-user">Normal User</label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id="role-owner"
                                  value={UserRole.STORE_OWNER}
                                  checked={field.value === UserRole.STORE_OWNER}
                                  onChange={() => field.onChange(UserRole.STORE_OWNER)}
                                  className="mr-2"
                                />
                                <label htmlFor="role-owner">Store Owner</label>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                
                <CardFooter className="flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 mt-2">
                    Already have an account?{" "}
                    <a 
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => setActiveTab("login")}
                    >
                      Login here
                    </a>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
