"use client";

import dynamic from "next/dynamic";

const Providers = dynamic(() => import("@/components/Providers"), {
  ssr: false,
});

export default function ClientProvidersWrapper({
  session,
  children,
}: {
  session: any;
  children: React.ReactNode;
}) {
  return <Providers session={session}>{children}</Providers>;
}
