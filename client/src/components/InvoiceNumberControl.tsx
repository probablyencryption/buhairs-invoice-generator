import { useState } from "react";
import { RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

interface InvoiceNumberControlProps {
  currentNumber: number;
  onRefresh: () => void;
}

export function InvoiceNumberControl({ currentNumber, onRefresh }: InvoiceNumberControlProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async (invoiceNumber: number) => {
      const response = await apiRequest("PATCH", "/api/settings/last-invoice", { invoiceNumber });
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invoice number updated",
        description: "The last invoice number has been successfully updated.",
      });
      setIsEditDialogOpen(false);
      setNewNumber("");
      onRefresh();
      queryClient.invalidateQueries({ queryKey: ["/api/settings/last-invoice"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update",
        description: error.message || "Could not update invoice number",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setNewNumber(currentNumber.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdate = () => {
    const num = parseInt(newNumber);
    if (isNaN(num)) {
      toast({
        title: "Invalid number",
        description: "Please enter a valid invoice number",
        variant: "destructive",
      });
      return;
    }
    if (num < 2799) {
      toast({
        title: "Invalid number",
        description: "Invoice number cannot be less than 2799",
        variant: "destructive",
      });
      return;
    }
    if (num < currentNumber) {
      toast({
        title: "Invalid number",
        description: `Invoice number cannot be less than current number (${currentNumber})`,
        variant: "destructive",
      });
      return;
    }
    updateMutation.mutate(num);
  };

  return (
    <>
      <div className="flex gap-1">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={onRefresh}
          data-testid="button-refresh-invoice"
          title="Refresh to see latest invoice number"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleEdit}
          data-testid="button-edit-invoice"
          title="Edit invoice number"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Invoice Number</DialogTitle>
            <DialogDescription>
              Update the last invoice number. The next invoice will use this number + 1.
              Note: You cannot set a number lower than the current value ({currentNumber}).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invoiceNumber">Last Invoice Number</Label>
              <Input
                id="invoiceNumber"
                type="number"
                min={2799}
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
                placeholder="Enter invoice number"
                data-testid="input-invoice-number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
              data-testid="button-save-invoice"
            >
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
