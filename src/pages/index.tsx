import dynamic from "next/dynamic";

const CMS = dynamic(() => import("decap-cms"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>My Next.js App with Decap CMS</h1>
      <CMS />
    </div>
  );
}
