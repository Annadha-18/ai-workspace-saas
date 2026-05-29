"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Settings
        </h1>

        <p className="text-muted-foreground">
          Manage application preferences.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              Dark Mode
            </h3>

            <p className="text-sm text-muted-foreground">
              Toggle dark mode UI
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "Enabled" : "Disabled"}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">
              AI Responses
            </h3>

            <p className="text-sm text-muted-foreground">
              Enable markdown formatting
            </p>
          </div>

          <Button variant="outline">
            Enabled
          </Button>
        </div>
      </div>
    </div>
  );
}