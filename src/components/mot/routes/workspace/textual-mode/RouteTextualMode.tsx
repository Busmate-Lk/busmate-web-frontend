'use client';

import { useRouteWorkspace } from "@/context/RouteWorkspace/useRouteWorkspace";
import { useEffect, useState } from "react";

export default function RouteTextualMode() {
  const { data, updateFromYaml, getYaml } = useRouteWorkspace();
  const [yamlText, setYamlText] = useState('');

  // Sync context data to textarea when form changes
  useEffect(() => {
    setYamlText(getYaml());
  }, [data, getYaml]);

  // Handle textarea changes and update context
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setYamlText(newText);
    
    // Parse and update context
    try {
      updateFromYaml(newText);
    } catch (error) {
      console.error('Failed to parse YAML:', error);
    }
  };

  return (
    <>
      <div className="mb-2">
        <span className="font-semibold">RouteTextualMode</span>
        <p className="text-sm text-gray-600 mt-1">
          Enter or paste route group data in YAML format. Changes will sync with Form Mode in real-time.
        </p>
      </div>
      {/* Full available screen sized text editor area to type or paste full route group data with route data and routestop data in textual format */}
      <div>
        <textarea 
          className="w-full h-[750px] border-2 border-gray-400 rounded px-2 py-1 outline-none font-mono text-sm"
          value={yamlText}
          onChange={handleTextChange}
          placeholder="# Example:
route_group:
  name: Colombo - Kandy Express Routes
  name_sinhala: කොළඹ - මහනුවර එක්ස්ප්‍රස් මාර්ග
  name_tamil: கொழும்பு - கண்டி எக்ஸ்பிரஸ் வழிகள்
  description: Main express routes between Colombo and Kandy"
        />
      </div>
    </>
  )
}
