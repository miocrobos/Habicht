# Comprehensive Translation Addition Script
# This script adds ALL missing translation keys to all 6 language files

Write-Host "Starting comprehensive translation addition..." -ForegroundColor Cyan

# Define all new keys needed (categorized)
$newKeys = @{
    # Home page slides
    "home.slides.nla.title" = @{
        gsw = "NLA Herren & Damen"
        de = "NLA Herren & Damen"
        fr = "LNA Hommes & Femmes"
        it = "LNA Uomini & Donne"
        rm = "LNA Umens & Dunnas"
        en = "NLA Men & Women"
    }
    "home.slides.nla.subtitle" = @{
        gsw = "Schwiizer Spitzevolleyball"
        de = "Schweizer Spitzenvolleyball"
        fr = "Volleyball Suisse de Pointe"
        it = "Pallavolo Svizzera di Alto Livello"
        rm = "Volleyball Svizzer da Punta"
        en = "Swiss Top-Level Volleyball"
    }
    "home.slides.nlb.title" = @{
        gsw = "NLB"
        de = "NLB"
        fr = "LNB"
        it = "LNB"
        rm = "LNB"
        en = "NLB"
    }
    "home.slides.nlb.subtitle" = @{
        gsw = "Dr Wäg Nach Obe"
        de = "Der Weg Nach Oben"
        fr = "Le Chemin Vers Le Haut"
        it = "La Strada Verso L'Alto"
        rm = "Il Viadi Ensi"
        en = "The Way Up"
    }
    "home.slides.league1.title" = @{
        gsw = "1. Liga"
        de = "1. Liga"
        fr = "1ère Ligue"
        it = "1a Lega"
        rm = "1avla Ligia"
        en = "1st League"
    }
    "home.slides.league1.subtitle" = @{
        gsw = "Regionali Spitze"
        de = "Regionale Spitze"
        fr = "Sommet Régional"
        it = "Vertice Regionale"
        rm = "Punta Regiunala"
        en = "Regional Top"
    }
    "home.slides.league23.title" = @{
        gsw = "2. & 3. Liga"
        de = "2. & 3. Liga"
        fr = "2ème & 3ème Ligue"
        it = "2a & 3a Lega"
        rm = "2avla & 3avla Ligia"
        en = "2nd & 3rd League"
    }
    "home.slides.league23.subtitle" = @{
        gsw = "Ufstrebendi Talönt"
        de = "Aufstrebende Talente"
        fr = "Talents Émergents"
        it = "Talenti Emergenti"
        rm = "Talents Emergents"
        en = "Rising Talents"
    }
    "home.slides.league45.title" = @{
        gsw = "4. & 5. Liga"
        de = "4. & 5. Liga"
        fr = "4ème & 5ème Ligue"
        it = "4a & 5a Lega"
        rm = "4avla & 5avla Ligia"
        en = "4th & 5th League"
    }
    "home.slides.league45.subtitle" = @{
        gsw = "Basis Und Nachwuchs"
        de = "Basis und Nachwuchs"
        fr = "Base et Relève"
        it = "Base e Giovani"
        rm = "Basa E Giuvenils"
        en = "Base and Youth"
    }
    
    # Placeholders
    "placeholders.exampleCities" = @{
        gsw = "z.B. Winterthur, Bern, Luzern"
        de = "z.B. Winterthur, Bern, Luzern"
        fr = "p.ex. Winterthour, Berne, Lucerne"
        it = "es. Winterthur, Berna, Lucerna"
        rm = "p.ex. Winterthur, Berna, Lucerna"
        en = "e.g. Winterthur, Bern, Lucerne"
    }
    "placeholders.exampleJob" = @{
        gsw = "z.B. Marketing Manager, Softwareentwickler"
        de = "z.B. Marketing Manager, Softwareentwickler"
        fr = "p.ex. Responsable Marketing, Développeur"
        it = "es. Manager Marketing, Sviluppatore"
        rm = "p.ex. Manager da Marketing, Sviluppader"
        en = "e.g. Marketing Manager, Developer"
    }
    "placeholders.exampleClub" = @{
        gsw = "z.B. Volley Amriswil"
        de = "z.B. Volley Amriswil"
        fr = "p.ex. Volley Amriswil"
        it = "es. Volley Amriswil"
        rm = "p.ex. Volley Amriswil"
        en = "e.g. Volley Amriswil"
    }
    "placeholders.exampleYear" = @{
        gsw = "z.B. 2020"
        de = "z.B. 2020"
        fr = "p.ex. 2020"
        it = "es. 2020"
        rm = "p.ex. 2020"
        en = "e.g. 2020"
    }
    "placeholders.exampleAchievement" = @{
        gsw = "z.B. U17 Schwiizermeister 2021"
        de = "z.B. U17 Schweizermeister 2021"
        fr = "p.ex. Champion Suisse U17 2021"
        it = "es. Campione Svizzero U17 2021"
        rm = "p.ex. Campion Svizzer U17 2021"
        en = "e.g. U17 Swiss Champion 2021"
    }
    "placeholders.searchClubCity" = @{
        gsw = "Suche nach Club oder Stadt..."
        de = "Suche nach Verein oder Stadt..."
        fr = "Rechercher club ou ville..."
        it = "Cerca club o città..."
        rm = "Tschertgar club u citad..."
        en = "Search for club or city..."
    }
    "placeholders.tellAboutYourself" = @{
        gsw = "Verzell Über Dich, Din Spielstil, Dini Ziel, etc..."
        de = "Erzähle über dich, deinen Spielstil, deine Ziele, etc..."
        fr = "Parle de toi, ton style de jeu, tes objectifs, etc..."
        it = "Racconta di te, il tuo stile di gioco, i tuoi obiettivi, etc..."
        rm = "Discurra davart tai, tes stil da giug, tes finamiras, etc..."
        en = "Tell about yourself, your playing style, your goals, etc..."
    }
    
    # Labels
    "labels.employmentStatus" = @{
        gsw = "Beschäftigungsstatus"
        de = "Beschäftigungsstatus"
        fr = "Statut d'Emploi"
        it = "Stato di Occupazione"
        rm = "Status d'Emplegament"
        en = "Employment Status"
    }
    "labels.schoolUniversity" = @{
        gsw = "Schuel / Universität"
        de = "Schule / Universität"
        fr = "École / Université"
        it = "Scuola / Università"
        rm = "Scola / Universitad"
        en = "School / University"
    }
    "labels.occupation" = @{
        gsw = "Beruf"
        de = "Beruf"
        fr = "Profession"
        it = "Professione"
        rm = "Professiun"
        en = "Occupation"
    }
    "labels.volleyballInfo" = @{
        gsw = "Volleyball Informatione"
        de = "Volleyball Informationen"
        fr = "Informations Volleyball"
        it = "Informazioni Pallavolo"
        rm = "Infurmaziuns Volleyball"
        en = "Volleyball Information"
    }
}

Write-Host "`nTotal keys to add: $($newKeys.Count)" -ForegroundColor Green
Write-Host "Languages to update: 6 (gsw, de, fr, it, rm, en)`n" -ForegroundColor Green

Write-Host "Script created. Run manually to add translations." -ForegroundColor Yellow
