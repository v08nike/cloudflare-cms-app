import dynamic from "next/dynamic";

const CMS = dynamic(() => import("decap-cms").then((mod: any) => mod.CMS), {
  ssr: false,
  loading: () => <p>Loading...</p>, // Fallback loading state
});

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <CMS />
    </div>
  );
}
