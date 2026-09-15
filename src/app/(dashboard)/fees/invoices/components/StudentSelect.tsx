/* eslint-disable no-console */
// components/StudentSelect.tsx
import { useEffect, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import registrationService, { type RegistrationData } from "@/services/registrations";

interface Props {
  value: number | null;
  onChange: (id: number) => void;
}

export default function StudentSelect({ value, onChange }: Props) {
  const [students, setStudents] = useState<RegistrationData[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    registrationService.getAll().then(setStudents).catch(console.error);
  }, []);

  const selectedStudent = students.find((s) => String(s.id) === String(value));

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Student</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            className={cn(
              "w-full flex justify-between items-center rounded-md border border-input bg-background px-3 py-2 text-sm",
              !selectedStudent && "text-muted-foreground"
            )}
          >
            {selectedStudent
              ? `${selectedStudent.first_name} ${selectedStudent.middle_name || ""} ${selectedStudent.last_name}`
              : "Select student"}
            <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search student..." />
            <CommandEmpty>No student found.</CommandEmpty>
            <CommandGroup>
              {students.filter(student => student.id !== undefined).map((student) => (
                <CommandItem
                  key={student.id}
                  value={student.id!.toString()}
                  onSelect={() => {
                    onChange(Number(student.id));
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      String(student.id) === String(selectedStudent?.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {student.first_name} {student.middle_name || ""} {student.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

