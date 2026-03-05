import { normalizeImageUrl, normalizeMediaUrl } from "./image.utils";

export function processNotificationHtml(html: string): string {
  if (!html || typeof window === "undefined") return html;

  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Find the main container div (first div with style attribute)
    const containerDiv = tempDiv.querySelector("div[style]");
    if (containerDiv) {
      const divElement = containerDiv as HTMLElement;
      // Remove ALL inline styles first
      divElement.removeAttribute("style");
      // Then set correct styles with important flag
      divElement.style.setProperty("display", "flex", "important");
      divElement.style.setProperty("flex-direction", "row", "important");
      divElement.style.setProperty("align-items", "center", "important");
      divElement.style.setProperty("padding", "0", "important");
      divElement.style.setProperty("border", "none", "important");
      divElement.style.setProperty("border-radius", "0", "important");
      divElement.style.setProperty(
        "background-color",
        "transparent",
        "important"
      );
    }

    // Find inner div with flex-direction: column (contains username and message)
    const innerDivs = tempDiv.querySelectorAll("div[style]");
    innerDivs.forEach((div) => {
      const divElement = div as HTMLElement;
      const style = divElement.getAttribute("style") || "";
      // If this div has flex-direction: column, change it to row
      if (
        style.includes("flex-direction: column") ||
        style.includes("flex-direction:column")
      ) {
        divElement.removeAttribute("style");
        // Set to row layout
        divElement.style.setProperty("display", "flex", "important");
        divElement.style.setProperty("flex-direction", "row", "important");
        divElement.style.setProperty("align-items", "center", "important");
        divElement.style.setProperty("gap", "8px", "important");
        divElement.style.setProperty("flex-wrap", "wrap", "important");
        // Remove problematic styles
        divElement.style.setProperty("height", "auto", "important");
        divElement.style.setProperty("overflow", "visible", "important");
        divElement.style.setProperty("max-width", "none", "important");
      }
    });

    // Ensure images have proper spacing and handle errors
    const images = tempDiv.querySelectorAll("img");
    images.forEach((img) => {
      const imgElement = img as HTMLImageElement;
      imgElement.style.setProperty("margin-right", "10px", "important");
      imgElement.style.setProperty("flex-shrink", "0", "important");
      
      // Normalize image URLs - replace localhost:9000/localhost:3000 with correct API URL
      const currentSrc = imgElement.getAttribute("src") || "";
      if (currentSrc) {
        let normalizedSrc = currentSrc;
        
        // First, try to get API URL from environment
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
        
        if (apiUrl && (currentSrc.includes("localhost:9000") || currentSrc.includes("localhost:3000"))) {
          normalizedSrc = normalizeMediaUrl(currentSrc);
        } else if (apiUrl && !currentSrc.startsWith("http://") && !currentSrc.startsWith("https://")) {
          normalizedSrc = normalizeMediaUrl(currentSrc);
        } else {
            normalizedSrc = normalizeImageUrl(currentSrc);
        }
        
        // Update src attribute
        if (normalizedSrc !== currentSrc) {
          imgElement.setAttribute("src", normalizedSrc);
        }
      }
      
      // IMPORTANT: Set error handlers BEFORE updating src to catch any errors
      // This prevents console errors from appearing
      const handleImageError = () => {
        imgElement.style.display = "none";
        return true; // Prevent error from bubbling
      };
      
      imgElement.onerror = handleImageError;
      
      // Also add event listener to catch errors
      imgElement.addEventListener("error", (e) => {
        e.preventDefault();
        e.stopPropagation();
        imgElement.style.display = "none";
      }, { once: true, capture: true });
    });

    return tempDiv.innerHTML;
  } catch (error) {
    // Silently fail and return original HTML
    return html; // Return original if processing fails
  }
}
