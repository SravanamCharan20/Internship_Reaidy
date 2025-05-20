import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authStore } from "@/store/authStore";
import { toast } from "@/components/ui/sonner";

const AuthForm: React.FC = observer(() => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }
    
    const success = await authStore.login(username, password);
    
    if (success) {
      toast.success("Login successful");
    } else if (authStore.error) {
      toast.error(authStore.error);
    }
  };

  return (
    <Card className="w-full max-w-[95%] sm:max-w-md mx-auto">
      <CardHeader className="space-y-1 p-4 sm:p-6">
        <CardTitle className="text-xl sm:text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center text-sm sm:text-base">
          Enter your credentials to access the chat platform
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
            <Input 
              id="username" 
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="text-sm sm:text-base"
            />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
            <Input 
              id="password" 
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-sm sm:text-base"
            />
          </div>
          <div className="text-[10px] sm:text-xs text-muted-foreground space-y-0.5 sm:space-y-1">
            <p>Demo credentials:</p>
            <p>User: username = "user", password = "password"</p>
            <p>Admin: username = "admin", password = "admin"</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
          <Button
            type="submit"
            className="w-full text-sm sm:text-base py-2 sm:py-2.5"
            disabled={authStore.isLoading}
          >
            {authStore.isLoading ? "Logging in..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
});

export default AuthForm;
