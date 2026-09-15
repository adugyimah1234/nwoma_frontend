/* eslint-disable @next/next/no-assign-module-variable */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
'use client';

import { useState, useEffect, Fragment } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllUsers } from '@/services/users';
import { getUserModuleAccess, updateModuleAccess, getAllModules } from '@/services/modules';
import { useToast } from '@/hooks/use-toast';
import { type Module } from '@/types/module';
import { type User } from '@/types/user';

// Type for pending updates to show loading state per checkbox
interface PendingUpdate {
  moduleId: string;
  isPending: boolean;
}

export default function ModuleAccess() {
  // State
  const [users, setUsers] = useState<User[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [moduleAccess, setModuleAccess] = useState<Record<string, boolean>>({});
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate[]>([]);
  
  // Loading states
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingAccess, setIsLoadingAccess] = useState(false);
  
  // Error states
  const [userError, setUserError] = useState<string | null>(null);
  const [moduleError, setModuleError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Load users and modules on component mount
  useEffect(() => {
    fetchUsers();
    fetchModules();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load user module access when user is selected
  useEffect(() => {
    if (selectedUser) {
      fetchUserModuleAccess(selectedUser);
    } else {
      // Clear module access if no user is selected
      setModuleAccess({});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  /**
   * Fetch all users
   */
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      setUserError(null);
      const data = await getAllUsers();
      setUsers(data.map((user: any) => ({
        ...user,
        name: user.name || '',
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString()
      })));
    } catch (error: any) {
      setUserError("Failed to fetch users. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive"
      });
      console.error("Error fetching users:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  /**
   * Fetch all modules
   */
  const fetchModules = async () => {
    try {
      setIsLoadingModules(true);
      setModuleError(null);
      const data = await getAllModules();
      setModules(data);
    } catch (error: any) {
      setModuleError("Failed to fetch modules. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch modules. Please try again.",
        variant: "destructive"
      });
      console.error("Error fetching modules:", error);
    } finally {
      setIsLoadingModules(false);
    }
  };

  /**
   * Fetch module access for a specific user
   */
  const fetchUserModuleAccess = async (userId: string) => {
    try {
      setIsLoadingAccess(true);
      setAccessError(null);
      const data = await getUserModuleAccess(userId);
      setModuleAccess(data);
    } catch (error: any) {
      setAccessError("Failed to fetch module access. Please try again.");
      toast({
        title: "Error",
        description: "Failed to fetch module access. Please try again.",
        variant: "destructive"
      });
      console.error("Error fetching module access:", error);
    } finally {
      setIsLoadingAccess(false);
    }
  };

  /**
   * Handle user selection change
   */
  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
  };

  /**
   * Handle module access toggle
   */
  const handleModuleToggle = async (moduleId: string, checked: boolean) => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Add to pending updates
      setPendingUpdates(prev => [...prev, { moduleId, isPending: true }]);
      
      // Optimistic update
      setModuleAccess(prev => ({
        ...prev,
        [moduleId]: checked
      }));
      
      // If toggling a parent module on, also toggle all children
      const parentModule = modules.find(m => m.id === moduleId);
      if (parentModule?.children && checked) {
        const updatedAccess = { ...moduleAccess, [moduleId]: checked };
        parentModule.children.forEach(child => {
          updatedAccess[child.id] = checked;
        });
        setModuleAccess(updatedAccess);
      }
      
      // If toggling a parent module off, also toggle all children off
      if (parentModule?.children && !checked) {
        const updatedAccess = { ...moduleAccess, [moduleId]: checked };
        parentModule.children.forEach(child => {
          updatedAccess[child.id] = false;
        });
        setModuleAccess(updatedAccess);
      }
      
      // If toggling a child module on, ensure parent is on
      if (checked) {
        for (const module of modules) {
          if (module.children?.some(child => child.id === moduleId)) {
            setModuleAccess(prev => ({
              ...prev,
              [module.id]: true
            }));
            break;
          }
        }
      }
      
      // Update in backend
      await updateModuleAccess(selectedUser, moduleId, checked);
      
      toast({
        title: "Success",
        description: `Module access ${checked ? 'granted' : 'revoked'} successfully`,
        variant: "default"
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setModuleAccess(prev => ({
        ...prev,
        [moduleId]: !checked
      }));
      
      toast({
        title: "Error",
        description: "Failed to update module access",
        variant: "destructive"
      });
      console.error("Error updating module access:", error);
    } finally {
      // Remove from pending updates
      setPendingUpdates(prev => prev.filter(update => update.moduleId !== moduleId));
    }
  };
  
  /**
   * Check if a module update is pending
   */
  const isUpdatePending = (moduleId: string): boolean => {
    return pendingUpdates.some(update => update.moduleId === moduleId && update.isPending);
  };

  /**
   * Refresh user module access
   */
  const refreshModuleAccess = () => {
    if (selectedUser) {
      fetchUserModuleAccess(selectedUser);
    }
  };
  
  /**
   * Refresh all data
   */
  const refreshAll = () => {
    fetchUsers();
    fetchModules();
    if (selectedUser) {
      fetchUserModuleAccess(selectedUser);
    }
  };

  /**
   * Find a user by ID
   */
  const getUserById = (userId: string): User | undefined => {
    return users.find(user => user.id === userId);
  };

  // Get the selected user details
  const selectedUserDetails = selectedUser ? getUserById(selectedUser) : undefined;
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <PageHeader
        title="Module Access Control"
        description="Fine-grained user permission management for system features."
        breadcrumbs={[
          { title: 'Home', href: '/' },
          { title: 'Admin', href: '/admin' },
          { title: 'Module Access' }
        ]}
      />

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Access Configuration</CardTitle>
              <CardDescription>
                Toggle system modules for individual user accounts.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshAll}
              disabled={isLoadingUsers || isLoadingModules || isLoadingAccess}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${(isLoadingUsers || isLoadingModules || isLoadingAccess) ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
        {/* Error display for users */}
        {userError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{userError}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchUsers} 
              className="mt-2"
              disabled={isLoadingUsers}
            >
              {isLoadingUsers ? <Spinner className="mr-2" /> : null}
              Retry
            </Button>
          </Alert>
        )}
        
        {/* Error display for modules */}
        {moduleError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{moduleError}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchModules} 
              className="mt-2"
              disabled={isLoadingModules}
            >
              {isLoadingModules ? <Spinner className="mr-2" /> : null}
              Retry
            </Button>
          </Alert>
        )}

        {/* User selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select User</label>
          {isLoadingUsers ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-[300px]" />
            </div>
          ) : users.length === 0 ? (
            <Alert variant="default" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>No Users Found</AlertTitle>
              <AlertDescription>No users available. Please add users to manage module access.</AlertDescription>
            </Alert>
          ) : (
            <Select onValueChange={handleUserChange} value={selectedUser}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Selected user info */}
        {selectedUser && selectedUserDetails && (
          <div className="mb-6 p-4 border rounded-md bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-medium">{selectedUserDetails.name}</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                {selectedUserDetails.role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{selectedUserDetails.email}</p>
          </div>
        )}
        
        {/* Error display for module access */}
        {accessError && selectedUser && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{accessError}</AlertDescription>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshModuleAccess} 
              className="mt-2"
              disabled={isLoadingAccess}
            >
              {isLoadingAccess ? <Spinner className="mr-2" /> : null}
              Retry
            </Button>
          </Alert>
        )}
        
        {/* Module access table */}
        {selectedUser ? (
          isLoadingAccess || isLoadingModules ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : modules.length === 0 ? (
            <Alert variant="default" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>No Modules Found</AlertTitle>
              <AlertDescription>No modules available in the system.</AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px] text-center">Access</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map(module => (
                  <Fragment key={module.id}>
                    <TableRow>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell>{module.description}</TableCell>
                      <TableCell className="text-center">
                        {isUpdatePending(module.id) ? (
                          <Spinner className="h-4 w-4 mx-auto" />
                        ) : (
                          <Checkbox
                            checked={moduleAccess[module.id] || false}
                            onCheckedChange={(checked) => 
                              handleModuleToggle(module.id, checked === true)
                            }
                            aria-label={`Toggle access to ${module.name}`}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    {module.children?.map(subModule => (
                      <TableRow key={subModule.id} className="bg-muted/50">
                        <TableCell className="pl-8 flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">└─</span>
                          {subModule.name}
                        </TableCell>
                        <TableCell>{subModule.description || `Sub-module of ${module.name}`}</TableCell>
                        <TableCell className="text-center">
                          {isUpdatePending(subModule.id) ? (
                            <Spinner className="h-4 w-4 mx-auto" />
                          ) : (
                            <Checkbox
                              checked={moduleAccess[subModule.id] || false}
                              onCheckedChange={(checked) => 
                                handleModuleToggle(subModule.id, checked === true)
                              }
                              disabled={!moduleAccess[module.id]}
                              aria-label={`Toggle access to ${subModule.name}`}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          )
        ) : (
          <Alert variant="default" className="mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>No User Selected</AlertTitle>
            <AlertDescription>Please select a user to manage their module access.</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
    </div>
  );
}
