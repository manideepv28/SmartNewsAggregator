import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginUser, registerUser } from "@/lib/news-api";
import { setCurrentUser, getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, LogOut } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthModalProps {
  onClose: () => void;
  onUserChange: (user: any) => void;
}

export default function AuthModal({ onClose, onUserChange }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(!!getCurrentUser());
  const currentUser = getCurrentUser();
  const { toast } = useToast();

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      const response = isLogin 
        ? await loginUser(data.email, data.password)
        : await registerUser(data.email, data.password);
      
      setCurrentUser(response.user);
      onUserChange(response.user);
      
      toast({
        title: isLogin ? "Welcome back!" : "Account created!",
        description: isLogin ? "You have successfully logged in." : "Your account has been created successfully.",
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    onUserChange(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    onClose();
  };

  if (showUserMenu && currentUser) {
    return (
      <Dialog open={true} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <User className="mx-auto h-12 w-12 text-primary mb-2" />
              <p className="font-medium text-slate-900">{currentUser.email}</p>
            </div>
            
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" disabled>
                <Settings className="mr-2 h-4 w-4" />
                Preferences (Coming Soon)
              </Button>
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-600 hover:text-red-700"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to NewsAI</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter your email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
              placeholder="Enter your password"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? "Please wait..." : (isLogin ? "Login" : "Register")}
            </Button>
          </div>
          
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setIsLogin(!isLogin);
                form.reset();
              }}
              className="text-sm"
            >
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
