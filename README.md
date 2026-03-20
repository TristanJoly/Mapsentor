# 🗺️ Mapsentor — Tableau de bord du vieillissement en France

**Mapsentor** est une application web interactive qui visualise les indicateurs du vieillissement par département en France métropolitaine. Elle permet d'explorer les données démographiques, sanitaires, économiques et sociales à travers une carte interactive, des graphiques détaillés et un système d'alertes intelligent.

🔗 **Accès en ligne** : [MAPSENTOR](mapsentor.fr)

📖 **Dictionnaire des variables** : [Consulter le dictionnaire](./Dictionnaire_Variables_Mapsentor.docx) — Référence complète des variables, types, sources et bases de données utilisées.

---

## 📸 Fonctionnalités

### 🗺️ Carte Interactive
- Visualisation choroplèthe des 96 départements métropolitains
- Sélection de métriques (taux de pauvreté, APL médecins, isolement social, etc.)
- Clic sur un département pour afficher ses données détaillées

### 📊 Graphiques
- Graphiques comparatifs par département (barres, radar, etc.)
- Visualisation des indicateurs clés vs. moyenne nationale

### ⚖️ Comparaison
- Comparaison côte à côte de plusieurs départements
- Analyse multi-critères

### 🚨 Système d'Alertes (Quintiles)
Un département déclenche une alerte s'il se trouve dans le **1er Quintile** (20 % les plus bas) ou le **dernier Quintile** (20 % les plus hauts) sur les indicateurs concernés.

#### 🏥 Alertes Sanitaires
| Alerte | Condition | Leviers |
|--------|-----------|---------|
| **Désertification médicale critique** | APL médecins (Bas) + Prévalence pathologies (Haut) | Téléconsultation en officine, IPA libéraux |
| **Rupture de maintien à domicile** | Aides à domicile (Bas) + Population âgée (Haut) | Plateforme recrutement, Baluchonnage |
| **Fragilité préventive** | Vaccination (Bas) + Indice vieillissement (Haut) | Campagnes mobiles, Programme ICOPE |

#### 💰 Alertes Économiques
| Alerte | Condition | Leviers |
|--------|-----------|---------|
| **Précarité locative** | Bénéficiaires ASPA (Haut) + Propriétaires (Bas) | FSL ciblé seniors, Habitat inclusif (AVP) |
| **Renoncement aux soins** | APL médecins (Bas) + Taux pauvreté (Haut) | Chèques mobilité, Data-mining C2S |
| **Paupérisation structurelle** | ASPA (Haut) + Indice vieillissement (Haut) | Pacte des Solidarités, Conférence des Financeurs |

#### 🤝 Alertes Sociales
| Alerte | Condition | Leviers |
|--------|-----------|---------|
| **Enfermement rural** | Isolement (Haut) + Sans voiture (Haut) | Réseau MONALISA, Veiller sur mes parents |
| **Exclusion numérique** | Isolement (Haut) + Fragilité numérique (Haut) | Conseillers numériques itinérants, Aidants Connect |
| **Enclavement sanitaire** | APL médecins (Bas) + Sans voiture (Haut) | Transport à la demande, Équipes mobiles gériatrie |

---

## 🛠️ Stack Technique

| Technologie | Usage |
|-------------|-------|
| **React 18** + **TypeScript** | Framework UI |
| **Vite** | Bundler et serveur de développement |
| **Tailwind CSS** | Styles utilitaires |
| **shadcn/ui** | Composants UI (Radix UI) |
| **Recharts** | Graphiques et visualisations |
| **react-simple-maps** | Carte SVG interactive |
| **d3-scale** | Échelles de couleurs choroplèthes |
| **PapaParse** | Parsing du fichier CSV des données |

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── charts/             # Graphiques par département
│   ├── comparison/         # Module de comparaison
│   ├── layout/             # Sidebar, navigation
│   ├── map/                # Carte, sélecteurs, alertes, infos
│   └── ui/                 # Composants shadcn/ui
├── hooks/                  # Hooks React personnalisés
├── lib/
│   ├── data.ts             # Chargement et typage des données CSV
│   ├── alertConfig.ts      # Configuration des 9 alertes (déciles)
│   ├── pathologyConfig.ts  # Configuration des pathologies
│   └── utils.ts            # Utilitaires
├── pages/
│   └── Index.tsx           # Page principale (carte, graphiques, comparaison)
└── main.tsx                # Point d'entrée

public/
└── data/
    └── departements.csv    # Données source (96 départements)
```

---

## 🚀 Installation et lancement

```bash
# 1. Cloner le dépôt
git clone https://github.com/TristanJoly/Lattitudes_cartes.git

# 2. Accéder au répertoire
cd Lattitudes_cartes

# 3. Installer les dépendances
npm install

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`.

### Autres commandes

```bash
npm run build       # Build de production
npm run preview     # Prévisualiser le build
npm run test        # Lancer les tests
npm run lint        # Vérifier le code (ESLint)
```

---

## 📊 Sources de données

- [Caisse des Dépôts — 75 ans et plus](https://opendata.caissedesdepots.fr/explore/dataset/75-ans-et-plus-indicateurs-de-vieillissement-par-departement/information/)
- [DREES — Vie quotidienne et santé 2021](https://data.drees.solidarites-sante.gouv.fr/explore/dataset/enquete-vie-quotidienne-et-sante-2021-donnees-detaillees/information/)
- [Caisse des Dépôts — 60 ans et plus](https://opendata.caissedesdepots.fr/explore/dataset/60-et-plus_indicateurs-au-niveau-de-la-commune/table/)

---

## 👥 Équipe

- [Hanae Benrabh](https://www.linkedin.com/in/hanae-c%C3%A9line-benrabh-3a4b04326/)
- [Othmane Nammous](https://www.linkedin.com/in/othmane-nammous-400330297/)
- [Charlotte Gaspalou](https://www.linkedin.com/in/charlotte-gaspalou-367b84347/)
- [Charlotte Ravelomanana](https://www.linkedin.com/in/charlotte-ravelomanana-gonzalo-1b974830b/)
- [Tristan Joly](https://www.linkedin.com/in/tristan-joly-10179034a/)

📧 Contact : datavislattitudescpes@gmail.com

---

## 📄 Licence

Projet académique — Lattitudes.
