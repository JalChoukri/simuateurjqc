// Score tracking object
const scores = {
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

let totalScore = 0
let hasSpouse = false
let showResults = false
let financialAutonomyAccepted = false
let mounted = false

// Cached DOM Elements for performance
const cachedElements = {}

// DOM Elements
const emailOverlay = document.getElementById("email-overlay")
const resultsContent = document.getElementById("results-content")
const emailForm = document.getElementById("email-form")
const spouseFields = document.getElementById("spouse-fields")
const progressFill = document.getElementById("progress-fill")
const progressMessage = document.getElementById("progress-message")
const recommendations = document.getElementById("recommendations")
const resetSection = document.getElementById("reset-section")
const financialStatus = document.getElementById("financial-status")

// Performance optimizations
const throttle = (func, limit) => {
  let inThrottle
  return function () {
    const args = arguments

    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Memoized calculations
const memoizedCalculations = {
  totalScore: null,
  completionPercentage: null,
  frenchTotal: null,
  englishTotal: null,
}

// Initialize the calculator
document.addEventListener("DOMContentLoaded", () => {
  mounted = true
  cacheElements()
  initializeEventListeners()
  updateProgress()
  updateScoreDisplay()
})

// Cache DOM elements for better performance
function cacheElements() {
  const elements = [
    "score-french-oral-comp",
    "score-french-oral-prod",
    "score-french-written-comp",
    "score-french-written-prod",
    "score-age",
    "score-education",
    "score-field",
    "score-work",
    "score-quebec-diploma",
    "score-quebec-work",
    "score-spouse-french",
    "score-spouse-age",
    "score-spouse-education",
    "score-spouse-field",
    "score-job-offer",
    "score-children",
    "score-family",
    "score-french-total",
    "score-english-total",
    "total-score",
    "completion-percentage",
  ]

  elements.forEach((id) => {
    cachedElements[id] = document.getElementById(id)
  })
}

// Event Listeners with performance optimizations
function initializeEventListeners() {
  // Navigation buttons
  document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const section = this.dataset.section
      scrollToSection(section)
      updateActiveNavButton(section)
    })
  })

  // Score selects with debounced updates
  document.querySelectorAll(".form-select[data-score]").forEach((select) => {
    select.addEventListener(
      "change",
      debounce(function () {
        const scoreKey = this.dataset.score
        const value = Number.parseInt(this.value) || 0
        updateScore(scoreKey, value)
      }, 100),
    )
  })

  // Spouse radio buttons
  document.querySelectorAll('input[name="hasSpouse"]').forEach((radio) => {
    radio.addEventListener("change", function () {
      hasSpouse = this.value === "true"
      toggleSpouseFields()
      if (!hasSpouse) {
        // Reset spouse scores
        scores.spouseFrenchOral = 0
        scores.spouseAge = 0
        scores.spouseEducation = 0
        scores.spouseFieldOfStudy = 0
        // Reset spouse form fields
        document.querySelectorAll("#spouse-fields .form-select").forEach((select) => {
          select.value = ""
        })
      }
      calculateTotal()
      updateScoreDisplay()
      updateProgress()
    })
  })

  // Financial autonomy checkbox
  const financialCheckbox = document.getElementById("financial-autonomy-checkbox")
  if (financialCheckbox) {
    financialCheckbox.addEventListener("change", function () {
      financialAutonomyAccepted = this.checked
      updateProgress()
      updateFinancialStatus()
    })
  }

  // Email form
  if (emailForm) {
    emailForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const email = document.getElementById("email-input").value
      const privacy = document.getElementById("privacy-checkbox").checked

      if (email && privacy) {
        showResults = true
        if (emailOverlay) emailOverlay.style.display = "none"
        if (resultsContent) resultsContent.classList.add("show")
        if (recommendations) recommendations.style.display = "block"
        if (resetSection) resetSection.style.display = "block"
        updateFinancialStatus()
        generateRecommendations()
      }
    })
  }

  // Reset button
  const resetBtn = document.getElementById("reset-btn")
  if (resetBtn) {
    resetBtn.addEventListener("click", resetCalculator)
  }

  // Throttled scroll spy
  if (mounted) {
    window.addEventListener("scroll", throttle(handleScroll, 100), { passive: true })
  }
}

