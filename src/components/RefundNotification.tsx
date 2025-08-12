"use client"
import { useState, useEffect } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useTheme } from "@/hooks/useTheme"
interface RefundNotificationProps {
  onClose: () => void
}

export default function RefundNotification({ onClose }: RefundNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const theme = useTheme()
  useEffect(() => {
    // Afficher la notification après 2 secondes
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])
  if (!isVisible) return null
  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      background: "linear-gradient(135deg, #10b981, #059669)",
      color: "white",
      padding: "16px 20px",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(16, 185, 129, 0.3)",
      zIndex: 1000,
      maxWidth: "350px",
      animation: "slideInRight 0.5s ease-out",
      border: "1px solid rgba(255, 255, 255, 0.2)"
    }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "12px"
      }}>
        <div style={{
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0
        }}>
          <FontAwesomeIcon icon="receipt" style={{ fontSize: "12px" }} />
        </div>
        
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: "14px",
            fontWeight: "600",
            margin: "0 0 4px 0",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            💰 Nouveau : Système de Remboursement
          </h4>
          
          <p style={{
            fontSize: "12px",
            margin: "0 0 12px 0",
            opacity: 0.9,
            lineHeight: "1.4",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          }}>
            Pas satisfait d'une réponse ? Demandez un remboursement de vos crédits en quelques clics !
          </p>
          
          <div style={{
            display: "flex",
            gap: "8px",
            alignItems: "center"
          }}>
            <button
              onClick={() => {
                window.location.href = "/refunds"
                onClose()
              }}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: "500",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"
              }}
            >
              Voir les détails
            </button>
            
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.7)",
                cursor: "pointer",
                fontSize: "12px",
                padding: "4px",
                borderRadius: "4px",
                transition: "color 0.2s"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = "white"
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = "rgba(255, 255, 255, 0.7)"
              }}
            >
              <FontAwesomeIcon icon="times" />
            </button>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%)
            opacity: 0
          }
          to {
            transform: translateX(0)
            opacity: 1
          }
        }
      `}</style>
    </div>
  )
}
