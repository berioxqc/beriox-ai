"use client";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import AccessGuard from "@/components/AccessGuard";
import TimeTrackingDashboard from "@/components/TimeTrackingDashboard";

export default function TimeTrackingPage() {
  const { data: session } = useSession();

  return (
    <AuthGuard>
      <AccessGuard premiumOnly={true}>
        <Layout>
          <TimeTrackingDashboard />
        </Layout>
      </AccessGuard>
    </AuthGuard>
  );
}
