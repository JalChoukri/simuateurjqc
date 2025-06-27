"use client"

import React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Calculator,
  User,
  GraduationCap,
  Languages,
  Briefcase,
  MapPin,
  Heart,
  Users,
  Mail,
  Lock,
  TrendingUp,
  Clock,
} from "lucide-react"
import Image from "next/image"

interface ScoreFactors {
  frenchOralComprehension: number
  frenchOralProduction: number
  frenchWrittenComprehension: number
  frenchWrittenProduction: number
  englishOralComprehension: number
  englishOralProduction: number
  englishWrittenComprehension: number
  englishWrittenProduction: number
  age: number
  education: number
  fieldOfStudy: number
  workExperience: number
  quebecDiploma: number
  quebecWorkExperience: number
  spouseFrenchOral: number
  spouseAge: number
  spouseEducation: number
  spouseFieldOfStudy: number
  jobOffer: number
  children: number
  familyInQuebec: number
}

const initialScores: ScoreFactors = {
  frenchOralComprehension: 0,
  frenchOralProduction: 0,
  frenchWrittenComprehension: 0,
  frenchWrittenProduction: 0,
  englishOralComprehension: 0,
  englishOralProduction: 0,
  englishWrittenComprehension: 0,
  englishWrittenProduction: 0,
  age: 0,
  education: 0,
  fieldOfStudy: 0,
  workExperience: 0,
  quebecDiploma: 0,
  quebecWorkExperience: 0,
  spouseFrenchOral: 0,
  spouseAge: 0,
  spouseEducation: 0,
  spouseFieldOfStudy: 0,
  jobOffer: 0,
  children: 0,
  familyInQuebec: 0,
}

// Memoized components for better performance
const MemoizedCard = React.memo(Card)
const MemoizedBadge = React.memo(Badge)

