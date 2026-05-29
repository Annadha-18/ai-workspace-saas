"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const res = await fetch("/api/profile");

    if (!res.ok) return;

    const data = await res.json();

    setForm({
      full_name: data.full_name || "",
      bio: data.bio || "",
      avatar_url: data.avatar_url || "",
    });
  }

  async function saveProfile() {
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to save profile");
      return;
    }

    alert("Profile updated");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Profile
        </h1>

        <p className="text-muted-foreground">
          Manage your public profile.
        </p>
      </div>

      <div className="space-y-4 rounded-2xl border p-6">
        <div className="space-y-2">
          <label>Full Name</label>

          <Input
            value={form.full_name}
            onChange={(e) =>
              setForm({
                ...form,
                full_name: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label>Avatar URL</label>

          <Input
            value={form.avatar_url}
            onChange={(e) =>
              setForm({
                ...form,
                avatar_url: e.target.value,
              })
            }
          />
        </div>

        <div className="space-y-2">
          <label>Bio</label>

          <Textarea
            rows={5}
            value={form.bio}
            onChange={(e) =>
              setForm({
                ...form,
                bio: e.target.value,
              })
            }
          />
        </div>

        <Button
          onClick={saveProfile}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}