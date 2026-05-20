"use client";

export default function Error({
  error,
}: {
  error: Error;
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          Something went wrong
        </h1>

        <p className="mt-2 text-zinc-500">
          {error.message}
        </p>
      </div>
    </div>
  );
}