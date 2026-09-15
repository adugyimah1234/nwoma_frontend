"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import schoolService from "@/services/schools";
import studentService from "@/services/students";
import { School } from "@/types/school";
import { useToast } from "@/hooks/use-toast";

interface ChangeSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  admissionId: string;
  currentSchoolId: string;
  onSchoolChanged: () => void;
}

export function ChangeSchoolDialog({
  isOpen,
  onClose,
  admissionId,
  currentSchoolId,
  onSchoolChanged,
}: ChangeSchoolDialogProps) {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(currentSchoolId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      schoolService
        .getAll()
        .then((data) => {
          setSchools(data);
        })
        .catch((err) => {
          setError("Failed to load schools.");
          console.error("Failed to load schools:", err);
          toast({
            title: "Error",
            description: "Failed to load schools.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, toast]);

  const handleSave = async () => {
    if (!selectedSchoolId || selectedSchoolId === currentSchoolId) {
      toast({
        title: "No Change",
        description: "Please select a different school.",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await studentService.updatePartial(admissionId, {
        school_id: selectedSchoolId,
      });
      toast({
        title: "Success",
        description: "School updated successfully.",
      });
      onSchoolChanged();
      onClose();
    } catch (err) {
      setError("Failed to update school.");
      console.error("Failed to update school:", err);
      toast({
        title: "Error",
        description: "Failed to update school.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change School</DialogTitle>
          <DialogDescription>
            Select a new school for the admitted student.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="school" className="text-right">
              School
            </Label>
            <Select
              onValueChange={setSelectedSchoolId}
              value={selectedSchoolId}
              disabled={loading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a school" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <SelectItem value="loading" disabled>
                    Loading schools...
                  </SelectItem>
                ) : error ? (
                  <SelectItem value="error" disabled>
                    {error}
                  </SelectItem>
                ) : (
                  schools.map((school) => (
                    <SelectItem key={school.id} value={String(school.id)}>
                      {school.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

