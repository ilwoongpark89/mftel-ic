"use client";
import DataInputTab from "@/components/tabs/DataInputTab";

export default function InputPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <DataInputTab onSaved={() => {}} />
      </div>
    </div>
  );
}
