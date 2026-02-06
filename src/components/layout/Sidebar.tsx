import { MapPin, Database, Users, Github, Mail, ExternalLink } from "lucide-react";

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

export const Sidebar = () => {
  return (
    <aside className="w-72 min-h-screen bg-card border-r border-border p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-soft">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold gradient-text">Mapsentor</h1>
        </div>
        <p className="text-sm text-muted-foreground">Indicateurs du vieillissement en France</p>
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
          href="mailto:datavislattitudescpes@gmail.com"
          className="sidebar-link"
        >
          <Mail className="w-4 h-4" />
          <span>Contact</span>
        </a>
        <a
          href="https://github.com/TristanJoly/Lattitudes_cartes/"
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