// Score management with memoization
function updateScore(key, value) {
  scores[key] = value
  // Clear memoized calculations
  memoizedCalculations.totalScore = null
  memoizedCalculations.completionPercentage = null
  memoizedCalculations.frenchTotal = null
  memoizedCalculations.englishTotal = null

  calculateTotal()
  updateScoreDisplay()
  updateProgress()
}

function calculateTotal() {
  if (memoizedCalculations.totalScore === null) {
    memoizedCalculations.totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  }
  totalScore = memoizedCalculations.totalScore
}

// UI Updates with performance optimizations
function updateScoreDisplay() {
  // Use requestAnimationFrame for smooth updates
  requestAnimationFrame(() => {
    // Individual scores with cached elements
    const scoreUpdates = {
      "score-french-oral-comp": scores.frenchOralComprehension,
      "score-french-oral-prod": scores.frenchOralProduction,
      "score-french-written-comp": scores.frenchWrittenComprehension,
      "score-french-written-prod": scores.frenchWrittenProduction,
      "score-age": scores.age,
      "score-education": scores.education,
      "score-field": scores.fieldOfStudy,
      "score-work": scores.workExperience,
      "score-quebec-diploma": scores.quebecDiploma,
      "score-quebec-work": scores.quebecWorkExperience,
      "score-spouse-french": scores.spouseFrenchOral,
      "score-spouse-age": scores.spouseAge,
      "score-spouse-education": scores.spouseEducation,
      "score-spouse-field": scores.spouseFieldOfStudy,
      "score-job-offer": scores.jobOffer,
      "score-children": scores.children,
      "score-family": scores.familyInQuebec,
    }

    Object.entries(scoreUpdates).forEach(([id, value]) => {
      const element = cachedElements[id]
      if (element) {
        element.textContent = `${value} pts`
      }
    })

    // French total with memoization
    if (memoizedCalculations.frenchTotal === null) {
      memoizedCalculations.frenchTotal =
        scores.frenchOralComprehension +
        scores.frenchOralProduction +
        scores.frenchWrittenComprehension +
        scores.frenchWrittenProduction
    }

    const frenchTotalElement = cachedElements["score-french-total"]
    if (frenchTotalElement) {
      frenchTotalElement.textContent = `${memoizedCalculations.frenchTotal} pts`
    }

    // English total with memoization
    if (memoizedCalculations.englishTotal === null) {
      memoizedCalculations.englishTotal =
        scores.englishOralComprehension +
        scores.englishOralProduction +
        scores.englishWrittenComprehension +
        scores.englishWrittenProduction
    }

    const englishTotalElement = cachedElements["score-english-total"]
    if (englishTotalElement) {
      englishTotalElement.textContent = `${memoizedCalculations.englishTotal} pts`
    }

    // Total score with dynamic color
    const totalScoreElement = cachedElements["total-score"]
    if (totalScoreElement) {
      totalScoreElement.textContent = `${totalScore} points`

      // Update total score color based on progress
      const completionPercentage = calculateCompletionPercentage()
      totalScoreElement.className = "total-score-text"

      if (totalScore < 300) {
        totalScoreElement.classList.add("red")
      } else if (totalScore < 600) {
        totalScoreElement.classList.add("yellow")
      } else {
        totalScoreElement.classList.add("green")
      }
    }

    // Completion percentage
    const completionElement = cachedElements["completion-percentage"]
    if (completionElement) {
      const percentage = Math.round(calculateCompletionPercentage())
      completionElement.textContent = `${percentage}% complété`
    }
  })
}

