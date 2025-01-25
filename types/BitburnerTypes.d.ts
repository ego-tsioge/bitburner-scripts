/** Server Information as defined in PDP-003 */
export interface ServerInfo {
    /** Basis-Informationen */
    /** Server-Hostname (server.hostname) */
    hostname: string;
    /** IP-Adresse des Servers (server.ip) */
    ip: string;
    /** Anzahl CPU-Kerne (server.cpuCores) */
    cores: number;
    /** Name der Organisation (server.organizationName) */
    organization: string;
    /** Ist Home-Server? (hostname === 'home') */
    isHome: boolean;
    /** Von Spieler gekauft? (server.purchasedByPlayer) */
    purchased: boolean;
    /** Direkte Netzwerkverbindungen (ns.scan()) */
    connections: string[];

    /** Zugriffs-Status */
    access: {
        /** Root-Rechte vorhanden? (server.hasAdminRights) */
        admin: boolean;
        /** Backdoor installiert? (server.backdoorInstalled) */
        backdoored: boolean;
        /** Benötigtes Hacking-Level (server.requiredHackingSkill) */
        level: number;
    };

    /** RAM Details des Servers */
    ram: {
        /** Genutztes RAM in GB (server.ramUsed) */
        used: number;
        /** Verfügbares RAM in GB (home: maxRam - RESERVED_RAM, sonst: maxRam) */
        max: number;
        /** Freies RAM in GB (max - used) */
        free: number;
        /** Absolutes RAM Maximum in GB (server.maxRam) */
        trueMax: number;
        /** RAM-Power (Math.max(0, Math.log2(maxRam))) */
        power: number;
    };

    /** Port-Status */
    ports: {
        /** Benötigte offene Ports (server.numOpenPortsRequired) */
        required: number;
        /** Anzahl offener Ports (server.openPortCount) */
        open: number;
        /** FTP-Port offen? (server.ftpPortOpen) */
        ftp: boolean;
        /** HTTP-Port offen? (server.httpPortOpen) */
        http: boolean;
        /** SMTP-Port offen? (server.smtpPortOpen) */
        smtp: boolean;
        /** SQL-Port offen? (server.sqlPortOpen) */
        sql: boolean;
        /** SSH-Port offen? (server.sshPortOpen) */
        ssh: boolean;
    };

    /** Security-Details */
    security: {
        /** Basis-Sicherheitslevel (server.baseDifficulty) */
        base: number;
        /** Aktuelles Sicherheitslevel (server.hackDifficulty) */
        level: number;
        /** Minimales Sicherheitslevel (server.minDifficulty) */
        min: number;
    };

    /** Finanzielle Details */
    money: {
        /** Aktuell verfügbares Geld (server.moneyAvailable) */
        available: number;
        /** Maximales Geld (server.moneyMax) */
        max: number;
        /** Server-Wachstumsfaktor (server.serverGrowth) */
        growth: number;
    };
}

/** Network State Structure */
export interface NetworkState {
    servers: { [key: string]: ServerInfo };  // Server nach Hostname
    lastUpdate: number;                      // Zeitstempel der letzten Aktualisierung
    scanTime: number;                        // Dauer des Scans
}

/** Player State Structure as defined in PDP-003 */
export interface PlayerState {
    /** Verfügbares Geld (player.money) */
    money: number;

    /** Gesundheitsstatus */
    hp: {
        /** Aktuelle HP (player.hp.current) */
        current: number;
        /** Maximale HP (player.hp.max) */
        max: number;
    };

    /** Hacking-Fähigkeiten und Multiplikatoren */
    hacking: {
        /** Hacking Level (player.skills.hacking) */
        level: number;
        /** Hacking Erfahrung (player.exp.hacking) */
        exp: number;
        /** Basis-Multiplikator (player.mults.hacking) */
        mult: number;
        /** Erfolgswahrscheinlichkeit (player.mults.hacking_chance) */
        chance: number;
        /** Ausführungsgeschwindigkeit (player.mults.hacking_speed) */
        speed: number;
        /** Geldertrag (player.mults.hacking_money) */
        money: number;
        /** Wachstumsrate (player.mults.hacking_grow) */
        growth: number;
    };

