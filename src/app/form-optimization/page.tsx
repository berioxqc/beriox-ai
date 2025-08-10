"use client";
import { useSession } from "next-auth/react";
import Layout from "@/components/Layout";
import AuthGuard from "@/components/AuthGuard";
import AccessGuard from "@/components/AccessGuard";
import FormOptimizer from "@/components/FormOptimizer";

export default function FormOptimizationPage() {
  const { data: session } = useSession();

  return (
    <AuthGuard>
      <AccessGuard premiumOnly={true}>
        <Layout>
          <FormOptimizer />
        </Layout>
      </AccessGuard>
    </AuthGuard>
  );
}
