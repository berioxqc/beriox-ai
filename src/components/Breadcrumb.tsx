"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface BreadcrumbItem {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('apos;/'apos;).filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Ajouter l'apos;accueil
  breadcrumbs.push({
    href: 'apos;/'apos;,
    label: 'apos;Accueil'apos;,
    icon: 'apos;home'apos;,
    isActive: pathname === 'apos;/'apos;
  });

  // Traiter chaque segment
  let currentPath = 'apos;'apos;;
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Mapping des segments vers des labels lisibles
    const labelMap: Record<string, string> = {
      'apos;missions'apos;: 'apos;Missions'apos;,
      'apos;profile'apos;: 'apos;Profil'apos;,
      'apos;settings'apos;: 'apos;Paramètres'apos;,
      'apos;pricing'apos;: 'apos;Tarifs'apos;,
      'apos;admin'apos;: 'apos;Administration'apos;,
      'apos;agents'apos;: 'apos;Agents IA'apos;,
      'apos;novabot'apos;: 'apos;NovaBot'apos;,
      'apos;competitors'apos;: 'apos;Veille Concurrentielle'apos;,
      'apos;coupon'apos;: 'apos;Coupons'apos;,
      'apos;refunds'apos;: 'apos;Remboursements'apos;,
      'apos;auth'apos;: 'apos;Authentification'apos;,
      'apos;signin'apos;: 'apos;Connexion'apos;,
      'apos;signout'apos;: 'apos;Déconnexion'apos;
    };

    const iconMap: Record<string, string> = {
      'apos;missions'apos;: 'apos;tasks'apos;,
      'apos;profile'apos;: 'apos;user'apos;,
      'apos;settings'apos;: 'apos;cog'apos;,
      'apos;pricing'apos;: 'apos;credit-card'apos;,
      'apos;admin'apos;: 'apos;crown'apos;,
      'apos;agents'apos;: 'apos;users'apos;,
      'apos;novabot'apos;: 'apos;brain'apos;,
      'apos;competitors'apos;: 'apos;search'apos;,
      'apos;coupon'apos;: 'apos;gift'apos;,
      'apos;refunds'apos;: 'apos;receipt'apos;,
      'apos;auth'apos;: 'apos;lock'apos;,
      'apos;signin'apos;: 'apos;user'apos;,
      'apos;signout'apos;: 'apos;sign-out-alt'apos;
    };

    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const icon = iconMap[segment] || 'apos;circle'apos;;
    
    breadcrumbs.push({
      href: currentPath,
      label,
      icon,
      isActive: pathname === currentPath
    });
  });

  return breadcrumbs;
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <div className="py-4 border-b border-gray-200 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex items-center gap-2 text-sm font-sans">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.href} className="flex items-center">
              {index > 0 && (
                <Icon
                  name="chevron-right"
                  className="text-gray-400 text-xs mx-2"
                  size={12}
                />
              )}
              {breadcrumb.isActive ? (
                <span className="text-gray-900 font-semibold flex items-center gap-1.5">
                  <Icon
                    name={breadcrumb.icon}
                    className="text-sm opacity-70"
                    size={14}
                  />
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-gray-600 no-underline flex items-center gap-1.5 transition-colors duration-200 hover:text-gray-900"
                >
                  <Icon
                    name={breadcrumb.icon}
                    className="text-sm opacity-70"
                    size={14}
                  />
                  {breadcrumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