    /** Körperliche Stärke */
    strength: {
        /** Stärke Level (player.skills.strength) */
        level: number;
        /** Stärke Erfahrung (player.exp.strength) */
        exp: number;
        /** Stärke Multiplikator (player.mults.strength) */
        mult: number;
    };

    /** Verteidigung */
    defense: {
        /** Verteidigungs Level (player.skills.defense) */
        level: number;
        /** Verteidigungs Erfahrung (player.exp.defense) */
        exp: number;
        /** Verteidigungs Multiplikator (player.mults.defense) */
        mult: number;
    };

    /** Geschicklichkeit */
    dexterity: {
        /** Geschicklichkeits Level (player.skills.dexterity) */
        level: number;
        /** Geschicklichkeits Erfahrung (player.exp.dexterity) */
        exp: number;
        /** Geschicklichkeits Multiplikator (player.mults.dexterity) */
        mult: number;
    };

    /** Beweglichkeit */
    agility: {
        /** Beweglichkeits Level (player.skills.agility) */
        level: number;
        /** Beweglichkeits Erfahrung (player.exp.agility) */
        exp: number;
        /** Beweglichkeits Multiplikator (player.mults.agility) */
        mult: number;
    };

    /** Charisma */
    charisma: {
        /** Charisma Level (player.skills.charisma) */
        level: number;
        /** Charisma Erfahrung (player.exp.charisma) */
        exp: number;
        /** Charisma Multiplikator (player.mults.charisma) */
        mult: number;
    };

    /** Standort & Arbeit */
    location: {
        /** Aktuelle Stadt (player.city) */
        city: string;
        /** Vorherige Stadt für Rückreise */
        lastCity: string;
        /** Spezifischer Ort (player.location) */
        location: string;
        /** Arbeitsstatus (player.jobs) */
        jobs: Partial<Record<string, string>>;
    };
    /** Factions */
    factions: {
        /** Aktuelle Faction-Mitgliedschaften (player.factions) */
        current: string[];
        /** Offene Faction-Einladungen (player.factionInvitations) */
        invites: string[];
    };
    /** Spielzeit-Tracking */
    playtime: {
        /** Gesamte Spielzeit (player.totalPlaytime) */
        total: number;
        /** Zeit seit letztem Augment Reset (ns.getResetInfo().lastAugReset) */
        sinceLastAug: number;
        /** Zeit seit letztem Node Reset (ns.getResetInfo().lastNodeReset) */
        sinceLastNode: number;
    };

    /** Fortschritt & Achievements */
    progress: {
        /**
         * Anzahl getöteter NPCs (player.numPeopleKilled)
         * Relevant für:
         * - Karma-System (Gang-Zugang)
         * - Spezielle Achievements
         */
        peopleKilled: number;
        /** Karma-Wert (ns.heart.break()) */
        karma: number;
        /** Freigeschaltete Achievements (player.achievements) */
        achievements: string[];
        /** Freigeschaltete Source Files (player.sourceFileLvl) */
        sourceFiles: { [key: string]: number };
    };
}

/** Global State Structure */
export interface GlobalState {
    /** Versionierung für alle States (version) */
    version: string;

    /** Minimaler Sicherheits-Puffer beim Hacken (Differenz zum Min-Level) */
    minSecurityBuffer: number;
    /** Minimales Geld das auf dem Server bleiben soll */
    minMoneyBuffer: number;
    /** RAM das auf Home reserviert bleibt */
    reservedHomeRam: number;
    /** Aktueller Logging Level */
    logLevel: string;

    /** Fokus der Automatisierung (money/hack_xp) */
    focus: string;
    /** Aktuelle Hack-Targets (Hostname) */
    targets: string[];
    /** Erzwungenes Target (überschreibt Targeting) */
    forcedTarget?: string;

    /** Automatische Hacknet Verwaltung */
    hacknetEnabled: boolean;
    /** Maximaler Anteil des Geldes für Hacknet (0-1) */
    hacknetMaxSpend: number;
}
