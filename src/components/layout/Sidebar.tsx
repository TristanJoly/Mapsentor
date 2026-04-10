import { useState } from "react";
import { Database, Users, Github, Mail, ExternalLink, ChevronLeft, ChevronRight, Info, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoLight from "@/assets/logo-light.png";

const sources = [
  { name: "Caisse des Dépôts - 75 ans+", url: "https://opendata.caissedesdepots.fr/explore/dataset/75-ans-et-plus-indicateurs-de-vieillissement-par-departement/information/" },
  { name: "DREES - Vie quotidienne", url: "https://data.drees.solidarites-sante.gouv.fr/explore/dataset/enquete-vie-quotidienne-et-sante-2021-donnees-detaillees/information/" },
  { name: "Caisse des Dépôts - 60 ans+", url: "https://opendata.caissedesdepots.fr/explore/dataset/60-et-plus_indicateurs-au-niveau-de-la-commune/table/" },
];

const team = [
  { name: "Hanae Benrabh", url: "https://www.linkedin.com/in/hanae-c%C3%A9line-benrabh-3a4b04326/" },
  { name: "Othmane Nammous", url: "https://www.linkedin.com/in/othmane-nammous-400330297/" },
  { name: "Charlotte Gaspalou", url: "https://www.linkedin.com/in/charlotte-gaspalou-367b84347/" },
  { name: "Charlotte Ravelomanana", url: "https://www.linkedin.com/in/charlotte-ravelomanana-gonzalo-1b974830b/" },
  { name: "Tristan Joly", url: "https://www.linkedin.com/in/tristan-joly-10179034a/" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar = ({ collapsed = false, onToggle }: SidebarProps) => {
  if (collapsed) {
    return (
      <aside className="w-14 min-h-screen bg-card border-r border-border p-2 flex flex-col items-center pt-4">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-soft">
          <MapPin className="w-5 h-5 text-white" />
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 min-h-screen bg-card border-r border-border p-6 flex flex-col">
      {/* Header with toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-soft">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Mapsentor</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Description du projet */}
      <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
          <Info className="w-4 h-4 text-primary" />
          À propos
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>Mapsentor</strong> est un tableau de bord interactif pour analyser les indicateurs du vieillissement en France. 
          Explorez les données démographiques, sanitaires et sociales par département grâce à une carte interactive et des graphiques détaillés.
        </p>
        <div className="mt-3 flex flex-wrap gap-1">
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/10 text-primary">96 départements</span>
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-accent/10 text-accent">Données 2024</span>
          <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-muted text-muted-foreground">Open Data</span>
        </div>
      </div>

      {/* Sources */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          <Database className="w-3.5 h-3.5" />
          Sources de données
        </h3>
        <div className="space-y-1">
          {sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link group"
            >
              <span className="flex-1 truncate">{source.name}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="mb-6">
        <h3 className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          <Users className="w-3.5 h-3.5" />
          Équipe
        </h3>
        <div className="space-y-1">
          {team.map((member, i) => (
            <a
              key={i}
              href={member.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sidebar-link group"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xs font-medium text-primary">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="flex-1 truncate">{member.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-auto pt-6 border-t border-border space-y-1">
        <a
          href="/data/Infos_sur_donnees_manquantes.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
        >
          <BookOpen className="w-4 h-4" />
          <span>Données manquantes</span>
        </a>
        <a
          href="/data/Dictionnaire_Variables_Mapsentor.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
        >
          <BookOpen className="w-4 h-4" />
          <span>Dictionnaire des variables</span>
        </a>
        <a
          href="mailto:datavislattitudescpes@gmail.com"
          className="sidebar-link"
        >
          <Mail className="w-4 h-4" />
          <span>Contact</span>
        </a>
        <a
          href="https://github.com/TristanJoly/Mapsentor"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-link"
        >
          <Github className="w-4 h-4" />
          <span>GitHub</span>
        </a>
      </div>
    </aside>
  );
};
