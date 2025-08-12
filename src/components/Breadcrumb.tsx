"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Icon from "@/components/ui/Icon"
interface BreadcrumbItem {
  href: string
  label: string
  icon: string
  isActive: boolean
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []
  // Ajouter l'accueil
  breadcrumbs.push({
    href: '/',
    label: 'Accueil',
    icon: 'home',
    isActive: pathname === '/'
  })
  // Traiter chaque segment
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    // Mapping des segments vers des labels lisibles
    const labelMap: Record<string, string> = {
      'missions': 'Missions',
      'profile': 'Profil',
      'settings': 'Paramètres',
      'pricing': 'Tarifs',
      'admin': 'Administration',
      'agents': 'Agents IA',
      'novabot': 'NovaBot',
      'competitors': 'Veille Concurrentielle',
      'coupon': 'Coupons',
      'refunds': 'Remboursements',
      'auth': 'Authentification',
      'signin': 'Connexion',
      'signout': 'Déconnexion'
    }
    const iconMap: Record<string, string> = {
      'missions': 'tasks',
      'profile': 'user',
      'settings': 'cog',
      'pricing': 'credit-card',
      'admin': 'crown',
      'agents': 'users',
      'novabot': 'brain',
      'competitors': 'search',
      'coupon': 'gift',
      'refunds': 'receipt',
      'auth': 'lock',
      'signin': 'user',
      'signout': 'sign-out-alt'
    }
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    const icon = iconMap[segment] || 'circle'
    breadcrumbs.push({
      href: currentPath,
      label,
      icon,
      isActive: pathname === currentPath
    })
  })
  return breadcrumbs
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)
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
  )
}