function calculateCompletionPercentage() {
  if (memoizedCalculations.completionPercentage === null) {
    const totalFields = Object.keys(scores).length // Remove +1 for financial autonomy
    const completedFields = Object.values(scores).filter((score) => score > 0).length
    memoizedCalculations.completionPercentage = (completedFields / totalFields) * 100
  }
  return memoizedCalculations.completionPercentage
}

function calculatePointsBasedProgress() {
  const maxPossibleScore = 1346
  return Math.min((totalScore / maxPossibleScore) * 100, 100)
}

function updateProgress() {
  const pointsProgress = Math.round(calculatePointsBasedProgress())

  if (progressFill) {
    progressFill.style.width = `${pointsProgress}%`
  }

  // Update progress color and message based on score
  if (progressFill && progressMessage) {
    if (totalScore < 300) {
      progressFill.className = "progress-fill"
      progressMessage.textContent = "Score faible - Améliorations nécessaires"
    } else if (totalScore < 600) {
      progressFill.className = "progress-fill yellow"
      progressMessage.textContent = "Bon score - Vous êtes sur la bonne voie"
    } else {
      progressFill.className = "progress-fill green"
      progressMessage.textContent = "Excellent score - Profil très compétitif"
    }
  }
}

function updateFinancialStatus() {
  if (!financialStatus || !showResults) return

  financialStatus.style.display = "block"

  if (!financialAutonomyAccepted) {
    financialStatus.innerHTML = `
      <div class="financial-warning">
        <p><strong>⚠️ ATTENTION :</strong> Vous n'avez pas confirmé votre compréhension de l'exigence d'autonomie financière. Cette condition est OBLIGATOIRE pour obtenir le CSQ et la résidence permanente. Veuillez cocher cette case dans la section précédente.</p>
      </div>
    `
  } else {
    financialStatus.innerHTML = `
      <div class="financial-confirmed">
        <p><strong>✅ Autonomie financière confirmée :</strong> Vous avez confirmé votre compréhension de cette exigence obligatoire.</p>
      </div>
    `
  }
}

function toggleSpouseFields() {
  if (spouseFields) {
    if (hasSpouse) {
      spouseFields.style.display = "block"
    } else {
      spouseFields.style.display = "none"
    }
  }
}

// Navigation with performance optimizations
function scrollToSection(sectionId) {
  if (!mounted) return

  const sectionMap = {
    profil: "profil-section",
    french: "french-section",
    english: "english-section",
    quebec: "quebec-section",
    autres: "autres-section",
    results: "results-section",
  }

  const sectionElementId = sectionMap[sectionId]
  const section = document.getElementById(sectionElementId)

  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" })
  }
}

function updateActiveNavButton(activeSection) {
  document.querySelectorAll(".nav-btn, .mobile-nav-btn").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.dataset.section === activeSection) {
      btn.classList.add("active")
    }
  })
}

const navigationItems = [
  { id: "profil", label: "Profil", section: "profil-section" },
  { id: "french", label: "Français", section: "french-section" },
  { id: "english", label: "Anglais", section: "english-section" },
  { id: "quebec", label: "Québec", section: "quebec-section" },
  { id: "autres", label: "Autres", section: "autres-section" },
  { id: "results", label: "Résultat", section: "results-section" },
]

function handleScroll() {
  if (!mounted) return

  const scrollY = window.scrollY
  const profilSection = document.getElementById("profil-section")
  const navbar = document.querySelector(".sticky-nav")

  // Show navbar when visitor is ON the profil section
  if (profilSection) {
    const profilTop = profilSection.offsetTop
    if (scrollY >= profilTop) {
      navbar?.classList.add("show")
    } else {
      navbar?.classList.remove("show")
    }
  }

  // Update active section
  const sections = [
    { id: "profil", element: document.getElementById("profil-section") },
    { id: "french", element: document.getElementById("french-section") },
    { id: "english", element: document.getElementById("english-section") },
    { id: "quebec", element: document.getElementById("quebec-section") },
    { id: "autres", element: document.getElementById("autres-section") },
    { id: "results", element: document.getElementById("results-section") },
  ]

  const scrollPosition = scrollY + 200

  for (const section of sections) {
    if (section.element) {
      const { offsetTop, offsetHeight } = section.element
      if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
        updateActiveNavButton(section.id)
        break
      }
    }
  }
}

