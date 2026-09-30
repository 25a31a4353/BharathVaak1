export interface ChecklistItem {
  id: string;
  titleEn: string;
  titleTe: string;
  descriptionEn: string;
  descriptionTe: string;
  isCritical: boolean;
  category: 'Structural' | 'Water & Food' | 'Medical' | 'Power & Comms' | 'Documents' | 'Livestock';
}

export interface SurvivalHack {
  titleEn: string;
  titleTe: string;
  stepsEn: string[];
  stepsTe: string[];
  icon: string;
}

export interface HelplineContact {
  labelEn: string;
  labelTe: string;
  number: string;
  agencyEn: string;
  agencyTe: string;
  isTollFree: boolean;
}

export interface DisasterGuide {
  id: string;
  titleEn: string;
  titleTe: string;
  category: 'cyclone' | 'flood' | 'thunderstorm' | 'heatwave' | 'earthquake' | 'gobag';
  badgeEn: string;
  badgeTe: string;
  icon: string;
  themeColor: string;
  summaryEn: string;
  summaryTe: string;
  localContextEn: string;
  localContextTe: string;
  officialSource: string;
  phases: {
    before: ChecklistItem[];
    during: ChecklistItem[];
    after: ChecklistItem[];
  };
  survivalHacks: SurvivalHack[];
  emergencyHelplines: HelplineContact[];
  offlineSmsTemplate: string;
}

