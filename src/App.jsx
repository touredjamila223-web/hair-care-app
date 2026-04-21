import React, { useState, useEffect } from 'react';

const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes bounce {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.15); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .animated-view { animation: fadeIn 0.3s ease-in-out; }
  .animated-card { animation: slideIn 0.4s ease-out; }
  .calendar-day-pulse { animation: pulse 2s ease-in-out infinite; }
  .accordion-content-expand { animation: slideIn 0.3s ease-out; }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

export default function HairCareTracker() {
  // ===== ÉTATS PERSISTANTS =====
  const [routines, setRoutines] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hairRoutines')) || []; } catch { return []; }
  });

  const [profil, setProfil] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hairProfil')) || null; } catch { return null; }
  });

  const [selectedProgram, setSelectedProgram] = useState(() => {
    try { return JSON.parse(localStorage.getItem('selectedProgram')) || null; } catch { return null; }
  });

  // ===== ÉTATS UI =====
  const [activeView, setActiveView] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingProfil, setEditingProfil] = useState(false);
  const [profilForm, setProfilForm] = useState(profil || {
    typeCheveaux: '',
    porosite: '',
    densite: '',
    problemes: [],
    objectifs: []
  });

  const [currentWeek, setCurrentWeek] = useState(1);
  const [expandedSoin, setExpandedSoin] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState({});
  const [programmeRoutineState, setProgrammeRoutineState] = useState({});

  const [addingFree, setAddingFree] = useState(false);
  const [selectedSoinType, setSelectedSoinType] = useState(null);
  const [freeRoutineState, setFreeRoutineState] = useState({});

  const [programmeDate, setProgrammeDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [coupes, setCoupes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hairCoupes')) || []; } catch { return []; }
  });
  
  const [selectedRoutineDetail, setSelectedRoutineDetail] = useState(null);
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [editingRoutineData, setEditingRoutineData] = useState(null);
  const [swipedRoutineId, setSwipedRoutineId] = useState(null);
  const [swipeStart, setSwipeStart] = useState(null);

  const [expandedLesson, setExpandedLesson] = useState(null);
  const [showRecap, setShowRecap] = useState(false);
  const [bouncingStarKey, setBouncingStarKey] = useState(null);

  // Animation des rating stars
  const handleStarClick = (callback) => {
    setBouncingStarKey(Math.random());
    callback();
    setTimeout(() => setBouncingStarKey(null), 400);
  };

  // ===== DONNÉES =====
  const soinTypes = {
    'baindhuile': { label: '🛢️ Bain d\'huile', types: ['Nourrissant', 'Hydratant', 'Protéiné'] },
    'prepoo': { label: '🌿 Prepoo', types: ['Hydratant', 'Protéiné', 'Nourrissant'] },
    'demmelage': { label: '🧵 Démêlage', types: [] },
    'shampoing': { label: '🧴 Shampoing', types: ['Doux/Sans sulfate', 'Clarifiant', 'Hydratant'] },
    'conditioner': { label: '💧 Après-shampoing', types: ['Riche', 'Hydratant', 'Léger'] },
    'masque': { label: '🎭 Masque', types: ['Hydratant', 'Protéiné', 'Hydratant + Protéiné'] },
    'leavein': { label: '🧴 Leave-in', types: ['Hydratant', 'Dense', 'Protéiné'] },
    'beurre': { label: '🧈 Beurre/Crème', types: ['Shea', 'Cacao', 'Karité/Classique'] },
    'serum': { label: '✨ Huile/Sérum', types: ['Légère (brillance)', 'Moyenne (équilibre)', 'Lourde (protection)'] }
  };

  const typesCheveux = ['2c', '2b', '3a', '3b', '3c', '4a', '4b', '4c'];
  const problemesListe = ['Casse', 'Sécheresse', 'Perte', 'Démangeaisons', 'Frisottis', 'Pellicules'];
  const objectifsListe = ['Hydratation', 'Force', 'Brillance', 'Volume', 'Pousse', 'Réparation', 'Soin du cuir chevelu'];

  const problemesToObjectives = {
    'Casse': ['Réparation', 'Force', 'Pousse'],
    'Sécheresse': ['Hydratation'],
    'Perte': ['Force', 'Pousse'],
    'Démangeaisons': ['Soin du cuir chevelu'],
    'Frisottis': ['Brillance', 'Hydratation'],
    'Pellicules': ['Soin du cuir chevelu']
  };

  // ===== PROGRAMMES =====
  const allProgrammes = {
    pousse: {
      id: 'pousse',
      nom: '📈 Pousse',
      nomComplet: '📈 Croissance & Longueur',
      duree: '4 semaines',
      description: 'Cheveux qui poussent sans casser',
      semaines: [
        {
          numero: 1,
          titre: 'Fondation Pousse - Semaine 1',
          conseil: '💡 Cheveux forts = moins de casse',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '30-45 min', conseil: 'Hydrate profondément', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare la fibre', soinKey: 'prepoo' },
            { nomComplet: 'Démêlage soigné', duree: '15 min', conseil: 'LA CLÉ!', soinKey: 'demmelage' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie sans agresser', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobe la fibre', soinKey: 'conditioner' },
            { nomComplet: 'Masque hydratant+protéiné', duree: '30 min', conseil: 'Renforce + hydrate', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle 48-72h', soinKey: 'leavein' },
            { nomComplet: 'Beurre shea léger', duree: 'permanent', conseil: 'Protège pointes', soinKey: 'beurre' }
          ]
        },
        {
          numero: 2,
          titre: 'Renforcement - Semaine 2',
          conseil: '💪 Protéines pour renforcer',
          soins: [
            { nomComplet: 'Bain d\'huile protéiné', duree: '30 min', conseil: 'Renforce la fibre', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo protéiné', duree: '10 min', conseil: 'Prépare au renforcement', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie sans décaper', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing protéiné', duree: '5 min', conseil: 'Renforce', soinKey: 'conditioner' },
            { nomComplet: 'Masque protéiné', duree: '30 min', conseil: 'Force maximale', soinKey: 'masque' },
            { nomComplet: 'Leave-in protéiné', duree: 'permanent', conseil: 'Maintient force', soinKey: 'leavein' }
          ]
        },
        {
          numero: 3,
          titre: 'Hydratation - Semaine 3',
          conseil: '💧 Réhydrate après protéines',
          soins: [
            { nomComplet: 'Bain d\'huile hydratant', duree: '45 min', conseil: 'Pénétration profonde', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant riche', duree: '15 min', conseil: 'Booster d\'hydratation', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing hydratant', duree: '5 min', conseil: 'Nettoie sans décaper', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '10 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque hydratant intense', duree: '40 min', conseil: 'Hydratation CHOC', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant épais', duree: 'permanent', conseil: 'Retient l\'eau', soinKey: 'leavein' },
            { nomComplet: 'Beurre shea épais', duree: 'permanent', conseil: 'Scelle', soinKey: 'beurre' }
          ]
        },
        {
          numero: 4,
          titre: 'Finition - Semaine 4',
          conseil: '✨ Prépare pour cycle suivant',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '30 min', conseil: 'Nutrition finale', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoyage final', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque mix', duree: '30 min', conseil: 'Équilibre', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' },
            { nomComplet: 'Huile légère', duree: 'permanent', conseil: 'Brillance', soinKey: 'serum' }
          ]
        }
      ]
    },
    hydratation: {
      id: 'hydratation',
      nom: '💧 Hydratation',
      nomComplet: '💧 Hydratation Profonde',
      duree: '3 semaines',
      description: 'Cheveux hydratés & souples',
      semaines: [
        {
          numero: 1,
          titre: 'Hydratation CHOC - Semaine 1',
          conseil: '💦 Maximum d\'hydratation!',
          soins: [
            { nomComplet: 'Bain d\'huile hydratant', duree: '45-60 min', conseil: 'Pénétration profonde', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant riche', duree: '15 min', conseil: 'Booster', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing hydratant doux', duree: '5 min', conseil: 'Nettoie sans décaper', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing ultra riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque hydratant intense', duree: '40 min', conseil: 'Hydratation CHOC', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant épais', duree: 'permanent', conseil: 'Retient l\'eau', soinKey: 'leavein' },
            { nomComplet: 'Beurre shea épais', duree: 'permanent', conseil: 'Scelle', soinKey: 'beurre' }
          ]
        },
        {
          numero: 2,
          titre: 'Maintien - Semaine 2',
          conseil: '💧 Continue l\'hydratation',
          soins: [
            { nomComplet: 'Bain d\'huile hydratant', duree: '30 min', conseil: 'Hydrate', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing hydratant', duree: '5 min', conseil: 'Nettoie doux', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque hydratant', duree: '30 min', conseil: 'Hydrate', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' }
          ]
        },
        {
          numero: 3,
          titre: 'Scellage Final - Semaine 3',
          conseil: '🔒 Prépare pour cycle suivant',
          soins: [
            { nomComplet: 'Bain d\'huile hydratant', duree: '30 min', conseil: 'Hydrate', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoyage final', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '10 min', conseil: 'Enrobage intensif', soinKey: 'conditioner' },
            { nomComplet: 'Masque hydratant', duree: '30 min', conseil: 'Hydratation finale', soinKey: 'masque' },
            { nomComplet: 'Leave-in dense', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' },
            { nomComplet: 'Beurre shea', duree: 'permanent', conseil: 'Protection', soinKey: 'beurre' }
          ]
        }
      ]
    },
    cuirchevelu: {
      id: 'cuirchevelu',
      nom: '🧪 Cuir Chevelu',
      nomComplet: '🧪 Soin du Cuir Chevelu',
      duree: '3 semaines',
      description: 'Cuir chevelu sain = cheveux sains',
      semaines: [
        {
          numero: 1,
          titre: 'Détox - Semaine 1',
          conseil: '🧼 Purifie SANS agresser',
          soins: [
            { nomComplet: 'Lotion tonique apaisante', duree: '5 min', conseil: 'Prépare', soinKey: 'baindhuile' },
            { nomComplet: 'Gommage exfoliant doux', duree: '10 min', conseil: 'Enlève résidus', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing clarifiant', duree: '5 min', conseil: 'Nettoie sans sulfates', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing longueurs', duree: '5 min', conseil: 'Protège longueurs', soinKey: 'conditioner' },
            { nomComplet: 'Masque cuir chevelu', duree: '20 min', conseil: 'Apaise & régule', soinKey: 'masque' }
          ]
        },
        {
          numero: 2,
          titre: 'Apaisement - Semaine 2',
          conseil: '😌 Apaise & calme',
          soins: [
            { nomComplet: 'Lotion apaisante', duree: '5 min', conseil: 'Apaise', soinKey: 'baindhuile' },
            { nomComplet: 'Shampoing doux apaisant', duree: '5 min', conseil: 'Nettoie doux', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing léger', duree: '5 min', conseil: 'Protège', soinKey: 'conditioner' },
            { nomComplet: 'Masque cuir chevelu', duree: '20 min', conseil: 'Apaise', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant longueurs', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' }
          ]
        },
        {
          numero: 3,
          titre: 'Maintenance - Semaine 3',
          conseil: '✅ Maintient équilibre',
          soins: [
            { nomComplet: 'Lotion équilibrante', duree: '5 min', conseil: 'Équilibre', soinKey: 'baindhuile' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoyage doux', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing', duree: '5 min', conseil: 'Protège', soinKey: 'conditioner' },
            { nomComplet: 'Masque maintenance', duree: '15 min', conseil: 'Maintient', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' }
          ]
        }
      ]
    },
    brillance: {
      id: 'brillance',
      nom: '✨ Brillance',
      nomComplet: '✨ Brillance & Éclat',
      duree: '3 semaines',
      description: 'Cheveux brillants = gainage',
      semaines: [
        {
          numero: 1,
          titre: 'Gainage - Semaine 1',
          conseil: '✨ Huile légère, PAS beurre!',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '30 min', conseil: 'Nourrit', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare gainage', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage brillance', soinKey: 'conditioner' },
            { nomComplet: 'Masque hydratant+protéiné', duree: '30 min', conseil: 'Gainage complet', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle légèrement', soinKey: 'leavein' },
            { nomComplet: 'Huile légère brillance', duree: 'permanent', conseil: 'Jamais beurre!', soinKey: 'serum' }
          ]
        },
        {
          numero: 2,
          titre: 'Renforcement - Semaine 2',
          conseil: '💎 Ajoute protéines',
          soins: [
            { nomComplet: 'Bain d\'huile protéiné', duree: '30 min', conseil: 'Renforce', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque mix', duree: '30 min', conseil: 'Équilibre', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' },
            { nomComplet: 'Huile légère', duree: 'permanent', conseil: 'Brillance', soinKey: 'serum' }
          ]
        },
        {
          numero: 3,
          titre: 'Scellage - Semaine 3',
          conseil: '🔒 Verrouille brillance',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '30 min', conseil: 'Nourrit', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare scellage', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoyage final', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque brillance', duree: '30 min', conseil: 'Scelle brillance', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' },
            { nomComplet: 'Huile légère finale', duree: 'permanent', conseil: 'Brillance max', soinKey: 'serum' }
          ]
        }
      ]
    },
    force: {
      id: 'force',
      nom: '💪 Force',
      nomComplet: '💪 Force & Solidité',
      duree: '3 semaines',
      description: 'Cheveux forts = moins de casse',
      semaines: [
        {
          numero: 1,
          titre: 'Cure Protéines - Semaine 1',
          conseil: '💪 Saturez de protéines',
          soins: [
            { nomComplet: 'Bain d\'huile protéiné', duree: '30 min', conseil: 'Renforce fibre', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo protéiné', duree: '10 min', conseil: 'Prépare renforcement', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie sans décaper', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing protéiné', duree: '5 min', conseil: 'Renforce', soinKey: 'conditioner' },
            { nomComplet: 'Masque protéiné intensif', duree: '30 min', conseil: 'Force maximale', soinKey: 'masque' },
            { nomComplet: 'Leave-in protéiné', duree: 'permanent', conseil: 'Maintient force', soinKey: 'leavein' }
          ]
        },
        {
          numero: 2,
          titre: 'Renforcement Continu - Semaine 2',
          conseil: '💪 Continue protéines',
          soins: [
            { nomComplet: 'Bain d\'huile protéiné', duree: '30 min', conseil: 'Renforce', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo protéiné', duree: '10 min', conseil: 'Prépare', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie doux', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing protéiné', duree: '5 min', conseil: 'Renforce', soinKey: 'conditioner' },
            { nomComplet: 'Masque protéiné', duree: '30 min', conseil: 'Renforce', soinKey: 'masque' },
            { nomComplet: 'Leave-in protéiné', duree: 'permanent', conseil: 'Maintient', soinKey: 'leavein' }
          ]
        },
        {
          numero: 3,
          titre: 'Équilibre - Semaine 3',
          conseil: '⚖️ Ajoute hydratation',
          soins: [
            { nomComplet: 'Bain d\'huile mix', duree: '30 min', conseil: 'Équilibre', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo mix', duree: '10 min', conseil: 'Prépare équilibre', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoyage final', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque mix hydratant+protéiné', duree: '30 min', conseil: 'Équilibre', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' }
          ]
        }
      ]
    },
    reparation: {
      id: 'reparation',
      nom: '🔧 Réparation',
      nomComplet: '🔧 Réparation Intense',
      duree: '4 semaines',
      description: 'Répare cheveux endommagés',
      semaines: [
        {
          numero: 1,
          titre: 'Sauvetage - Semaine 1',
          conseil: '🛡️ MAXIMUM de protection',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '45 min', conseil: 'Nutrition profonde', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant+protéiné', duree: '15 min', conseil: 'Prépare réparation', soinKey: 'prepoo' },
            { nomComplet: 'Démêlage ULTRA délicat', duree: '20 min', conseil: 'TRÈS lentement!', soinKey: 'demmelage' },
            { nomComplet: 'Shampoing très doux', duree: '5 min', conseil: 'Minimaliste', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing ultra riche', duree: '10 min', conseil: 'Protection enveloppe', soinKey: 'conditioner' },
            { nomComplet: 'Masque réparateur intense', duree: '45 min', conseil: 'Réparation CHOC', soinKey: 'masque' },
            { nomComplet: 'Leave-in dense hydratant', duree: 'permanent', conseil: 'Scelle l\'hydratation', soinKey: 'leavein' },
            { nomComplet: 'Beurre épais', duree: 'permanent', conseil: 'Protection maximale', soinKey: 'beurre' }
          ]
        },
        {
          numero: 2,
          titre: 'Renforcement - Semaine 2',
          conseil: '💪 Ajoute protéines',
          soins: [
            { nomComplet: 'Bain d\'huile mix', duree: '30 min', conseil: 'Nourrit & renforce', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo mix', duree: '10 min', conseil: 'Prépare équilibre', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing très doux', duree: '5 min', conseil: 'Nettoie doux', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '10 min', conseil: 'Protection', soinKey: 'conditioner' },
            { nomComplet: 'Masque mix hydratant+protéiné', duree: '30 min', conseil: 'Réparation+force', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' },
            { nomComplet: 'Beurre épais', duree: 'permanent', conseil: 'Protection', soinKey: 'beurre' }
          ]
        },
        {
          numero: 3,
          titre: 'Consolidation - Semaine 3',
          conseil: '🔒 Consolide réparations',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '30 min', conseil: 'Nourrit', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoie doux', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage', soinKey: 'conditioner' },
            { nomComplet: 'Masque réparateur', duree: '30 min', conseil: 'Répare', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle', soinKey: 'leavein' },
            { nomComplet: 'Beurre shea épais', duree: 'permanent', conseil: 'Protection', soinKey: 'beurre' }
          ]
        },
        {
          numero: 4,
          titre: 'Finition - Semaine 4',
          conseil: '✨ Prépare pour cycle suivant',
          soins: [
            { nomComplet: 'Bain d\'huile nourrissant', duree: '30 min', conseil: 'Nutrition finale', soinKey: 'baindhuile' },
            { nomComplet: 'Prepoo hydratant', duree: '10 min', conseil: 'Prépare au scellage', soinKey: 'prepoo' },
            { nomComplet: 'Shampoing doux', duree: '5 min', conseil: 'Nettoyage final', soinKey: 'shampoing' },
            { nomComplet: 'Après-shampoing riche', duree: '5 min', conseil: 'Enrobage final', soinKey: 'conditioner' },
            { nomComplet: 'Masque mix', duree: '30 min', conseil: 'Équilibre final', soinKey: 'masque' },
            { nomComplet: 'Leave-in hydratant', duree: 'permanent', conseil: 'Scelle l\'hydratation', soinKey: 'leavein' },
            { nomComplet: 'Huile légère finale', duree: 'permanent', conseil: 'Brillance & protection', soinKey: 'serum' }
          ]
        }
      ]
    }
  };

  // ===== FONCTIONS =====
  const getRecommendedObjectives = (selectedProblemes) => {
    const recommended = new Set();
    selectedProblemes.forEach(probleme => {
      if (problemesToObjectives[probleme]) {
        problemesToObjectives[probleme].forEach(obj => recommended.add(obj));
      }
    });
    return Array.from(recommended);
  };

  const getMarquesUtilisees = () => {
    const marques = new Set();
    routines.forEach(routine => {
      routine.soins.forEach(soin => {
        if (soin.marque && soin.marque !== 'Non spécifiée') {
          marques.add(soin.marque);
        }
      });
    });
    return Array.from(marques).sort();
  };

  const getProgrammesRecommandes = () => {
    if (!profil || !profil.typeCheveaux) return [];
    const programmes = [];
    const objectifs = profil.objectifs || [];

    if (objectifs.includes('Pousse')) programmes.push(allProgrammes.pousse);
    if (objectifs.includes('Hydratation')) programmes.push(allProgrammes.hydratation);
    if (objectifs.includes('Soin du cuir chevelu')) programmes.push(allProgrammes.cuirchevelu);
    if (objectifs.includes('Brillance')) programmes.push(allProgrammes.brillance);
    if (objectifs.includes('Force')) programmes.push(allProgrammes.force);
    if (objectifs.includes('Réparation')) programmes.push(allProgrammes.reparation);

    return programmes;
  };

  // VÉRIFIER SI PROGRAMME TERMINÉ
  const routinesForCurrentProgram = selectedProgram 
    ? routines.filter(r => r.programmeId === selectedProgram.id)
    : [];
  
  const isProgrammeFinished = selectedProgram && routinesForCurrentProgram.length >= selectedProgram.semaines.length;

  const getRecapStats = () => {
    if (!selectedProgram) return null;
    const avg = routinesForCurrentProgram.length > 0
      ? Math.round(routinesForCurrentProgram.reduce((sum, r) => sum + (r.evaluation || 0), 0) / routinesForCurrentProgram.length * 10) / 10
      : 0;
    
    return {
      completes: routinesForCurrentProgram.length,
      total: selectedProgram.semaines.length,
      avgSatisfaction: avg
    };
  };

  // ===== SAUVEGARDE =====
  useEffect(() => {
    try { localStorage.setItem('hairRoutines', JSON.stringify(routines)); } catch (e) { }
  }, [routines]);

  useEffect(() => {
    try { if (profil) localStorage.setItem('hairProfil', JSON.stringify(profil)); } catch (e) { }
  }, [profil]);

  useEffect(() => {
    try { if (selectedProgram) localStorage.setItem('selectedProgram', JSON.stringify(selectedProgram)); } catch (e) { }
  }, [selectedProgram]);

  useEffect(() => {
    try { localStorage.setItem('hairCoupes', JSON.stringify(coupes)); } catch (e) { }
  }, [coupes]);

  // ===== FONCTIONS PROFIL =====
  const saveProfil = () => {
    if (!profilForm.typeCheveaux) {
      alert('Sélectionnez votre type de cheveux!');
      return;
    }
    setProfil(profilForm);
    setSelectedProgram(null);
    localStorage.removeItem('selectedProgram');
    setEditingProfil(false);
    alert('✅ Profil sauvegardé!');
    setActiveView('programme');
  };

  // ===== FONCTIONS PROGRAMME =====
  const selectProgram = (program) => {
    setSelectedProgram(program);
    setCurrentWeek(1);
    setProgrammeRoutineState({});
    setSelectedTypes({});
    setProgrammeDate(new Date().toISOString().split('T')[0]);
    setActiveView('programme');
  };

  const saveProgrammeRoutine = () => {
    const date = programmeDate;
    const soinsDetails = [];
    
    Object.keys(programmeRoutineState).forEach(key => {
      if (key !== 'notes' && key !== 'evaluation' && programmeRoutineState[key].checked) {
        soinsDetails.push({
          id: key,
          label: programmeRoutineState[key].label,
          type: selectedTypes[key] || 'Non spécifié',
          marque: programmeRoutineState[key].marque || 'Non spécifiée',
          photo: programmeRoutineState[key].photo || null,
          rating: programmeRoutineState[key].rating || 0
        });
      }
    });

    if (soinsDetails.length === 0) {
      alert('Sélectionnez au moins un soin!');
      return;
    }

    const newRoutine = {
      id: Date.now(),
      date: date,
      soins: soinsDetails,
      notes: programmeRoutineState.notes || '',
      evaluation: programmeRoutineState.evaluation || 0,
      programmeId: selectedProgram?.id,
      week: currentWeek
    };
    
    const updatedRoutines = [...routines, newRoutine];
    setRoutines(updatedRoutines);
    
    // Vérifier si programme terminé
    const routinesProgram = updatedRoutines.filter(r => r.programmeId === selectedProgram?.id);
    const isComplete = routinesProgram.length >= selectedProgram.semaines.length;
    
    alert('✅ Routine sauvegardée!');
    setProgrammeRoutineState({});
    setProgrammeDate(new Date().toISOString().split('T')[0]);
    
    if (isComplete) {
      setShowRecap(true);
    }
  };

  const handlePhotoChangeProgramme = (key, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProgrammeRoutineState({
          ...programmeRoutineState,
          [key]: { ...programmeRoutineState[key], photo: e.target.result }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const startNewCycle = (programId) => {
    const program = Object.values(allProgrammes).find(p => p.id === programId);
    if (program) {
      setCurrentWeek(1);
      setProgrammeRoutineState({});
      setSelectedTypes({});
      selectProgram(program);
    }
  };

  // ===== FONCTIONS LIBRE =====
  const saveFreeRoutine = () => {
    if (!selectedSoinType) {
      alert('Sélectionnez un soin!');
      return;
    }

    const date = new Date().toISOString().split('T')[0];
    const newRoutine = {
      id: Date.now(),
      date: date,
      soins: [{
        id: selectedSoinType,
        label: soinTypes[selectedSoinType].label,
        type: freeRoutineState.selectedType || '',
        marque: freeRoutineState.marque || 'Non spécifiée',
        photo: freeRoutineState.photo || null,
        rating: freeRoutineState.rating || 0
      }],
      notes: freeRoutineState.notes || '',
      evaluation: freeRoutineState.evaluation || 0,
      isFree: true
    };
    
    setRoutines([...routines, newRoutine]);
    alert('✅ Routine libre ajoutée!');
    setAddingFree(false);
    setSelectedSoinType(null);
    setFreeRoutineState({});
  };

  const handlePhotoChangeFree = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFreeRoutineState({ ...freeRoutineState, photo: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // ===== FONCTIONS HISTORIQUE =====
  const handleSwipeStart = (e, routineId) => {
    setSwipeStart(e.touches[0].clientX);
    setSwipedRoutineId(null);
  };

  const handleSwipeEnd = (e, routineId) => {
    if (!swipeStart) return;
    const swipeEnd = e.changedTouches[0].clientX;
    const swipeDistance = swipeStart - swipeEnd;
    
    if (swipeDistance < -50) {
      setSwipedRoutineId(routineId);
    } else if (swipeDistance > 50) {
      setSwipedRoutineId(null);
    }
    setSwipeStart(null);
  };

  const startEditingRoutine = (routine) => {
    setEditingRoutineId(routine.id);
    setEditingRoutineData(JSON.parse(JSON.stringify(routine)));
    setActiveView('edit-routine');
  };

  const saveEditedRoutine = () => {
    setRoutines(routines.map(r => r.id === editingRoutineId ? editingRoutineData : r));
    alert('✅ Routine modifiée!');
    setEditingRoutineId(null);
    setEditingRoutineData(null);
    setActiveView('history');
  };

  const updateEditingSoin = (index, field, value) => {
    const newSoins = [...editingRoutineData.soins];
    newSoins[index] = { ...newSoins[index], [field]: value };
    setEditingRoutineData({ ...editingRoutineData, soins: newSoins });
  };

  const handlePhotoChangeEditMode = (index, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updateEditingSoin(index, 'photo', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteRoutine = (routineId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette routine?')) {
      setRoutines(routines.filter(r => r.id !== routineId));
      setSwipedRoutineId(null);
      alert('✅ Routine supprimée!');
    }
  };

  // ===== FONCTIONS CALENDRIER =====
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getRoutineForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return routines.find(r => r.date === dateStr);
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const programmes = getProgrammesRecommandes();
  const currentWeekData = selectedProgram && selectedProgram.semaines[currentWeek - 1];
  const recapStats = getRecapStats();

  // ===== RENDER =====
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF9F5 0%, #F5EBE0 100%)',
      fontFamily: "'Sora', system-ui, sans-serif",
      paddingBottom: '80px'
    }}>
      {/* HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(212, 113, 77, 0.15)'
      }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '600' }}>🌿 Ma Routine Capillaire</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.9, fontSize: '14px' }}>Pour cheveux crépus en bonne santé 💪</p>
      </div>

      {/* NAVIGATION */}
      <div style={{ display: 'flex', gap: '8px', padding: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { id: 'dashboard', label: '📊 Dashboard' },
          { id: 'profil', label: '🧬 Profil' },
          { id: 'programme', label: '📋 Programme' },
          { id: 'addFree', label: '➕ Libre' },
          { id: 'coupes', label: '✂️ Coupes' },
          { id: 'calendar', label: '📅 Calendrier' },
          { id: 'history', label: '📖 Historique' },
          { id: 'learn', label: '🧠 Apprendre' },
          { id: 'diy', label: '🧪 DIY' }
        ].map(btn => (
          <button
            key={btn.id}
            onClick={() => {
              setActiveView(btn.id);
              setSelectedRoutineDetail(null);
              setEditingProfil(false);
            }}
            style={{
              padding: '8px 14px',
              border: 'none',
              borderRadius: '12px',
              background: activeView === btn.id ? '#D4714D' : '#FFF5F0',
              color: activeView === btn.id ? 'white' : '#D4714D',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '650px', margin: '0 auto', padding: '0 20px' }}>
        {/* ===== DASHBOARD ===== */}
        {activeView === 'dashboard' && (
          <div>
            {!profil || !profil.typeCheveaux ? (
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '40px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666' }}>Créez votre profil pour voir le dashboard! 🧬</p>
                <button
                  onClick={() => setActiveView('profil')}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  ➕ Créer mon profil
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* TITRE */}
                <div style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #FFD9CC 100%)', padding: '20px', borderRadius: '16px', borderLeft: '4px solid #D4714D' }}>
                  <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#D4714D' }}>📊 Votre Progression</h2>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>Vers vos objectifs: {profil.objectifs?.join(', ') || 'Pas d\'objectifs'}</p>
                </div>

                {/* SATISFACTION GLOBALE */}
                <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>⭐ Satisfaction Globale</h3>
                  {routines.length > 0 ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '28px' }}>
                          {'⭐'.repeat(Math.round((routines.reduce((sum, r) => sum + (r.evaluation || 0), 0) / routines.length)))}
                        </div>
                        <div>
                          <p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#333' }}>
                            {(routines.reduce((sum, r) => sum + (r.evaluation || 0), 0) / routines.length).toFixed(1)}/5
                          </p>
                          <p style={{ margin: '0', fontSize: '11px', color: '#999' }}>sur {routines.length} routines</p>
                        </div>
                      </div>
                      {(routines.reduce((sum, r) => sum + (r.evaluation || 0), 0) / routines.length) >= 4 && (
                        <p style={{ margin: '0', padding: '8px', background: '#FFE5D9', borderRadius: '6px', fontSize: '11px', color: '#D4714D', fontWeight: '600' }}>
                          💪 Excellent! Tu es sur la bonne voie!
                        </p>
                      )}
                      {(routines.reduce((sum, r) => sum + (r.evaluation || 0), 0) / routines.length) < 3 && (
                        <p style={{ margin: '0', padding: '8px', background: '#FFE5D9', borderRadius: '6px', fontSize: '11px', color: '#D4714D', fontWeight: '600' }}>
                          💡 Tes cheveux ne sont pas satisfaits. Ajuste ta routine!
                        </p>
                      )}
                    </div>
                  ) : (
                    <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>Aucune routine encore. Commence par le Programme! 📋</p>
                  )}
                </div>

                {/* ROUTINES CE MOIS */}
                <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>📅 Routines This Month</h3>
                  {(() => {
                    const now = new Date();
                    const month = now.getMonth();
                    const year = now.getFullYear();
                    const thisMonthRoutines = routines.filter(r => {
                      const rDate = new Date(r.date);
                      return rDate.getMonth() === month && rDate.getFullYear() === year;
                    }).length;
                    const objectif = 8; // 2 routines/semaine

                    return (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ flex: 1, height: '20px', background: '#F0E6DC', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: 'linear-gradient(90deg, #D4714D 0%, #C66B48 100%)', width: `${Math.min(100, (thisMonthRoutines / objectif) * 100)}%` }}></div>
                          </div>
                          <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#333' }}>{thisMonthRoutines}/{objectif}</p>
                        </div>
                        {thisMonthRoutines >= objectif && (
                          <p style={{ margin: '0', padding: '8px', background: '#FFE5D9', borderRadius: '6px', fontSize: '11px', color: '#D4714D', fontWeight: '600' }}>
                            ✅ Objectif mois atteint!
                          </p>
                        )}
                        {thisMonthRoutines < objectif && (
                          <p style={{ margin: '0', padding: '8px', background: '#FFE5D9', borderRadius: '6px', fontSize: '11px', color: '#D4714D', fontWeight: '600' }}>
                            📈 {objectif - thisMonthRoutines} routines pour atteindre l'objectif
                          </p>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* PAR OBJECTIF */}
                {profil.objectifs && profil.objectifs.length > 0 && (
                  <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>🎯 Satisfaction par Objectif</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {profil.objectifs.map(obj => {
                        const objRoutines = routines.filter(r => {
                          const programmeForRoutine = selectedProgram && r.programmeId === selectedProgram.id;
                          return programmeForRoutine || r.isFree;
                        });
                        const avgSat = objRoutines.length > 0 
                          ? (objRoutines.reduce((sum, r) => sum + (r.evaluation || 0), 0) / objRoutines.length).toFixed(1)
                          : 0;

                        return (
                          <div key={obj} style={{ padding: '12px', background: '#F9F6F3', borderRadius: '8px', borderLeft: '4px solid #D4714D' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                              <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#333' }}>{obj}</p>
                              <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>
                                {'⭐'.repeat(Math.round(avgSat))} {avgSat}
                              </p>
                            </div>
                            <div style={{ height: '4px', background: '#E8E8E8', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', background: 'linear-gradient(90deg, #D4714D 0%, #C66B48 100%)', width: `${avgSat * 20}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STATS GÉNÉRALES */}
                <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>📊 Statistiques Générales</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', background: '#F9F6F3', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #D4714D' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#D4714D' }}>{routines.length}</p>
                      <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Routines Total</p>
                    </div>
                    <div style={{ padding: '12px', background: '#F9F6F3', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #D4714D' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#D4714D' }}>{coupes.length}</p>
                      <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Coupes</p>
                    </div>
                    <div style={{ padding: '12px', background: '#F9F6F3', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #D4714D' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#D4714D' }}>
                        {coupes.length > 0 ? coupes.reduce((sum, c) => sum + c.quantity, 0).toFixed(1) : 0}cm
                      </p>
                      <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Total Coupé</p>
                    </div>
                    <div style={{ padding: '12px', background: '#F9F6F3', borderRadius: '8px', textAlign: 'center', borderLeft: '4px solid #D4714D' }}>
                      <p style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: '600', color: '#D4714D' }}>
                        {Math.round((routines.reduce((sum, r) => sum + (r.evaluation || 0), 0) / (routines.length || 1)) * 10) / 10}
                      </p>
                      <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Satisfaction Moy</p>
                    </div>
                  </div>
                </div>

                {/* MESSAGE MOTIVANT */}
                <div style={{ padding: '20px', background: 'linear-gradient(135deg, #FFE5D9 0%, #FFD9CC 100%)', borderRadius: '16px', borderLeft: '4px solid #D4714D', textAlign: 'center' }}>
                  <p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#D4714D' }}>
                    💪 Bravo pour ton engagement! Continue comme ça!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== PROFIL ===== */}
        {activeView === 'profil' && !editingProfil && (
          <div>
            {profil ? (
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Mon profil capillaire</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px' }}>
                  <div style={{ padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>Type: {profil.typeCheveaux}</p>
                  </div>
                  {profil.porosite && (
                    <div style={{ padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>Porosité: {profil.porosite}</p>
                    </div>
                  )}
                  {profil.densite && (
                    <div style={{ padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>Densité: {profil.densite}</p>
                    </div>
                  )}
                  {profil.problemes && profil.problemes.length > 0 && (
                    <div style={{ padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>Problèmes: {profil.problemes.join(', ')}</p>
                    </div>
                  )}
                  <div style={{ padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                    <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>Objectifs: {profil.objectifs?.join(', ') || '-'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingProfil(true);
                    setProfilForm(profil);
                  }}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  ✏️ Modifier mon profil
                </button>
              </div>
            ) : (
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '40px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666' }}>Créez votre profil capillaire! 🧬</p>
                <button
                  onClick={() => setEditingProfil(true)}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  ➕ Créer mon profil
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===== PROFIL EDIT ===== */}
        {editingProfil && (
          <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              {profil ? '✏️ Modifier profil' : '🧬 Créer profil'}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Type de cheveux *</label>
              <select
                value={profilForm.typeCheveaux}
                onChange={(e) => setProfilForm({ ...profilForm, typeCheveaux: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #F0E6DC', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                <option value="">-- Sélectionnez --</option>
                {typesCheveux.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Porosité (optionnel)</label>
              <select
                value={profilForm.porosite || ''}
                onChange={(e) => setProfilForm({ ...profilForm, porosite: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #F0E6DC', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                <option value="">-- Sélectionnez --</option>
                <option value="Basse">Basse</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Haute">Haute</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Densité (optionnel)</label>
              <select
                value={profilForm.densite || ''}
                onChange={(e) => setProfilForm({ ...profilForm, densite: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid #F0E6DC', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                <option value="">-- Sélectionnez --</option>
                <option value="Fine">Fine</option>
                <option value="Moyenne">Moyenne</option>
                <option value="Épaisse">Épaisse</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Problèmes</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {problemesListe.map(prob => (
                  <label key={prob} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={profilForm.problemes?.includes(prob)}
                      onChange={(e) => {
                        let newProblemes = profilForm.problemes ? [...profilForm.problemes] : [];
                        if (e.target.checked) {
                          newProblemes.push(prob);
                        } else {
                          newProblemes = newProblemes.filter(p => p !== prob);
                        }
                        setProfilForm({ ...profilForm, problemes: newProblemes });
                      }}
                      style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '12px', color: '#333' }}>{prob}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>Objectifs</label>
              
              {profilForm.problemes && profilForm.problemes.length > 0 && (
                <div style={{ marginBottom: '12px', padding: '10px', background: '#E8F4F8', borderLeft: '4px solid #4ECDC4', borderRadius: '6px', fontSize: '12px', color: '#0066cc', fontWeight: '600' }}>
                  💡 Recommandés: {getRecommendedObjectives(profilForm.problemes).join(', ')}
                </div>
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {objectifsListe.map(obj => {
                  const isRecommended = profilForm.problemes && getRecommendedObjectives(profilForm.problemes).includes(obj);
                  return (
                    <label key={obj} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      padding: isRecommended ? '8px' : '0',
                      background: isRecommended ? '#FFF5F0' : 'transparent',
                      borderRadius: isRecommended ? '6px' : '0',
                      borderLeft: isRecommended ? '3px solid #D4714D' : 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={profilForm.objectifs?.includes(obj)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProfilForm({ ...profilForm, objectifs: [...(profilForm.objectifs || []), obj] });
                          } else {
                            setProfilForm({ ...profilForm, objectifs: profilForm.objectifs.filter(o => o !== obj) });
                          }
                        }}
                        style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '12px', color: '#333', fontWeight: isRecommended ? '600' : '400' }}>
                        {obj} {isRecommended ? '✨' : ''}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={saveProfil}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ✅ Sauvegarder
              </button>
              <button
                onClick={() => setEditingProfil(false)}
                style={{ flex: 1, padding: '12px', background: '#F0E6DC', color: '#D4714D', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ✕ Annuler
              </button>
            </div>
          </div>
        )}

        {/* ===== PROGRAMME ===== */}
        {activeView === 'programme' && (
          <div>
            {!selectedProgram ? (
              <div>
                {!profil || !profil.typeCheveaux ? (
                  <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '40px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666' }}>Créez d'abord votre profil! 🧬</p>
                    <button
                      onClick={() => setActiveView('profil')}
                      style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                      ➕ Créer mon profil
                    </button>
                  </div>
                ) : programmes.length === 0 ? (
                  <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '40px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666' }}>Aucun programme. Sélectionnez des objectifs!</p>
                    <button
                      onClick={() => setActiveView('profil')}
                      style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                      ✏️ Modifier profil
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#333' }}>Choisissez votre programme</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {programmes.map((prog) => (
                        <div key={prog.id} style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: '4px solid #D4714D' }}>
                          <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#333' }}>{prog.nomComplet}</h3>
                          <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#999' }}>Durée: {prog.duree}</p>
                          <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#666' }}>{prog.description}</p>
                          <button
                            onClick={() => selectProgram(prog)}
                            style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                            ✅ Choisir
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : showRecap ? (
              // ===== ÉCRAN RÉCAPITULATIF FINAL =====
              <div>
                <div style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #FFD9CC 100%)', borderRadius: '16px', padding: '30px 20px', marginBottom: '25px', borderLeft: '4px solid #D4714D', textAlign: 'center' }}>
                  <h1 style={{ margin: '0 0 10px', fontSize: '28px', fontWeight: '600', color: '#D4714D' }}>✅ Bravo!</h1>
                  <p style={{ margin: '0 0 15px', fontSize: '14px', color: '#666' }}>Vous avez terminé:<br/><strong>{selectedProgram.nomComplet}</strong></p>
                </div>

                <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', marginBottom: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '600', color: '#333' }}>📊 Statistiques</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '12px', background: '#F9F6F3', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>✅ Routines: {recapStats?.completes}/{recapStats?.total}</p>
                    </div>
                    <div style={{ padding: '12px', background: '#F9F6F3', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>⭐ Satisfaction: {'⭐'.repeat(Math.round(recapStats?.avgSatisfaction || 0))}</p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => startNewCycle(selectedProgram.id)}
                    style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    ✅ Recommencer ce programme
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProgram(null);
                      setCurrentWeek(1);
                      setProgrammeRoutineState({});
                      setShowRecap(false);
                      setSelectedTypes({});
                    }}
                    style={{ width: '100%', padding: '16px', background: '#E8F4F8', color: '#0066cc', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    🎯 Choisir un autre programme
                  </button>
                  <button
                    onClick={() => alert('📊 Récapitulatif:\n' + (recapStats?.completes + ' routines complétées\nSatisfaction moyenne: ' + recapStats?.avgSatisfaction + ' ⭐'))}
                    style={{ width: '100%', padding: '16px', background: '#F0E6DC', color: '#D4714D', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    📊 Voir détails
                  </button>
                </div>
              </div>
            ) : (
              // ===== PROGRAMME ACTIF =====
              <div>
                <div style={{ background: 'linear-gradient(135deg, #FFE5D9 0%, #FFD9CC 100%)', borderRadius: '16px', padding: '20px', marginBottom: '25px', borderLeft: '4px solid #D4714D' }}>
                  <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#D4714D' }}>{selectedProgram.nomComplet}</h2>
                  <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>{selectedProgram.description}</p>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <button
                    disabled={currentWeek === 1}
                    onClick={() => setCurrentWeek(currentWeek - 1)}
                    style={{ padding: '8px 12px', background: currentWeek === 1 ? '#CCC' : '#D4714D', color: 'white', border: 'none', borderRadius: '8px', cursor: currentWeek === 1 ? 'default' : 'pointer', fontWeight: '600' }}>
                    ◀
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>Semaine {currentWeek}/{selectedProgram.semaines.length}</span>
                  <button
                    disabled={currentWeek === selectedProgram.semaines.length}
                    onClick={() => setCurrentWeek(currentWeek + 1)}
                    style={{ padding: '8px 12px', background: currentWeek === selectedProgram.semaines.length ? '#CCC' : '#D4714D', color: 'white', border: 'none', borderRadius: '8px', cursor: currentWeek === selectedProgram.semaines.length ? 'default' : 'pointer', fontWeight: '600' }}>
                    ▶
                  </button>
                </div>

                {currentWeekData && (
                  <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#333' }}>{currentWeekData.titre}</h4>
                    <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666', fontStyle: 'italic' }}>{currentWeekData.conseil}</p>

                    {/* SÉLECTEUR DE DATE */}
                    <div style={{ marginBottom: '20px', padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>📅 Date de la routine</label>
                      <input
                        type="date"
                        value={programmeDate}
                        onChange={(e) => setProgrammeDate(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '25px' }}>
                      {currentWeekData.soins.map((soin, idx) => {
                        const soinKey = `${currentWeek}-${idx}`;
                        const isExpanded = expandedSoin === soinKey;
                        const soinTypeInfo = soinTypes[soin.soinKey];

                        return (
                          <div key={idx} style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                            <button
                              onClick={() => setExpandedSoin(isExpanded ? null : soinKey)}
                              style={{
                                width: '100%',
                                padding: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: 'none',
                                background: programmeRoutineState[soinKey]?.checked ? '#FFE5D9' : '#F9F6F3',
                                cursor: 'pointer',
                                borderLeft: '4px solid #D4714D'
                              }}
                            >
                              <div style={{ textAlign: 'left', flex: 1 }}>
                                <strong style={{ fontSize: '13px', color: '#333' }}>{soin.nomComplet}</strong>
                                <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                  {soin.duree} • {soin.conseil}
                                </div>
                              </div>
                              <span style={{ fontSize: '16px', marginLeft: '12px', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                            </button>

                            {isExpanded && (
                              <div style={{ padding: '16px', borderTop: '1px solid #E8E8E8', background: '#FDFCFB' }}>
                                {/* TYPES */}
                                {soinTypeInfo && soinTypeInfo.types.length > 0 && (
                                  <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '6px', color: '#D4714D' }}>Type</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {soinTypeInfo.types.map(type => (
                                        <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '6px', background: selectedTypes[soinKey] === type ? '#FFE5D9' : 'transparent', borderRadius: '6px' }}>
                                          <input
                                            type="radio"
                                            name={soinKey}
                                            checked={selectedTypes[soinKey] === type}
                                            onChange={() => setSelectedTypes({ ...selectedTypes, [soinKey]: type })}
                                            style={{ marginRight: '8px', width: '14px', height: '14px', cursor: 'pointer' }}
                                          />
                                          <span style={{ fontSize: '12px', color: '#333' }}>{type}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* MARQUE - TOUJOURS VISIBLE */}
                                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4714D' }}>🏷️ Marque du produit</label>
                                  <input
                                    type="text"
                                    placeholder="Marque utilisée..."
                                    value={programmeRoutineState[soinKey]?.marque || ''}
                                    onChange={(e) => {
                                      setProgrammeRoutineState({
                                        ...programmeRoutineState,
                                        [soinKey]: { ...programmeRoutineState[soinKey], marque: e.target.value }
                                      });
                                    }}
                                    list={`marques-prog-${soinKey}`}
                                    style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#FFF5F0' }}
                                  />
                                  <datalist id={`marques-prog-${soinKey}`}>
                                    {getMarquesUtilisees().map(marque => (
                                      <option key={marque} value={marque} />
                                    ))}
                                  </datalist>
                                </div>

                                {/* PHOTO - TOUJOURS VISIBLE */}
                                <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4714D' }}>📷 Photo du produit</label>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handlePhotoChangeProgramme(soinKey, e)}
                                    style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '6px', border: '1px dashed #D4714D', cursor: 'pointer' }}
                                  />
                                  {programmeRoutineState[soinKey]?.photo && (
                                    <img
                                      src={programmeRoutineState[soinKey].photo}
                                      alt="preview"
                                      style={{ marginTop: '6px', width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #D4714D' }}
                                    />
                                  )}
                                </div>

                                {/* CHECKBOX J'AI FAIT */}
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '12px' }}>
                                  <input
                                    type="checkbox"
                                    checked={programmeRoutineState[soinKey]?.checked || false}
                                    onChange={(e) => {
                                      setProgrammeRoutineState({
                                        ...programmeRoutineState,
                                        [soinKey]: {
                                          ...programmeRoutineState[soinKey],
                                          label: soin.nomComplet,
                                          checked: e.target.checked
                                        }
                                      });
                                    }}
                                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                                  />
                                  <span style={{ fontSize: '13px', color: '#333', fontWeight: '500' }}>J'ai fait ce soin</span>
                                </label>

                                {programmeRoutineState[soinKey]?.checked && (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {/* RATING */}
                                    <div>
                                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4714D' }}>⭐ Satisfaction</label>
                                      <div style={{ display: 'flex', gap: '4px', fontSize: '16px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button
                                            key={star}
                                            onClick={() => {
                                              handleStarClick(() => {
                                                setProgrammeRoutineState({
                                                  ...programmeRoutineState,
                                                  [soinKey]: { ...programmeRoutineState[soinKey], rating: star }
                                                });
                                              });
                                            }}
                                            style={{
                                              border: 'none',
                                              background: 'none',
                                              cursor: 'pointer',
                                              opacity: star <= (programmeRoutineState[soinKey]?.rating || 0) ? 1 : 0.3,
                                              transform: star <= (programmeRoutineState[soinKey]?.rating || 0) ? 'scale(1.1)' : 'scale(1)',
                                              transition: 'all 0.2s',
                                              animation: bouncingStarKey ? 'bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                                            }}
                                          >
                                            ⭐
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* NOTES & SATISFACTION GLOBALE */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', borderTop: '2px solid #F0E6DC' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>📝 Notes</label>
                        <textarea
                          value={programmeRoutineState.notes || ''}
                          onChange={(e) => setProgrammeRoutineState({ ...programmeRoutineState, notes: e.target.value })}
                          placeholder="Résultats globaux..."
                          style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4714D', fontSize: '12px', fontFamily: 'inherit', minHeight: '60px', boxSizing: 'border-box', background: '#FFF5F0' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>⭐ Satisfaction globale</label>
                        <div style={{ display: 'flex', gap: '6px', fontSize: '22px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => {
                                handleStarClick(() => setProgrammeRoutineState({ ...programmeRoutineState, evaluation: star }));
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                opacity: star <= (programmeRoutineState.evaluation || 0) ? 1 : 0.3,
                                transform: star <= (programmeRoutineState.evaluation || 0) ? 'scale(1.2)' : 'scale(1)',
                                transition: 'all 0.2s',
                                animation: bouncingStarKey ? 'bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                              }}
                            >
                              ⭐
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={saveProgrammeRoutine}
                      style={{ width: '100%', marginTop: '20px', padding: '14px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                      ✅ Sauvegarder ma routine de la semaine
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===== AUTRES ONGLETS (raccourcis) ===== */}
        {activeView === 'addFree' && (
          <div>
            {!addingFree ? (
              // ===== MODE NON-AJOUT =====
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '40px 25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                <p style={{ margin: '0 0 20px', fontSize: '16px', color: '#666' }}>Ajoutez un soin en libre! ➕</p>
                <button
                  onClick={() => setAddingFree(true)}
                  style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  ➕ Ajouter un soin
                </button>
              </div>
            ) : (
              // ===== MODE AJOUT =====
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>Ajouter un soin en libre</h2>

                {/* SÉLECTION SOIN */}
                {!selectedSoinType ? (
                  <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>Quel soin?</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {Object.entries(soinTypes).map(([key, soin]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedSoinType(key)}
                          style={{
                            padding: '14px',
                            background: '#F9F6F3',
                            border: '2px solid #F0E6DC',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#333',
                            textAlign: 'center',
                            transition: 'all 0.2s'
                          }}>
                          {soin.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* SOIN SÉLECTIONNÉ */}
                    <div style={{ background: '#FFE5D9', padding: '12px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#D4714D' }}>{soinTypes[selectedSoinType].label}</strong>
                      <button
                        onClick={() => {
                          setSelectedSoinType(null);
                          setFreeRoutineState({});
                        }}
                        style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#D4714D' }}>
                        ✕
                      </button>
                    </div>

                    {/* TYPES (si applicable) */}
                    {soinTypes[selectedSoinType].types.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>Type</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {soinTypes[selectedSoinType].types.map(type => (
                            <label key={type} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px', background: freeRoutineState.selectedType === type ? '#FFE5D9' : '#F9F6F3', borderRadius: '8px' }}>
                              <input
                                type="radio"
                                name="freeType"
                                checked={freeRoutineState.selectedType === type}
                                onChange={() => setFreeRoutineState({ ...freeRoutineState, selectedType: type })}
                                style={{ marginRight: '8px', width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                              <span style={{ fontSize: '12px', color: '#333' }}>{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* MARQUE */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>🏷️ Marque du produit</label>
                      <input
                        type="text"
                        placeholder="Marque utilisée..."
                        value={freeRoutineState.marque || ''}
                        onChange={(e) => setFreeRoutineState({ ...freeRoutineState, marque: e.target.value })}
                        list="marques-libre"
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4714D', fontSize: '12px', fontFamily: 'inherit', boxSizing: 'border-box', background: '#FFF5F0' }}
                      />
                      <datalist id="marques-libre">
                        {getMarquesUtilisees().map(marque => (
                          <option key={marque} value={marque} />
                        ))}
                      </datalist>
                    </div>

                    {/* PHOTO */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>📷 Photo du produit</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChangeFree}
                        style={{ width: '100%', fontSize: '11px', padding: '4px', borderRadius: '6px', border: '1px dashed #D4714D', cursor: 'pointer' }}
                      />
                      {freeRoutineState.photo && (
                        <img
                          src={freeRoutineState.photo}
                          alt="preview"
                          style={{ marginTop: '6px', width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '2px solid #D4714D' }}
                        />
                      )}
                    </div>

                    {/* NOTES */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>📝 Notes</label>
                      <textarea
                        value={freeRoutineState.notes || ''}
                        onChange={(e) => setFreeRoutineState({ ...freeRoutineState, notes: e.target.value })}
                        placeholder="Vos impressions..."
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4714D', fontSize: '12px', fontFamily: 'inherit', minHeight: '60px', boxSizing: 'border-box', background: '#FFF5F0' }}
                      />
                    </div>

                    {/* RATING */}
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>⭐ Satisfaction</label>
                      <div style={{ display: 'flex', gap: '6px', fontSize: '22px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              handleStarClick(() => setFreeRoutineState({ ...freeRoutineState, evaluation: star }));
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              opacity: star <= (freeRoutineState.evaluation || 0) ? 1 : 0.3,
                              transform: star <= (freeRoutineState.evaluation || 0) ? 'scale(1.2)' : 'scale(1)',
                              transition: 'all 0.2s',
                              animation: bouncingStarKey ? 'bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                            }}>
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* BOUTONS */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={saveFreeRoutine}
                        style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        ✅ Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setAddingFree(false);
                          setSelectedSoinType(null);
                          setFreeRoutineState({});
                        }}
                        style={{ flex: 1, padding: '12px', background: '#F0E6DC', color: '#D4714D', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                        ✕ Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'coupes' && (
          <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#333' }}>✂️ Coupes de Pointes</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>Essentiel pour la santé des cheveux crépus</p>

            {/* STATUT COUPE */}
            {coupes.length > 0 ? (
              <div style={{ background: '#FFF5F0', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #D4714D', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>
                  ✂️ Dernière coupe: {new Date(coupes[coupes.length - 1].date).toLocaleDateString('fr-FR')}
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>
                  {Math.floor((new Date() - new Date(coupes[coupes.length - 1].date)) / (1000 * 60 * 60 * 24))} jours ago
                </p>
              </div>
            ) : null}

            {/* AJOUTER COUPE */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#FFE5D9', borderRadius: '10px', borderLeft: '4px solid #D4714D' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>➕ Ajouter une coupe</h4>

              {/* DATE */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>📅 Date</label>
                <input
                  type="date"
                  id="coupeDate"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              {/* QUANTITÉ */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>📏 Quantité (cm)</label>
                <input
                  type="number"
                  id="coupeQuantity"
                  placeholder="Ex: 5"
                  min="0.5"
                  step="0.5"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '12px', boxSizing: 'border-box' }}
                />
              </div>

              {/* OÙ */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>🏪 Où?</label>
                <select
                  id="coupeWhere"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '12px', boxSizing: 'border-box' }}>
                  <option value="">-- Sélectionnez --</option>
                  <option value="Salon">Salon (coiffeur)</option>
                  <option value="DIY">DIY (moi-même)</option>
                  <option value="Amie">Amie</option>
                </select>
              </div>

              {/* NOTES */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#333' }}>📝 Notes</label>
                <textarea
                  id="coupeNotes"
                  placeholder="Pourquoi? (pointes sèches, objectif pousse, etc.)"
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '12px', fontFamily: 'inherit', minHeight: '50px', boxSizing: 'border-box' }}
                />
              </div>

              {/* BOUTON AJOUTER */}
              <button
                onClick={() => {
                  const date = document.getElementById('coupeDate').value;
                  const quantity = parseFloat(document.getElementById('coupeQuantity').value);
                  const where = document.getElementById('coupeWhere').value;
                  const notes = document.getElementById('coupeNotes').value;

                  if (!date || !quantity || !where) {
                    alert('Remplissez date, quantité et lieu!');
                    return;
                  }

                  setCoupes([...coupes, { id: Date.now(), date, quantity, where, notes }]);
                  alert('✂️ Coupe enregistrée!');
                  document.getElementById('coupeDate').value = new Date().toISOString().split('T')[0];
                  document.getElementById('coupeQuantity').value = '';
                  document.getElementById('coupeWhere').value = '';
                  document.getElementById('coupeNotes').value = '';
                }}
                style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                ✅ Enregistrer
              </button>
            </div>

            {/* HISTORIQUE COUPES */}
            {coupes.length > 0 ? (
              <div>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>📋 Historique</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[...coupes].reverse().map((coupe) => (
                    <div key={coupe.id} style={{ padding: '12px', background: '#F9F6F3', borderLeft: '4px solid #D4714D', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '600', color: '#333' }}>
                          📅 {new Date(coupe.date).toLocaleDateString('fr-FR')}
                        </p>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666' }}>
                          ✂️ {coupe.quantity}cm • 🏪 {coupe.where}
                        </p>
                        {coupe.notes && (
                          <p style={{ margin: '0', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                            💬 {coupe.notes}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Supprimer cette coupe?')) {
                            setCoupes(coupes.filter(c => c.id !== coupe.id));
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: '#E74C3C', cursor: 'pointer', fontSize: '16px', padding: '4px' }}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>

                {/* STATISTIQUES */}
                <div style={{ marginTop: '20px', padding: '15px', background: '#FFF5F0', borderRadius: '10px', borderLeft: '4px solid #D4714D' }}>
                  <h4 style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '600', color: '#333' }}>📊 Statistiques</h4>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666' }}>
                    Total coupé: <strong>{coupes.reduce((sum, c) => sum + c.quantity, 0).toFixed(1)}cm</strong>
                  </p>
                  <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#666' }}>
                    Nombre de coupes: <strong>{coupes.length}</strong>
                  </p>
                  <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>
                    Moyenne par coupe: <strong>{(coupes.reduce((sum, c) => sum + c.quantity, 0) / coupes.length).toFixed(1)}cm</strong>
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
                <p style={{ margin: '0', fontSize: '13px' }}>Aucune coupe enregistrée 📝</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'calendar' && (
          <div>
            {!selectedRoutineDetail ? (
              // ===== CALENDRIER =====
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {/* EN-TÊTE NAVIGATION */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    style={{ padding: '8px 12px', background: '#D4714D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    ◀
                  </button>
                  <h2 style={{ margin: '0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    style={{ padding: '8px 12px', background: '#D4714D', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    ▶
                  </button>
                </div>

                {/* JOURS DE LA SEMAINE */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, idx) => (
                    <div key={idx} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#999', padding: '8px' }}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* GRILLE DU MOIS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {days.map((day, idx) => {
                    const routine = day ? getRoutineForDate(day) : null;
                    const stars = routine ? Math.round(routine.evaluation || 0) : 0;
                    
                    return (
                      <div
                        key={idx}
                        className={routine ? 'calendar-day-pulse' : ''}
                        onClick={() => {
                          if (routine) setSelectedRoutineDetail(routine);
                        }}
                        style={{
                          padding: '12px',
                          borderRadius: '10px',
                          minHeight: '70px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'center',
                          background: routine 
                            ? 'linear-gradient(135deg, #FFE5D9 0%, #FFD9CC 100%)' 
                            : day ? '#F9F6F3' : 'transparent',
                          border: routine ? '2px solid #D4714D' : day ? '1px solid #E8E8E8' : 'none',
                          cursor: routine ? 'pointer' : 'default',
                          fontSize: '13px',
                          fontWeight: routine ? '600' : '400',
                          color: routine ? '#D4714D' : day ? '#999' : '#FFF'
                        }}>
                        {day && (
                          <>
                            <span>{day}</span>
                            {routine && (
                              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                                {'⭐'.repeat(Math.min(stars, 3))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              // ===== VUE DÉTAIL ROUTINE =====
              <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <button
                  onClick={() => setSelectedRoutineDetail(null)}
                  style={{ marginBottom: '15px', padding: '8px 12px', background: '#F0E6DC', color: '#D4714D', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  ◀ Retour
                </button>

                <div style={{ background: '#FFE5D9', padding: '15px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid #D4714D' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '600', color: '#D4714D' }}>
                    {selectedRoutineDetail.date}
                  </h3>
                  <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                    {selectedRoutineDetail.soins.length} soin(s) • Satisfaction: {'⭐'.repeat(selectedRoutineDetail.evaluation || 0)}
                  </p>
                </div>

                {/* SOINS */}
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>🧴 Soins utilisés</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedRoutineDetail.soins.map((soin, idx) => (
                      <div key={idx} style={{ padding: '12px', background: '#F9F6F3', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                        <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: '600', color: '#333' }}>{soin.label}</p>
                        {soin.type && (
                          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999' }}>Type: {soin.type}</p>
                        )}
                        {soin.marque && soin.marque !== 'Non spécifiée' && (
                          <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#999' }}>🏷️ {soin.marque}</p>
                        )}
                        {soin.rating && (
                          <p style={{ margin: '0', fontSize: '11px', color: '#D4714D', fontWeight: '600' }}>⭐ {soin.rating}/5</p>
                        )}
                        {soin.photo && (
                          <img
                            src={soin.photo}
                            alt="produit"
                            style={{ marginTop: '6px', width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* NOTES */}
                {selectedRoutineDetail.notes && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#333' }}>📝 Notes</h4>
                    <p style={{ margin: '0', padding: '12px', background: '#FFF5F0', borderRadius: '8px', fontSize: '12px', color: '#666', borderLeft: '4px solid #D4714D' }}>
                      {selectedRoutineDetail.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeView === 'history' && !editingRoutineId && (
          <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              📖 Historique ({routines.length} routine{routines.length > 1 ? 's' : ''})
            </h2>

            {routines.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#999' }}>
                <p style={{ margin: '0', fontSize: '14px' }}>Aucune routine pour l'instant 📝</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...routines].reverse().map((routine) => (
                  <div
                    key={routine.id}
                    onTouchStart={(e) => handleSwipeStart(e, routine.id)}
                    onTouchEnd={(e) => handleSwipeEnd(e, routine.id)}
                    style={{
                      position: 'relative',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      background: '#F9F6F3',
                      border: '1px solid #F0E6DC'
                    }}>
                    
                    {/* CONTENU PRINCIPAL */}
                    <div style={{
                      padding: '12px',
                      transform: swipedRoutineId === routine.id ? 'translateX(-80px)' : 'translateX(0)',
                      transition: 'transform 0.3s ease',
                      background: '#F9F6F3'
                    }}>
                      {/* DATE */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>
                          📅 {new Date(routine.date + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {routine.evaluation > 0 && (
                          <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#D4714D' }}>
                            {'⭐'.repeat(routine.evaluation)}
                          </p>
                        )}
                      </div>

                      {/* SOINS */}
                      <div style={{ marginBottom: '8px' }}>
                        {routine.soins.map((soin, idx) => (
                          <p key={idx} style={{ margin: '4px 0', fontSize: '11px', color: '#666' }}>
                            • <strong>{soin.label}</strong>
                            {soin.type && <span> ({soin.type})</span>}
                            {soin.marque && soin.marque !== 'Non spécifiée' && <span> - 🏷️ {soin.marque}</span>}
                            {soin.rating && <span> ⭐ {soin.rating}</span>}
                          </p>
                        ))}
                      </div>

                      {/* NOTES */}
                      {routine.notes && (
                        <p style={{ margin: '0', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                          💬 {routine.notes}
                        </p>
                      )}

                      {/* BOUTON ÉDITION */}
                      <button
                        onClick={() => startEditingRoutine(routine)}
                        style={{
                          marginTop: '8px',
                          padding: '6px 10px',
                          background: '#FFE5D9',
                          color: '#D4714D',
                          border: '1px solid #D4714D',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                        ✏️ Éditer
                      </button>
                    </div>

                    {/* BOUTON SUPPRESSION (SWIPE) */}
                    <div style={{
                      position: 'absolute',
                      right: '0',
                      top: '0',
                      height: '100%',
                      width: '80px',
                      background: '#E74C3C',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        style={{
                          padding: '6px 10px',
                          background: 'none',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '20px',
                          fontWeight: '600'
                        }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== ÉDITION ROUTINE ===== */}
        {editingRoutineId && (
          <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '600', color: '#333' }}>✏️ Éditer la routine</h2>

            {/* DATE ÉDITION */}
            <div style={{ marginBottom: '20px', padding: '12px', background: '#FFF5F0', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>📅 Date</label>
              <input
                type="date"
                value={editingRoutineData?.date || ''}
                onChange={(e) => setEditingRoutineData({ ...editingRoutineData, date: e.target.value })}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* SOINS ÉDITION */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: '600', color: '#333' }}>🧴 Soins</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {editingRoutineData?.soins?.map((soin, idx) => (
                  <div key={idx} style={{ padding: '12px', background: '#F9F6F3', borderLeft: '4px solid #D4714D', borderRadius: '8px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '600', color: '#333' }}>{soin.label}</p>

                    {/* MARQUE */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4714D' }}>🏷️ Marque</label>
                      <input
                        type="text"
                        value={soin.marque || ''}
                        onChange={(e) => updateEditingSoin(idx, 'marque', e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #D4714D', fontSize: '11px', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* PHOTO */}
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4714D' }}>📷 Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoChangeEditMode(idx, e)}
                        style={{ width: '100%', fontSize: '10px', padding: '4px', borderRadius: '6px', border: '1px dashed #D4714D', cursor: 'pointer' }}
                      />
                      {soin.photo && (
                        <img
                          src={soin.photo}
                          alt="preview"
                          style={{ marginTop: '4px', width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #D4714D' }}
                        />
                      )}
                    </div>

                    {/* RATING */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', marginBottom: '4px', color: '#D4714D' }}>⭐ Rating</label>
                      <div style={{ display: 'flex', gap: '3px', fontSize: '14px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => {
                              handleStarClick(() => updateEditingSoin(idx, 'rating', star));
                            }}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              opacity: star <= (soin.rating || 0) ? 1 : 0.3,
                              transform: star <= (soin.rating || 0) ? 'scale(1.1)' : 'scale(1)',
                              transition: 'all 0.2s',
                              animation: bouncingStarKey ? 'bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                            }}>
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* NOTES */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>📝 Notes</label>
              <textarea
                value={editingRoutineData?.notes || ''}
                onChange={(e) => setEditingRoutineData({ ...editingRoutineData, notes: e.target.value })}
                placeholder="Vos impressions..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4714D', fontSize: '12px', fontFamily: 'inherit', minHeight: '60px', boxSizing: 'border-box', background: '#FFF5F0' }}
              />
            </div>

            {/* SATISFACTION */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: '#333' }}>⭐ Satisfaction globale</label>
              <div style={{ display: 'flex', gap: '6px', fontSize: '22px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => {
                      handleStarClick(() => setEditingRoutineData({ ...editingRoutineData, evaluation: star }));
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      opacity: star <= (editingRoutineData?.evaluation || 0) ? 1 : 0.3,
                      transform: star <= (editingRoutineData?.evaluation || 0) ? 'scale(1.2)' : 'scale(1)',
                      transition: 'all 0.2s',
                      animation: bouncingStarKey ? 'bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)' : 'none'
                    }}>
                    ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* BOUTONS */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={saveEditedRoutine}
                style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #D4714D', transition: 'all 0.2s ease 0%, #C66B48 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ✅ Enregistrer
              </button>
              <button
                onClick={() => {
                  setEditingRoutineId(null);
                  setEditingRoutineData(null);
                }}
                style={{ flex: 1, padding: '12px', background: '#F0E6DC', color: '#D4714D', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ✕ Annuler
              </button>
            </div>
          </div>
        )}

        {activeView === 'learn' && (
          <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#333' }}>🧠 Cheveux Crépus 101</h2>
            <p style={{ margin: '0 0 25px', fontSize: '13px', color: '#666' }}>Apprenez à prendre soin de vos cheveux</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '25px' }}>
              {/* LEÇON 1 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 1 ? null : 1)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>📚 Comprendre les cheveux crépus</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 1 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 1 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>Structure:</strong> Les cheveux crépus ont une structure hélicoïdale (ressemblent à des ressorts). Cette forme naturelle les rend plus fragiles.</p>
                    <p><strong>Porosité:</strong> Ils sont très poreux = absorbent facilement l'eau mais la perdent aussi rapidement.</p>
                    <p><strong>Fragilité:</strong> Tendance à la casse à cause du manque d'hydratation naturelle (le sébum glisse mal sur les cheveux bouclés).</p>
                  </div>
                )}
              </div>

              {/* LEÇON 2 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 2 ? null : 2)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🔍 Type 4 — Classification</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 2 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 2 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>4A:</strong> Boucles bien définies, spirales visibles. Cheveux plus hydratés naturellement.</p>
                    <p><strong>4B:</strong> Cheveux en zig-zag, moins de boucles visibles. Demandent plus d'hydratation.</p>
                    <p><strong>4C:</strong> Très texturés, cheveux ultra-fragiles, shrinkage très important. Hydratation QUOTIDIENNE nécessaire.</p>
                  </div>
                )}
              </div>

              {/* LEÇON 3 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 3 ? null : 3)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>💧 L'Hydratation - LA CLÉ</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 3 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 3 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>Pourquoi?</strong> Les cheveux crépus perdent l'eau 5x plus vite que d'autres cheveux!</p>
                    <p><strong>Comment?</strong> Eau + scellage + protection = Bain d'huile + Leave-in + Beurre</p>
                    <p><strong>Fréquence minimum:</strong> 1x par semaine pour maintenir l'hydratation. 2-3x/semaine si très secs.</p>
                    <p><strong>Méthode:</strong> LOC (Leave-in, Oil, Cream) = l'eau d'abord, puis l'huile/crème pour sceller.</p>
                  </div>
                )}
              </div>

              {/* LEÇON 4 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 4 ? null : 4)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🧵 Démêlage - Technique Cruciale</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 4 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 4 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>Direction:</strong> Toujours des pointes vers les racines, JAMAIS l'inverse!</p>
                    <p><strong>Préparation:</strong> Démêler toujours avec un après-shampoing ou un leave-in hydratant.</p>
                    <p><strong>Outils:</strong> Doigts ou peigne à dents larges. Jamais de brosse!</p>
                    <p><strong>Étapes:</strong> Sections → Doigts d'abord → Peigne → Vérifier qu'aucun nœud ne reste.</p>
                  </div>
                )}
              </div>

              {/* LEÇON 5 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 5 ? null : 5)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🛡️ 7 Erreurs Fatales à Éviter</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 5 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 5 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p>❌ <strong>Brosse:</strong> Cause la casse. Utilisez doigts/peigne.</p>
                    <p>❌ <strong>Séchage à l'air libre:</strong> Perd trop d'eau. Pliez les cheveux vers le haut (plopping).</p>
                    <p>❌ <strong>Trop d'huile:</strong> Cheveux gras et mous. Modérez les quantités.</p>
                    <p>❌ <strong>Routines trop rares:</strong> Min 1x/semaine pour cheveux crépus.</p>
                    <p>❌ <strong>Eau trop chaude:</strong> Dessèche. Préférez tiède/froide.</p>
                    <p>❌ <strong>Sulfates:</strong> Décapent les cheveux. Lisez les étiquettes!</p>
                    <p>❌ <strong>Pas de coupe:</strong> Les pointes sèches se propagent. Coupez 1x/trimestre min.</p>
                  </div>
                )}
              </div>

              {/* LEÇON 6 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 6 ? null : 6)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>✨ Conseils Pro</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 6 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 6 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>Alternance:</strong> Hydratation une semaine, protéines la suivante. Ne pas mélanger.</p>
                    <p><strong>Fréquence idéale:</strong> 1-2x par semaine pour maintenir, 2-3x si très secs/cassants.</p>
                    <p><strong>Pousse:</strong> Trackez votre progrès! Une bonne routine = +5-10cm par an.</p>
                    <p><strong>Patience:</strong> Les changements prennent 3-6 mois. Restez constant!</p>
                  </div>
                )}
              </div>

              {/* LEÇON 7 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 7 ? null : 7)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🎯 Mythes vs Réalité</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 7 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 7 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>Mythe:</strong> "Les cheveux crépus ne poussent pas" → <strong>Réalité:</strong> Ils poussent, c'est juste moins visible (shrinkage).</p>
                    <p><strong>Mythe:</strong> "Il faut les laver tous les jours" → <strong>Réalité:</strong> 1x/semaine suffit, plus c'est trop.</p>
                    <p><strong>Mythe:</strong> "Tous les produits expensive sont bons" → <strong>Réalité:</strong> Les basiques (eau, huile, crème) suffisent.</p>
                    <p><strong>Mythe:</strong> "Les cheveux crépus ne peuvent pas être longs" → <strong>Réalité:</strong> Oui avec une bonne routine!</p>
                    <p><strong>Mythe:</strong> "Il faut détendre les cheveux pour qu'ils se lavent" → <strong>Réalité:</strong> Faux! Les naturels se lavent très bien.</p>
                    <p><strong>Mythe:</strong> "Un produit gratuit = mauvais" → <strong>Réalité:</strong> La qualité ne dépend pas du prix, mais de la composition.</p>
                  </div>
                )}
              </div>

              {/* LEÇON 8 */}
              <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedLesson(expandedLesson === 8 ? null : 8)}
                  style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🎁 Ressources & Communauté</span>
                  <span style={{ fontSize: '16px', transform: expandedLesson === 8 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>
                {expandedLesson === 8 && (
                  <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                    <p><strong>YouTubers:</strong> Recherchez des créatrices avec votre type de cheveux pour des tutoriels.</p>
                    <p><strong>Blogs & Livres:</strong> Découvrez des livres sur les soins naturels des cheveux crépus.</p>
                    <p><strong>Communautés:</strong> Rejoignez des groupes TikTok/Instagram pour partager expériences et tips.</p>
                    <p><strong>Marques de confiance:</strong> Cherchez des marques noires qui comprennent vos besoins.</p>
                  </div>
                )}
              </div>
            </div>

            {/* FOOTER */}
            <div style={{ padding: '20px', background: '#FFE5D9', borderRadius: '10px', textAlign: 'center', borderLeft: '4px solid #D4714D', marginTop: '25px' }}>
              <p style={{ margin: '0', fontSize: '13px', fontWeight: '600', color: '#D4714D' }}>💪 Remember: Tes cheveux crépus ne sont pas 'difficiles' - ils ont juste des besoins différents!</p>
            </div>
          </div>
        )}

        {activeView === 'diy' && (
          <div className="animated-card" style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '600', color: '#333' }}>🧪 DIY Recettes Spécialisées</h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#666' }}>Recettes maison détaillées • Ingrédients avancés • Variations légère/riche/puissante</p>

            {/* TABS: Catégories vs Objectifs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #F0E6DC' }}>
              <button
                onClick={() => setEditingProfil(editingProfil === 'diyCategories' ? null : 'diyCategories')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: editingProfil === 'diyCategories' ? '#D4714D' : 'transparent',
                  color: editingProfil === 'diyCategories' ? 'white' : '#D4714D',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0'
                }}>
                📚 Par Catégories
              </button>
              <button
                onClick={() => setEditingProfil(editingProfil === 'diyObjectifs' ? null : 'diyObjectifs')}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: editingProfil === 'diyObjectifs' ? '#D4714D' : 'transparent',
                  color: editingProfil === 'diyObjectifs' ? 'white' : '#D4714D',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  borderRadius: '8px 8px 0 0'
                }}>
                🎯 Par Objectifs
              </button>
            </div>

            {editingProfil === 'diyCategories' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* CATÉGORIE 1: MASQUES */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 301 ? null : 301)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🎭 MASQUES (Hydratation & Protéines)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 301 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 301 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      {/* LÉGÈRE */}
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>🌱 LÉGÈRE (Hydratation Douce)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 80g gel aloe vera + 20g miel + 10g huile jojoba</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 15-20 min</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Mélangez tous les ingrédients. Appliquez sur cheveux humides, en sectionnant bien.</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Hydratation légère, parfait pour cheveux fins. Aloe vera = humectant naturel!</p>
                      </div>

                      {/* RICHE */}
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>💪 RICHE (Hydratation + Protéines)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 1 avocat écrasé + 1 œuf + 20g miel + 15g huile coco + 5g poudre protéine ou yaourt nature</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 30-45 min</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Battez l'œuf. Écrasez avocat finement. Mélangez tous. Appliquez généreusement, couvrez bien.</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Hydratation INTENSE + protéines (œuf + avocat). Cheveux lisses et brillants après!</p>
                      </div>

                      {/* PUISSANTE */}
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>⚡ PUISSANTE (Réparation Maximum)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 100g yaourt nature + 40g miel + 2 œufs + 20g huile ricin + 15g huile coco + 5g poudre shikakaï + 3 gouttes HE ylang-ylang</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 45 min-1h</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Battez œufs. Mélangez tout. Appliquez cheveux entiers, massez cuir chevelu 5 min. Couvrez bonnet 45-60 min!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> RÉPARATION TOTALE! Ricin = régénère, Shikakaï = nettoyant naturel. Cheveux transformés en 1 application!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CATÉGORIE 2: BAINS D'HUILE */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 302 ? null : 302)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🛢️ BAINS D'HUILE (Nutrition Profonde)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 302 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 302 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      {/* LÉGÈRE */}
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>🌱 LÉGÈRE (Nourrissant Léger)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 25g huile jojoba + 15g huile argan + 3 gouttes HE lavande</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 20-30 min</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Mélangez. Massez cuir chevelu + longueurs. Attendez 20-30 min. Rincez bien!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Léger, non-gras. Argan = antioxydant. Parfait pour cheveux fins!</p>
                      </div>

                      {/* RICHE */}
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>💪 RICHE (Nutrition Intense)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 30g huile coco + 25g huile avocat + 15g huile ricin + 20g miel + 10g poudre shikakaï</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 45 min-1h</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Mélangez tous les ingrédients. Réchauffez légèrement (pas plus de 40°C!). Appliquez généreusement, massez 10 min. Couvrez 45 min!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> NUTRITION TOTALE! Ricin + Coco + Avocat = cheveux repulpés. Shikakaï = nettoyant naturel!</p>
                      </div>

                      {/* PUISSANTE */}
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>⚡ PUISSANTE (Ultra-Nourrissant)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 40g huile ricin + 30g huile coco + 25g huile avocat + 20g huile argan + 25g miel + 10g poudre shikakaï + 5g poudre brahmi + 5 gouttes HE ylang-ylang</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 1h-2h avant shampoing</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Mélangez toutes les huiles. Légèrement tiédir (40°C max). Appliquez cheveux entiers. Massez cuir chevelu 10 min. Couvrez bonnet 1-2h!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> RÉPARATION ULTIME! Brahmi = force ancestrale ayurvédique. 5 huiles = couverture complète. Résultats GARANTIS!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CATÉGORIE 3: PREPOO */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 303 ? null : 303)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🌿 PREPOO (Avant-Shampoing)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 303 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 303 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      {/* LÉGÈRE */}
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>🌱 LÉGÈRE (Démêlage Doux)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 50g gel aloe vera + 25g miel + 10g huile jojoba</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 10-15 min avant shampoing</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Mélangez. Appliquez sur cheveux secs avant mouiller. Attendez 10-15 min, puis shampoing normal.</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Protège du choc eau chaude. Démêlage facile. Cheveux glissants après!</p>
                      </div>

                      {/* RICHE */}
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>💪 RICHE (Protection + Hydratation)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 40g huile coco + 30g miel + 1 œuf + 20g conditionneur naturel ou yaourt + 5g poudre shikakaï</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 20-30 min avant shampoing</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Battez l'œuf. Mélangez avec huiles + miel + shikakaï. Appliquez cheveux secs généreusement. Couvrez 20-30 min!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Protection INTENSE avant shampoing. Protéines + hydratation. Shikakaï = nettoyant doux!</p>
                      </div>

                      {/* PUISSANTE */}
                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>⚡ PUISSANTE (Régénération Totale)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 50g huile ricin + 40g huile coco + 30g miel + 2 œufs + 20g gel aloe vera + 10g poudre shikakaï + 5g poudre brahmi + 5 gouttes HE lavande</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 30-45 min avant shampoing</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Battez œufs. Mélangez tous les ingrédients. Appliquez cheveux ENTIERS, cheveu par cheveu! Massez cuir chevelu 10 min. Couvrez BIEN 30-45 min!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> TRANSFORMATION EN 1 APPLICATION! Ricin + Brahmi = pousse garantie. Cheveux forts + hydratés = résistent au shampoing!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CATÉGORIE 4: LEAVE-IN */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 304 ? null : 304)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🧴 LEAVE-IN (Soins Quotidiens)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 304 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 304 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>🌱 LÉGÈRE (Hydratation Quotidienne)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 100g gel aloe vera + 50g eau + 20g glycérine + 5 gouttes HE lavande</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>💾 Conservation:</strong> Dans spray/vaporisateur, 2-3 semaines au frais</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> À vaporiser chaque matin! Hydratation légère 48h. Aloe vera = humectant + protecteur!</p>
                      </div>

                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>💪 RICHE (Hydratation Intense)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 80g gel aloe vera + 30g eau + 25g glycérine + 20g miel + 15g huile argan + 5g poudre protéine + 5 gouttes HE ylang-ylang</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>💾 Conservation:</strong> Dans spray, 1 semaine au frais (avec protéine = court durée)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Hydratation + protéines = cheveux bouclés bien définis! À vaporiser matin ET soir!</p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>⚡ PUISSANTE (Cocktail Maximum)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 100g gel aloe vera + 40g eau + 30g glycérine + 25g miel + 20g huile argan + 10g huile coco + 8g poudre protéine + 5g poudre brahmi + 7 gouttes HE ylang-ylang + 3 gouttes HE lavande</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>💾 Conservation:</strong> 3-5 jours au frais (faire petites quantités)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> LE LEAVE-IN ULTIME! Hydratation 72h + protéines + brahmi = boucles parfaites tous les jours!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CATÉGORIE 5: SÉRUMS */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 305 ? null : 305)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🎁 SÉRUMS & HUILES (Finition)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 305 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 305 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>🌱 LÉGÈRE (Brillance Subtile)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 20g huile jojoba + 5 gouttes HE lavande + 3 gouttes HE arbre à thé</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Utilisation:</strong> 2-3 gouttes sur longueurs + pointes (APRÈS séchage)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Brillance subtile, non-gras. Parfum relaxant. Cheveux fins adorent!</p>
                      </div>

                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>💪 RICHE (Brillance + Satiné)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 25g huile argan + 20g huile avocat + 8 gouttes HE ylang-ylang + 4 gouttes HE neroli</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Utilisation:</strong> 3-5 gouttes sur longueurs (cheveux secs après styling)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> BRILLANCE EXTRÊME! Parfum exotique divin. Cheveux lisses et luisants!</p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>⚡ PUISSANTE (Anti-Casse + Brillance)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 30g huile argan + 25g huile ricin + 20g huile avocat + 10 gouttes HE ylang-ylang + 5 gouttes HE neroli + 3 gouttes HE sandalwood + 2g poudre brahmi</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Utilisation:</strong> 3-5 gouttes sur longueurs + pointes (entretien quotidien)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> SÉRUMS ULTIME! Ricin = anti-casse. Argan + Avocat = brillance MAX. Brahmi = fortifie. Cheveux irradiants!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* CATÉGORIE 6: GOMMAGES */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 306 ? null : 306)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🧖 GOMMAGES (Cuir Chevelu Détox)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 306 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 306 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>🌱 LÉGÈRE (Exfoliant Doux)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 30g sucre fin + 20g huile jojoba + 15g miel + 3 gouttes HE lavande</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 5 min gommage + 5 min pose</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Mélangez. Appliquez cuir chevelu SEC. Massez DÉLICATEMENT 5 min (mouvements circulaires). Rincez!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> Enlève résidus produits. Sucre = exfoliant doux. Cuir chevelu respire!</p>
                      </div>

                      <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #E8E8E8' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>💪 RICHE (Détox Équilibrée)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 40g sucre + 30g argile rhassoul + 20g huile coco + 15g miel + 50ml gel aloe vera + 5 gouttes HE menthe + 3 gouttes HE arbre à thé</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 5 min gommage + 10 min pose</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Hydratez argile lentement avec eau. Mélangez tous. Massez cuir chevelu 5 min (vigoureux). Attendez 10 min. Rincez!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> DÉTOX EFFICACE! Argile = absorbe sébum/pollution. Menthe = rafraîchit. Cuir chevelu = léger + sain!</p>
                      </div>

                      <div>
                        <p style={{ margin: '0 0 4px', fontWeight: '600', color: '#D4714D' }}>⚡ PUISSANTE (Nettoyage Complet)</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>🥘 Ingrédients:</strong> 50g sucre + 40g argile verte + 25g poudre shikakaï + 25g huile coco + 20g miel + 100g gel aloe vera + 5g poudre gingembre + 5 gouttes HE menthe + 5 gouttes HE arbre à thé + 2g sel marin</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>⏱️ Temps:</strong> 5 min gommage VIGOUREUX + 15 min pose</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>📝 Préparation:</strong> Hydratez argile. Mélangez tous. Massez cuir chevelu 5 min VIGOUREUSEMENT (circulation!). Attendez 15 min. Rincez très bien!</p>
                        <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>✨ Bénéfices:</strong> DÉTOX TOTALE! Gingembre = chauffe/stimule. Shikakaï = nettoyant puissant. Pellicules? Sébum? Résidus? TOUS disparus! Cuir chevelu = complètement purifié!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {editingProfil === 'diyObjectifs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* OBJECTIF 1: POUSSE */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 401 ? null : 401)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>📈 POUSSE RAPIDE (Ricin + Stimulation)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 401 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 401 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#D4714D' }}>✨ La recette RICHE du Prepoo est PARFAITE pour la pousse!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Ricin:</strong> L'ingrédient #1 pour la pousse (acides gras + minéraux)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Brahmi:</strong> Utilisé en Ayurvéda depuis 5000 ans pour la pousse (dosage: 5-10g)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Shikakaï:</strong> Nettoyant naturel, doux, stimule cuir chevelu</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Fréquence:</strong> Prepoo riche 2x/semaine + leave-in quotidien + gommage 1x/mois = POUSSE GARANTIE en 3 mois!</p>
                    </div>
                  )}
                </div>

                {/* OBJECTIF 2: HYDRATATION */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 402 ? null : 402)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>💧 HYDRATATION INTENSE (Aloe + Glycérine)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 402 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 402 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#D4714D' }}>✨ Le LEAVE-IN riche est votre meilleur allié!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Aloe Vera:</strong> L'humectant naturel #1 (attire l'eau dans les cheveux)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Glycérine:</strong> Dosage = 20-30% max (sinon dessèche)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Méthode LOC:</strong> Leave-in + Huile + Crème (pour sceller hydratation)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Fréquence:</strong> Leave-in quotidien + masque léger 1x/semaine + bain d'huile 2x/mois = CHEVEUX TOUJOURS HYDRATÉS!</p>
                    </div>
                  )}
                </div>

                {/* OBJECTIF 3: BRILLANCE */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 403 ? null : 403)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>✨ BRILLANCE EXTRÊME (Huiles Premium)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 403 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 403 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#D4714D' }}>✨ Utilisez le SÉRUM riche quotidiennement!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Argan:</strong> Riche en vitamine E (antioxydant). Donne brillance immédiate!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Huiles légères:</strong> Jojoba, avocat = ne collent pas</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Ylang-Ylang:</strong> HE qui apaise + sent incroyable</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Fréquence:</strong> Sérum 3-5 gouttes quotidien après séchage + masque riche 1x/semaine = BRILLANCE D'INFLUENCEUSE!</p>
                    </div>
                  )}
                </div>

                {/* OBJECTIF 4: FORCE */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 404 ? null : 404)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>💪 FORCE MAXIMALE (Protéines + Anti-Casse)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 404 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 404 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#D4714D' }}>✨ Alternez masque PUISSANT + sérum riche!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Œufs:</strong> Protéines complètes (gaine des cheveux = protéines!)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Ricin:</strong> Acides gras = lien protéines. Force maximale!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Poudre protéine:</strong> Si œufs pas assez, ajouter poudre (dosage = 5g max)</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Fréquence:</strong> Masque puissant 2x/mois + leave-in riche quotidien + sérum après shampoing = CHEVEUX BLINDÉS ANTI-CASSE!</p>
                    </div>
                  )}
                </div>

                {/* OBJECTIF 5: RÉPARATION */}
                <div style={{ borderRadius: '10px', background: '#F9F6F3', overflow: 'hidden' }}>
                  <button
                    onClick={() => setExpandedLesson(expandedLesson === 405 ? null : 405)}
                    style={{ width: '100%', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none', background: '#F9F6F3', cursor: 'pointer', borderLeft: '4px solid #D4714D' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#333', textAlign: 'left' }}>🔧 RÉPARATION DÉGÂTS (Choc + Régénération)</span>
                    <span style={{ fontSize: '16px', transform: expandedLesson === 405 ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                  </button>
                  {expandedLesson === 405 && (
                    <div className="accordion-content-expand" style={{ padding: '14px', background: '#FDFCFB', borderTop: '1px solid #E8E8E8', fontSize: '12px', color: '#666', lineHeight: '1.6' }}>
                      <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#D4714D' }}>✨ Programme CHOC = Prepoo PUISSANT + Masque PUISSANT!</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Ricin + Brahmi:</strong> Les 2 du bracelet! Ricin = cicatrisant. Brahmi = régénère</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Oeufs + Yaourt:</strong> Protéines + probiotiques = répare</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Gommage puissant:</strong> Élimine résidus qui empêchent régénération</p>
                      <p style={{ margin: '4px 0', fontSize: '11px' }}><strong>Fréquence CHOC:</strong> Semaine 1-2: Gommage + Prepoo puissant 2x/sem. Semaine 3-4: Masque puissant 1x/sem. PUIS régulier. Résultats = visibles en 1 mois!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* NOTES IMPORTANTES */}
            <div style={{ padding: '15px', background: '#FFE5D9', borderRadius: '10px', borderLeft: '4px solid #D4714D', marginTop: '20px', marginBottom: '15px', fontSize: '11px', color: '#666' }}>
              <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#333' }}>💡 CONSEILS ESSENTIELS:</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Grammes précis:</strong> Utilisez une balance pour meilleurs résultats</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Commencez léger:</strong> Puis progressez à riche, puis puissant (tolérance!)</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Testez d'abord:</strong> Appliquez petit portion (allergie possible: huiles essentielles, œuf)</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Couvrez TOUJOURS:</strong> Bonnet/serviette/film pendant pose (meilleurs résultats!)</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Eau FROIDE/TIÈDE:</strong> Jamais chaude (perte d'hydratation immédiate)</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Conservation:</strong> Sans conservateur = court durée. Coco/Ricin = stable. Aloe/œuf = 1 semaine max</p>
              <p style={{ margin: '4px 0' }}>✓ <strong>Track dans Programme:</strong> Note la recette + satisfaction = sais ce qui marche!</p>
            </div>

            {/* FOOTER */}
            <div style={{ padding: '20px', background: '#FFE5D9', borderRadius: '10px', textAlign: 'center', borderLeft: '4px solid #D4714D' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: '600', color: '#D4714D' }}>💪 DIY = Économique + Efficace + PERSONNEL!</p>
              <p style={{ margin: '0', fontSize: '11px', color: '#666' }}>Partage tes recettes favorites avec ta communauté TikTok/Instagram! 📱</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