// Recommendations with memoization
function generateRecommendations() {
  const baseScore = totalScore - scores.jobOffer
  const frenchTotal =
    memoizedCalculations.frenchTotal ||
    scores.frenchOralComprehension +
      scores.frenchOralProduction +
      scores.frenchWrittenComprehension +
      scores.frenchWrittenProduction

  // Generate score interpretation
  let scoreInterpretation = ""
  let chanceLevel = ""

  if (scores.jobOffer > 0) {
    if (totalScore >= 800) {
      chanceLevel = "TRÈS ÉLEVÉES"
      scoreInterpretation = `Avec une offre d'emploi validée et un score total de ${totalScore} points (score de base sans offre: ${baseScore}), vos chances d'invitation sont ${chanceLevel}. Les candidats avec une offre d'emploi validée sont souvent priorisés, surtout si elle est hors de la CMM. Assurez-vous que votre offre est bien validée par le MIFI.`
    } else if (totalScore >= 600) {
      chanceLevel = "ÉLEVÉES"
      scoreInterpretation = `Avec une offre d'emploi validée et un score total de ${totalScore} points (score de base sans offre: ${baseScore}), vos chances d'invitation sont ${chanceLevel}. Votre offre d'emploi vous donne un avantage significatif.`
    } else {
      chanceLevel = "MODÉRÉES"
      scoreInterpretation = `Avec une offre d'emploi validée et un score total de ${totalScore} points (score de base sans offre: ${baseScore}), vos chances d'invitation sont ${chanceLevel}. Bien que l'offre d'emploi soit un atout, il serait bénéfique d'améliorer d'autres aspects de votre profil.`
    }
  } else {
    if (totalScore >= 620) {
      chanceLevel = "TRÈS ÉLEVÉES"
      scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont ${chanceLevel}. Votre profil est très compétitif pour les tirages généraux.`
    } else if (totalScore >= 570) {
      chanceLevel = "ÉLEVÉES"
      scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont ${chanceLevel}. Votre score se situe dans la fourchette souvent observée lors des tirages généraux.`
    } else if (totalScore >= 400) {
      chanceLevel = "MODÉRÉES"
      scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont ${chanceLevel}. Il serait recommandé d'améliorer certains aspects de votre profil pour augmenter vos chances.`
    } else {
      chanceLevel = "FAIBLES"
      scoreInterpretation = `Avec un score de ${totalScore} points, vos chances d'invitation sont ${chanceLevel}. Il est important d'améliorer significativement votre profil avant de soumettre votre candidature.`
    }
  }

  // Update score interpretation
  const scoreInterpretationElement = document.getElementById("score-interpretation")
  if (scoreInterpretationElement) {
    scoreInterpretationElement.innerHTML = `<p>${scoreInterpretation}</p>`
  }

  // Generate specific recommendations
  const recommendationsList = document.getElementById("recommendations-list")
  if (!recommendationsList) return

  const recommendationsArray = []

  if (frenchTotal < 200) {
    recommendationsArray.push({
      title: "Améliorer le français",
      description:
        "Votre score en français est faible. Concentrez-vous sur l'amélioration de vos compétences linguistiques, particulièrement l'oral qui rapporte plus de points.",
      priority: "high",
      icon: "language",
    })
  }

  if (scores.age < 100) {
    recommendationsArray.push({
      title: "Facteur âge",
      description:
        "L'âge impacte votre score. Si vous avez plus de 35 ans, concentrez-vous sur d'autres facteurs pour compenser.",
      priority: "medium",
      icon: "user",
    })
  }

  if (scores.education < 90) {
    recommendationsArray.push({
      title: "Niveau d'éducation",
      description:
        "Considérez obtenir une reconnaissance de diplôme ou poursuivre des études supérieures pour augmenter vos points.",
      priority: "medium",
      icon: "education",
    })
  }

  if (scores.workExperience < 80) {
    recommendationsArray.push({
      title: "Expérience professionnelle",
      description: "Accumulez plus d'expérience de travail qualifiée dans votre domaine avant de postuler.",
      priority: "medium",
      icon: "work",
    })
  }

  if (scores.quebecDiploma === 0 && scores.quebecWorkExperience === 0) {
    recommendationsArray.push({
      title: "Connexion au Québec",
      description:
        "Considérez obtenir un diplôme québécois ou une expérience de travail au Québec pour des points bonus significatifs.",
      priority: "high",
      icon: "location",
    })
  }

  if (scores.jobOffer === 0) {
    recommendationsArray.push({
      title: "Offre d'emploi",
      description:
        "Une offre d'emploi validée par le MIFI peut considérablement augmenter vos chances, surtout si elle est hors de la région de Montréal.",
      priority: "high",
      icon: "trending",
    })
  }

  // Render recommendations with performance optimization
  if (recommendationsArray.length > 0) {
    let recommendationsHTML = '<h4>Recommandations pour améliorer votre profil :</h4><div class="recommendations-grid">'

    recommendationsArray.forEach((rec) => {
      const iconSVG = getIconSVG(rec.icon)
      recommendationsHTML += `
                <div class="recommendation-item ${rec.priority}">
                    ${iconSVG}
                    <div class="recommendation-content">
                        <h5>${rec.title}</h5>
                        <p>${rec.description}</p>
                    </div>
                </div>
            `
    })

    recommendationsHTML += "</div>"
    recommendationsList.innerHTML = recommendationsHTML
  } else {
    recommendationsList.innerHTML = "<p>Excellent profil ! Continuez à maintenir vos qualifications à jour.</p>"
  }
}