function ArrimaCalculator() {
  const [mounted, setMounted] = useState(false)
  const [scores, setScores] = useState<ScoreFactors>(initialScores)
  const [hasSpouse, setHasSpouse] = useState(false)
  const [activeSection, setActiveSection] = useState("profil")
  const [email, setEmail] = useState("")
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)
  const [financialAutonomyAccepted, setFinancialAutonomyAccepted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showNavbar, setShowNavbar] = useState(false)
  const [showFieldExplanation, setShowFieldExplanation] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  // Refs for sections
  const frenchRef = useRef<HTMLDivElement>(null)
  const englishRef = useRef<HTMLDivElement>(null)
  const quebecRef = useRef<HTMLDivElement>(null)
  const conjugalRef = useRef<HTMLDivElement>(null)
  const additionalRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Memoized calculations
  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, score) => sum + score, 0)
  }, [scores])

  const completionPercentage = useMemo(() => {
    const totalFields = Object.keys(scores).length
    const completedFields = Object.values(scores).filter((score) => score > 0).length
    return (completedFields / totalFields) * 100
  }, [scores])

  const frenchTotal = useMemo(() => {
    return (
      scores.frenchOralComprehension +
      scores.frenchOralProduction +
      scores.frenchWrittenComprehension +
      scores.frenchWrittenProduction
    )
  }, [
    scores.frenchOralComprehension,
    scores.frenchOralProduction,
    scores.frenchWrittenComprehension,
    scores.frenchWrittenProduction,
  ])

  const englishTotal = useMemo(() => {
    return (
      scores.englishOralComprehension +
      scores.englishOralProduction +
      scores.englishWrittenComprehension +
      scores.englishWrittenProduction
    )
  }, [
    scores.englishOralComprehension,
    scores.englishOralProduction,
    scores.englishWrittenComprehension,
    scores.englishWrittenProduction,
  ])

  const baseScore = useMemo(() => totalScore - scores.jobOffer, [totalScore, scores.jobOffer])

  const pointsBasedProgress = useMemo(() => {
    const maxPossibleScore = 1346
    return Math.min((totalScore / maxPossibleScore) * 100, 100)
  }, [totalScore])

  // Handle mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Optimized scroll handler with throttling
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const profilSection = conjugalRef.current

    if (profilSection) {
      const profilTop = profilSection.offsetTop
      setShowNavbar(scrollY >= profilTop)
    }

    const sections = [
      { id: "profil", ref: conjugalRef },
      { id: "french", ref: frenchRef },
      { id: "english", ref: englishRef },
      { id: "quebec", ref: quebecRef },
      { id: "autres", ref: additionalRef },
      { id: "results", ref: resultsRef },
    ]

    const scrollPosition = scrollY + 150

    for (const section of sections) {
      if (section.ref.current) {
        const { offsetTop, offsetHeight } = section.ref.current
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(section.id)
          break
        }
      }
    }
  }, [])

  // Throttled scroll event listener
  useEffect(() => {
    if (!mounted) return

    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledScroll, { passive: true })
    return () => window.removeEventListener("scroll", throttledScroll)
  }, [mounted, handleScroll])

  const updateScore = useCallback((factor: keyof ScoreFactors, value: number) => {
    setScores((prev) => ({ ...prev, [factor]: value }))
  }, [])

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (!mounted) return

      const refs: { [key: string]: React.RefObject<HTMLDivElement> } = {
        profil: conjugalRef,
        french: frenchRef,
        english: englishRef,
        quebec: quebecRef,
        autres: additionalRef,
        results: resultsRef,
      }

      const ref = refs[sectionId]
      if (ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    },
    [mounted],
  )

  const resetCalculator = useCallback(() => {
    setScores(initialScores)
    setHasSpouse(false)
    setShowResults(false)
    setEmail("")
    setAcceptedPrivacy(false)
    setFinancialAutonomyAccepted(false)
    setActiveSection("profil")
    setShowFieldExplanation(false)
    setResetKey((prev) => prev + 1)

    if (mounted) {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [mounted])

  const downloadResults = useCallback(async () => {
    if (!mounted || !resultsRef.current) return

    try {
      const html2canvas = await import("html2canvas")
      const canvas = await html2canvas.default(resultsRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      })

      const link = document.createElement("a")
      link.download = `arrima-score-${totalScore}-points.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()
    } catch (error) {
      console.error("Error downloading results:", error)
      window.print()
    }
  }, [mounted, totalScore])

  const handleEmailSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (email && acceptedPrivacy) {
        setShowResults(true)
      }
    },
    [email, acceptedPrivacy],
  )

  const getScoreProgressColor = useCallback(() => {
    if (totalScore < 300) return "bg-red-500"
    if (totalScore < 600) return "bg-orange-500"
    return "bg-green-500"
  }, [totalScore])

  const getScoreProgressMessage = useCallback(() => {
    const minimumRequired = hasSpouse ? 59 : 50

    if (totalScore < minimumRequired) {
      return "Score insuffisant pour soumettre un profil Arrima"
    } else if (totalScore < 300) {
      return "Score minimal atteint, mais des améliorations sont nécessaires"
    } else if (totalScore < 600) {
      return "Bon score ! Vous êtes sur la bonne voie"
    } else {
      return "Excellent score ! Profil très compétitif"
    }
  }, [totalScore, hasSpouse])

  const getTotalScoreColor = useCallback(() => {
    if (totalScore < 300) return "text-red-500"
    if (totalScore < 600) return "text-orange-500"
    return "text-green-500"
  }, [totalScore])

  const generateRecommendations = useMemo(() => {
    const recommendations = []
    let scoreInterpretation = ""

    const minimumRequired = hasSpouse ? 59 : 50

    if (totalScore < minimumRequired) {
      scoreInterpretation = `Avec un score de ${totalScore} points, vous n'atteignez pas le minimum requis de ${minimumRequired} points pour soumettre un profil Arrima ${hasSpouse ? "(avec conjoint)" : "(candidat seul)"}. Il est essentiel d'améliorer votre profil avant de pouvoir postuler.`
    } else if (scores.jobOffer > 0) {
      if (totalScore >= 800) {
        scoreInterpretation = `Avec une offre d'emploi validée et un score total de ${totalScore} points (score de base sans offre: ${baseScore}), vos chances d'invitation sont TRÈS ÉLEVÉES. Les candidats avec une offre d'emploi validée sont souvent priorisés, surtout si elle est hors de la CMM. Assurez-vous que votre offre est bien validée par le MIFI.`
      } else if (totalScore >= 600) {
        scoreInterpretation = `Avec une offre d'emploi validée et un score total de ${totalScore} points (score de base sans offre: ${baseScore}), vos chances d'invitation sont ÉLEVÉES. Votre offre d'emploi vous donne un avantage significatif.`
      } else {
        scoreInterpretation = `Avec une offre d'emploi validée et un score total de ${totalScore} points (score de base sans offre: ${baseScore}), vos chances d'invitation sont MODÉRÉES. Bien que l'offre d'emploi soit un atout, il serait bénéfique d'améliorer d'autres aspects de votre profil.`
      }
    } else {
      if (totalScore >= 620) {
        scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont TRÈS ÉLEVÉES. Votre profil est très compétitif pour les tirages généraux.`
      } else if (totalScore >= 570) {
        scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont ÉLEVÉES. Votre score se situe dans la fourchette souvent observée lors des tirages généraux.`
      } else if (totalScore >= 400) {
        scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont MODÉRÉES. Il serait recommandé d'améliorer certains aspects de votre profil pour augmenter vos chances.`
      } else {
        scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont FAIBLES. Il est important d'améliorer significativement votre profil avant de soumettre votre candidature.`
      }
    }

    if (frenchTotal < 200) {
      recommendations.push({
        icon: Languages,
        title: "Améliorer le français",
        description:
          "Votre score en français est faible. Concentrez-vous sur l'amélioration de vos compétences linguistiques, particulièrement l'oral qui rapporte plus de points.",
        priority: "high",
      })
    }

    if (scores.age < 100) {
      recommendations.push({
        icon: User,
        title: "Facteur âge",
        description:
          "L'âge impacte votre score. Si vous avez plus de 35 ans, concentrez-vous sur d'autres facteurs pour compenser.",
        priority: "medium",
      })
    }

    if (scores.education < 90) {
      recommendations.push({
        icon: GraduationCap,
        title: "Niveau d'éducation",
        description:
          "Considérez obtenir une reconnaissance de diplôme ou poursuivre des études supérieures pour augmenter vos points.",
        priority: "medium",
      })
    }

    if (scores.workExperience < 80) {
      recommendations.push({
        icon: Briefcase,
        title: "Expérience professionnelle",
        description: "Accumulez plus d'expérience de travail qualifiée dans votre domaine avant de postuler.",
        priority: "medium",
      })
    }

    if (scores.quebecDiploma === 0 && scores.quebecWorkExperience === 0) {
      recommendations.push({
        icon: MapPin,
        title: "Connexion au Québec",
        description:
          "Considérez obtenir un diplôme québécois ou une expérience de travail au Québec pour des points bonus significatifs.",
        priority: "high",
      })
    }

    if (scores.jobOffer === 0) {
      recommendations.push({
        icon: TrendingUp,
        title: "Offre d'emploi",
        description:
          "Une offre d'emploi validée par le MIFI peut considérablement augmenter vos chances, surtout si elle est hors de la région de Montréal.",
        priority: "high",
      })
    }

    return { scoreInterpretation, recommendations }
  }, [totalScore, hasSpouse, scores, baseScore, frenchTotal])

  // Navigation items memoized
  const navigationItems = useMemo(
    () => [
      { id: "profil", label: "Profil", icon: User },
      {
        id: "french",
        label: "Français",
        icon: () => <span className="text-blue-600 font-bold text-xs">🇫🇷</span>,
      },
      {
        id: "english",
        label: "Anglais",
        icon: () => <span className="text-red-600 font-bold text-xs">🇬🇧</span>,
      },
      { id: "quebec", label: "Québec", icon: MapPin },
      { id: "autres", label: "Autres", icon: Users },
      { id: "results", label: "Résultat", icon: Calculator },
    ],
    [],
  )

  if (!mounted) {
    return null
  }

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        @media (max-width: 640px) {
          .mobile-card {
            margin: 0 -4px;
            border-radius: 12px;
          }
          
          .mobile-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .mobile-select {
            font-size: 16px;
            padding: 12px;
            width: 100%;
            max-width: 100%;
            box-sizing: border-box;
          }
          
          .mobile-nav-btn {
            min-width: 44px;
            min-height: 44px;
            padding: 8px 12px;
            font-size: 12px;
            border-radius: 8px;
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
          
          .mobile-card .grid {
            padding: 0 4px;
          }
          
          [data-radix-select-trigger] {
            width: 100% !important;
            max-width: 100% !important;
          }

          .mobile-navbar-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 8px;
            width: 100%;
          }

          .mobile-email-overlay {
            top: 20px !important;
            bottom: auto !important;
            height: auto !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-card {
            margin: 0 -2px;
          }
          
          .mobile-nav-btn {
            padding: 6px 8px;
            font-size: 11px;
            min-width: 40px;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 pb-20 sm:pb-24" key={resetKey}>
        {/* Sticky Navigation Bar */}
        {showNavbar && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm animate-in fade-in duration-300">
            <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Calculator className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  <span className="font-semibold text-gray-900 text-xs sm:text-base">
                    Simulateur Arrima Gratuit 2025
                  </span>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex gap-1 overflow-x-auto scrollbar-hide">
                  {navigationItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                        activeSection === id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {typeof Icon === "function" ? <Icon /> : <Icon className="h-4 w-4" />}
                      <span>{label}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Navigation */}
                <div className="sm:hidden mobile-navbar-grid">
                  {navigationItems.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`mobile-nav-btn ${
                        activeSection === id
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      {typeof Icon === "function" ? <Icon /> : <Icon className="h-3 w-3" />}
                      <span className="text-xs">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-6xl space-y-2 sm:space-y-4 p-2 sm:p-4 pt-4 sm:pt-8">
          {/* Header */}
          <div className="text-center px-2">
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Image
                src="/images/jarrive-quebec-logo.png"
                alt="J'arrive Québec"
                width={120}
                height={60}
                className="h-10 w-auto sm:h-16"
                priority
              />
              <div className="text-center">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Simulateur Arrima Gratuit 2025</h1>
                <p className="text-xs sm:text-sm text-blue-600 font-medium">Par J'arrive Québec</p>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Calculez votre score potentiel pour l'immigration au Québec. Complétez toutes les sections pour voir vos
              résultats.
            </p>
          </div>

          {/* Profil Section - Consolidated */}
          <div ref={conjugalRef} id="profil-section">
            <MemoizedCard className="mobile-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <User className="h-5 w-5" />
                  Profil personnel et situation conjugale
                </CardTitle>
                <CardDescription className="text-sm">
                  Informations sur votre profil personnel et votre situation conjugale
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {/* Conjugal Status */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Situation conjugale</h4>
                  <RadioGroup value={hasSpouse.toString()} onValueChange={(value) => setHasSpouse(value === "true")}>
                    <div className="flex items-center space-x-3 py-2">
                      <RadioGroupItem value="false" id="no-spouse" className="mt-0.5" />
                      <Label htmlFor="no-spouse" className="text-sm sm:text-base leading-relaxed">
                        Je postule seul(e)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 py-2">
                      <RadioGroupItem value="true" id="has-spouse" className="mt-0.5" />
                      <Label htmlFor="has-spouse" className="text-sm sm:text-base leading-relaxed">
                        Je postule avec mon conjoint/partenaire
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Personal Information Grid */}
                <div className="mobile-grid grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2 mb-6">
                  {/* Age */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Votre âge</Label>
                    <Select onValueChange={(value) => updateScore("age", Number.parseInt(value))}>
                      <SelectTrigger className="mobile-select">
                        <SelectValue placeholder="Sélectionnez votre âge" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Moins de 18 ans ou 43+ ans</SelectItem>
                        <SelectItem value="130">18-30 ans</SelectItem>
                        <SelectItem value="124">31 ans</SelectItem>
                        <SelectItem value="118">32 ans</SelectItem>
                        <SelectItem value="112">33 ans</SelectItem>
                        <SelectItem value="106">34 ans</SelectItem>
                        <SelectItem value="100">35 ans</SelectItem>
                        <SelectItem value="88">36 ans</SelectItem>
                        <SelectItem value="76">37 ans</SelectItem>
                        <SelectItem value="64">38 ans</SelectItem>
                        <SelectItem value="52">39 ans</SelectItem>
                        <SelectItem value="40">40 ans</SelectItem>
                        <SelectItem value="26">41 ans</SelectItem>
                        <SelectItem value="13">42 ans</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Education */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Niveau de scolarité</Label>
                    <Select onValueChange={(value) => updateScore("education", Number.parseInt(value))}>
                      <SelectTrigger className="mobile-select">
                        <SelectValue placeholder="Sélectionner le niveau d'éducation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Aucun / Secondaire non terminé</SelectItem>
                        <SelectItem value="20">Secondaire général ou professionnel</SelectItem>
                        <SelectItem value="40">Post-secondaire technique (1-2 ans)</SelectItem>
                        <SelectItem value="70">DEC technique / Post-secondaire (3 ans)</SelectItem>
                        <SelectItem value="90">Universitaire 1er cycle (Baccalauréat 3+ ans)</SelectItem>
                        <SelectItem value="110">Universitaire 2e cycle (Maîtrise)</SelectItem>
                        <SelectItem value="130">Universitaire 3e cycle (Doctorat)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Field of Study */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Domaine de formation
                      <button
                        onClick={() => setShowFieldExplanation(!showFieldExplanation)}
                        className="ml-2 text-xs text-blue-600 underline hover:text-blue-800 transition-colors"
                      >
                        + d'infos
                      </button>
                    </Label>
                    <Select onValueChange={(value) => updateScore("fieldOfStudy", Number.parseInt(value))}>
                      <SelectTrigger className="mobile-select">
                        <SelectValue placeholder="Sélectionner la catégorie de domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Non applicable / Non listé</SelectItem>
                        <SelectItem value="10">Domaine général / Peu en demande</SelectItem>
                        <SelectItem value="40">TI, Génie, Gestion spécialisée, Finance</SelectItem>
                        <SelectItem value="70">Santé, Services sociaux, Enseignement, Éducation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Expérience de travail</Label>
                    <Select onValueChange={(value) => updateScore("workExperience", Number.parseInt(value))}>
                      <SelectTrigger className="mobile-select">
                        <SelectValue placeholder="Sélectionner la durée d'expérience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Moins de 6 mois</SelectItem>
                        <SelectItem value="20">6-11 mois</SelectItem>
                        <SelectItem value="40">12-23 mois</SelectItem>
                        <SelectItem value="60">24-35 mois</SelectItem>
                        <SelectItem value="80">36-47 mois</SelectItem>
                        <SelectItem value="100">48+ mois</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Field Explanation */}
                {showFieldExplanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm mb-6">
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-semibold text-blue-900 mb-1">
                          1. Domaine général / Peu en demande (10 pts)
                        </h5>
                        <p className="text-blue-800 text-xs leading-relaxed mb-2">
                          Formations générales sans spécialisation technique pointue. Exemples : Sciences humaines
                          générales, Arts sans lien numérique, Administration générale.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-blue-900 mb-1">2. Non applicable / Non listé (0 pts)</h5>
                        <p className="text-blue-800 text-xs leading-relaxed mb-2">
                          Si votre domaine ne correspond à aucune catégorie ou si vous n'êtes pas certain.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-blue-900 mb-1">
                          3. TI, Génie, Gestion spécialisée, Finance (40 pts)
                        </h5>
                        <p className="text-blue-800 text-xs leading-relaxed mb-2">
                          Développeurs, Ingénieurs (civil, mécanique, électrique), Gestionnaires de projet TI,
                          Comptables CPA, Analystes financiers.
                        </p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-blue-900 mb-1">
                          4. Santé, Services sociaux, Enseignement (70 pts)
                        </h5>
                        <p className="text-blue-800 text-xs leading-relaxed">
                          Infirmiers, Préposés aux bénéficiaires, Médecins, Travailleurs sociaux, Enseignants,
                          Éducateurs petite enfance. Note : Professions souvent réglementées.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Spouse Information */}
                {hasSpouse && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Informations du conjoint/partenaire</h4>
                    <div className="mobile-grid grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Compétences orales françaises du conjoint
                        </Label>
                        <Select onValueChange={(value) => updateScore("spouseFrenchOral", Number.parseInt(value))}>
                          <SelectTrigger className="mobile-select">
                            <SelectValue placeholder="Sélectionner le niveau NCLC" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">NCLC 1-4</SelectItem>
                            <SelectItem value="10">NCLC 5-6</SelectItem>
                            <SelectItem value="20">NCLC 7+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Âge du conjoint</Label>
                        <Select onValueChange={(value) => updateScore("spouseAge", Number.parseInt(value))}>
                          <SelectTrigger className="mobile-select">
                            <SelectValue placeholder="Sélectionnez l'âge" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20">18-35 ans</SelectItem>
                            <SelectItem value="10">36-40 ans</SelectItem>
                            <SelectItem value="0">41+ ans</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Éducation du conjoint</Label>
                        <Select onValueChange={(value) => updateScore("spouseEducation", Number.parseInt(value))}>
                          <SelectTrigger className="mobile-select">
                            <SelectValue placeholder="Sélectionner le niveau d'éducation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Aucun / Secondaire non terminé</SelectItem>
                            <SelectItem value="5">Secondaire</SelectItem>
                            <SelectItem value="10">Post-secondaire / DEC / Baccalauréat</SelectItem>
                            <SelectItem value="20">Diplôme d'études supérieures (Maîtrise/Doctorat)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium mb-2 block">Domaine d'études du conjoint</Label>
                        <Select onValueChange={(value) => updateScore("spouseFieldOfStudy", Number.parseInt(value))}>
                          <SelectTrigger className="mobile-select">
                            <SelectValue placeholder="Sélectionner la catégorie de domaine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Domaine non en demande</SelectItem>
                            <SelectItem value="10">Domaine en demande</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </MemoizedCard>
          </div>

          {/* French Language Skills */}
          <div ref={frenchRef} id="french-section">
            <MemoizedCard className="mobile-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <span className="text-lg">🇫🇷</span>
                  Compétences linguistiques en français (NCLC)
                </CardTitle>
                <CardDescription className="text-sm">
                  Points pour chacune des quatre compétences linguistiques françaises
                </CardDescription>
              </CardHeader>
              <CardContent className="mobile-grid grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 pt-0 px-3 sm:px-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Compréhension orale (Écoute)</Label>
                  <Select onValueChange={(value) => updateScore("frenchOralComprehension", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le niveau NCLC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">NCLC 1-4</SelectItem>
                      <SelectItem value="20">NCLC 5</SelectItem>
                      <SelectItem value="40">NCLC 6</SelectItem>
                      <SelectItem value="80">NCLC 7</SelectItem>
                      <SelectItem value="90">NCLC 8</SelectItem>
                      <SelectItem value="100">NCLC 9</SelectItem>
                      <SelectItem value="110">NCLC 10+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Production orale (Expression)</Label>
                  <Select onValueChange={(value) => updateScore("frenchOralProduction", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le niveau NCLC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">NCLC 1-4</SelectItem>
                      <SelectItem value="20">NCLC 5</SelectItem>
                      <SelectItem value="40">NCLC 6</SelectItem>
                      <SelectItem value="80">NCLC 7</SelectItem>
                      <SelectItem value="90">NCLC 8</SelectItem>
                      <SelectItem value="100">NCLC 9</SelectItem>
                      <SelectItem value="110">NCLC 10+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Compréhension écrite (Lecture)</Label>
                  <Select onValueChange={(value) => updateScore("frenchWrittenComprehension", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le niveau NCLC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">NCLC 1-4</SelectItem>
                      <SelectItem value="10">NCLC 5</SelectItem>
                      <SelectItem value="20">NCLC 6</SelectItem>
                      <SelectItem value="30">NCLC 7+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Production écrite (Écriture)</Label>
                  <Select onValueChange={(value) => updateScore("frenchWrittenProduction", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le niveau NCLC" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">NCLC 1-4</SelectItem>
                      <SelectItem value="10">NCLC 5</SelectItem>
                      <SelectItem value="20">NCLC 6</SelectItem>
                      <SelectItem value="30">NCLC 7+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </MemoizedCard>
          </div>

          {/* English Language Skills */}
          <div ref={englishRef} id="english-section">
            <MemoizedCard className="mobile-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <span className="text-lg">🇬🇧</span>
                  Compétences linguistiques en anglais - Points bonus (CLB)
                </CardTitle>
                <CardDescription className="text-sm">Points bonus pour la maîtrise de l'anglais</CardDescription>
              </CardHeader>
              <CardContent className="mobile-grid grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 pt-0 px-3 sm:px-6">
                {[
                  { key: "englishOralComprehension", label: "Écoute" },
                  { key: "englishOralProduction", label: "Expression" },
                  { key: "englishWrittenComprehension", label: "Lecture" },
                  { key: "englishWrittenProduction", label: "Écriture" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label className="text-sm font-medium mb-2 block">{label}</Label>
                    <Select onValueChange={(value) => updateScore(key as keyof ScoreFactors, Number.parseInt(value))}>
                      <SelectTrigger className="mobile-select">
                        <SelectValue placeholder="Sélectionner le niveau CLB" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">CLB 1-4</SelectItem>
                        <SelectItem value="6">CLB 5-8</SelectItem>
                        <SelectItem value="12">CLB 9+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </MemoizedCard>
          </div>

          {/* Quebec-Specific Factors */}
          <div ref={quebecRef} id="quebec-section">
            <MemoizedCard className="mobile-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Facteurs spécifiques au Québec
                </CardTitle>
                <CardDescription className="text-sm">Points bonus pour les connexions au Québec</CardDescription>
              </CardHeader>
              <CardContent className="mobile-grid grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2 pt-0 px-3 sm:px-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Diplôme du Québec</Label>
                  <Select onValueChange={(value) => updateScore("quebecDiploma", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le diplôme du Québec" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucun diplôme du Québec</SelectItem>
                      <SelectItem value="70">DEP (≥1800h) / AEC / DEC technique</SelectItem>
                      <SelectItem value="100">Diplôme universitaire (Baccalauréat, Maîtrise, Doctorat)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Expérience de travail au Québec</Label>
                  <Select onValueChange={(value) => updateScore("quebecWorkExperience", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner l'expérience de travail au Québec" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucune expérience de travail au Québec</SelectItem>
                      <SelectItem value="70">6-11 mois de travail qualifié</SelectItem>
                      <SelectItem value="110">12+ mois de travail qualifié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </MemoizedCard>
          </div>

          {/* Additional Factors - Now includes Financial Autonomy */}
          <div ref={additionalRef} id="autres-section">
            <MemoizedCard className="mobile-card">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Users className="h-5 w-5" />
                  Facteurs additionnels
                </CardTitle>
                <CardDescription className="text-sm">Autres facteurs qui peuvent ajouter des points</CardDescription>
              </CardHeader>
              <CardContent className="mobile-grid grid gap-4 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-0 px-3 sm:px-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Offre d'emploi validée (MIFI validée)</Label>
                  <Select onValueChange={(value) => updateScore("jobOffer", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le type d'offre d'emploi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucune offre d'emploi</SelectItem>
                      <SelectItem value="180">Offre d'emploi DANS la région métropolitaine de Montréal</SelectItem>
                      <SelectItem value="380">Offre d'emploi HORS de la région métropolitaine de Montréal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Enfants à charge</Label>
                  <Select onValueChange={(value) => updateScore("children", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Sélectionner le nombre d'enfants" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Aucun enfant</SelectItem>
                      <SelectItem value="30">1 enfant</SelectItem>
                      <SelectItem value="55">2+ enfants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Famille proche au Québec</Label>
                  <Select onValueChange={(value) => updateScore("familyInQuebec", Number.parseInt(value))}>
                    <SelectTrigger className="mobile-select">
                      <SelectValue placeholder="Famille au Québec?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Non</SelectItem>
                      <SelectItem value="20">Oui</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </MemoizedCard>

            {/* Financial Autonomy Section - Now part of Additional Factors */}
            <MemoizedCard className="mobile-card mt-4">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Capacité d'autonomie financière (Condition Essentielle)
                </CardTitle>
                <CardDescription className="text-sm">
                  Cette condition est obligatoire pour obtenir le CSQ et la résidence permanente
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="financial-autonomy"
                      checked={financialAutonomyAccepted}
                      onCheckedChange={(checked) => setFinancialAutonomyAccepted(checked as boolean)}
                      className="mt-1"
                    />
                    <Label htmlFor="financial-autonomy" className="text-sm leading-relaxed text-yellow-800 font-medium">
                      Je comprends que je dois prouver ma capacité d'autonomie financière pour subvenir à mes besoins et
                      à ceux de ma famille pendant les 3 premiers mois. (Ceci n'ajoute pas de points au classement
                      Arrima mais est obligatoire pour le CSQ/RP)
                    </Label>
                  </div>
                </div>
              </CardContent>
            </MemoizedCard>
          </div>

          {/* Email Form and Results */}
          <div className="relative" ref={resultsRef} id="results-section">
            {!showResults && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-start justify-center z-20 rounded-lg p-3 sm:p-4 mobile-email-overlay">
                <MemoizedCard className="border-blue-200 bg-blue-50 w-full max-w-md mobile-card mt-4 sm:mt-8">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                      <Mail className="h-5 w-5 text-blue-600" />
                      Obtenez vos résultats
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Entrez votre courriel pour voir votre répartition détaillée des points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium mb-2 block">
                          Adresse courriel
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="votre.courriel@exemple.com"
                          required
                          className="mobile-select"
                        />
                      </div>
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="privacy"
                          checked={acceptedPrivacy}
                          onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                          className="mt-1"
                        />
                        <Label htmlFor="privacy" className="text-xs sm:text-sm leading-relaxed">
                          J'accepte la{" "}
                          <a href="#" className="text-blue-600 underline">
                            Politique de confidentialité
                          </a>{" "}
                          et les Conditions d'utilisation
                        </Label>
                      </div>
                      <Button type="submit" disabled={!email || !acceptedPrivacy} className="w-full h-12 text-base">
                        <Lock className="h-4 w-4 mr-2" />
                        Débloquer mes résultats
                      </Button>
                    </form>
                  </CardContent>
                </MemoizedCard>
              </div>
            )}

            <div className={`${!showResults ? "blur-sm" : ""}`} ref={resultsRef}>
              <MemoizedCard className="mobile-card">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="text-lg sm:text-xl">Répartition détaillée des points</CardTitle>
                  <CardDescription className="text-sm">
                    Répartition complète de tous les points par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 px-3 sm:px-6">
                  <div className="mobile-grid grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-blue-700 text-sm sm:text-base">Compétences linguistiques</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Compréhension orale:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.frenchOralComprehension} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Production orale:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.frenchOralProduction} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Compréhension écrite:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.frenchWrittenComprehension} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Production écrite:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.frenchWrittenProduction} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center font-medium text-blue-700">
                          <span className="flex-1 pr-2">Sous-total français:</span>
                          <MemoizedBadge className="bg-blue-100 text-blue-800 text-xs">{frenchTotal} pts</MemoizedBadge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Anglais (toutes compétences):</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {englishTotal} pts
                          </MemoizedBadge>
                        </div>
                      </div>

                      <h4 className="font-semibold text-purple-700 pt-4 text-sm sm:text-base">Capital humain</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Âge:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.age} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Niveau de scolarité:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.education} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Domaine de formation:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.fieldOfStudy} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Expérience de travail:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.workExperience} pts
                          </MemoizedBadge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-orange-700 text-sm sm:text-base">Facteurs Québec</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Diplôme du Québec:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.quebecDiploma} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Expérience de travail au Québec:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.quebecWorkExperience} pts
                          </MemoizedBadge>
                        </div>
                      </div>

                      <h4 className="font-semibold text-pink-700 pt-4 text-sm sm:text-base">Facteurs conjoint</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Compétences orales françaises du conjoint:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.spouseFrenchOral} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Âge du conjoint:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.spouseAge} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Éducation du conjoint:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.spouseEducation} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Domaine d'études du conjoint:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.spouseFieldOfStudy} pts
                          </MemoizedBadge>
                        </div>
                      </div>

                      <h4 className="font-semibold text-green-700 pt-4 text-sm sm:text-base">Facteurs additionnels</h4>
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Offre d'emploi:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.jobOffer} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Enfants à charge:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.children} pts
                          </MemoizedBadge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="flex-1 pr-2">Famille proche au Québec:</span>
                          <MemoizedBadge variant="outline" className="text-xs">
                            {scores.familyInQuebec} pts
                          </MemoizedBadge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4 sm:my-6" />
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
                    <span className="text-lg sm:text-xl font-bold">SCORE TOTAL:</span>
                    <span className={`text-lg sm:text-xl px-3 sm:px-4 py-2 font-bold ${getTotalScoreColor()}`}>
                      {totalScore} points
                    </span>
                  </div>

                  {showResults && !financialAutonomyAccepted && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-red-800 leading-relaxed font-medium">
                        <strong>⚠️ ATTENTION :</strong> Vous n'avez pas confirmé votre compréhension de l'exigence
                        d'autonomie financière. Cette condition est OBLIGATOIRE pour obtenir le CSQ et la résidence
                        permanente. Veuillez cocher cette case dans la section précédente.
                      </p>
                    </div>
                  )}

                  {showResults && financialAutonomyAccepted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800 leading-relaxed">
                        <strong>✅ Autonomie financière confirmée :</strong> Vous avez confirmé votre compréhension de
                        cette exigence obligatoire.
                      </p>
                    </div>
                  )}

                  {showResults && (
                    <>
                      <Separator className="my-6" />
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Interprétation de Votre Score et Prochaines Étapes
                          </h3>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-800 leading-relaxed">
                              {generateRecommendations.scoreInterpretation}
                            </p>
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                              <Heart className="h-4 w-4 text-red-600" />
                              Recommandations Personnalisées
                            </h3>
                            {generateRecommendations.recommendations.length > 0 ? (
                              <div className="space-y-4">
                                {generateRecommendations.recommendations.map((recommendation, index) => (
                                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                      <recommendation.icon className="h-5 w-5 text-gray-700" />
                                      <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                      {recommendation.description}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800 leading-relaxed">
                                  Votre profil est excellent ! Aucune recommandation spécifique n'est nécessaire.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
                            <h4 className="font-semibold text-gray-900 mb-2">Rappel sur les Invitations :</h4>
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                              Les invitations Arrima dépendent de nombreux facteurs : le nombre de candidats dans le
                              bassin, les besoins du marché du travail québécois, les objectifs d'immigration du
                              gouvernement, la répartition géographique souhaitée, et les priorités sectorielles. Le
                              score minimum varie selon ces facteurs et peut changer d'un tirage à l'autre.
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm text-blue-800 font-medium">
                                <strong>
                                  Scores d'Invitation Récents (Tirages Généraux sans offre/profession ciblée) :
                                </strong>{" "}
                                Souvent observés entre 570 et 620+ points. Cette fourchette est indicative et évolue.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between mt-6">
                    <Button variant="secondary" onClick={resetCalculator}>
                      Réinitialiser
                    </Button>
                    <Button onClick={downloadResults} disabled={!showResults}>
                      Télécharger les résultats
                    </Button>
                  </div>
                </CardContent>
              </MemoizedCard>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>© 2025 Simulateur de Score de Classement Arrima Québec. Conçu par J'arrive Québec.</strong>
              <br />
              <br />
              Cet outil fournit une estimation et est à titre indicatif seulement. Les barèmes de points sont des
              estimations basées sur les informations publiques et les tendances observées et peuvent différer des
              calculs officiels du MIFI. Ce score ne garantit PAS une invitation.
              <br />
              <br />
              Veuillez toujours consulter le site officiel de l'immigration du Québec (MIFI) pour les informations
              exactes et les critères à jour.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
            <div className="mx-auto max-w-6xl px-2 sm:px-4 py-2 sm:py-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">Évolution de votre score</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 mb-2">
                <div
                  className={`h-2 sm:h-3 rounded-full transition-all duration-500 ease-out ${getScoreProgressColor()}`}
                  style={{ width: `${pointsBasedProgress}%` }}
                ></div>
              </div>
              <p className="text-center text-xs sm:text-sm font-medium text-gray-700">{getScoreProgressMessage()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Export as default
export default ArrimaCalculator