export const DISASTER_CHECKLISTS: DisasterGuide[] = [
  {
    id: 'cyclone',
    titleEn: 'Cyclone & Gale Storm Preparedness',
    titleTe: 'తుఫాను & పెనుగాలుల ముందస్తు రక్షణ చర్యలు',
    category: 'cyclone',
    badgeEn: 'Bay of Bengal Coastal Protocol',
    badgeTe: 'బంగాళాఖాతం తీరప్రాంత నిబంధనలు',
    icon: 'cyclone',
    themeColor: '#081534',
    summaryEn: 'Actionable life-safety steps for high-velocity winds (100+ km/h), torrential rain, and storm surges in coastal & delta Andhra Pradesh.',
    summaryTe: 'తీరప్రాంతాల్లో 100+ కి.మీ వేగంతో వీచే పెనుగాలులు, భారీ వర్షాల సమయంలో ప్రాణ, ఆస్తి నష్టం జరగకుండా తీసుకోవాల్సిన రక్షణ చర్యలు.',
    localContextEn: 'Tailored for Tadepalligudem, Eluru, and Godavari delta basin prone to Bay of Bengal cyclonic depressions and flash water logging.',
    localContextTe: 'తాడేపల్లిగూడెం, ఏలూరు మరియు గోదావరి డెల్టా పరిసర ప్రాంతాల తుఫాను ముప్పును దృష్టిలో ఉంచుకొని రూపొందించబడింది.',
    officialSource: 'NDMA & AP State Disaster Management Authority (APSDMA)',
    phases: {
      before: [
        {
          id: 'cyc_b_1',
          titleEn: 'Clear Drainage & Anchor Roof Sheets',
          titleTe: 'పైకప్పు రేకులు, గుడిసెల దృఢత్వం & డ్రైనేజీ క్లియరెన్స్',
          descriptionEn: 'Fasten asbestos or tin roof sheets with heavy sandbags or wire ties. Clear surrounding storm drains of silt.',
          descriptionTe: 'రేకుల షెడ్లను బరువులు, ఇసుక బస్తాలతో గట్టిగా కట్టండి. ఇంటి చుట్టూ మురుగు కాలువల్లో చెత్తాచెదారం తొలగించండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'cyc_b_2',
          titleEn: 'Prune Overhanging Tree Branches',
          titleTe: 'విద్యుత్ తీగలపై పడే చెట్ల కొమ్మలను నరకడం',
          descriptionEn: 'Trim old branches near your house walls and overhead power lines to prevent falling hazards during gale winds.',
          descriptionTe: 'ఇంటి సమీపంలోని బలహీనమైన చెట్ల కొమ్మలను, విద్యుత్ లైన్ల దగ్గర ఉన్న కొమ్మలను ముందుగానే తొలగించండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'cyc_b_3',
          titleEn: 'Store 3-Day Potable Water Supply',
          titleTe: 'కనీసం 3 రోజులకు సరిపడా స్వచ్ఛమైన తాగునీటి నిల్వ',
          descriptionEn: 'Store at least 15-20 liters of boiled drinking water in sealed, covered containers. Municipal supply may stop.',
          descriptionTe: 'ప్రభుత్వ కుళాయిలు నిలిచిపోవచ్చు కాబట్టి శుభ్రమైన మూతలున్న పాత్రలలో 15-20 లీటర్ల తాగునీరు నిల్వ చేసుకోండి.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'cyc_b_4',
          titleEn: 'Charge All Power Banks & Mobile Phones',
          titleTe: 'మొబైల్ ఫోన్లు & పవర్ బ్యాంకుల ఫుల్ చార్జింగ్',
          descriptionEn: 'Charge devices to 100%. Turn on battery saver mode. Keep LED emergency lamps ready for grid cutoffs.',
          descriptionTe: 'కరెంటు పోకముందే ఫోన్లు, పవర్ బ్యాంకులు పూర్తిగా చార్జ్ చేయండి. అత్యవసర ఎమర్జెన్సీ లైట్లు సిద్ధం చేసుకోండి.',
          isCritical: false,
          category: 'Power & Comms',
        },
        {
          id: 'cyc_b_5',
          titleEn: 'Seal Important Documents in Plastic Zip-Bags',
          titleTe: 'ముఖ్యమైన పత్రాలు ప్లాస్టిక్ కవర్లలో భద్రపరచడం',
          descriptionEn: 'Put Aadhaar cards, property deeds, ration card, insurance & bank passbooks into double-layered waterproof pouches.',
          descriptionTe: 'ఆధార్, రేషన్ కార్డు, పట్టాదార్ పాస్ పుస్తకాలు, బ్యాంకు పత్రాలు వాటర్‌ప్రూఫ్ ప్లాస్టిక్ కవర్లలో భద్రపరచండి.',
          isCritical: true,
          category: 'Documents',
        },
        {
          id: 'cyc_b_6',
          titleEn: 'Identify Nearest High-Ground Shelter / Safe Haven',
          titleTe: 'సమీపంలోని తుఫాను పునరావాస కేంద్రాన్ని గుర్తించడం',
          descriptionEn: 'Check local government relief shelter address (e.g., Tadepalligudem ZP High School or Mandal Parishad hall).',
          descriptionTe: 'మీ ఏరియాలోని ప్రభుత్వ తుఫాను పునరావాస భవనం (ZP హైస్కూల్ / కమ్యూనిటీ హాల్) ఎక్కడుందో తెలుసుకోండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'cyc_b_7',
          titleEn: 'Untie & Move Cattle to Elevated Sheds',
          titleTe: 'పశువులు, మూగజీవాలను ఎత్తైన ప్రాంతాలకు తరలించడం',
          descriptionEn: 'Never leave livestock tied up in low-lying sheds. Move them to community shelters with dry fodder.',
          descriptionTe: 'పశువులను ఎట్టి పరిస్థితుల్లో కట్టేసి ఉంచవద్దు. ఎత్తైన ప్రదేశాలకు తరలించి ఎండుగడ్డి సిద్ధం చేయండి.',
          isCritical: false,
          category: 'Livestock',
        },
      ],
      during: [
        {
          id: 'cyc_d_1',
          titleEn: 'Shut Down Main Electric Breaker & LPG Gas Valve',
          titleTe: 'మెయిన్ విద్యుత్ స్విచ్ & గ్యాస్ సిలిండర్ రెగ్యులేటర్ ఆఫ్ చేయడం',
          descriptionEn: 'Turn off the main electrical MCB to prevent short-circuit fires. Close LPG cylinder valve tightly.',
          descriptionTe: 'షార్ట్ సర్క్యూట్ ప్రమాదాలను నివారించడానికి ఇంటి మెయిన్ స్విచ్ ఆఫ్ చేయండి. గ్యాస్ రెగ్యులేటర్ ఆపివేయండి.',
          isCritical: true,
          category: 'Power & Comms',
        },
        {
          id: 'cyc_d_2',
          titleEn: 'Stay Indoors & Away From Glass Windows',
          titleTe: 'ఇంటి లోపలే ఉండండి, కిటికీలకు దూరంగా ఉండండి',
          descriptionEn: 'Move into the strongest interior room without large windows. Flying debris poses severe trauma risk.',
          descriptionTe: 'పెనుగాలుల సమయంలో ఎట్టి పరిస్థితుల్లో బయటకు రాకండి. కిటికీలు పగిలి గాయాలయ్యే ప్రమాదం ఉంది.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'cyc_d_3',
          titleEn: 'Beware of the "Cyclone Eye" False Lull',
          titleTe: 'తుఫాను కన్ను (హఠాత్తుగా గాలి తగ్గడం) మోసపూరిత శాంతి',
          descriptionEn: 'If winds suddenly stop, do NOT go outside. The opposite wall of the cyclone will strike with equal force in minutes.',
          descriptionTe: 'గాలి ఒకేసారి ఆగిపోతే తుఫాను తగ్గిందనుకుని బయటకు వెళ్లకండి. కొద్దిసేపట్లోనే రెండవ వైపు నుంచి తీవ్రమైన గాలులు వీస్తాయి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'cyc_d_4',
          titleEn: 'Listen Only to Official All India Radio / DDMA Feeds',
          titleTe: 'అధికారిక ఆల్ ఇండియా రేడియో / ఆకాశవాణి బులెటిన్లు మాత్రమే వినండి',
          descriptionEn: 'Do not spread unverified rumors on WhatsApp. Rely on official government disaster broadcasts.',
          descriptionTe: 'సోషల్ మీడియాలో వచ్చే అనధికారిక పుకార్లను నమ్మవద్దు, షేర్ చేయవద్దు.',
          isCritical: false,
          category: 'Power & Comms',
        },
      ],
      after: [
        {
          id: 'cyc_a_1',
          titleEn: 'Watch Out for Fallen Live Electric Wires & Snapped Cables',
          titleTe: 'తెగిపడిన విద్యుత్ తీగలను తాకవద్దు',
          descriptionEn: 'Never touch dangling wires, metal poles, or water puddles near transformers. Report immediately to 1912.',
          descriptionTe: 'రోడ్లపై పడివున్న విద్యుత్ తీగలు, స్తంభాలను ముట్టుకోవద్దు. వెంటనే 1912 కి సమాచారం ఇవ్వండి.',
          isCritical: true,
          category: 'Power & Comms',
        },
        {
          id: 'cyc_a_2',
          titleEn: 'Boil Drinking Water for at least 1 Full Minute',
          titleTe: 'తాగునీటిని కనీసం ఒక నిమిషం పాటు బాగా మరిగించి తాగండి',
          descriptionEn: 'Cyclone waters contaminate borewells and pipelines with sewage. Drink only thoroughly boiled or chlorinated water.',
          descriptionTe: 'వరద నీటి వల్ల బావులు, పైపులైన్లు కలుషితమవుతాయి. కలరా, టైఫాయిడ్ రాకుండా నీటిని మరిగించి మాత్రమే తాగండి.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'cyc_a_3',
          titleEn: 'Check for Venomous Snakes in Flood Debris',
          titleTe: 'ఇళ్లలోకి చేరే పాములు, తేళ్ల విషయంలో జాగ్రత్త',
          descriptionEn: 'Snakes and reptiles seek dry shelter in houses. Inspect corners, shoes, and dark spaces with a torch stick.',
          descriptionTe: 'నీటి ముంపు వల్ల పాములు ఇళ్లలోకి వచ్చే అవకాశం ఉంది. చీకటి మూలలను టార్చ్ లైట్‌తో పరిశీలించండి.',
          isCritical: true,
          category: 'Medical',
        },
      ],
    },
    survivalHacks: [
      {
        titleEn: 'Window X-Taping Technique',
        titleTe: 'కిటికీల ఎక్స్-టేపింగ్ టెక్నిక్',
        stepsEn: [
          'Apply heavy duct tape or packing tape in large "X" and "*" patterns across window glass panes.',
          'This reduces vibration and prevents glass from shattering inward into fatal projectile shards.',
        ],
        stepsTe: [
          'గాజు కిటికీలపై దళసరి డక్ట్ టేప్‌ను "X" ఆకారంలో లేదా నక్షత్రంలా అతికించండి.',
          'ఇది గాలి ఒత్తిడికి గాజు ముక్కలు చెల్లాచెదురుగా పడకుండా ఆపుతుంది.',
        ],
        icon: 'grid_view',
      },
      {
        titleEn: 'Emergency Rice Bag Door Barrier',
        titleTe: 'ఇంటి గుమ్మానికి బియ్యం/ఇసుక బస్తాల రక్షణ',
        stepsEn: [
          'Fill empty fertilizer or gunny bags 2/3rd with sand or dry mud.',
          'Stack them tightly against the external threshold to stop 1-2 feet of storm surge water from entering.',
        ],
        stepsTe: [
          'గోనె సంచుల్లో ఇసుక లేదా మట్టిని నింపి ఇంటి ప్రధాన గుమ్మం వద్ద అడ్డంగా పేర్చండి.',
          'ఇది వర్షపు నీరు ఇంట్లోకి రాకుండా అడ్డుకట్ట వేస్తుంది.',
        ],
        icon: 'fence',
      },
    ],
    emergencyHelplines: [
      { labelEn: 'AP State Disaster Control Room', labelTe: 'రాష్ట్ర విపత్తు నిర్వహణ విభాగం', number: '1070', agencyEn: 'APSDMA Toll-Free', agencyTe: 'ఏపీ విపత్తుల సంస్థ', isTollFree: true },
      { labelEn: 'District Emergency Operations (Eluru/West Godavari)', labelTe: 'జిల్లా ఎమర్జెన్సీ కంట్రోల్ రూమ్', number: '1077', agencyEn: 'Collectorate Control Room', agencyTe: 'కలెక్టరేట్ విభాగం', isTollFree: true },
      { labelEn: 'APEPDCL Power Emergency & Snapped Lines', labelTe: 'విద్యుత్ శాఖ అత్యవసర సేవ', number: '1912', agencyEn: 'Electricity Dept Toll-Free', agencyTe: 'విద్యుత్ శాఖ టోల్ ఫ్రీ', isTollFree: true },
      { labelEn: 'National Emergency Universal Help', labelTe: 'జాతీయ అత్యవసర నంబర్', number: '112', agencyEn: 'All-India Police & Rescue', agencyTe: 'పోలీస్ & రక్షణ దళం', isTollFree: true },
    ],
    offlineSmsTemplate: 'EMERGENCY: We are stranded during cyclone gale winds at [LOCATION/HOUSE_NO]. Number of family members: [COUNT]. Need immediate evacuation/shelter assistance. Sent via Akashvani Offline DPI.',
  },
  {
    id: 'flood',
    titleEn: 'Flash Flood & River Inundation Guide',
    titleTe: 'వరదలు & కాల్వల ముంపు రక్షణ మార్గదర్శిని',
    category: 'flood',
    badgeEn: 'Godavari / Canal Delta Protocol',
    badgeTe: 'గోదావరి & డెల్టా కాలువల నిబంధనలు',
    icon: 'flood',
    themeColor: '#0369a1',
    summaryEn: 'Critical escape, sanitation, and life-preservation protocols during canal overflow, flash flooding, and reservoir surplus discharge.',
    summaryTe: 'కాలువల గండ్లు, రిజర్వాయర్ల నుంచి వరద నీరు విడుదలైనప్పుడు తీసుకోవాల్సిన సత్వర జాగ్రత్తలు, రక్షణ చర్యలు.',
    localContextEn: 'Specific guidelines for West Godavari canal systems, low-lying wards in Tadepalligudem, and agricultural irrigation floodways.',
    localContextTe: 'తాడేపల్లిగూడెం ఏరియాలోని లోతట్టు ప్రాంతాలు, గోదావరి కాలువ పరివాహక ప్రాంతాల కోసం ప్రత్యేకించినవి.',
    officialSource: 'Central Water Commission (CWC) & AP Water Resources Dept',
    phases: {
      before: [
        {
          id: 'fld_b_1',
          titleEn: 'Elevate Vital Electrical Appliances & Food Stocks',
          titleTe: 'విద్యుత్ పరికరాలు, నిత్యావసరాలను ఎత్తైన అటకలపై పెట్టండి',
          descriptionEn: 'Move refrigerators, televisions, gas cylinders, and sacks of rice to second floors or overhead lofts.',
          descriptionTe: 'టీవీలు, ఫ్రిజ్‌లు, గ్యాస్ సిలిండర్, బియ్యం బస్తాలను పై అంతస్తు లేదా అటకపై భద్రపరచండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'fld_b_2',
          titleEn: 'Prepare 10-15 Chlorine Tablets / Bleaching Powder',
          titleTe: 'క్లోరిన్ మాత్రలు, బ్లీచింగ్ పౌడర్ నిల్వ',
          descriptionEn: 'Keep water purification tablets (Halazone or Chlorine 5mg) ready from your local PHC or Anganwadi.',
          descriptionTe: 'తాగునీటి శుద్ధి కోసం ప్రాథమిక ఆరోగ్య కేంద్రం (PHC) నుంచి క్లోరిన్ మాత్రలు తెచ్చి ఉంచుకోండి.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'fld_b_3',
          titleEn: 'Pack Waterproof Emergency "Go-Bag"',
          titleTe: 'అత్యవసర బ్యాగ్ (గో-బ్యాగ్) సిద్ధం చేసుకోవడం',
          descriptionEn: 'Pack dry food (poha, chana, biscuits), water bottles, torch, prescription medicines, and baby supplies into one bag.',
          descriptionTe: 'అటుకులు, వేరుశెనగ, బిస్కెట్లు, మందులు, టార్చ్ లైట్ ఉన్న ఒక బ్యాగును గుమ్మం వద్ద సిద్ధంగా ఉంచుకోండి.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'fld_b_4',
          titleEn: 'Know Your Neighborhood Escape Corridor',
          titleTe: 'మీ వార్డులోని వరద ఎస్కేప్ మార్గాన్ని గమనించండి',
          descriptionEn: 'Review the high-elevation road to the designated relief camp (check Akashvani real GIS map).',
          descriptionTe: 'ముంపు తక్కువగా ఉండే ఎత్తైన రోడ్లు, పునరావాస కేంద్రానికి వెళ్లే దారిని ముందుగానే గుర్తించండి.',
          isCritical: true,
          category: 'Structural',
        },
      ],
      during: [
        {
          id: 'fld_d_1',
          titleEn: 'Never Walk or Drive Through Moving Floodwater',
          titleTe: 'ప్రవహించే వరద నీటిలో ఎట్టి పరిస్థితుల్లో నడవకండి, వాహనాలు నడపకండి',
          descriptionEn: 'Just 6 inches of rapid water can sweep an adult off balance; 12 inches can carry away a car or tractor.',
          descriptionTe: 'కేవలం అర అడుగు వేగంగా ప్రవహించే నీరు మనిషిని కొట్టుకుపోయేలా చేస్తుంది. కల్వర్టులు, వంతెనలపై దాటవద్దు.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'fld_d_2',
          titleEn: 'Move to Rooftop or Highest Floor if Stranded',
          titleTe: 'నీరు పెరిగితే వెంటనే డాబా లేదా పై అంతస్తుకు చేరండి',
          descriptionEn: 'Take emergency whistle, torch, and drinking water. Wave a bright colored cloth to signal rescue boats/NDRF.',
          descriptionTe: 'ఈల (విజిల్), టార్చ్ లైట్, తాగునీరు తీసుకుని డాబా పైకి వెళ్లండి. ఎరుపు లేదా ప్రకాశవంతమైన వస్త్రంతో సహాయం కోరండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'fld_d_3',
          titleEn: 'Switch Off Main Electric Switchboard Before Water Reaches It',
          titleTe: 'నీరు చేరక ముందే ఇంటి మెయిన్ స్విచ్ బోర్డు ఆఫ్ చేయండి',
          descriptionEn: 'Submerged wall sockets can electrify entire standing water in the home.',
          descriptionTe: 'నీటిలో విద్యుత్ ప్రసారమై ప్రాణాంతకం కాకుండా ఉండేందుకు వెంటనే మెయిన్ ఆఫ్ చేయండి.',
          isCritical: true,
          category: 'Power & Comms',
        },
      ],
      after: [
        {
          id: 'fld_a_1',
          titleEn: 'Disinfect Flood-Soaked Rooms with Bleaching Solution',
          titleTe: 'ఇంట్లో చేరిన వరద బురదను బ్లీచింగ్, ఫినాయిల్‌తో శుభ్రం చేయండి',
          descriptionEn: 'Wear rubber boots and thick gloves. Spray 5% bleaching powder solution to prevent leptospirosis and fungal infections.',
          descriptionTe: 'చెప్పులు, చేతి తొడుగులు ధరించి ఇల్లు శుభ్రం చేయండి. వ్యాధులు ప్రబలకుండా బ్లీచింగ్ చల్లండి.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'fld_a_2',
          titleEn: 'Do NOT Eat Food Touched by Floodwater',
          titleTe: 'వరద నీరు తగిలిన ఆహార పదార్థాలు, కూరగాయలను తినవద్దు',
          descriptionEn: 'Discard opened grain bags, vegetables, and packaged goods that came into contact with sewage floodwaters.',
          descriptionTe: 'మురికి నీరు తగిలిన తినుబండారాలు, బియ్యం వెంటనే పారవేయండి. విషతుల్యమయ్యే ప్రమాదం ఉంది.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'fld_a_3',
          titleEn: 'Get Tested for Fever / Diarrhea at Nearest Relief PHC',
          titleTe: 'జ్వరం, వాంతులు ఉంటే వెంటనే సమీప ప్రభుత్వ శిబిరాన్ని సంప్రదించండి',
          descriptionEn: 'Visit the local medical camp for preventive doxycycline and ORS packets.',
          descriptionTe: 'వరద తగ్గాక వచ్చే అంటువ్యాధుల నివారణకు ప్రభుత్వ డాక్టర్లను సంప్రదించి మందులు తీసుకోండి.',
          isCritical: false,
          category: 'Medical',
        },
      ],
    },
    survivalHacks: [
      {
        titleEn: 'Emergency Water Purification Without Power',
        titleTe: 'విద్యుత్ లేనప్పుడు అత్యవసర తాగునీటి శుద్ధి పద్ధతి',
        stepsEn: [
          'Filter muddy water through 4 layers of clean cotton cloth/sari into a clean pot.',
          'Add 1 Halazone/Chlorine tablet (or 3-4 drops of unscented 5% household liquid bleach) per 5 liters of clear water.',
          'Let it sit undisturbed for 30 minutes before drinking.',
        ],
        stepsTe: [
          'మలినమైన నీటిని నాలుగు మడతల శుభ్రమైన కాటన్ చీర లేదా గుడ్డతో వడకట్టండి.',
          'ప్రతి 5 లీటర్ల నీటికి 1 క్లోరిన్ మాత్ర వేయండి.',
          'కలపకుండా 30 నిమిషాలు ఉంచిన తర్వాత మాత్రమే తాగండి.',
        ],
        icon: 'water_drop',
      },
      {
        titleEn: 'DIY Flotation Life Vest',
        titleTe: 'తాత్కాలిక తేలియాడే లైఫ్ వెస్ట్ తయారీ',
        stepsEn: [
          'Take 4-6 empty, clean 2-liter plastic soda/water bottles with caps screwed on tight.',
          'Place them inside an ordinary backpack or tie them securely with a bedsheet around the chest under armpits.',
          'Provides enough buoyancy to keep an adult head above water during emergency wading.',
        ],
        stepsTe: [
          'మూతలు గట్టిగా బిగించిన 4-6 ఖాళీ ప్లాస్టిక్ వాటర్ బాటిళ్లను తీసుకోండి.',
          'వాటిని స్కూల్ బ్యాగ్‌లో ఉంచి వీపుకు తగిలించుకోండి లేదా తువ్వాలుతో ఛాతీకి గట్టిగా కట్టండి.',
          'ఇది నీటిలో మునిగిపోకుండా తేలేందుకు సహాయపడుతుంది.',
        ],
        icon: 'lifebuoy',
      },
    ],
    emergencyHelplines: [
      { labelEn: 'SDRF / NDRF Flood Rescue Unit', labelTe: 'వరద రక్షణ దళం (NDRF)', number: '1070', agencyEn: 'State Disaster Response', agencyTe: 'రాష్ట్ర రక్షణ దళం', isTollFree: true },
      { labelEn: 'Government Ambulance Service', labelTe: '108 అత్యవసర అంబులెన్స్', number: '108', agencyEn: 'Govt Emergency Medical Service', agencyTe: 'అత్యవసర వైద్య సేవ', isTollFree: true },
      { labelEn: 'Flood Cell / Irrigation Control Room', labelTe: 'వరద & నీటిపారుదల కంట్రోల్ రూమ్', number: '08818-222100', agencyEn: 'West Godavari Irrigation Div', agencyTe: 'గోదావరి ప్రాజెక్ట్స్', isTollFree: false },
      { labelEn: 'Health Helpline & Tele-Med', labelTe: '104 ప్రభుత్వ ఆరోగ్య సమాచారం', number: '104', agencyEn: 'AP Health Dept', agencyTe: 'ఆరోగ్య శాఖ', isTollFree: true },
    ],
    offlineSmsTemplate: 'URGENT: Flooding in our house at [STREET/WARD]. Water level is currently [FEET] high. Stranded with [CHILDREN/ELDERLY]. Immediate boat rescue needed. Sent via Akashvani Offline DPI.',
  },
  {
    id: 'thunderstorm',
    titleEn: 'Lightning & Severe Storm Survival',
    titleTe: 'పిడుగుపాటు & భారీ ఉరుముల రక్షణ నియమావళి',
    category: 'thunderstorm',
    badgeEn: 'Damini Lightning Warning Safety',
    badgeTe: 'దామిని పిడుగుపాటు భద్రతా నిబంధనలు',
    icon: 'bolt',
    themeColor: '#7c3aed',
    summaryEn: 'Crucial life-saving protocols to avoid lightning strikes in fields, rural open grounds, and residential buildings during convective thunderstorms.',
    summaryTe: 'వ్యవసాయ పొలాలు, బహిరంగ ప్రదేశాలు మరియు ఇళ్లలో పిడుగుపాటు బారిన పడకుండా పాటించవలసిన నియమాలు.',
    localContextEn: 'High occurrence during pre-monsoon and cyclonic squalls in coastal Andhra Pradesh agricultural belts.',
    localContextTe: 'వరి పొలాలు, కొబ్బరి తోటలు విస్తారంగా ఉన్న ఏపీ పల్లెల్లో పిడుగుపాటు ప్రమాదాలు ఎక్కువ.',
    officialSource: 'IITM Pune / Damini Lightning Network & NDMA',
    phases: {
      before: [
        {
          id: 'thn_b_1',
          titleEn: 'Check 30-30 Lightning Safety Rule',
          titleTe: '30-30 పిడుగుపాటు నియమాన్ని పాటించండి',
          descriptionEn: 'If the time between seeing lightning and hearing thunder is less than 30 seconds, lightning is within 10 km. Seek shelter immediately.',
          descriptionTe: 'మెరుపు కనిపించిన తర్వాత 30 సెకన్లలోపు ఉరుము శబ్దం వినిపిస్తే, పిడుగు 10 కి.మీ లోపే పడే ప్రమాదం ఉంది. వెంటనే సురక్షిత ప్రదేశానికి వెళ్ళండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'thn_b_2',
          titleEn: 'Unplug Sensitive Electronic Appliances',
          titleTe: 'టీవీలు, ఫ్రిజ్‌లు, రూటర్ల ప్లగ్గులు తీసివేయండి',
          descriptionEn: 'High-voltage lightning surges travel through power and cable wires. Unplug completely from wall sockets.',
          descriptionTe: 'విద్యుత్ వైర్ల ద్వారా వచ్చే హై-వోల్టేజ్ షాక్ వల్ల పరికరాలు కాలిపోకుండా గోడ సాకెట్ల నుంచి ప్లగ్గులు తొలగించండి.',
          isCritical: false,
          category: 'Power & Comms',
        },
        {
          id: 'thn_b_3',
          titleEn: 'Stop Outdoor Agricultural / Field Work',
          titleTe: 'పొలాల్లో పనులు, చెరువుల వద్ద చేపల వేట వెంటనే ఆపండి',
          descriptionEn: 'Farm workers and livestock in open fields account for 85% of lightning fatalities. Walk away from open fields.',
          descriptionTe: 'బహిరంగ ప్రదేశాల్లో ఉండటం అత్యంత ప్రమాదకరం. వెంటనే పక్కా భవనంలోకి వెళ్లండి.',
          isCritical: true,
          category: 'Structural',
        },
      ],
      during: [
        {
          id: 'thn_d_1',
          titleEn: 'NEVER Take Shelter Under Isolated Tall Trees',
          titleTe: 'ఒంటరిగా ఉన్న ఎత్తైన చెట్ల కింద ఎట్టి పరిస్థితుల్లో నిలబడవద్దు',
          descriptionEn: 'Tall trees (coconut, palm, banyan) act as natural lightning rods and disperse deadly side-flash currents.',
          descriptionTe: 'కొబ్బరి, తాటి, మర్రి వంటి ఎత్తైన చెట్ల కిందకు వెళ్లకండి. పిడుగులు చెట్లపైనే ఎక్కువగా పడతాయి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'thn_d_2',
          titleEn: 'Adopt the "Lightning Crouch" if Trapped Outdoors',
          titleTe: 'బయట చిక్కుకుంటే "మెరుపు క్రౌచ్" భంగిమలో కూర్చోండి',
          descriptionEn: 'Crouch low on balls of your feet, tuck head between knees, cover ears. Do NOT lie flat on the ground.',
          descriptionTe: 'నేలపై పడుకోవద్దు! పాదాల మునివేళ్లపై వంగి కూర్చోండి, తలను మోకాళ్ల మధ్య ఉంచి చేతులతో చెవులను మూసుకోండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'thn_d_3',
          titleEn: 'Avoid Running Water & Metal Plumbing Indoors',
          titleTe: 'ఇంట్లో కొళాయి నీటిని వాడవద్దు, స్నానం చేయవద్దు',
          descriptionEn: 'Metal water pipes conduct electrical discharge. Avoid hand washing, showers, and corded landline phones.',
          descriptionTe: 'ఇనుప పైపుల ద్వారా కరెంట్ ప్రసరించే అవకాశం ఉంది. ఉరుముల సమయంలో స్నానం చేయకండి.',
          isCritical: false,
          category: 'Medical',
        },
      ],
      after: [
        {
          id: 'thn_a_1',
          titleEn: 'Provide Immediate CPR to Lightning Victims',
          titleTe: 'పిడుగుపాటు బాధితులకు వెంటనే సీపీఆర్ (CPR) చేయండి',
          descriptionEn: 'Lightning victims DO NOT carry electrical charge. They are completely safe to touch. Immediate chest compressions save lives.',
          descriptionTe: 'పిడుగు తగిలిన వారిని ముట్టుకుంటే షాక్ కొట్టదు. వారి గుండె కొట్టుకోకపోతే వెంటనే ఛాతీపై ఒత్తుతూ కృత్రిమ శ్వాస ఇవ్వండి.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'thn_a_2',
          titleEn: 'Wait 30 Full Minutes After Last Thunderclap',
          titleTe: 'చివరి ఉరుము తర్వాత కనీసం 30 నిమిషాలు వేచి ఉండండి',
          descriptionEn: 'Do not rush outside as soon as rain stops. Trailing edge strikes occur frequently.',
          descriptionTe: 'వర్షం తగ్గినా మరో అరగంట పాటు బయటకు రావద్దు.',
          isCritical: false,
          category: 'Structural',
        },
      ],
    },
    survivalHacks: [
      {
        titleEn: 'The Car as a Faraday Shield',
        titleTe: 'కారు లేదా బస్సులో సురక్షిత రక్షణ',
        stepsEn: [
          'A fully enclosed metal vehicle (car, van, or bus) is one of the safest places during lightning.',
          'Keep windows rolled all the way up. Do NOT touch exposed metal door handles or frame.',
          'The metal chassis conducts lightning safely around the exterior into the ground without harming occupants.',
        ],
        stepsTe: [
          'పూర్తిగా మూసివున్న కారు లేదా బస్సు లోపల ఉండటం అత్యంత సురక్షితం.',
          'అన్ని అద్దాలు మూసి ఉంచండి. మెటల్ భాగాలను ముట్టుకోవద్దు.',
          'కారు బాహ్య రేకు విద్యుత్‌ను భూమిలోకి సురక్షితంగా పంపిస్తుంది.',
        ],
        icon: 'directions_car',
      },
    ],
    emergencyHelplines: [
      { labelEn: 'National Emergency Help', labelTe: '112 అత్యవసర నంబర్', number: '112', agencyEn: 'National ERSS', agencyTe: 'జాతీయ రక్షణ సేవ', isTollFree: true },
      { labelEn: 'AP Ambulance Network', labelTe: '108 అత్యవసర అంబులెన్స్', number: '108', agencyEn: 'Emergency Medical', agencyTe: 'వైద్య విభాగం', isTollFree: true },
      { labelEn: 'AP Fire Services', labelTe: '101 అగ్నిమాపక కేంద్రం', number: '101', agencyEn: 'Fire & Rescue', agencyTe: 'ఫైర్ సర్వీసెస్', isTollFree: true },
    ],
    offlineSmsTemplate: 'LIGHTNING EMERGENCY: Person struck by lightning at [LOCATION]. CPR in progress. Need 108 ambulance urgently. Sent via Akashvani Offline DPI.',
  },
  {
    id: 'heatwave',
    titleEn: 'Extreme Heatwave & Sunstroke Protocol',
    titleTe: 'తీవ్ర వడగాల్పులు & వడదెబ్బ నివారణ నియమాలు',
    category: 'heatwave',
    badgeEn: 'APSDMA Summer Heat Action Plan',
    badgeTe: 'రాష్ట్ర వడగాల్పుల యాక్షన్ ప్లాన్',
    icon: 'sunny',
    themeColor: '#ea580c',
    summaryEn: 'Protection protocols against lethal heat stress (42°C - 48°C), dehydration, and heat stroke in coastal and inland Andhra Pradesh.',
    summaryTe: '45 డిగ్రీల పైబడిన ఎండలు, తీవ్ర ఉక్కపోత సమయంలో ప్రాణాంతక వడదెబ్బ నుంచి కాపాడుకునే సులభమైన పద్ధతులు.',
    localContextEn: 'High humidity combined with inland continental heat creates dangerous wet-bulb index across Godavari & Krishna basins.',
    localContextTe: 'తీరప్రాంత తేమతో కూడిన ఎండల వల్ల శరీర ఉష్ణోగ్రత వేగంగా పెరిగి వడదెబ్బ తగిలే ముప్పు ఎక్కువ.',
    officialSource: 'National Disaster Management Authority & IMD Amaravati',
    phases: {
      before: [
        {
          id: 'htw_b_1',
          titleEn: 'Prepare Oral Rehydration Solution (ORS) & Buttermilk',
          titleTe: 'ఓఆర్ఎస్ (ORS), మజ్జిగ, కొబ్బరి నీళ్లు సిద్ధం చేసుకోండి',
          descriptionEn: 'Stock WHO-formula ORS sachets or prepare homemade electrolyte drink (1 liter boiled water + 6 teaspoons sugar + 1/2 teaspoon salt).',
          descriptionTe: 'ఇంట్లోనే ఓఆర్ఎస్ ద్రావణం లేదా ఉప్పు వేసిన పల్చటి మజ్జిగ, నిమ్మరసం పుష్కలంగా సిద్ధం చేసుకోండి.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'htw_b_2',
          titleEn: 'Schedule Outdoor Work Before 11 AM or After 4 PM',
          titleTe: 'ఉదయం 11 నుంచి సాయంత్రం 4 గంటల మధ్య బయట తిరగొద్దు',
          descriptionEn: 'Avoid peak solar radiation hours. Agricultural laborers and construction workers should rest in ventilated shade.',
          descriptionTe: 'తీవ్రమైన ఎండ వేళల్లో శారీరక శ్రమను నివారించండి. నీడపట్టున విశ్రాంతి తీసుకోండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'htw_b_3',
          titleEn: 'Keep Earthen Pots (Ranjans) for Cool Water',
          titleTe: 'మట్టి కుండల్లో చల్లటి తాగునీటిని నిల్వ చేయండి',
          descriptionEn: 'Earthen pots naturally cool drinking water without requiring electricity during summer power cuts.',
          descriptionTe: 'కరెంటు కోతలు ఉన్నప్పుడు కూడా మట్టి కుండల నీరు శరీరాన్ని చల్లబరిచి ఉపశమనం ఇస్తుంది.',
          isCritical: false,
          category: 'Water & Food',
        },
      ],
      during: [
        {
          id: 'htw_d_1',
          titleEn: 'Cover Head with Wet Cotton Cloth / Gamcha',
          titleTe: 'తలకు తడి గుడ్డ లేదా టోపీ, గొడుగు తప్పనిసరిగా వాడండి',
          descriptionEn: 'Never step out bareheaded. Wear light-colored, loose cotton clothing that reflects sunlight.',
          descriptionTe: 'ఎండలో వెళ్లాల్సి వస్తే తలకు తెల్లటి కాటన్ తువ్వాలు కట్టుకోండి. వదులైన దుస్తులు ధరించండి.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'htw_d_2',
          titleEn: 'Drink Water Every 20 Minutes Even if Not Thirsty',
          titleTe: 'దాహం వేయకపోయినా ప్రతి 20 నిమిషాలకు మంచినీరు తాగండి',
          descriptionEn: 'Sweating depletes vital body fluids rapidly before you feel thirst. Dehydration sets in silently.',
          descriptionTe: 'చెమట ద్వారా కోల్పోయే లవణాలను భర్తీ చేయడానికి నిరంతరం నీరు, గంజి లేదా కొబ్బరి నీళ్లు తాగండి.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'htw_d_3',
          titleEn: 'Identify Sunstroke Warning Signs',
          titleTe: 'వడదెబ్బ ప్రాథమిక లక్షణాలను గుర్తించండి',
          descriptionEn: 'Dizziness, nausea, rapid pulse, stop of sweating with hot dry skin, or fainting are signs of medical emergency.',
          descriptionTe: 'కళ్లు తిరగడం, వాంతులు, చెమట పట్టడం ఆగిపోయి ఒళ్లు వేడెక్కడం వడదెబ్బ లక్షణాలు.',
          isCritical: true,
          category: 'Medical',
        },
      ],
      after: [
        {
          id: 'htw_a_1',
          titleEn: 'Immediate First Aid: Move to Shade & Apply Cold Compresses',
          titleTe: 'వడదెబ్బ తగిలిన వ్యక్తికి ప్రాథమిక చికిత్స',
          descriptionEn: 'Lay patient down in cool shade, elevate feet. Place ice packs or wet cloth on neck, armpits, and groin. Fan vigorously.',
          descriptionTe: 'బాధితుడిని నీడకు చేర్చి కాళ్లను కొద్దిగా పైకెత్తండి. మెడ, చంకల వద్ద చల్లటి తడి గుడ్డలతో అద్దండి.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'htw_a_2',
          titleEn: 'Call 108 Ambulance if Patient is Unconscious or Vomiting',
          titleTe: 'స్పృహ తప్పితే వెంటనే 108 అంబులెన్స్ పిలవండి',
          descriptionEn: 'Do NOT force liquids into an unconscious person’s mouth. Rush to PHC immediately for intravenous fluids.',
          descriptionTe: 'స్పృహ లేని వారికి నోటి ద్వారా నీరు తాగించవద్దు. వెంటనే ఆసుపత్రికి తరలించండి.',
          isCritical: true,
          category: 'Medical',
        },
      ],
    },
    survivalHacks: [
      {
        titleEn: 'Emergency Homemade ORS Recipe (WHO Formula)',
        titleTe: 'ఇంట్లోనే ఓఆర్ఎస్ ద్రావణం తయారీ పద్ధతి',
        stepsEn: [
          'Take 1 liter of clean drinking or boiled-cooled water.',
          'Add 6 level teaspoons of sugar.',
          'Add 1/2 level teaspoon of salt.',
          'Mix thoroughly until fully dissolved. Sip slowly throughout hot afternoon hours.',
        ],
        stepsTe: [
          'ఒక లీటర్ శుభ్రమైన తాగునీటిని తీసుకోండి.',
          '6 చెంచాల చక్కెర వేయండి.',
          'అర చెంచా ఉప్పు వేయండి.',
          'బాగా కలిపి రోజు మొత్తం కొద్దికొద్దిగా తాగుతూ ఉండండి.',
        ],
        icon: 'medication',
      },
    ],
    emergencyHelplines: [
      { labelEn: '108 Free Emergency Ambulance', labelTe: '108 అత్యవసర అంబులెన్స్', number: '108', agencyEn: 'AP Health Dept', agencyTe: 'ఆరోగ్య శాఖ', isTollFree: true },
      { labelEn: '104 Medical Advice & Tele-Triage', labelTe: '104 ప్రభుత్వ డాక్టర్ సలహా', number: '104', agencyEn: 'Health Help Desk', agencyTe: 'ఆరోగ్య సలహా కేంద్రం', isTollFree: true },
      { labelEn: 'APSDMA Heatwave Cell', labelTe: 'విపత్తుల విభాగం కంట్రోల్ రూమ్', number: '1070', agencyEn: 'Disaster Management', agencyTe: 'విపత్తుల శాఖ', isTollFree: true },
    ],
    offlineSmsTemplate: 'HEALTH ALERT: Suspected severe heatstroke for person at [LOCATION]. Body temp high, unconscious. Need 108 ambulance immediate response. Sent via Akashvani Offline DPI.',
  },
  {
    id: 'gobag',
    titleEn: '72-Hour Survival "Go-Bag" Master Checklist',
    titleTe: '72 గంటల అత్యవసర సర్వైవల్ కిట్ (గో-బ్యాగ్)',
    category: 'gobag',
    badgeEn: 'Universal Evacuation Kit',
    badgeTe: 'అత్యవసర తరలింపు కిట్',
    icon: 'backpack',
    themeColor: '#15803d',
    summaryEn: 'Comprehensive, self-sufficient survival kit packed in a waterproof backpack for an immediate 15-minute home evacuation.',
    summaryTe: 'క్షణాల్లో ఇల్లు విడిచి పునరావాస కేంద్రానికి వెళ్లాల్సి వచ్చినప్పుడు 3 రోజులకు అవసరమయ్యే అత్యవసర వస్తువుల కిట్.',
    localContextEn: 'Essential for all households in flood-prone, coastal, and river delta wards across Andhra Pradesh.',
    localContextTe: 'వరదలు, తుఫానులు సంభవించినప్పుడు ప్రతి కుటుంబం సిద్ధంగా ఉంచుకోవాల్సిన రక్షణ కిట్.',
    officialSource: 'NDMA Household Emergency Preparedness Standard',
    phases: {
      before: [
        {
          id: 'gb_1',
          titleEn: '3 Liters Drinking Water Per Person Per Day (9L total for 72h)',
          titleTe: 'ప్రతి ఒక్కరికి రోజుకు 3 లీటర్ల తాగునీరు (3 రోజులకు 9 లీటర్లు)',
          descriptionEn: 'Pack commercially sealed bottles or chlorinated containers.',
          descriptionTe: 'సీల్ చేసిన వాటర్ బాటిళ్లు లేదా శుభ్రమైన డబ్బాల్లో నింపిన తాగునీరు.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'gb_2',
          titleEn: 'Non-Perishable Energy Food (Ready to Eat)',
          titleTe: 'పాడవని పొడి ఆహార పదార్థాలు (అటుకులు, వేరుశెనగ, బిస్కెట్లు)',
          descriptionEn: 'Roasted chana, beaten rice (poha), glucose biscuits, jaggery, dried fruits, energy bars.',
          descriptionTe: 'పొయ్యి వెలిగించే పనిలేకుండా నేరుగా తినగలిగే అటుకులు, బెల్లం, వేరుశెనగ గుళ్లు, బిస్కెట్లు.',
          isCritical: true,
          category: 'Water & Food',
        },
        {
          id: 'gb_3',
          titleEn: '15-Day Supply of Personal Prescription Medicines',
          titleTe: 'బీపీ, షుగర్ తదితర రోజువారీ మందులు (కనీసం 15 రోజులకు)',
          descriptionEn: 'Insulin, blood pressure tablets, asthma inhalers, and cardiac medications in sealed pill organizer.',
          descriptionTe: 'దీర్ఘకాలిక వ్యాధులతో బాధపడే పెద్దల బీపీ, షుగర్ మందులను వాటర్‌ప్రూఫ్ కవర్‌లో ఉంచండి.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'gb_4',
          titleEn: 'First Aid Kit (Antiseptic, Bandages, Paracetamol, ORS)',
          titleTe: 'ప్రథమ చికిత్స కిట్ (డెట్టాల్, పారాసిటమాల్, బ్యాండేజ్, దూది)',
          descriptionEn: 'Include Betadine ointment, sterile gauze, band-aids, paracetamol 500mg, anti-diarrheal tabs, adhesive tape.',
          descriptionTe: 'గాయాలైనప్పుడు రక్తం కారకుండా బ్యాండేజీలు, జ్వరం మాత్రలు, ఓఆర్ఎస్ ప్యాకెట్లు.',
          isCritical: true,
          category: 'Medical',
        },
        {
          id: 'gb_5',
          titleEn: 'Waterproof Pouch with Original IDs & Cash',
          titleTe: 'వాటర్‌ప్రూఫ్ పౌచ్‌లో అసలు పత్రాలు & నగదు (కరెన్సీ)',
          descriptionEn: 'Aadhaar, Ration Card, Land records, ATM cards, and ₹2,000 to ₹5,000 in small physical currency notes (ATMs will fail).',
          descriptionTe: 'కరెంటు లేకపోతే ఏటీఎంలు పనిచేయవు కాబట్టి చేతిలో చిల్లర నోట్లు, ఆధార్, రేషన్ కార్డులు భద్రపరచండి.',
          isCritical: true,
          category: 'Documents',
        },
        {
          id: 'gb_6',
          titleEn: 'Heavy Duty LED Torch + Extra Dry Batteries',
          titleTe: 'ఎమర్జెన్సీ టార్చ్ లైట్ & అదనపు బ్యాటరీలు',
          descriptionEn: 'A bright 10W+ waterproof torch or headlamp with 2 spare sets of alkaline batteries.',
          descriptionTe: 'చీకట్లో రాత్రిపూట దారి చూసేందుకు పవర్ఫుల్ టార్చ్ లైట్ మరియు బ్యాటరీలు.',
          isCritical: true,
          category: 'Power & Comms',
        },
        {
          id: 'gb_7',
          titleEn: 'Loud Whistle for Rescue Signaling',
          titleTe: 'రక్షణ దళాలను పిలవడానికి ఉపయోగపడే విజిల్ (ఈల)',
          descriptionEn: 'A whistle carries sound 5x farther than human voice and conserves precious vocal energy in water/debris.',
          descriptionTe: 'వరదలో లేదా శిథిలాల కింద చిక్కుకున్నప్పుడు కేకలు వేయడం కంటే విజిల్ ఊదడం ద్వారా రక్షకులు త్వరగా గుర్తిస్తారు.',
          isCritical: true,
          category: 'Power & Comms',
        },
      ],
      during: [
        {
          id: 'gb_d_1',
          titleEn: 'Double-Check Go-Bag is Positioned by Front Door Exit',
          titleTe: 'గో-బ్యాగ్ ప్రధాన గుమ్మం వద్ద సిద్ధంగా ఉందా లేదా సరిచూసుకోండి',
          descriptionEn: 'In sudden night evacuations, every second counts. Everyone in family must know where it is kept.',
          descriptionTe: 'అర్ధరాత్రి వేళ తరలించాల్సి వస్తే వెతుక్కునే సమయం ఉండదు కాబట్టి ఎగ్జిట్ డోర్ వద్దనే ఉంచండి.',
          isCritical: true,
          category: 'Structural',
        },
      ],
      after: [
        {
          id: 'gb_a_1',
          titleEn: 'Replenish Consumed Rations and Expired Medicines',
          titleTe: 'ఉపయోగించిన వస్తువులను తిరిగి నింపి బ్యాగును పునరుద్ధరించండి',
          descriptionEn: 'Check expiry dates on food and tablets every 6 months. Rotate water bottles.',
          descriptionTe: 'ప్రతి 6 నెలలకోసారి ఆహార పదార్థాల గడువు తేదీని పరిశీలించి కొత్తవి పెట్టండి.',
          isCritical: false,
          category: 'Water & Food',
        },
      ],
    },
    survivalHacks: [
      {
        titleEn: 'Household Emergency Supply Calculator',
        titleTe: 'కుటుంబ సభ్యుల సంఖ్యను బట్టి వస్తువుల లెక్కింపు',
        stepsEn: [
          'Adults require 3L water/day; small children require 2L/day.',
          'For 4 persons over 72 hours, minimum 36 Liters of water is required.',
          'Keep 4 packets of ORS per family member.',
        ],
        stepsTe: [
          'ఒక్కో పెద్ద మనిషికి రోజుకు 3 లీటర్లు, పిల్లలకు 2 లీటర్ల నీరు అవసరం.',
          'నలుగురు ఉన్న కుటుంబానికి 3 రోజులకు కనీసం 36 లీటర్ల తాగునీరు సిద్ధం చేయాలి.',
          'ప్రతి ఒక్కరికీ 4 ఓఆర్ఎస్ ప్యాకెట్లు ఉంచండి.',
        ],
        icon: 'calculate',
      },
    ],
    emergencyHelplines: [
      { labelEn: '112 Universal Police / Fire / Medical', labelTe: '112 జాతీయ అత్యవసర సహాయం', number: '112', agencyEn: 'National ERSS', agencyTe: 'జాతీయ రక్షణ దళం', isTollFree: true },
      { labelEn: '1070 State Disaster Control Room', labelTe: '1070 రాష్ట్ర విపత్తుల కేంద్రం', number: '1070', agencyEn: 'APSDMA', agencyTe: 'విపత్తు నిర్వహణ', isTollFree: true },
      { labelEn: '1098 Childline Emergency', labelTe: '1098 చైల్డ్‌లైన్ (పిల్లల రక్షణ)', number: '1098', agencyEn: 'Child Welfare Dept', agencyTe: 'పిల్లల సంరక్షణ శాఖ', isTollFree: true },
    ],
    offlineSmsTemplate: 'EVACUATION NOTICE: Our family has packed Go-Bag and evacuating from [HOME_ADDRESS] to designated relief shelter at [SHELTER_NAME]. Everyone safe. Sent via Akashvani Offline DPI.',
  },
  {
    id: 'earthquake',
    titleEn: 'Earthquake & Building Tremor Safety',
    titleTe: 'భూకంపం & భవన భద్రతా మార్గదర్శిని',
    category: 'earthquake',
    badgeEn: 'Structural Seismic Standard',
    badgeTe: 'భవన భూకంప రక్షణ నియమాలు',
    icon: 'landslide',
    themeColor: '#78350f',
    summaryEn: 'Immediate survival reactions during ground tremors, building shaking, structural collapse, and aftershock precautions.',
    summaryTe: 'భూమి కంపించినప్పుడు, గోడలు బీటలు వారినప్పుడు తీసుకోవాల్సిన తక్షణ "డ్రాప్-కవర్-హోల్డ్" రక్షణ విధానం.',
    localContextEn: 'Applicable for Zone-III seismic areas and multi-story masonry structures along river basins.',
    localContextTe: 'నదీ పరివాహక ప్రాంతాల్లోని అపార్ట్‌మెంట్లు మరియు పాత భవనాల్లో పాటించవలసిన జాగ్రత్తలు.',
    officialSource: 'National Centre for Seismology & NDMA',
    phases: {
      before: [
        {
          id: 'eq_b_1',
          titleEn: 'Secure Heavy Wardrobes & Overhead Wall Mirrors',
          titleTe: 'భారీ బీరువాలు, అద్దాలు గోడకు దృఢంగా బిగించడం',
          descriptionEn: 'Fasten tall wooden cupboards and steel almirahs to wall studs using L-brackets to prevent toppling during tremors.',
          descriptionTe: 'భూకంపం సమయంలో బీరువాలు మనుషులపై పడకుండా గోడకు ఎల్-బ్రాకెట్లతో గట్టిగా బిగించండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'eq_b_2',
          titleEn: 'Identify Safe Indoor Cover Spots (Heavy Wooden Desks)',
          titleTe: 'ఇంట్లో బలమైన బల్లలు, డైనింగ్ టేబుళ్లను గుర్తించండి',
          descriptionEn: 'Identify sturdy furniture you can crawl underneath in each room within 5 seconds of shaking.',
          descriptionTe: 'కంపనం మొదలవగానే దూరి రక్షణ పొందగలిగే గట్టి చెక్క బల్లలు ఎక్కడున్నాయో తెలుసుకోండి.',
          isCritical: false,
          category: 'Structural',
        },
      ],
      during: [
        {
          id: 'eq_d_1',
          titleEn: 'DROP, COVER, and HOLD ON Immediately',
          titleTe: 'తక్షణమే కిందకు వంగండి, బలమైన బల్ల కింద తల దాచుకోండి (Drop, Cover, Hold)',
          descriptionEn: 'Drop to hands and knees. Cover your head and neck under a sturdy table. Hold on until the shaking stops completely.',
          descriptionTe: 'నేలపై మోకాళ్లపై వంగండి. బలమైన బల్ల కింద దూరి తల, మెడను కాపాడుకోండి. కదలికలు తగ్గే వరకు బల్ల కోళ్లను గట్టిగా పట్టుకోండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'eq_d_2',
          titleEn: 'NEVER Use Elevators or Lifts During Shaking',
          titleTe: 'లిఫ్ట్‌లు, ఎలివేటర్లను ఎట్టి పరిస్థితుల్లో వాడవద్దు',
          descriptionEn: 'Elevator power cables snap and cars get jammed between crushed shafts. Always take external concrete stairs once shaking stops.',
          descriptionTe: 'విద్యుత్ నిలిచిపోయి లిఫ్ట్‌లో చిక్కుకునే ప్రమాదం ఉంది. మెట్లను మాత్రమే ఉపయోగించండి.',
          isCritical: true,
          category: 'Structural',
        },
        {
          id: 'eq_d_3',
          titleEn: 'If in Bed, Stay in Bed and Protect Head with a Pillow',
          titleTe: 'మంచంపై ఉన్నట్లయితే తల కింద దిండును ఉంచి రక్షించుకోండి',
          descriptionEn: 'Rolling out in the dark leads to stepping on broken glass shards. Guard head with thick pillow.',
          descriptionTe: 'చీకట్లో గాజు ముక్కలు గుచ్చుకోకుండా మంచంపైనే ఉండి తలను దిండుతో కప్పుకోండి.',
          isCritical: false,
          category: 'Structural',
        },
      ],
      after: [
        {
          id: 'eq_a_1',
          titleEn: 'Check for LPG Gas Leaks by Smell (Do NOT Flick Electric Switches)',
          titleTe: 'గ్యాస్ వాసన వస్తే అగ్గిపుల్ల వెలిగించవద్దు, కరెంట్ స్విచ్‌లు వేయవద్దు',
          descriptionEn: 'Tremors rupture gas hoses. A single electric spark can cause an explosive blast. Open windows immediately.',
          descriptionTe: 'గ్యాస్ పైపులు పగిలే అవకాశం ఉంది. స్పార్క్ వస్తే మంటలు వ్యాపిస్తాయి కాబట్టి వెంటనే కిటికీలు తెరవండి.',
          isCritical: true,
          category: 'Power & Comms',
        },
        {
          id: 'eq_a_2',
          titleEn: 'Gather in Open Ground Away from Buildings & Glass Facades',
          titleTe: 'భవనాలకు, విద్యుత్ స్తంభాలకు దూరంగా బహిరంగ మైదానానికి వెళ్ళండి',
          descriptionEn: 'Move calmly to community sports ground or wide street. Be prepared for aftershocks within 24 hours.',
          descriptionTe: 'భవనాలు, గోడలు కూలే అవకాశం లేని మైదానానికి చేరుకోండి. తదుపరి ప్రకంపనలు వచ్చే అవకాశం ఉంది.',
          isCritical: true,
          category: 'Structural',
        },
      ],
    },
    survivalHacks: [
      {
        titleEn: 'Triangle of Life & Structural Pillars',
        titleTe: 'ట్రయాంగిల్ ఆఫ్ లైఫ్ & పిల్లర్ల రక్షణ',
        stepsEn: [
          'If no table is available, sit crouched next to a main load-bearing pillar or interior structural wall.',
          'Never stand in doorways unless you are sure they are reinforced, load-bearing concrete frames.',
        ],
        stepsTe: [
          'బల్ల లేకపోతే ఇంటి ప్రధాన లోడ్-బేరింగ్ పిల్లర్ లేదా మూలలో వంగి కూర్చోండి.',
          'ద్వారబంధాలు కూలిపోయే అవకాశం ఉంది కాబట్టి జాగ్రత్త వహించండి.',
        ],
        icon: 'foundation',
      },
    ],
    emergencyHelplines: [
      { labelEn: '112 Unified Emergency Response', labelTe: '112 జాతీయ అత్యవసర విభాగం', number: '112', agencyEn: 'Emergency Response Support', agencyTe: 'అత్యవసర రక్షణ', isTollFree: true },
      { labelEn: '101 Fire & Building Rescue', labelTe: '101 ఫైర్ & బిల్డింగ్ రెస్క్యూ', number: '101', agencyEn: 'Fire Department', agencyTe: 'అగ్నిమాపక కేంద్రం', isTollFree: true },
      { labelEn: '108 Ambulance Traumatology', labelTe: '108 అంబులెన్స్ సేవ', number: '108', agencyEn: 'State Trauma Care', agencyTe: 'ట్రామా కేర్ విభాగం', isTollFree: true },
    ],
    offlineSmsTemplate: 'EARTHQUAKE ALERT: Building tremor experienced at [LOCATION]. Structural cracks observed. Family is moving to open ground at [SAFE_ZONE]. Sent via Akashvani Offline DPI.',
  },
];