function getIconSVG(iconType) {
  const icons = {
    language:
      '<svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg>',
    user: '<svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    education:
      '<svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 0 5-1 7-2"/></svg>',
    work: '<svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    location:
      '<svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    trending:
      '<svg class="recommendation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  }
  return icons[iconType] || icons.user
}

// Reset functionality
function resetCalculator() {
  // Reset all scores
  Object.keys(scores).forEach((key) => {
    scores[key] = 0
  })

  // Clear memoized calculations
  Object.keys(memoizedCalculations).forEach((key) => {
    memoizedCalculations[key] = null
  })

  // Reset state variables
  totalScore = 0
  hasSpouse = false
  showResults = false
  financialAutonomyAccepted = false

  // Reset form elements
  document.querySelectorAll(".form-select").forEach((select) => {
    select.value = ""
  })

  document.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked = false
  })

  document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
    checkbox.checked = false
  })

  document.getElementById("email-input").value = ""

  // Hide spouse fields
  if (spouseFields) {
    spouseFields.style.display = "none"
  }

  // Show email overlay
  if (emailOverlay) {
    emailOverlay.style.display = "flex"
  }

  // Hide results content
  if (resultsContent) {
    resultsContent.classList.remove("show")
  }

  // Hide recommendations and reset section
  if (recommendations) {
    recommendations.style.display = "none"
  }

  if (resetSection) {
    resetSection.style.display = "none"
  }

  if (financialStatus) {
    financialStatus.style.display = "none"
  }

  // Update displays
  updateScoreDisplay()
  updateProgress()

  // Scroll to top
  if (mounted) {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

// Performance monitoring (optional)
if (typeof performance !== "undefined" && performance.mark) {
  performance.mark("calculator-init-start")

  window.addEventListener("load", () => {
    performance.mark("calculator-init-end")
    performance.measure("calculator-init", "calculator-init-start", "calculator-init-end")
  })
}
