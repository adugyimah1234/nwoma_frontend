import { type FC } from 'react';
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateInvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateInvoiceForm: FC<CreateInvoiceFormProps> = ({ onSuccess, onCancel }) => {
  // Add form implementation here
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      // Add form submission logic
      onSuccess();
    }}>
      <div className="grid gap-4 py-4">
        {/* Student selection */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="student" className="text-right">
            Student
          </Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student1">John Doe</SelectItem>
              <SelectItem value="student2">Jane Smith</SelectItem>
              <SelectItem value="student3">Michael Johnson</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Invoice type */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="invoice-type" className="text-right">
            Invoice Type
          </Label>
          <Select>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select invoice type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tuition">Tuition Fee</SelectItem>
              <SelectItem value="assessment">Assessment Fee</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="materials">Study Materials</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Amount */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="0.00"
            className="col-span-3"
          />
        </div>
        
        {/* Due date */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="due-date" className="text-right">
            Due Date
          </Label>
          <Input
            id="due-date"
            type="date"
            className="col-span-3"
          />
        </div>
        
        {/* Description */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea
            id="description"
            placeholder="Enter invoice details"
            className="col-span-3"
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Invoice</Button>
      </DialogFooter>
    </form>
  );
};

