"use client";

import { useState, useCallback, useEffect } from "react";
import FilterSidebar from "./FilterSidebar";
import type { Price, Audience, Tool } from "@/types/tool.types";
import { filterTools } from "@/services/client/tools.client";

interface FilterSidebarWrapperProps {
    prices: Price[];
    audiences: Audience[];
    onToolsChange: (tools: Tool[]) => void;
}

export default function FilterSidebarWrapper({
    prices,
    audiences,
    onToolsChange,
}: FilterSidebarWrapperProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = useCallback(
        async (price?: string, audience?: string) => {
            setIsLoading(true);
            try {
                const tools = await filterTools(0, 8, price, audience);
                onToolsChange(tools);
            } catch (error) {
                console.error("Failed to filter tools:", error);
            } finally {
                setIsLoading(false);
            }
        },
        [onToolsChange]
    );

    useEffect(() => {
        handleFilterChange();
    }, []);

    return (
        <FilterSidebar
            prices={prices}
            audiences={audiences}
            onFilterChange={handleFilterChange}
            isLoading={isLoading}
        />
    );
}
