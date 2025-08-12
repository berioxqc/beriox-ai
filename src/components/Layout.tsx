"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navigation from "@/components/Navigation";
import Breadcrumb from "@/components/Breadcrumb";
import QuickMissionModal from "@/components/QuickMissionModal";
import Icon from "@/components/ui/Icon";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showSidebar?: boolean;
  showNavigation?: boolean;
}

export default function Layout({
  children,
  title,
  subtitle,
  headerActions,
  showSidebar = true,
  showNavigation = true
}: LayoutProps) {
  const [showQuickMissionModal, setShowQuickMissionModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isMobile = useIsMobile();

  // Écouter les changements d'apos;état du sidebar
  useEffect(() => {
    const handleSidebarStateChange = () => {
      setSidebarCollapsed(prev => !prev);
    };

    window.addEventListener('apos;sidebar-toggle'apos;, handleSidebarStateChange);
    return () => window.removeEventListener('apos;sidebar-toggle'apos;, handleSidebarStateChange);
  }, []);

  const handleMissionCreated = (missionId: string) => {
    // Rediriger vers la mission créée
    window.location.href = `/missions/${missionId}`;
  };

  // Calculer la marge gauche en fonction de l'apos;état du sidebar
  const getSidebarMargin = () => {
    if (!showSidebar) return 'apos;0'apos;;
    return sidebarCollapsed ? 'apos;64px'apos; : 'apos;256px'apos;;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content */}
      <div 
        className="flex-1 flex flex-col"
        style={{ 
          marginLeft: showSidebar && !isMobile ? getSidebarMargin() : 'apos;0'apos;,
          transition: 'apos;margin-left 0.3s ease'apos;
        }}
      >
        {/* Navigation horizontale */}
        {showNavigation && <Navigation />}

        {/* Breadcrumb */}
        {showNavigation && <Breadcrumb />}

        {/* Header avec titre et actions */}
        {(title || headerActions) && (
          <div className="bg-white border-b border-gray-200 px-4 py-6 sm:px-6 lg:px-10">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1 min-w-0">
                {title && (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 m-0 mb-2 font-sans tracking-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm sm:text-base text-gray-600 m-0 font-sans leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                {/* Bouton + Mission rapide */}
                <button
                  onClick={() => setShowQuickMissionModal(true)}
                  className="px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white border-none rounded-xl text-xs sm:text-sm font-semibold cursor-pointer flex items-center gap-1 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-sans whitespace-nowrap"
                >
                  <Icon name="plus" size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Nouvelle Mission</span>
                  <span className="sm:hidden">+</span>
                </button>

                {headerActions}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </div>

      {/* Modal de création rapide de mission */}
      <QuickMissionModal
        isOpen={showQuickMissionModal}
        onClose={() => setShowQuickMissionModal(false)}
        onMissionCreated={handleMissionCreated}
      />
    </div>
  );
}