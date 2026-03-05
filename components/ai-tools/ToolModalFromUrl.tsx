"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AIToolModal from "./AIToolModal";
import type { Tool } from "@/types/tool.types";
import { filterTools } from "@/services/client/tools.client";

interface ToolModalFromUrlProps {
  allTools: Tool[];
  topRatedTools: Tool[];
  usedTools?: Tool[];
  savedTools?: Tool[];
}

export default function ToolModalFromUrl({
  allTools,
  topRatedTools,
  usedTools = [],
  savedTools = [],
}: ToolModalFromUrlProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const toolId = searchParams.get("toolId");
    
    if (!toolId) {
      setIsOpen(false);
      setSelectedTool(null);
      return;
    }

    // Combine all available tools
    const allAvailableTools = [
      ...topRatedTools,
      ...allTools,
      ...usedTools,
      ...savedTools,
    ];

    // Remove duplicates by ID
    const uniqueTools = allAvailableTools.filter(
      (tool, index, self) => index === self.findIndex((t) => t.id === tool.id)
    );

    // Try to find tool in existing tools
    const foundTool = uniqueTools.find((tool) => tool.id === toolId);

    if (foundTool) {
      setSelectedTool(foundTool);
      setIsOpen(true);
      // Remove toolId from URL after opening modal
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("toolId");
      const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
      router.replace(newUrl, { scroll: false });
    } else {
      // Tool not found in existing tools, try to fetch it
      setIsLoading(true);
      // Try to fetch by filtering (might not work if tool is not in first page)
      // For now, just show loading and then close if not found
      setTimeout(() => {
        setIsLoading(false);
        // If still not found, remove toolId from URL
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.delete("toolId");
        const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
        router.replace(newUrl, { scroll: false });
      }, 1000);
    }
  }, [searchParams, allTools, topRatedTools, usedTools, savedTools, router]);

  const handleClose = () => {
    setIsOpen(false);
    setSelectedTool(null);
    // Remove toolId from URL
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("toolId");
    const newUrl = `${window.location.pathname}${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
    router.replace(newUrl, { scroll: false });
  };

  if (!selectedTool || isLoading) {
    return null;
  }

  return (
    <AIToolModal
      open={isOpen}
      onClose={handleClose}
      data={selectedTool}
    />
  );
}

