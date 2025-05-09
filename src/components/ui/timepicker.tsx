import * as React from "react";
import { TimePicker } from "@mui/x-date-pickers/TimePicker"; // Assuming Material-UI TimePicker
import { ChevronDown } from "lucide-react"; // For dropdown icon
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface TimePickerProps {
  value: Date | null;
  onChange: (newDate: Date | null) => void;
  errors?: { date?: boolean };
  formData: { date: Date | null };
  handleDateChange: (updatedDate: Date) => void;
}

function StyledTimePicker({
  value,
  onChange,
  errors,
  formData,
  handleDateChange,
}: TimePickerProps) {
  return (
    <div className={cn("p-3", "bg-background rounded-md")}>
      <TimePicker
        value={value || null}
        onChange={(newDate) => {
          if (newDate && formData.date) {
            const updatedDate = new Date(formData.date);
            updatedDate.setHours(newDate.getHours());
            updatedDate.setMinutes(newDate.getMinutes());
            handleDateChange(updatedDate);
          }
        }}
        slotProps={{
          textField: {
            size: "small",
            className: cn(
              "w-full border rounded-md",
              "text-sm font-normal text-foreground",
              "bg-background hover:bg-accent/50 focus:bg-accent",
              "focus-within:ring-1 focus-within:ring-primary",
              errors?.date && "border-destructive focus-within:ring-destructive",
              "h-9 px-3 py-0"
            ),
          },
          popper: {
            className: cn(
              "bg-background border rounded-md shadow-md",
              "text-sm font-normal text-foreground"
            ),
          },
          digitalClockItem: {
            className: cn(
              "space-y-2 p-3",
              "text-sm font-normal text-foreground"
            ),
          },
          actionBar: {
            className: cn("flex justify-end space-x-2 p-2"),
            actions: ["accept", "cancel"],
          },
        }}
        sx={{
          "& .MuiButton-text": {
            "&.Mui-selected": {
              color: "primary.main",
            },
          },
        }}
        slots={{
          openPickerIcon: () => <ChevronDown className="h-4 w-4 text-muted-foreground" />,
        }}
      />
    </div>
  );
}

StyledTimePicker.displayName = "StyledTimePicker";

export { StyledTimePicker };