import React from "react";
import { Typography, Button } from "@material-tailwind/react";
import { InboxIcon } from "@heroicons/react/24/outline";

export function EmptyState({ icon: Icon = InboxIcon, title = "No data", message, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-zinc-400" />
      </div>
      <Typography variant="h6" className="text-zinc-700 font-bold mb-1">{title}</Typography>
      {message && (
        <Typography variant="small" className="text-zinc-400 font-medium max-w-sm">{message}</Typography>
      )}
      {action && onAction && (
        <Button size="sm" className="mt-4 normal-case" color="indigo" onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
