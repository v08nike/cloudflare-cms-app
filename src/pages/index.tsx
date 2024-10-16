import { debounce } from "lodash";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const CMS = dynamic(() => import("decap-cms").then((mod: any) => mod.CMS), {
  ssr: false,
  loading: () => <p>Loading...</p>, // Fallback loading state
});

export default function Home() {
  useEffect(() => {
    const applyIframeStyles = (iframe: HTMLIFrameElement) => {
      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        // Apply styles dynamically to the iframe content
        const style = document.createElement("style");
        style.textContent = `
          img {
            max-width: 100%;
            height: auto;
          }
        `;
        iframeDoc.head.appendChild(style);
      }
    };

    const checkAndApplyStyles = debounce(() => {
      const iframe = document.getElementById(
        "preview-pane"
      ) as HTMLIFrameElement;
      if (iframe) {
        applyIframeStyles(iframe);
      }
    }, 200);

    // Set up a MutationObserver to watch for changes in the DOM
    const observer = new MutationObserver(() => {
      checkAndApplyStyles();
    });

    // Start observing the body for changes
    const observerConfig = { childList: true, subtree: true };
    const targetNode = document.body; // Observe changes in the entire document
    observer.observe(targetNode, observerConfig);

    // Initial check in case the iframe already exists when the component loads
    checkAndApplyStyles();

    // Cleanup observer on component unmount
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <CMS />
    </div>
  );
}
