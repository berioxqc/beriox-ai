"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MobileMenu from "./MobileMenu";
import UserStatus from "./UserStatus";
import Icon from "@/components/ui/Icon";

export default function Navigation() {
  const { data: session } = useSession();
  const [userPermissions, setUserPermissions] = useState<{
    role: string;
    plan?: string;
    hasAccess: boolean;
  } | null>(null);

  // Récupérer les permissions utilisateur
  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (session?.user?.email) {
        try {
          // Récupérer les informations du profil utilisateur
          const profileRes = await fetch('apos;/api/user/profile'apos;);
          const profile = profileRes.ok ? await profileRes.json() : null;

          // Vérifier l'apos;accès premium basé sur le rôle et les crédits
          let hasAccess = false;
          let plan = undefined;

          if (profile?.user?.role === 'apos;SUPER_ADMIN'apos; || profile?.user?.role === 'apos;ADMIN'apos;) {
            hasAccess = true;
            plan = 'apos;enterprise'apos;;
          } else if (profile?.user?.credits && profile.user.credits > 0) {
            hasAccess = true;
            plan = 'apos;basic'apos;;
          }

          const permissions = {
            role: profile?.user?.role || 'apos;USER'apos;,
            plan: plan,
            hasAccess: hasAccess
          };

          setUserPermissions(permissions);
        } catch (error) {
          console.error('apos;Erreur lors de la récupération des permissions:'apos;, error);
        }
      }
    };

    fetchUserPermissions();
  }, [session]);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-10">
      <div className="flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Icon name="bolt" className="text-white" size={16} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900">Beriox AI</h1>
          </div>
        </div>

        {/* Actions centrales - masquées sur mobile */}
        <div className="hidden md:flex items-center gap-4">
          {/* Indicateur de statut premium */}
          {userPermissions?.hasAccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-full">
              <Icon name="crown" className="text-yellow-600" size={14} />
              <span className="text-xs font-medium text-yellow-800">
                {userPermissions.plan?.toUpperCase()} ACTIF
              </span>
            </div>
          )}
        </div>

        {/* Actions de droite */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Statut utilisateur - masqué sur mobile */}
          <div className="hidden sm:block">
            <UserStatus />
          </div>

          {/* Menu mobile - seulement sur mobile */}
          <div className="block sm:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}
