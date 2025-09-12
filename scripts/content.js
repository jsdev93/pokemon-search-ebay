// content.js
(function () {
  // Only run on eBay item pages
  if (
    window.location.hostname === "www.ebay.com" &&
    window.location.pathname.startsWith("/itm/")
  ) {
    const title = document.title;
    // Find any values before and after '/'
    let displayText = "No values found.";
    const match = title.match(/([^\s\/]+)\s*\/\s*([^\s\/]+)/);
    let div = document.createElement("div");
    // List of Pokémon names (Gen 1-9, 1025 total)
    const pokemonList = [
      "Bulbasaur",
      "Ivysaur",
      "Venusaur",
      "Charmander",
      "Charmeleon",
      "Charizard",
      "Squirtle",
      "Wartortle",
      "Blastoise",
      "Caterpie",
      "Metapod",
      "Butterfree",
      "Weedle",
      "Kakuna",
      "Beedrill",
      "Pidgey",
      "Pidgeotto",
      "Pidgeot",
      "Rattata",
      "Raticate",
      "Spearow",
      "Fearow",
      "Ekans",
      "Arbok",
      "Pikachu",
      "Raichu",
      "Sandshrew",
      "Sandslash",
      "Nidoran♀",
      "Nidorina",
      "Nidoqueen",
      "Nidoran♂",
      "Nidorino",
      "Nidoking",
      "Clefairy",
      "Clefable",
      "Vulpix",
      "Ninetales",
      "Jigglypuff",
      "Wigglytuff",
      "Zubat",
      "Golbat",
      "Oddish",
      "Gloom",
      "Vileplume",
      "Paras",
      "Parasect",
      "Venonat",
      "Venomoth",
      "Diglett",
      "Dugtrio",
      "Meowth",
      "Persian",
      "Psyduck",
      "Golduck",
      "Mankey",
      "Primeape",
      "Growlithe",
      "Arcanine",
      "Poliwag",
      "Poliwhirl",
      "Poliwrath",
      "Abra",
      "Kadabra",
      "Alakazam",
      "Machop",
      "Machoke",
      "Machamp",
      "Bellsprout",
      "Weepinbell",
      "Victreebel",
      "Tentacool",
      "Tentacruel",
      "Geodude",
      "Graveler",
      "Golem",
      "Ponyta",
      "Rapidash",
      "Slowpoke",
      "Slowbro",
      "Magnemite",
      "Magneton",
      "Farfetch’d",
      "Doduo",
      "Dodrio",
      "Seel",
      "Dewgong",
      "Grimer",
      "Muk",
      "Shellder",
      "Cloyster",
      "Gastly",
      "Haunter",
      "Gengar",
      "Onix",
      "Drowzee",
      "Hypno",
      "Krabby",
      "Kingler",
      "Voltorb",
      "Electrode",
      "Exeggcute",
      "Exeggutor",
      "Cubone",
      "Marowak",
      "Hitmonlee",
      "Hitmonchan",
      "Lickitung",
      "Koffing",
      "Weezing",
      "Rhyhorn",
      "Rhydon",
      "Chansey",
      "Tangela",
      "Kangaskhan",
      "Horsea",
      "Seadra",
      "Goldeen",
      "Seaking",
      "Staryu",
      "Starmie",
      "Mr. Mime",
      "Scyther",
      "Jynx",
      "Electabuzz",
      "Magmar",
      "Pinsir",
      "Tauros",
      "Magikarp",
      "Gyarados",
      "Lapras",
      "Ditto",
      "Eevee",
      "Vaporeon",
      "Jolteon",
      "Flareon",
      "Porygon",
      "Omanyte",
      "Omastar",
      "Kabuto",
      "Kabutops",
      "Aerodactyl",
      "Snorlax",
      "Articuno",
      "Zapdos",
      "Moltres",
      "Dratini",
      "Dragonair",
      "Dragonite",
      "Mewtwo",
      "Mew",
      // Gen 2
      "Chikorita",
      "Bayleef",
      "Meganium",
      "Cyndaquil",
      "Quilava",
      "Typhlosion",
      "Totodile",
      "Croconaw",
      "Feraligatr",
      "Sentret",
      "Furret",
      "Hoothoot",
      "Noctowl",
      "Ledyba",
      "Ledian",
      "Spinarak",
      "Ariados",
      "Crobat",
      "Chinchou",
      "Lanturn",
      "Pichu",
      "Cleffa",
      "Igglybuff",
      "Togepi",
      "Togetic",
      "Natu",
      "Xatu",
      "Mareep",
      "Flaaffy",
      "Ampharos",
      "Bellossom",
      "Marill",
      "Azumarill",
      "Sudowoodo",
      "Politoed",
      "Hoppip",
      "Skiploom",
      "Jumpluff",
      "Aipom",
      "Sunkern",
      "Sunflora",
      "Yanma",
      "Wooper",
      "Quagsire",
      "Espeon",
      "Umbreon",
      "Murkrow",
      "Slowking",
      "Misdreavus",
      "Unown",
      "Wobbuffet",
      "Girafarig",
      "Pineco",
      "Forretress",
      "Dunsparce",
      "Gligar",
      "Steelix",
      "Snubbull",
      "Granbull",
      "Qwilfish",
      "Scizor",
      "Shuckle",
      "Heracross",
      "Sneasel",
      "Teddiursa",
      "Ursaring",
      "Slugma",
      "Magcargo",
      "Swinub",
      "Piloswine",
      "Corsola",
      "Remoraid",
      "Octillery",
      "Delibird",
      "Mantine",
      "Skarmory",
      "Houndour",
      "Houndoom",
      "Kingdra",
      "Phanpy",
      "Donphan",
      "Porygon2",
      "Stantler",
      "Smeargle",
      "Tyrogue",
      "Hitmontop",
      "Smoochum",
      "Elekid",
      "Magby",
      "Miltank",
      "Blissey",
      "Raikou",
      "Entei",
      "Suicune",
      "Larvitar",
      "Pupitar",
      "Tyranitar",
      "Lugia",
      "Ho-Oh",
      "Celebi",
      // Gen 3
      "Treecko",
      "Grovyle",
      "Sceptile",
      "Torchic",
      "Combusken",
      "Blaziken",
      "Mudkip",
      "Marshtomp",
      "Swampert",
      "Poochyena",
      "Mightyena",
      "Zigzagoon",
      "Linoone",
      "Wurmple",
      "Silcoon",
      "Beautifly",
      "Cascoon",
      "Dustox",
      "Lotad",
      "Lombre",
      "Ludicolo",
      "Seedot",
      "Nuzleaf",
      "Shiftry",
      "Taillow",
      "Swellow",
      "Wingull",
      "Pelipper",
      "Ralts",
      "Kirlia",
      "Gardevoir",
      "Surskit",
      "Masquerain",
      "Shroomish",
      "Breloom",
      "Slakoth",
      "Vigoroth",
      "Slaking",
      "Nincada",
      "Ninjask",
      "Shedinja",
      "Whismur",
      "Loudred",
      "Exploud",
      "Makuhita",
      "Hariyama",
      "Azurill",
      "Nosepass",
      "Skitty",
      "Delcatty",
      "Sableye",
      "Mawile",
      "Aron",
      "Lairon",
      "Aggron",
      "Meditite",
      "Medicham",
      "Electrike",
      "Manectric",
      "Plusle",
      "Minun",
      "Volbeat",
      "Illumise",
      "Roselia",
      "Gulpin",
      "Swalot",
      "Carvanha",
      "Sharpedo",
      "Wailmer",
      "Wailord",
      "Numel",
      "Camerupt",
      "Torkoal",
      "Spoink",
      "Grumpig",
      "Spinda",
      "Trapinch",
      "Vibrava",
      "Flygon",
      "Cacnea",
      "Cacturne",
      "Swablu",
      "Altaria",
      "Zangoose",
      "Seviper",
      "Lunatone",
      "Solrock",
      "Barboach",
      "Whiscash",
      "Corphish",
      "Crawdaunt",
      "Baltoy",
      "Claydol",
      "Lileep",
      "Cradily",
      "Anorith",
      "Armaldo",
      "Feebas",
      "Milotic",
      "Castform",
      "Kecleon",
      "Shuppet",
      "Banette",
      "Duskull",
      "Dusclops",
      "Tropius",
      "Chimecho",
      "Absol",
      "Wynaut",
      "Snorunt",
      "Glalie",
      "Spheal",
      "Sealeo",
      "Walrein",
      "Clamperl",
      "Huntail",
      "Gorebyss",
      "Relicanth",
      "Luvdisc",
      "Bagon",
      "Shelgon",
      "Salamence",
      "Beldum",
      "Metang",
      "Metagross",
      "Regirock",
      "Regice",
      "Registeel",
      "Latias",
      "Latios",
      "Kyogre",
      "Groudon",
      "Rayquaza",
      "Jirachi",
      "Deoxys",
      // Gen 4
      "Turtwig",
      "Grotle",
      "Torterra",
      "Chimchar",
      "Monferno",
      "Infernape",
      "Piplup",
      "Prinplup",
      "Empoleon",
      "Starly",
      "Staravia",
      "Staraptor",
      "Bidoof",
      "Bibarel",
      "Kricketot",
      "Kricketune",
      "Shinx",
      "Luxio",
      "Luxray",
      "Budew",
      "Roserade",
      "Cranidos",
      "Rampardos",
      "Shieldon",
      "Bastiodon",
      "Burmy",
      "Wormadam",
      "Mothim",
      "Combee",
      "Vespiquen",
      "Pachirisu",
      "Buizel",
      "Floatzel",
      "Cherubi",
      "Cherrim",
      "Shellos",
      "Gastrodon",
      "Ambipom",
      "Drifloon",
      "Drifblim",
      "Buneary",
      "Lopunny",
      "Mismagius",
      "Honchkrow",
      "Glameow",
      "Purugly",
      "Chingling",
      "Stunky",
      "Skuntank",
      "Bronzor",
      "Bronzong",
      "Bonsly",
      "Mime Jr.",
      "Happiny",
      "Chatot",
      "Spiritomb",
      "Gible",
      "Gabite",
      "Garchomp",
      "Munchlax",
      "Riolu",
      "Lucario",
      "Hippopotas",
      "Hippowdon",
      "Skorupi",
      "Drapion",
      "Croagunk",
      "Toxicroak",
      "Carnivine",
      "Finneon",
      "Lumineon",
      "Mantyke",
      "Snover",
      "Abomasnow",
      "Weavile",
      "Magnezone",
      "Lickilicky",
      "Rhyperior",
      "Tangrowth",
      "Electivire",
      "Magmortar",
      "Togekiss",
      "Yanmega",
      "Leafeon",
      "Glaceon",
      "Gliscor",
      "Mamoswine",
      "Porygon-Z",
      "Gallade",
      "Probopass",
      "Dusknoir",
      "Froslass",
      "Rotom",
      "Uxie",
      "Mesprit",
      "Azelf",
      "Dialga",
      "Palkia",
      "Heatran",
      "Regigigas",
      "Giratina",
      "Cresselia",
      "Phione",
      "Manaphy",
      "Darkrai",
      "Shaymin",
      "Arceus",
      // Gen 5
      "Victini",
      "Snivy",
      "Servine",
      "Serperior",
      "Tepig",
      "Pignite",
      "Emboar",
      "Oshawott",
      "Dewott",
      "Samurott",
      "Patrat",
      "Watchog",
      "Lillipup",
      "Herdier",
      "Stoutland",
      "Purrloin",
      "Liepard",
      "Pansage",
      "Simisage",
      "Pansear",
      "Simisear",
      "Panpour",
      "Simipour",
      "Munna",
      "Musharna",
      "Pidove",
      "Tranquill",
      "Unfezant",
      "Blitzle",
      "Zebstrika",
      "Roggenrola",
      "Boldore",
      "Gigalith",
      "Woobat",
      "Swoobat",
      "Drilbur",
      "Excadrill",
      "Audino",
      "Timburr",
      "Gurdurr",
      "Conkeldurr",
      "Tympole",
      "Palpitoad",
      "Seismitoad",
      "Throh",
      "Sawk",
      "Sewaddle",
      "Swadloon",
      "Leavanny",
      "Venipede",
      "Whirlipede",
      "Scolipede",
      "Cottonee",
      "Whimsicott",
      "Petilil",
      "Lilligant",
      "Basculin",
      "Sandile",
      "Krokorok",
      "Krookodile",
      "Darumaka",
      "Darmanitan",
      "Maractus",
      "Dwebble",
      "Crustle",
      "Scraggy",
      "Scrafty",
      "Sigilyph",
      "Yamask",
      "Cofagrigus",
      "Tirtouga",
      "Carracosta",
      "Archen",
      "Archeops",
      "Trubbish",
      "Garbodor",
      "Zorua",
      "Zoroark",
      "Minccino",
      "Cinccino",
      "Gothita",
      "Gothorita",
      "Gothitelle",
      "Solosis",
      "Duosion",
      "Reuniclus",
      "Ducklett",
      "Swanna",
      "Vanillite",
      "Vanillish",
      "Vanilluxe",
      "Deerling",
      "Sawsbuck",
      "Emolga",
      "Karrablast",
      "Escavalier",
      "Foongus",
      "Amoonguss",
      "Frillish",
      "Jellicent",
      "Alomomola",
      "Joltik",
      "Galvantula",
      "Ferroseed",
      "Ferrothorn",
      "Klink",
      "Klang",
      "Klinklang",
      "Tynamo",
      "Eelektrik",
      "Eelektross",
      "Elgyem",
      "Beheeyem",
      "Litwick",
      "Lampent",
      "Chandelure",
      "Axew",
      "Fraxure",
      "Haxorus",
      "Cubchoo",
      "Beartic",
      "Cryogonal",
      "Shelmet",
      "Accelgor",
      "Stunfisk",
      "Mienfoo",
      "Mienshao",
      "Druddigon",
      "Golett",
      "Golurk",
      "Pawniard",
      "Bisharp",
      "Bouffalant",
      "Rufflet",
      "Braviary",
      "Vullaby",
      "Mandibuzz",
      "Heatmor",
      "Durant",
      "Deino",
      "Zweilous",
      "Hydreigon",
      "Larvesta",
      "Volcarona",
      "Cobalion",
      "Terrakion",
      "Virizion",
      "Tornadus",
      "Thundurus",
      "Reshiram",
      "Zekrom",
      "Landorus",
      "Kyurem",
      "Keldeo",
      "Meloetta",
      "Genesect",
      // Gen 6
      "Chespin",
      "Quilladin",
      "Chesnaught",
      "Fennekin",
      "Braixen",
      "Delphox",
      "Froakie",
      "Frogadier",
      "Greninja",
      "Bunnelby",
      "Diggersby",
      "Fletchling",
      "Fletchinder",
      "Talonflame",
      "Scatterbug",
      "Spewpa",
      "Vivillon",
      "Litleo",
      "Pyroar",
      "Flabébé",
      "Floette",
      "Florges",
      "Skiddo",
      "Gogoat",
      "Pancham",
      "Pangoro",
      "Furfrou",
      "Espurr",
      "Meowstic",
      "Honedge",
      "Doublade",
      "Aegislash",
      "Spritzee",
      "Aromatisse",
      "Swirlix",
      "Slurpuff",
      "Inkay",
      "Malamar",
      "Binacle",
      "Barbaracle",
      "Skrelp",
      "Dragalge",
      "Clauncher",
      "Clawitzer",
      "Helioptile",
      "Heliolisk",
      "Tyrunt",
      "Tyrantrum",
      "Amaura",
      "Aurorus",
      "Sylveon",
      "Hawlucha",
      "Dedenne",
      "Carbink",
      "Goomy",
      "Sliggoo",
      "Goodra",
      "Klefki",
      "Phantump",
      "Trevenant",
      "Pumpkaboo",
      "Gourgeist",
      "Bergmite",
      "Avalugg",
      "Noibat",
      "Noivern",
      "Xerneas",
      "Yveltal",
      "Zygarde",
      "Diancie",
      "Hoopa",
      "Volcanion",
      // Gen 7
      "Rowlet",
      "Dartrix",
      "Decidueye",
      "Litten",
      "Torracat",
      "Incineroar",
      "Popplio",
      "Brionne",
      "Primarina",
      "Pikipek",
      "Trumbeak",
      "Toucannon",
      "Yungoos",
      "Gumshoos",
      "Grubbin",
      "Charjabug",
      "Vikavolt",
      "Crabrawler",
      "Crabominable",
      "Oricorio",
      "Cutiefly",
      "Ribombee",
      "Rockruff",
      "Lycanroc",
      "Wishiwashi",
      "Mareanie",
      "Toxapex",
      "Mudbray",
      "Mudsdale",
      "Dewpider",
      "Araquanid",
      "Fomantis",
      "Lurantis",
      "Morelull",
      "Shiinotic",
      "Salandit",
      "Salazzle",
      "Stufful",
      "Bewear",
      "Bounsweet",
      "Steenee",
      "Tsareena",
      "Comfey",
      "Oranguru",
      "Passimian",
      "Wimpod",
      "Golisopod",
      "Sandygast",
      "Palossand",
      "Pyukumuku",
      "Type: Null",
      "Silvally",
      "Minior",
      "Komala",
      "Turtonator",
      "Togedemaru",
      "Mimikyu",
      "Bruxish",
      "Drampa",
      "Dhelmise",
      "Jangmo-o",
      "Hakamo-o",
      "Kommo-o",
      "Tapu Koko",
      "Tapu Lele",
      "Tapu Bulu",
      "Tapu Fini",
      "Cosmog",
      "Cosmoem",
      "Solgaleo",
      "Lunala",
      "Nihilego",
      "Buzzwole",
      "Pheromosa",
      "Xurkitree",
      "Celesteela",
      "Kartana",
      "Guzzlord",
      "Necrozma",
      "Magearna",
      "Marshadow",
      "Poipole",
      "Naganadel",
      "Stakataka",
      "Blacephalon",
      "Zeraora",
      "Meltan",
      "Melmetal",
      // Gen 8
      "Grookey",
      "Thwackey",
      "Rillaboom",
      "Scorbunny",
      "Raboot",
      "Cinderace",
      "Sobble",
      "Drizzile",
      "Inteleon",
      "Skwovet",
      "Greedent",
      "Rookidee",
      "Corvisquire",
      "Corviknight",
      "Blipbug",
      "Dottler",
      "Orbeetle",
      "Nickit",
      "Thievul",
      "Gossifleur",
      "Eldegoss",
      "Wooloo",
      "Dubwool",
      "Chewtle",
      "Drednaw",
      "Yamper",
      "Boltund",
      "Rolycoly",
      "Carkol",
      "Coalossal",
      "Applin",
      "Flapple",
      "Appletun",
      "Silicobra",
      "Sandaconda",
      "Cramorant",
      "Arrokuda",
      "Barraskewda",
      "Toxel",
      "Toxtricity",
      "Sizzlipede",
      "Centiskorch",
      "Clobbopus",
      "Grapploct",
      "Sinistea",
      "Polteageist",
      "Hatenna",
      "Hattrem",
      "Hatterene",
      "Impidimp",
      "Morgrem",
      "Grimmsnarl",
      "Obstagoon",
      "Perrserker",
      "Cursola",
      "Sirfetch’d",
      "Mr. Rime",
      "Runerigus",
      "Milcery",
      "Alcremie",
      "Falinks",
      "Pincurchin",
      "Snom",
      "Frosmoth",
      "Stonjourner",
      "Eiscue",
      "Indeedee",
      "Morpeko",
      "Cufant",
      "Copperajah",
      "Dracozolt",
      "Arctozolt",
      "Dracovish",
      "Arctovish",
      "Duraludon",
      "Dreepy",
      "Drakloak",
      "Dragapult",
      "Zacian",
      "Zamazenta",
      "Eternatus",
      "Kubfu",
      "Urshifu",
      "Zarude",
      "Regieleki",
      "Regidrago",
      "Glastrier",
      "Spectrier",
      "Calyrex",
      // Gen 9
      "Sprigatito",
      "Floragato",
      "Meowscarada",
      "Fuecoco",
      "Crocalor",
      "Skeledirge",
      "Quaxly",
      "Quaxwell",
      "Quaquaval",
      "Lechonk",
      "Oinkologne",
      "Tarountula",
      "Spidops",
      "Nymble",
      "Lokix",
      "Pawmi",
      "Pawmo",
      "Pawmot",
      "Tandemaus",
      "Maushold",
      "Squawkabilly",
      "Nacli",
      "Naclstack",
      "Garganacl",
      "Charcadet",
      "Armarouge",
      "Ceruledge",
      "Tadbulb",
      "Bellibolt",
      "Wattrel",
      "Kilowattrel",
      "Maschiff",
      "Mabosstiff",
      "Shroodle",
      "Grafaiai",
      "Bramblin",
      "Brambleghast",
      "Toedscool",
      "Toedscruel",
      "Klawf",
      "Capsakid",
      "Scovillain",
      "Rellor",
      "Rabsca",
      "Flittle",
      "Espathra",
      "Tinkatink",
      "Tinkatuff",
      "Tinkaton",
      "Wiglett",
      "Wugtrio",
      "Bombirdier",
      "Finizen",
      "Palafin",
      "Varoom",
      "Revavroom",
      "Cyclizar",
      "Orthworm",
      "Glimmet",
      "Glimmora",
      "Greavard",
      "Houndstone",
      "Flamigo",
      "Cetoddle",
      "Cetitan",
      "Veluza",
      "Dondozo",
      "Tatsugiri",
      "Annihilape",
      "Clodsire",
      "Farigiraf",
      "Dudunsparce",
      "Kingambit",
      "Great Tusk",
      "Scream Tail",
      "Brute Bonnet",
      "Flutter Mane",
      "Slither Wing",
      "Sandy Shocks",
      "Iron Treads",
      "Iron Bundle",
      "Iron Hands",
      "Iron Jugulis",
      "Iron Moth",
      "Iron Thorns",
      "Frigibax",
      "Arctibax",
      "Baxcalibur",
      "Gimmighoul",
      "Gholdengo",
      "Wo-Chien",
      "Chien-Pao",
      "Ting-Lu",
      "Chi-Yu",
      "Roaring Moon",
      "Iron Valiant",
      "Koraidon",
      "Miraidon",
      "Walking Wake",
      "Iron Leaves",
      "Dipplin",
      "Poltchageist",
      "Sinistcha",
      "Okidogi",
      "Munkidori",
      "Fezandipiti",
      "Ogerpon",
      "Archaludon",
      "Hydrapple",
      "Raging Bolt",
      "Iron Crown",
      "Terapagos",
    ];
    let foundPokemon = "";
    for (const name of pokemonList) {
      const regex = new RegExp(`\\b${name}\\b`, "i");
      if (regex.test(title)) {
        foundPokemon = name;
        break;
      }
    }
    let searchValue = "";
    if (match) {
      searchValue = `${match[1]}/${match[2]}`;
    } else {
      // Use any number in the title as backup
      const numMatch = title.match(/\d+/g);
      if (numMatch && numMatch.length > 0) {
        searchValue = numMatch.join(" ");
      } else {
        searchValue = "";
      }
    }
    // Always append foundPokemon if present
    if (foundPokemon) {
      searchValue = foundPokemon + (searchValue ? " " + searchValue : "");
    }
    if (/1st/i.test(title)) {
      searchValue += " 1st";
    }
    if (/chinese/i.test(title)) {
      searchValue += " chinese";
    }
    if (/japanese/i.test(title)) {
      searchValue += " japanese";
    }
    // Create a sidebar for grading checkboxes (outside the iframe)
    const sidebar = document.createElement("div");
    sidebar.style.width = "100%";
    sidebar.style.height = "auto";
    sidebar.style.background = "rgba(30,30,30,0.95)";
    sidebar.style.borderRadius = "8px";
    sidebar.style.display = "flex";
    sidebar.style.flexDirection = "row";
    sidebar.style.justifyContent = "center";
    sidebar.style.alignItems = "center";
    sidebar.style.padding = "6px 2px";
    sidebar.style.boxSizing = "border-box";
    sidebar.style.zIndex = "10002";
    sidebar.style.marginRight = "0";
    sidebar.style.marginBottom = "4px";

    // Modernize sidebar UI
    sidebar.style.background = "rgba(30, 30, 40, 0.65)";
    sidebar.style.backdropFilter = "blur(10px)";
    sidebar.style.borderRadius = "16px";
    sidebar.style.boxShadow = "0 4px 24px 0 rgba(0,0,0,0.18)";
    sidebar.style.border = "1.5px solid rgba(255,255,255,0.18)";
    sidebar.style.padding = "10px 18px";
    sidebar.style.margin = "12px";
    sidebar.style.minHeight = "56px";
    sidebar.style.maxWidth = "calc(100% - 24px)";

    const labels = ["fuzzy", "psa", "bgs", "cgc", "tag"];
    const checkboxes = {};
    // Load persisted checkbox states from localStorage
    const persisted = JSON.parse(
      localStorage.getItem("ebayGradingCheckboxes") || "{}"
    );
    labels.forEach((label) => {
      const wrapper = document.createElement("label");
      wrapper.style.display = "flex";
      wrapper.style.alignItems = "center";
      wrapper.style.marginBottom = "0";
      wrapper.style.marginRight = "8px";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.style.marginRight = "7px";
      cb.id = `cb-${label}`;
      cb.checked = !!persisted[label];
      checkboxes[label] = cb;
      const span = document.createElement("span");
      span.textContent = label.toUpperCase();
      span.style.color = "#fff";
      span.style.fontSize = "13px";
      wrapper.appendChild(cb);
      wrapper.appendChild(span);
      sidebar.appendChild(wrapper);
    });

    const gradeWrapper = document.createElement("div");
    gradeWrapper.style.display = "flex";
    gradeWrapper.style.alignItems = "center";
    gradeWrapper.style.marginLeft = "8px";
    const gradeLabel = document.createElement("span");
    gradeLabel.textContent = "Grade:";
    gradeLabel.style.color = "#fff";
    gradeLabel.style.fontSize = "13px";
    gradeLabel.style.marginRight = "4px";
    const gradeSelect = document.createElement("select");
    gradeSelect.style.fontSize = "15px";
    gradeSelect.style.padding = "1px 4px";
    gradeSelect.style.borderRadius = "4px";
    gradeSelect.style.border = "1px solid #ccc";
    gradeSelect.style.background = "#222";
    gradeSelect.style.color = "#fff";
    // Reduce the width of the grade select dropdown for a more compact appearance
    gradeSelect.style.width = "4rem";
    const grades = ["Any", "10", "9", "8", "7", "6", "5", "4", "3", "2", "1"];
    const gradeOptions = [
      "Any",
      "10",
      "9/10",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
      "1",
    ];
    gradeOptions.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g;
      opt.textContent = g;
      gradeSelect.appendChild(opt);
    });
    gradeWrapper.appendChild(gradeLabel);
    gradeWrapper.appendChild(gradeSelect);
    sidebar.appendChild(gradeWrapper);
    // Update iframe search on change
    gradeSelect.addEventListener("change", () => {
      localStorage.setItem("ebayGradeSelect", gradeSelect.value);
      updateIframe();
    });
    // Persist selection
    const persistedGrade = localStorage.getItem("ebayGradeSelect");
    if (persistedGrade) gradeSelect.value = persistedGrade;
    // Add grade to search
    const oldUpdateIframe = updateIframe;
    updateIframe = function () {
      let extra = "";
      labels.forEach((label) => {
        if (checkboxes[label].checked && label !== "fuzzy") {
          extra += " " + label;
        }
      });
      let gradeVal = gradeSelect.value;
      let baseSearch = searchValue;
      // Remove number and slash if fuzzy is checked
      if (checkboxes["fuzzy"] && checkboxes["fuzzy"].checked) {
        // Remove only the slash and the number after it, keep the number before the slash
        baseSearch = baseSearch.replace(/\/(\s*\d+)/, "");
        baseSearch = baseSearch.replace(/\s{2,}/g, " ").trim();
      }
      let fullSearch = baseSearch + extra;
      if (gradeVal && gradeVal !== "Any") {
        if (gradeVal === "9/10") {
          fullSearch += " (9, 10)";
        } else {
          fullSearch += " " + gradeVal;
        }
      }
      iframe.src = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
        fullSearch.trim()
      )}&LH_Sold=1&LH_Complete=1&rt=nc&_dcat=183454`;
    };

    // Create a container for sidebar + iframe
    // Create a toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.textContent = "Hide Panel";
    toggleBtn.style.position = "fixed";
    toggleBtn.style.bottom = "10px";
    toggleBtn.style.right = "10px";
    toggleBtn.style.zIndex = "10003";
    toggleBtn.style.padding = "8px 16px";
    toggleBtn.style.borderRadius = "8px";
    toggleBtn.style.border = "none";
    toggleBtn.style.background = "#444";
    toggleBtn.style.color = "#fff";
    toggleBtn.style.fontSize = "16px";
    toggleBtn.style.cursor = "pointer";
    let panelVisible = true;
    toggleBtn.onclick = function () {
      panelVisible = !panelVisible;
      container.style.display = panelVisible ? "flex" : "none";
      toggleBtn.textContent = panelVisible ? "Hide Panel" : "Show Panel";
    };
    document.body.appendChild(toggleBtn);
    // ...existing code...
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.bottom = "0";
    container.style.right = "0";
    container.style.width = "33vw";
    container.style.height = "80vh";
    container.style.zIndex = "10001";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.alignItems = "stretch";
    container.style.background = "transparent";

    // Create the iframe
    const iframe = document.createElement("iframe");
    function updateIframe() {
      let extra = "";
      labels.forEach((label) => {
        if (checkboxes[label].checked) {
          extra += " " + label;
        }
      });
      let fullSearch = searchValue + extra;
      iframe.src = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(
        fullSearch.trim()
      )}&LH_Sold=1&LH_Complete=1&rt=nc&Grade=10%7C9&_dcat=183454`;
    }
    iframe.style.width = "100%";
    iframe.style.height = "calc(80vh - " + sidebar.offsetHeight + "px)";
    iframe.style.border = "2px solid rgba(0,0,0,0.12)";
    iframe.style.borderRadius = "12px";
    iframe.style.boxShadow = "0 8px 32px rgba(0,0,0,0.18)";
    iframe.style.background = "rgba(255,255,255,0.5)";
    iframe.style.marginLeft = "0";
    iframe.style.zIndex = "10001";
    iframe.style.overflowX = "hidden";
    iframe.style.overflowY = "auto";
    // Initial load
    updateIframe();

    // Add event listeners to checkboxes and persist state
    labels.forEach((label) => {
      checkboxes[label].addEventListener("change", function () {
        // Persist state
        const state = {};
        labels.forEach((l) => {
          state[l] = checkboxes[l].checked;
        });
        localStorage.setItem("ebayGradingCheckboxes", JSON.stringify(state));
        updateIframe();
      });
    });

    container.appendChild(sidebar);
    container.appendChild(iframe);
    div.appendChild(container);
    // Removed overlay styling from div to prevent covering the UI
    document.body.appendChild(div);

    iframe.addEventListener("load", function () {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc) {
          const style = doc.createElement("style");
          style.innerHTML = "html, body { overflow-x: hidden !important; }";
          doc.head.appendChild(style);
        }
      } catch (e) {
        // Cross-origin, cannot inject style
      }
    });
  }
})();
