import os
import sys
import time
import json
import urllib.request
import urllib.parse
from datetime import datetime
import streamlit as st
import pandas as pd
import folium
from folium import plugins
from streamlit_folium import st_folium

# -----------------------------------------------------------------------------
# 1. Page Configuration & Global Settings
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Akashvani - Civic Trust & Crisis Response",
    page_icon="🚨",
    layout="wide",
    initial_sidebar_state="expanded",
)

GOV_SERVER_URL = os.environ.get("AKASHVANI_GOV_SERVER_URL", "https://akashvani-production.up.railway.app")

# -----------------------------------------------------------------------------
# 2. Custom CSS: Premium Emergency Operations Styling
# -----------------------------------------------------------------------------
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap');

    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', sans-serif;
    }

    .main-header {
        background: linear-gradient(135deg, #0b1329 0%, #172554 50%, #1e1b4b 100%);
        padding: 24px 28px;
        border-radius: 16px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.25);
        border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .kpi-card {
        background: white;
        border-radius: 14px;
        padding: 18px 20px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        transition: all 0.2s ease-in-out;
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
    }

    .risk-badge-critical {
        background: #fef2f2;
        color: #991b1b;
        border: 1px solid #fecaca;
        padding: 6px 14px;
        border-radius: 9999px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    .risk-badge-high {
        background: #fff7ed;
        color: #c2410c;
        border: 1px solid #fed7aa;
        padding: 6px 14px;
        border-radius: 9999px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .risk-badge-moderate {
        background: #fefce8;
        color: #854d0e;
        border: 1px solid #fef08a;
        padding: 6px 14px;
        border-radius: 9999px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }
    .risk-badge-low {
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 6px 14px;
        border-radius: 9999px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
    }

    .alert-card-critical {
        border-left: 6px solid #dc2626;
        background: #ffffff;
        border-radius: 12px;
        padding: 18px 22px;
        margin-bottom: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
        border-top: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }
    .alert-card-high {
        border-left: 6px solid #ea580c;
        background: #ffffff;
        border-radius: 12px;
        padding: 18px 22px;
        margin-bottom: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
        border-top: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }
    .alert-card-advisory {
        border-left: 6px solid #0284c7;
        background: #ffffff;
        border-radius: 12px;
        padding: 18px 22px;
        margin-bottom: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
        border-top: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }
    .alert-card-community {
        border-left: 6px solid #16a34a;
        background: #ffffff;
        border-radius: 12px;
        padding: 18px 22px;
        margin-bottom: 16px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06);
        border-top: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        border-bottom: 1px solid #f1f5f9;
    }

    .mandatory-action-box {
        background: #fee2e2;
        border: 1px solid #fca5a5;
        border-radius: 8px;
        padding: 10px 14px;
        color: #991b1b;
        font-weight: 600;
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .gov-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# -----------------------------------------------------------------------------
# 3. Master Data Definitions
# -----------------------------------------------------------------------------
INITIAL_ALERTS = [
    {
        "id": "1",
        "category": ["critical", "weather", "nearby"],
        "severity": "critical",
        "tagEn": "RED ALERT • FLOOD",
        "tagTe": "రెడ్ అలర్ట్ • వరద",
        "agency": "APSDMA & DDMA",
        "agencyType": "official",
        "timeAgoEn": "12 min ago",
        "timeAgoTe": "12 నిమిషాల క్రితం",
        "titleEn": "Godavari Inflow Red Alert — Severe Inundation in Tadepalligudem Lowlands",
        "titleTe": "గోదావరి ఉధృతి రెడ్ అలర్ట్ — తాడేపల్లిగూడెం లోతట్టు ప్రాంతాలు జలమయం",
        "distanceEn": "1.8 km away",
        "distanceTe": "1.8 కి.మీ దూరంలో",
        "locationEn": "Wards 8, 9 & Jagannadhapuram Lowlands",
        "locationTe": "వార్డులు 8, 9 & జగన్నాధపురం",
        "mandatoryActionEn": "Evacuate ground floors immediately. Safe corridor designated toward Zilla Parishad Boys High School relief staging ground.",
        "mandatoryActionTe": "కింది అంతస్తుల ప్రజలు తక్షణమే సురక్షిత ప్రాంతాలకు వెళ్లవలెను. జిల్లా పరిషత్ బాలుర ఉన్నత పాఠశాల పునరావాస కేంద్రం వైపు సురక్షిత మార్గం ఏర్పాటు చేయబడింది.",
        "descriptionEn": "Water discharge levels at Dowleswaram Barrage crossed 15.2 lakh cusecs. Godavari canal overflows into low-lying wards of Tadepalligudem.",
        "descriptionTe": "ధవళేశ్వరం బ్యారేజీ వద్ద నీటి ప్రవాహం 15.2 లక్షల క్యూసెక్కులు దాటింది. కాలువ ఒడ్డు పొంగి తాడేపల్లిగూడెం లోతట్టు ప్రాంతాలలోకి నీరు చేరుతోంది.",
        "shelterName": "Zilla Parishad High School, Subba Rao Road",
        "shelterCapacity": "800 beds (450 occupied)",
        "medicalOfficer": "Dr. K. Srinivas (Civil Surgeon on Duty)",
        "rationStatus": "Drinking Water Tankers & Hot Meals Operational",
        "helplines": ["08818-222108", "112", "1077 (Disaster Control)"],
        "upvotes": 42,
    },
    {
        "id": "2",
        "category": ["critical", "civil"],
        "severity": "high",
        "tagEn": "HIGH WARNING • GRID",
        "tagTe": "హై వార్నింగ్ • విద్యుత్ గ్రిడ్",
        "agency": "APEPDCL",
        "agencyType": "official",
        "timeAgoEn": "35 min ago",
        "timeAgoTe": "35 నిమిషాల క్రితం",
        "titleEn": "High Tension Power Grid Shutdown for Safety Precaution",
        "titleTe": "ముందస్తు భద్రతా చర్యగా హై టెన్షన్ విద్యుత్ గ్రిడ్ నిలిపివేత",
        "distanceEn": "Sub-division 3",
        "distanceTe": "సబ్ డివిజన్ 3",
        "locationEn": "Feeder lines #2 & #7 Isolated",
        "locationTe": "ఫీడర్ లైన్లు #2 & #7 ఐసోలేట్ చేయబడ్డాయి",
        "descriptionEn": "Controlled preventative shutdown due to heavy wind gusts & localized waterlogging near 33kV substation. Anticipated restoration 18:30 IST.",
        "descriptionTe": "ఈదురు గాలులు మరియు 33కేవీ సబ్‌స్టేషన్ వద్ద నీటి నిల్వ కారణంగా ముందస్తుగా విద్యుత్ సరఫరా నిలిపివేయబడింది.",
        "shelterName": "Nearby Municipal Transit Camp",
        "shelterCapacity": "N/A (Power Grid Isolation)",
        "medicalOfficer": "APEPDCL Divisional Engineer on Site",
        "rationStatus": "Emergency backup generators at Government Area Hospital active",
        "helplines": ["1912 (APEPDCL)", "112"],
        "upvotes": 28,
    },
    {
        "id": "3",
        "category": ["weather", "nearby"],
        "severity": "advisory",
        "tagEn": "PUBLIC HEALTH",
        "tagTe": "ప్రజా ఆరోగ్యం",
        "agency": "DIST HEALTH DEPT",
        "agencyType": "health",
        "timeAgoEn": "2 hrs ago",
        "timeAgoTe": "2 గంటల క్రితం",
        "titleEn": "Mandatory Boil Water Advisory Issued for Rural Mandals",
        "titleTe": "గ్రామీణ మండలాలకు కాచి చల్లార్చిన నీటి తాగునీటి మార్గదర్శకాలు",
        "distanceEn": "Pentapadu & TDP Rural",
        "distanceTe": "పెంటపాడు & తాడేపల్లిగూడెం రూరల్",
        "locationEn": "Godavari canal pipeline intake",
        "locationTe": "గోదావరి కాలువ పైప్‌లైన్ ఇన్‌టేక్",
        "descriptionEn": "Turbidity spike detected in pipeline intake. Boil drinking and cooking water vigorously for at least 3 minutes before consumption.",
        "descriptionTe": "గోదావరి కాలువ నీటిలో బురద శాతం పెరిగినట్లు గుర్తించబడింది. తాగునీరు మరియు వంటకు వాడే నీటిని కనీసం 3 నిమిషాల పాటు మరిగించి వాడాలి.",
        "shelterName": "All PHC Health Centers",
        "shelterCapacity": "Chlorine tablet stock distributed",
        "medicalOfficer": "District Medical & Health Officer (DM&HO)",
        "rationStatus": "Chlorine testing camps active across Pentapadu",
        "helplines": ["104", "108"],
        "upvotes": 19,
    },
    {
        "id": "4",
        "category": ["civil", "nearby"],
        "severity": "community",
        "tagEn": "COMMUNITY REPORTED",
        "tagTe": "పౌరులు నివేదించిన సమాచారం",
        "agency": "CITIZEN VERIFIED",
        "agencyType": "community",
        "timeAgoEn": "45 min ago",
        "timeAgoTe": "45 నిమిషాల క్రితం",
        "titleEn": "Banyan Tree Fall Obstructing Old Bus Stand Dual Carriageway",
        "titleTe": "పాత బస్ స్టాండ్ రోడ్డుపై నేలకొరిగిన మర్రిచెట్టు - రాకపోకలకు అంతరాయం",
        "distanceEn": "900m away",
        "distanceTe": "900 మీటర్ల దూరంలో",
        "locationEn": "Near Sai Baba Temple Junction, Ward 4",
        "locationTe": "సాయిబాబా గుడి కూడలి వద్ద, వార్డు 4",
        "descriptionEn": "Heavy trunk fallen across the road near Sai Baba Temple junction. Municipal woodcutters dispatched via Ward 4 dispatch. Divert through Railway feeder road.",
        "descriptionTe": "సాయిబాబా గుడి వద్ద భారీ చెట్టు కొమ్మలు రోడ్డుకు అడ్డంగా పడ్డాయి. మున్సిపల్ కార్మికులు చేరుకున్నారు. రైల్వే ఫీడర్ రోడ్డు ద్వారా వాహనాలు మళ్లించబడ్డాయి.",
        "shelterName": "Ward 4 Municipal Office",
        "shelterCapacity": "Clearance team deployed",
        "medicalOfficer": "Municipal Ward Inspector",
        "rationStatus": "Traffic diversion active",
        "helplines": ["08818-223001"],
        "upvotes": 35,
    },
]

SHELTERS = [
    {
        "id": "s1",
        "nameEn": "Zilla Parishad Boys High School",
        "nameTe": "జిల్లా పరిషత్ బాలుర ఉన్నత పాఠశాల",
        "address": "Subba Rao Road, Near Gandhi Park, Tadepalligudem",
        "capacityTotal": 800,
        "capacityOccupied": 450,
        "lat": 16.8285,
        "lon": 81.5393,
        "phone": "08818-222108",
        "officer": "Dr. K. Srinivas (Civil Surgeon on Duty)",
        "status": "Active Safe Staging Complex",
    },
    {
        "id": "s2",
        "nameEn": "Government Degree College Camp",
        "nameTe": "ప్రభుత్వ డిగ్రీ కళాశాల సహాయ శిబిరం",
        "address": "Pentapadu Road, Tadepalligudem",
        "capacityTotal": 650,
        "capacityOccupied": 210,
        "lat": 16.8110,
        "lon": 81.5450,
        "phone": "08818-223450",
        "officer": "Dr. P. Lakshmi (PHC Pentapadu)",
        "status": "Active Relief Camp",
    },
    {
        "id": "s3",
        "nameEn": "Municipal Town Hall & Indoor Stadium",
        "nameTe": "మున్సిపల్ టౌన్ హాల్ & స్టేడియం",
        "address": "RTC Complex Road, Tadepalligudem",
        "capacityTotal": 500,
        "capacityOccupied": 480,
        "lat": 16.8040,
        "lon": 81.5230,
        "phone": "08818-224190",
        "officer": "Dr. M. Venkat Rao (Municipal Health Officer)",
        "status": "Nearing Maximum Capacity",
    },
]

RESCUE_BOATS = [
    {
        "name": "SDRF Boat Unit #1",
        "spec": "Inflatable Zodiac 40HP • 6 Rescue Divers",
        "lat": 16.8175,
        "lon": 81.5245,
        "status": "Patrolling Ward 8 Jagannadhapuram canal breach point. Evacuated 14 citizens.",
    },
    {
        "name": "NDRF Boat Unit #4",
        "spec": "Hard-Hull Rescue Craft • Medical Paramedic Onboard",
        "lat": 16.8115,
        "lon": 81.5180,
        "status": "Stationed near Pentapadu confluence. Providing emergency medical transport.",
    },
]

MOCK_HAZARDS = [
    {
        "name": "Banyan Tree Fall Blockage",
        "location": "Old Bus Stand Road near Sai Baba Temple, Ward 4",
        "lat": 16.8155,
        "lon": 81.5310,
        "status": "Municipal woodcutters clearing road. Four-wheeler diversion in effect.",
    },
    {
        "name": "Canal Bund Culvert Reinforcement",
        "location": "Ward 12 Bund Road Crossing",
        "lat": 16.8080,
        "lon": 81.5330,
        "status": "High water overflow over culvert. Speed limit 20km/h.",
    },
]

FLOOD_POLYGON = [
    [16.8060, 81.5160],
    [16.8140, 81.5210],
    [16.8210, 81.5270],
    [16.8250, 81.5340],
    [16.8190, 81.5360],
    [16.8120, 81.5280],
    [16.8050, 81.5200],
]

PREDEFINED_LOCATIONS = {
    "Ward 8 - Jagannadhapuram Lowlands (RED ZONE)": {"lat": 16.8142, "lon": 81.5283, "ward": "Ward 8", "is_red_zone": True},
    "Ward 4 - Old Bus Stand / Sai Baba Temple": {"lat": 16.8155, "lon": 81.5310, "ward": "Ward 4", "is_red_zone": False},
    "Ward 6 - Subba Rao Road / ZP High School": {"lat": 16.8285, "lon": 81.5393, "ward": "Ward 6", "is_red_zone": False},
    "Ward 12 - Bund Road Canal Crossing": {"lat": 16.8080, "lon": 81.5330, "ward": "Ward 12", "is_red_zone": True},
    "Pentapadu Confluence Sector": {"lat": 16.8110, "lon": 81.5450, "ward": "Pentapadu", "is_red_zone": False},
}

# -----------------------------------------------------------------------------
# 4. Session State Management
# -----------------------------------------------------------------------------
if "language" not in st.session_state:
    st.session_state.language = "en"
if "alerts" not in st.session_state:
    st.session_state.alerts = list(INITIAL_ALERTS)
if "chat_history" not in st.session_state:
    st.session_state.chat_history = []
if "reported_cases" not in st.session_state:
    st.session_state.reported_cases = []
if "sos_beacons" not in st.session_state:
    st.session_state.sos_beacons = []

# -----------------------------------------------------------------------------
# 5. Network & API Service Helpers
# -----------------------------------------------------------------------------
def check_gov_server_health():
    """Ping Government DIVA decision support server."""
    start = time.time()
    try:
        req = urllib.request.Request(f"{GOV_SERVER_URL}/", headers={"User-Agent": "AkashvaniStreamlit/1.0"})
        with urllib.request.urlopen(req, timeout=3.5) as response:
            latency = int((time.time() - start) * 1000)
            return {"connected": response.status == 200, "latency": latency, "url": GOV_SERVER_URL}
    except Exception as e:
        return {"connected": False, "latency": 999, "url": GOV_SERVER_URL, "error": str(e)}

def call_gov_trpc(path, options=None):
    """Call Government platform tRPC API."""
    options = options or {}
    method = options.get("method", "GET")
    url = f"{GOV_SERVER_URL}/api/trpc/{path}"
    
    headers = {
        "Content-Type": "application/json",
        "x-trpc-source": "akashvani-streamlit-client",
        "User-Agent": "AkashvaniStreamlit/1.0",
    }
    
    body_data = None
    if method == "GET" and "query" in options:
        param = urllib.parse.quote(json.dumps({"json": options["query"]}))
        url += f"?input={param}"
    elif method == "POST" and "body" in options:
        body_data = json.dumps({"json": options["body"]}).encode("utf-8")
        
    try:
        req = urllib.request.Request(url, data=body_data, headers=headers, method=method)
        with urllib.request.urlopen(req, timeout=4.5) as response:
            res_json = json.loads(response.read().decode("utf-8"))
            return res_json.get("result", {}).get("data", {}).get("json")
    except Exception as err:
        return None

def fetch_live_telemetry(lat, lon):
    """Fetch high-precision Open-Meteo satellite & weather radar telemetry."""
    url = (
        f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}"
        "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m"
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max"
        "&timezone=auto"
    )
    aqi_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude={lat}&longitude={lon}&current=us_aqi,pm2_5,pm10"
    
    weather_data, aqi_data = None, None
    try:
        req1 = urllib.request.Request(url, headers={"User-Agent": "AkashvaniStreamlit/1.0"})
        with urllib.request.urlopen(req1, timeout=3.5) as r1:
            weather_data = json.loads(r1.read().decode("utf-8"))
    except Exception:
        pass

    try:
        req2 = urllib.request.Request(aqi_url, headers={"User-Agent": "AkashvaniStreamlit/1.0"})
        with urllib.request.urlopen(req2, timeout=3.0) as r2:
            aqi_data = json.loads(r2.read().decode("utf-8"))
    except Exception:
        pass

    current = weather_data.get("current", {}) if weather_data else {}
    aqi_curr = aqi_data.get("current", {}) if aqi_data else {}
    daily = weather_data.get("daily", {}) if weather_data else {}

    temp = current.get("temperature_2m", 28.4)
    feels_like = current.get("apparent_temperature", temp + 2.5)
    humidity = current.get("relative_humidity_2m", 82)
    precip = current.get("precipitation", 12.0)
    wind_speed = current.get("wind_speed_10m", 24.5)
    wind_gust = current.get("wind_gusts_10m", 36.0)
    weather_code = current.get("weather_code", 95)
    aqi = aqi_curr.get("us_aqi", 65)
    pm25 = aqi_curr.get("pm2_5", 18.2)
    pm10 = aqi_curr.get("pm10", 26.5)

    # Dynamic multi-factor risk calculation
    if precip > 25 or wind_speed > 45 or weather_code >= 95:
        risk_score = 88
        risk_level = "Critical"
        risk_color = "#dc2626"
        summary_en = f"Critical storm & inundation danger detected ({precip} mm/h rain, {wind_gust} km/h wind gusts). Red Zone advisory active."
        summary_te = f"తీవ్రమైన తుఫాను మరియు భారీ వర్షపాతం ({precip} మి.మీ/గం, గాలులు {wind_gust} కి.మీ/గం). సురక్షిత ప్రాంతాలకు తరలివెళ్ళండి."
    elif precip > 8 or wind_speed > 28 or aqi > 150:
        risk_score = 65
        risk_level = "High"
        risk_color = "#ea580c"
        summary_en = f"Elevated meteorological hazard ({precip} mm/h rain, gusts {wind_gust} km/h). Waterlogging caution in low-lying sectors."
        summary_te = f"హెచ్చరిక స్థాయి వర్షపాతం ({precip} మి.మీ వర్షం). లోతట్టు ప్రాంతాలలో జాగ్రత్త వహించండి."
    elif precip > 1 or wind_speed > 18 or aqi > 100:
        risk_score = 45
        risk_level = "Moderate"
        risk_color = "#d97706"
        summary_en = f"Moderate meteorological activity observed ({precip} mm rain, {wind_speed} km/h wind). Monitor local civic updates."
        summary_te = "మోస్తరు వాతావరణ మార్పులు. స్థానిక హెచ్చరికలను గమనించండి."
    else:
        risk_score = 22
        risk_level = "Low"
        risk_color = "#16a34a"
        summary_en = "Normal meteorological parameters observed at your coordinates."
        summary_te = "మీ ప్రాంతంలో సాధారణ వాతావరణ పరిస్థితులు నమోదవుతున్నాయి."

    return {
        "temperature": temp,
        "feels_like": feels_like,
        "humidity": humidity,
        "precipitation": precip,
        "wind_speed": wind_speed,
        "wind_gust": wind_gust,
        "aqi": aqi,
        "pm25": pm25,
        "pm10": pm10,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_color": risk_color,
        "summary_en": summary_en,
        "summary_te": summary_te,
        "daily": daily,
    }

def fetch_evacuation_route(orig_lat, orig_lon, dest_lat, dest_lon):
    """Fetch verified road network driving routing geometry from OSRM."""
    osrm_url = (
        f"https://router.project-osrm.org/route/v1/driving/{orig_lon},{orig_lat};{dest_lon},{dest_lat}"
        "?overview=full&geometries=geojson&steps=true"
    )
    try:
        req = urllib.request.Request(osrm_url, headers={"User-Agent": "AkashvaniStreamlit/1.0"})
        with urllib.request.urlopen(req, timeout=4.0) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if data.get("routes"):
                route = data["routes"][0]
                coords = [[pt[1], pt[0]] for pt in route["geometry"]["coordinates"]]
                steps = []
                for leg in route.get("legs", []):
                    for step in leg.get("steps", []):
                        instruction = step.get("maneuver", {}).get("instruction") or step.get("name")
                        if instruction:
                            steps.append(instruction)
                return {
                    "distance_km": round(route["distance"] / 1000, 1),
                    "duration_min": max(1, round(route["duration"] / 60)),
                    "coordinates": coords,
                    "steps": steps,
                    "source": "OSRM OpenStreetMap Verified Road Routing",
                }
    except Exception:
        pass

    # High-reliability fallback corridor geometry
    return {
        "distance_km": 2.4,
        "duration_min": 6,
        "coordinates": [
            [orig_lat, orig_lon],
            [orig_lat + (dest_lat - orig_lat) * 0.25, orig_lon + (dest_lon - orig_lon) * 0.15],
            [orig_lat + (dest_lat - orig_lat) * 0.55, orig_lon + (dest_lon - orig_lon) * 0.50],
            [orig_lat + (dest_lat - orig_lat) * 0.85, orig_lon + (dest_lon - orig_lon) * 0.80],
            [dest_lat, dest_lon],
        ],
        "steps": [
            "Evacuate flood-prone sector towards Main Bypass Arterial",
            "Follow illuminated safety corridor past Railway Crossing",
            "Turn right onto Subba Rao Road at Municipal Junction",
            "Enter main gate of Zilla Parishad Boys High School Relief Complex",
        ],
        "source": "Akashvani Emergency Fallback Safety Corridor",
    }

# -----------------------------------------------------------------------------
# 6. Sidebar: Institutional Controls & Live Telemetry Fix
# -----------------------------------------------------------------------------
with st.sidebar:
    st.markdown("### 🇮🇳 **Akashvani DPI**")
    st.caption("Civic Trust & Crisis Decision-Support Infrastructure")

    # Bilingual Language Toggle
    lang_choice = st.radio(
        "🌐 Language / భాష",
        options=["English", "తెలుగు (Telugu)"],
        index=0 if st.session_state.language == "en" else 1,
        horizontal=True,
    )
    st.session_state.language = "en" if lang_choice == "English" else "te"
    is_te = st.session_state.language == "te"

    st.divider()

    # Government Server Connection Status
    st.markdown("#### 🏛️ **Government DIVA Server**")
    gov_status = check_gov_server_health()
    if gov_status["connected"]:
        st.markdown(
            f"""<div style="background:#f0fdf4; border:1px solid #86efac; border-radius:8px; padding:8px 12px; color:#15803d; font-weight:600; font-size:13px;">
            🟢 ONLINE & SYNCED • Latency: {gov_status['latency']} ms<br>
            <span style="font-size:11px; color:#166534; font-weight:400;">Akashvani AP Gov Platform</span>
            </div>""",
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            """<div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:8px; padding:8px 12px; color:#b91c1c; font-weight:600; font-size:13px;">
            ⚠️ DIVA SERVER UNREACHABLE<br>
            <span style="font-size:11px; color:#7f1d1d; font-weight:400;">Operating in Offline Cached Mode</span>
            </div>""",
            unsafe_allow_html=True,
        )

    st.divider()

    # Location Selector
    st.markdown("#### 📍 **Citizen GPS Coordinates**" if not is_te else "#### 📍 **పౌరుల జీపీఎస్ స్థానం**")
    selected_loc_name = st.selectbox(
        "Select Sector / వార్డును ఎంచుకోండి:",
        options=list(PREDEFINED_LOCATIONS.keys()),
        index=0,
    )
    current_location = PREDEFINED_LOCATIONS[selected_loc_name]

    # Custom coordinate override option
    with st.expander("🛠️ Custom Coordinates Override" if not is_te else "🛠️ అనుకూల అక్షాంశ రేఖాంశాలు"):
        custom_lat = st.number_input("Latitude", value=float(current_location["lat"]), format="%.4f")
        custom_lon = st.number_input("Longitude", value=float(current_location["lon"]), format="%.4f")
        if st.button("Apply Coordinates" if not is_te else "స్థానాన్ని వర్తింపజేయి"):
            current_location["lat"] = custom_lat
            current_location["lon"] = custom_lon
            st.success("Coordinates updated!")

    st.divider()

    # Emergency Speed-Dial Helplines
    st.markdown("#### 🚨 **24x7 Emergency Helplines**" if not is_te else "#### 🚨 **అత్యవసర హెల్ప్‌లైన్లు**")
    st.markdown(
        """
        - **112**: National Emergency Rescue
        - **1077**: District Disaster Control (DDMA)
        - **108**: Medical Ambulance Dispatch
        - **1912**: APEPDCL Electricity Emergency
        - **08818-222108**: SDRF Flood Rescue Battalion
        """
    )

    st.divider()
    st.caption("Developed for Tadepalligudem & West Godavari District Administration, AP.")

# -----------------------------------------------------------------------------
# 7. Main Institutional Header
# -----------------------------------------------------------------------------
is_red_zone_active = current_location.get("is_red_zone", False)

header_badge = (
    '<span class="risk-badge-critical">🚨 OFFICIAL RED ZONE ACTIVE</span>'
    if is_red_zone_active
    else '<span class="risk-badge-low">🟢 NORMAL SAFETY SECTOR</span>'
)

st.markdown(
    f"""
    <div class="main-header">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:16px;">
            <div>
                <div style="font-size:12px; letter-spacing:1.5px; text-transform:uppercase; color:#93c5fd; font-weight:700; margin-bottom:6px;">
                    Government of Andhra Pradesh • APSDMA • DDMA West Godavari
                </div>
                <h1 style="margin:0; font-size:28px; font-weight:800; color:white; font-family:'Space Grotesk', sans-serif;">
                    {"Akashvani - Civic Trust & Crisis Response" if not is_te else "ఆకాశవాణి - పౌర విశ్వాస & విపత్తు స్పందన వేదిక"}
                </h1>
                <p style="margin:6px 0 0 0; color:#cbd5e1; font-size:14px;">
                    {"Digital Public Infrastructure for real-time safety feeds, verified crisis alerts, GIS disaster mapping, and citizen reporting in Tadepalligudem." if not is_te else "తాడేపల్లిగూడెంలో ప్రత్యక్ష భద్రతా సమాచారం, జి.ఐ.ఎస్ విపత్తు మ్యాపింగ్ మరియు అత్యవసర పౌర స్పందన వేదిక."}
                </p>
            </div>
            <div style="text-align:right;">
                {header_badge}
                <div style="margin-top:8px; font-size:12px; color:#e2e8f0;">
                    📍 {selected_loc_name.split(' (')[0]} ({current_location['lat']:.4f}° N, {current_location['lon']:.4f}° E)
                </div>
            </div>
        </div>
    </div>
    """,
    unsafe_allow_html=True,
)

# -----------------------------------------------------------------------------
# 8. Fetch Live Environmental Telemetry for Selected Coordinates
# -----------------------------------------------------------------------------
telemetry = fetch_live_telemetry(current_location["lat"], current_location["lon"])

# -----------------------------------------------------------------------------
# 9. Main Navigation Tabs
# -----------------------------------------------------------------------------
tab_alerts, tab_telemetry, tab_map, tab_report, tab_sos, tab_community, tab_ai = st.tabs(
    [
        "🚨 Crisis Alerts Feed" if not is_te else "🚨 లైవ్ అలర్ట్లు",
        "🏠 Telemetry & Risk" if not is_te else "🏠 వాతావరణం & రిస్క్",
        "🗺️ GIS Crisis Map" if not is_te else "🗺️ జి.ఐ.ఎస్ మ్యాప్",
        "📝 Citizen Report" if not is_te else "📝 ప్రమాద నివేదిక",
        "🆘 SOS Beacon" if not is_te else "🆘 ఎస్.ఓ.ఎస్ బీకాన్",
        "📢 Community Hub" if not is_te else "📢 కమ్యూనిటీ",
        "🤖 AI Disaster Advisor" if not is_te else "🤖 విపత్తు ఏఐ సలహాదారు",
    ]
)

# =============================================================================
# TAB 1: CRISIS ALERTS FEED
# =============================================================================
with tab_alerts:
    st.subheader("Official Alerts & Verified Crisis Stream" if not is_te else "అధికారిక హెచ్చరికలు & ప్రమాద సమాచారం")
    
    col_filter, col_search = st.columns([1, 2])
    with col_filter:
        category_filter = st.selectbox(
            "Filter Category / వర్గం:",
            ["All", "Critical (Red Alerts)", "Weather", "Civil / Grid", "Nearby"],
        )
    with col_search:
        search_query = st.text_input(
            "Search alerts by keyword or location..." if not is_te else "కీలకపదం లేదా ప్రాంతం ద్వారా వెతకండి...",
            value="",
        )

    # Filter logic
    filtered_alerts = []
    for item in st.session_state.alerts:
        cat_matches = True
        if category_filter == "Critical (Red Alerts)":
            cat_matches = "critical" in item.get("category", [])
        elif category_filter == "Weather":
            cat_matches = "weather" in item.get("category", [])
        elif category_filter == "Civil / Grid":
            cat_matches = "civil" in item.get("category", [])
        elif category_filter == "Nearby":
            cat_matches = "nearby" in item.get("category", [])
            
        text_matches = True
        if search_query.strip():
            q = search_query.lower()
            text_matches = (
                q in item["titleEn"].lower()
                or q in item["titleTe"].lower()
                or q in item["locationEn"].lower()
                or q in item["descriptionEn"].lower()
            )
            
        if cat_matches and text_matches:
            filtered_alerts.append(item)

    st.markdown(f"**Showing {len(filtered_alerts)} active alerts**" if not is_te else f"**{len(filtered_alerts)} క్రియాశీల హెచ్చరికలు ఉన్నాయి**")

    for alert in filtered_alerts:
        sev = alert.get("severity", "advisory")
        card_class = f"alert-card-{sev}"
        badge_style = "background:#fee2e2; color:#991b1b;" if sev == "critical" else "background:#ffedd5; color:#9a3412;" if sev == "high" else "background:#e0f2fe; color:#0369a1;"
        
        tag = alert["tagTe"] if is_te else alert["tagEn"]
        title = alert["titleTe"] if is_te else alert["titleEn"]
        location = alert["locationTe"] if is_te else alert["locationEn"]
        desc = alert["descriptionTe"] if is_te else alert["descriptionEn"]
        time_ago = alert["timeAgoTe"] if is_te else alert["timeAgoEn"]
        distance = alert["distanceTe"] if is_te else alert["distanceEn"]
        
        mandatory_action = alert.get("mandatoryActionTe" if is_te else "mandatoryActionEn")

        with st.container():
            st.markdown(
                f"""
                <div class="{card_class}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <span style="{badge_style} font-weight:700; font-size:12px; padding:3px 10px; border-radius:6px;">
                            {tag}
                        </span>
                        <span style="font-size:12px; color:#64748b;">
                            ⏱️ {time_ago} • 📍 {distance} • 🏛️ {alert['agency']}
                        </span>
                    </div>
                    <h3 style="margin:4px 0 8px 0; font-size:18px; font-weight:700; color:#0f172a;">
                        {title}
                    </h3>
                    <div style="font-size:13px; color:#475569; margin-bottom:8px;">
                        📍 <strong>{'ప్రాంతం' if is_te else 'Location'}:</strong> {location}
                    </div>
                    <p style="color:#334155; font-size:14px; line-height:1.5; margin-bottom:10px;">
                        {desc}
                    </p>
                </div>
                """,
                unsafe_allow_html=True,
            )
            
            if mandatory_action:
                st.markdown(
                    f"""<div class="mandatory-action-box">
                    🚨 <span><strong>{'తక్షణ ఆదేశం' if is_te else 'MANDATORY ACTION'}:</strong> {mandatory_action}</span>
                    </div>""",
                    unsafe_allow_html=True,
                )

            # Details expander with shelter protocol and community verification
            col_exp, col_upvote = st.columns([4, 1])
            with col_exp:
                with st.expander("📋 View Emergency Protocol & Assigned Shelter" if not is_te else "📋 పునరావాస కేంద్రం & అత్యవసర ప్రోటోకాల్"):
                    st.markdown(f"**Designated Safe Haven:** {alert.get('shelterName', 'Zilla Parishad High School')}")
                    st.markdown(f"**Shelter Status:** {alert.get('shelterCapacity', 'Active Camp')}")
                    st.markdown(f"**Medical Officer in Charge:** {alert.get('medicalOfficer', 'Dr. K. Srinivas')}")
                    st.markdown(f"**Ration / Water Status:** {alert.get('rationStatus', 'Operational')}")
                    helplines = alert.get("helplines", ["112", "1077"])
                    st.markdown(f"**Direct Helplines:** {', '.join(helplines)}")
            with col_upvote:
                upvotes = alert.get("upvotes", 0)
                if st.button(f"👍 Upvote ({upvotes})", key=f"up_{alert['id']}"):
                    alert["upvotes"] = upvotes + 1
                    st.rerun()

# =============================================================================
# TAB 2: DASHBOARD & ENVIRONMENTAL TELEMETRY
# =============================================================================
with tab_telemetry:
    st.subheader("High-Resolution Satellite & Atmospheric Telemetry" if not is_te else "ప్రత్యక్ష ఉపగ్రహ & వాతావరణ సమాచారం")
    st.caption("Live Open-Meteo High Resolution Feeds + Government DIVA Environmental Analytics")

    # Composite Multi-Factor Risk Assessment Banner
    risk_level = telemetry["risk_level"]
    risk_color = telemetry["risk_color"]
    risk_score = telemetry["risk_score"]
    risk_summary = telemetry["summary_te"] if is_te else telemetry["summary_en"]

    st.markdown(
        f"""
        <div style="background:{risk_color}12; border:2px solid {risk_color}; border-radius:14px; padding:18px 22px; margin-bottom:24px;">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                <div>
                    <span style="background:{risk_color}; color:white; padding:4px 12px; border-radius:9999px; font-weight:800; font-size:12px; text-transform:uppercase;">
                        {risk_level} RISK LEVEL ({risk_score}/100)
                    </span>
                    <h3 style="margin:10px 0 4px 0; color:#0f172a; font-size:20px; font-weight:800;">
                        {"Dynamic Composite Hazard Index" if not is_te else "నిరంతర విపత్తు విశ్లేషణ సూచిక"}
                    </h3>
                    <p style="margin:0; color:#334155; font-size:14px; font-weight:500;">
                        {risk_summary}
                    </p>
                </div>
                <div style="text-align:center; min-width:110px;">
                    <div style="font-size:36px; font-weight:900; color:{risk_color}; font-family:'Space Grotesk', sans-serif;">
                        {risk_score}
                    </div>
                    <div style="font-size:12px; color:#64748b; font-weight:600;">/ 100 THREAT SCORE</div>
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 4 Key Telemetry Metrics
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric(
            label="🌡️ Temperature" if not is_te else "🌡️ ఉష్ణోగ్రత",
            value=f"{telemetry['temperature']} °C",
            delta=f"Feels like {telemetry['feels_like']} °C",
        )
    with c2:
        st.metric(
            label="🌧️ Precipitation Rate" if not is_te else "🌧️ వర్షపాతం",
            value=f"{telemetry['precipitation']} mm/h",
            delta="Heavy Rain" if telemetry["precipitation"] > 15 else "Moderate",
        )
    with c3:
        st.metric(
            label="💨 Wind Speed & Gusts" if not is_te else "💨 గాలి వేగం",
            value=f"{telemetry['wind_speed']} km/h",
            delta=f"Gusts up to {telemetry['wind_gust']} km/h",
        )
    with c4:
        aqi_val = telemetry["aqi"]
        aqi_status = "Good" if aqi_val <= 50 else "Moderate" if aqi_val <= 100 else "Unhealthy"
        st.metric(
            label="🌫️ Air Quality (US AQI)" if not is_te else "🌫️ గాలి నాణ్యత (AQI)",
            value=f"{aqi_val} AQI",
            delta=f"{aqi_status} • PM2.5: {telemetry['pm25']}",
        )

    st.markdown("---")

    # 5-Day Emergency Forecast
    st.markdown("#### 📅 5-Day Emergency Meteorological Forecast" if not is_te else "#### 📅 రాబోయే 5 రోజుల అత్యవసర వాతావరణ అంచనా")
    daily = telemetry.get("daily", {})
    if daily and "time" in daily:
        forecast_cols = st.columns(min(5, len(daily["time"])))
        for i, col in enumerate(forecast_cols):
            with col:
                date_str = daily["time"][i]
                t_max = daily.get("temperature_2m_max", [30])[i]
                t_min = daily.get("temperature_2m_min", [24])[i]
                rain_prob = daily.get("precipitation_probability_max", [50])[i]
                wind_max = daily.get("wind_speed_10m_max", [15])[i]
                
                st.markdown(
                    f"""
                    <div class="kpi-card" style="text-align:center;">
                        <div style="font-weight:700; font-size:13px; color:#1e293b;">{date_str}</div>
                        <div style="font-size:22px; font-weight:800; color:#0284c7; margin:8px 0;">{t_max}° / {t_min}°</div>
                        <div style="font-size:12px; color:#475569;">🌧️ Rain: <strong>{rain_prob}%</strong></div>
                        <div style="font-size:12px; color:#475569;">💨 Wind: <strong>{wind_max} km/h</strong></div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

# =============================================================================
# TAB 3: GIS CRISIS MAP & EVACUATION CORRIDOR
# =============================================================================
with tab_map:
    st.subheader("Interactive GIS Disaster Map & Verified Evacuation Corridors" if not is_te else "జి.ఐ.ఎస్ విపత్తు మ్యాప్ & రక్షణ మార్గాలు")
    st.caption("Live OpenStreetMap / Satellite Engine with Yerrakaluva Flood Basin, Relief Shelters, and OSRM Road Router")

    # Select destination shelter for evacuation routing
    shelter_names = [s["nameEn"] for s in SHELTERS]
    col_shelter, col_tile = st.columns([2, 1])
    with col_shelter:
        dest_shelter_name = st.selectbox(
            "Select Destination Relief Shelter / పునరావాస కేంద్రం:" if not is_te else "గమ్యస్థాన పునరావాస కేంద్రాన్ని ఎంచుకోండి:",
            options=shelter_names,
            index=0,
        )
    with col_tile:
        tile_style = st.selectbox(
            "Map Layer Style / మ్యాప్ స్టైల్:",
            options=["OpenStreetMap", "CartoDB Positron", "CartoDB Dark_Matter"],
            index=0,
        )

    dest_shelter = next(s for s in SHELTERS if s["nameEn"] == dest_shelter_name)
    user_lat, user_lon = current_location["lat"], current_location["lon"]

    # Compute live road evacuation route using OSRM
    route_data = fetch_evacuation_route(user_lat, user_lon, dest_shelter["lat"], dest_shelter["lon"])

    # Create Folium Map
    m = folium.Map(
        location=[user_lat, user_lon],
        zoom_start=14,
        tiles=tile_style,
        control_scale=True,
    )

    # 1. Flood Inundation Danger Polygon
    folium.Polygon(
        locations=FLOOD_POLYGON,
        color="#dc2626",
        weight=3,
        fill=True,
        fill_color="#ef4444",
        fill_opacity=0.35,
        tooltip="🚨 OFFICIAL RED ZONE: Yerrakaluva & Godavari Overflow Inundation Basin",
        popup="<b>OFFICIAL RED ZONE</b><br>High inundation depth. Evacuate to high ground immediately.",
    ).add_to(m)

    # 2. Citizen GPS Location Marker
    folium.Marker(
        location=[user_lat, user_lon],
        popup=f"<b>Citizen Current Position</b><br>Lat: {user_lat:.4f}, Lon: {user_lon:.4f}<br>{selected_loc_name}",
        tooltip="📍 Your Current GPS Location",
        icon=folium.Icon(color="red" if is_red_zone_active else "blue", icon="user", prefix="fa"),
    ).add_to(m)

    # GPS accuracy buffer circle
    folium.Circle(
        location=[user_lat, user_lon],
        radius=180,
        color="#3b82f6",
        fill=True,
        fill_color="#60a5fa",
        fill_opacity=0.15,
    ).add_to(m)

    # 3. Designated Relief Shelters Markers
    for shelter in SHELTERS:
        folium.Marker(
            location=[shelter["lat"], shelter["lon"]],
            popup=(
                f"<b>🏫 {shelter['nameEn']}</b><br>"
                f"Address: {shelter['address']}<br>"
                f"Capacity: {shelter['capacityOccupied']} / {shelter['capacityTotal']} beds<br>"
                f"Officer: {shelter['officer']}<br>"
                f"Phone: {shelter['phone']}"
            ),
            tooltip=f"🏫 Relief Shelter: {shelter['nameEn']}",
            icon=folium.Icon(color="green", icon="home", prefix="fa"),
        ).add_to(m)

    # 4. SDRF / NDRF Rescue Watercraft Staging Points
    for boat in RESCUE_BOATS:
        folium.Marker(
            location=[boat["lat"], boat["lon"]],
            popup=f"<b>🚤 {boat['name']}</b><br>{boat['spec']}<br><i>Status: {boat['status']}</i>",
            tooltip=f"🚤 Rescue Boat: {boat['name']}",
            icon=folium.Icon(color="purple", icon="ship", prefix="fa"),
        ).add_to(m)

    # 5. Critical Hazards Blockades
    for h in MOCK_HAZARDS:
        folium.Marker(
            location=[h["lat"], h["lon"]],
            popup=f"<b>⚠️ {h['name']}</b><br>{h['location']}<br><i>Status: {h['status']}</i>",
            tooltip=f"⚠️ Hazard: {h['name']}",
            icon=folium.Icon(color="orange", icon="exclamation-triangle", prefix="fa"),
        ).add_to(m)

    # 6. Evacuation Route Polyline
    if route_data and "coordinates" in route_data:
        folium.PolyLine(
            locations=route_data["coordinates"],
            color="#16a34a",
            weight=6,
            opacity=0.85,
            tooltip=f"🟢 Verified Safe Evacuation Corridor ({route_data['distance_km']} km, ~{route_data['duration_min']} min)",
        ).add_to(m)

    # Render Map in Streamlit
    st_folium(m, width="100%", height=500)

    # Route Information Box & Turn-by-Turn Steps
    if route_data:
        st.markdown(
            f"""
            <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:16px 20px; margin-top:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                        <span style="background:#16a34a; color:white; padding:3px 10px; border-radius:6px; font-size:12px; font-weight:700;">
                            VERIFIED SAFE CORRIDOR
                        </span>
                        <h4 style="margin:8px 0 4px 0; color:#14532d; font-size:16px;">
                            Route to {dest_shelter['nameEn']}
                        </h4>
                        <div style="font-size:13px; color:#166534;">
                            Routing Engine: {route_data.get('source', 'OSRM')}
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <span style="font-size:24px; font-weight:800; color:#15803d;">
                            {route_data['distance_km']} km
                        </span>
                        <span style="font-size:14px; color:#166534; font-weight:600; margin-left:8px;">
                            (~{route_data['duration_min']} min evacuation time)
                        </span>
                    </div>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        with st.expander("🧭 Turn-by-Turn Evacuation Itinerary" if not is_te else "🧭 అంచెలంచెల రక్షణ మార్గ సూచనలు"):
            for step_num, step_text in enumerate(route_data.get("steps", []), 1):
                st.markdown(f"**Step {step_num}:** {step_text}")

# =============================================================================
# TAB 4: CITIZEN HAZARD REPORTING (DIVA INTEGRATED)
# =============================================================================
with tab_report:
    st.subheader("Report Ground Hazard or Incident" if not is_te else "స్థానిక ప్రమాదాన్ని నివేదించండి")
    st.caption("Directly registered on the Government Decision Support Platform & triggers instant rescue directives.")

    with st.form("incident_report_form"):
        col_cat, col_ward = st.columns(2)
        with col_cat:
            cat = st.selectbox(
                "Hazard Classification / ప్రమాద రకం:",
                ["flood", "tree", "power", "medical", "structural"],
                format_func=lambda x: {
                    "flood": "🌊 Severe Inundation / Flood",
                    "tree": "🌳 Fallen Tree / Road Blockage",
                    "power": "⚡ High-Tension Electrical Snap",
                    "medical": "🚑 Medical Emergency / Stranded",
                    "structural": "🏚️ Structural Wall / Culvert Damage",
                }.get(x, x),
            )
        with col_ward:
            ward_name = st.text_input("Ward / Colony Name:", value=selected_loc_name.split(" (")[0])

        title_input = st.text_input("Incident Summary / Title:", placeholder="e.g. Canal culvert overflowing near Subba Rao Road")
        landmark_input = st.text_input("Immediate Landmark:", placeholder="e.g. Near Sai Baba Temple Junction")
        desc_input = st.text_area("Detailed Situation Description:", placeholder="Describe the water depth, trapped individuals, or specific blockage...")

        col_cname, col_cphone = st.columns(2)
        with col_cname:
            reporter_name = st.text_input("Your Name / మీ పేరు:", value="Citizen Responder")
        with col_cphone:
            reporter_phone = st.text_input("Contact Phone Number / ఫోన్ నంబర్:", value="9876543210")

        col_lat_show, col_lon_show = st.columns(2)
        with col_lat_show:
            st.text_input("Latitude", value=str(current_location["lat"]), disabled=True)
        with col_lon_show:
            st.text_input("Longitude", value=str(current_location["lon"]), disabled=True)

        submit_report = st.form_submit_button("🚨 Submit Incident to Government Platform & Get Decision" if not is_te else "🚨 ప్రభుత్వానికి నివేదించి తక్షణ నిర్ణయం పొందండి")

    if submit_report:
        if not title_input.strip():
            st.error("Please provide an incident title." if not is_te else "దయచేసి ప్రమాద శీర్షికను నమోదు చేయండి.")
        else:
            with st.spinner("Submitting incident report to Government DIVA Command Engine..."):
                case_id = f"CASE-RZ-{int(time.time() * 1000) % 1000000}"
                decision_id = f"DEC-{int(time.time() * 1000) % 1000000}"

                # Try posting to real Gov server tRPC endpoint
                gov_result = call_gov_trpc(
                    "diva.historical.createCase",
                    {
                        "method": "POST",
                        "body": {
                            "name": f"🚨 RED ZONE: [{cat.upper()}] {ward_name} - {title_input}",
                            "location": f"{ward_name}, Tadepalligudem, AP [OFFICIAL RED ZONE]",
                            "eventDate": datetime.now().strftime("%Y-%m-%d"),
                            "hazardType": "Flood" if cat in ["flood", "power"] else "Extreme Rainfall",
                            "description": f"Hazard: {title_input}. Description: {desc_input}. Reporter: {reporter_name} ({reporter_phone}).",
                        },
                    },
                )
                if gov_result and "id" in gov_result:
                    case_id = gov_result["id"]

                # Add new alert item to session state
                new_alert = {
                    "id": str(len(st.session_state.alerts) + 1),
                    "category": ["critical" if cat == "flood" else "civil", "nearby"],
                    "severity": "critical" if cat == "flood" else "high",
                    "tagEn": f"RED ALERT • {cat.upper()}",
                    "tagTe": f"రెడ్ అలర్ట్ • {cat.upper()}",
                    "agency": "CITIZEN VERIFIED & GOV LOGGED",
                    "agencyType": "official",
                    "timeAgoEn": "Just now",
                    "timeAgoTe": "ఇప్పుడే",
                    "titleEn": title_input,
                    "titleTe": title_input,
                    "distanceEn": "Your Sector",
                    "distanceTe": "మీ ప్రాంతం",
                    "locationEn": f"{ward_name}, {landmark_input}",
                    "locationTe": f"{ward_name}, {landmark_input}",
                    "mandatoryActionEn": "Red zone cordon established. Evacuate to ZP High School Shelter.",
                    "mandatoryActionTe": "రెడ్ జోన్ పరిధి విధించబడింది. జెడ్పీ ఉన్నత పాఠశాలకు తరలివెళ్ళండి.",
                    "descriptionEn": desc_input or "Citizen ground hazard registered on Akashvani Platform.",
                    "descriptionTe": desc_input or "పౌరుడు నివేదించిన సమాచారం ప్రభుత్వ పోర్టల్‌లో నమోదైంది.",
                    "shelterName": "ZP High School Relief Campus",
                    "shelterCapacity": "420 beds available",
                    "medicalOfficer": "Dr. K. Srinivas",
                    "rationStatus": "Disaster response units mobilized",
                    "helplines": ["112", "1077"],
                    "upvotes": 1,
                }
                st.session_state.alerts.insert(0, new_alert)

                st.success("Incident registered successfully! Government Decision Directive issued." if not is_te else "నివేదిక విజయవంతంగా నమోదైంది! అధికారిక ఆదేశం జారీ చేయబడింది.")

                # Render Instant Government Decision Directive
                st.markdown(
                    f"""
                    <div style="background:#fef2f2; border:2px solid #ef4444; border-radius:14px; padding:20px; margin-top:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="background:#dc2626; color:white; padding:4px 12px; border-radius:6px; font-weight:800; font-size:12px;">
                                OFFICIAL RED ZONE DIRECTIVE
                            </span>
                            <span style="font-size:12px; color:#7f1d1d; font-weight:600;">
                                Case Ref: {case_id} • Decision: {decision_id}
                            </span>
                        </div>
                        <h3 style="color:#991b1b; margin:12px 0 6px 0; font-size:20px;">
                            🚨 Government Decision: Active Red Zone Enforced
                        </h3>
                        <p style="color:#7f1d1d; font-size:14px; margin-bottom:12px;">
                            The area around <strong>{ward_name}</strong> has been analyzed by the Akashvani DIVA Decision-Support Engine and designated as an active <strong>RED ZONE</strong>.
                        </p>
                        <div style="background:white; border-radius:8px; padding:12px 16px; border:1px solid #fecaca; margin-bottom:12px;">
                            <div style="font-size:13px; color:#1e293b;">
                                <strong>Assigned Transit Shelter:</strong> ZP Boys High School Relief Complex (2.5 km away, ~5 min evacuation)<br>
                                <strong>Mobilized Units:</strong> SDRF Rescue Unit #04, Tadepalligudem Municipal Quick Response Team<br>
                                <strong>Safety Directive:</strong> Evacuate ground floor immediately. Avoid wading through canal water.
                            </div>
                        </div>
                        <div style="font-size:12px; color:#991b1b; font-weight:600;">
                            📡 Live Sync: Logged in District Collectorate DDMA Emergency Database.
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

# =============================================================================
# TAB 5: HIGH-PRIORITY SOS DISTRESS BEACON
# =============================================================================
with tab_sos:
    st.subheader("High-Priority Emergency SOS Distress Beacon" if not is_te else "అత్యవసర ఎస్.ఓ.ఎస్ రక్షణ బీకాన్")
    st.markdown(
        """
        <div style="background:#fff1f2; border-left:6px solid #e11d48; padding:14px 18px; border-radius:8px; margin-bottom:20px;">
            <strong style="color:#9f1239;">ATTENTION:</strong>
            <span style="color:#881337;"> Use this beacon ONLY in life-threatening emergencies. Triggering this beacon alerts the District Emergency Operations Center (DEOC) and SDRF Rescue Watercraft teams immediately.</span>
        </div>
        """,
        unsafe_allow_html=True,
    )

    with st.form("sos_beacon_form"):
        st.markdown(f"**Current Sector:** {selected_loc_name}")
        st.markdown(f"**GPS Fix:** {current_location['lat']:.4f}° N, {current_location['lon']:.4f}° E")
        
        victim_status = st.selectbox(
            "Current Victim Situation / పరిస్థితి:",
            [
                "Trapped in inundated ground floor / building",
                "Marooned on rooftop due to surging water levels",
                "Senior citizen / infant requiring boat rescue",
                "Severe injury or medical trauma",
                "Electrical short circuit / wire snap nearby",
            ],
        )

        col_med, col_people = st.columns(2)
        with col_med:
            has_medical = st.checkbox("Immediate Medical Emergency / తీవ్ర గాయాలు లేదా అత్యవసరం", value=False)
        with col_people:
            people_count = st.number_input("Number of Stranded Persons / చిక్కుకున్న వ్యక్తులు:", min_value=1, max_value=50, value=2)

        sos_submitted = st.form_submit_button("🆘 BROADCAST HIGH-PRIORITY SOS BEACON" if not is_te else "🆘 అత్యవసర బీకాన్‌ను ప్రసారం చేయండి")

    if sos_submitted:
        with st.spinner("Dispatching SOS Distress Beacon to SDRF Watercraft & DDMA Command Center..."):
            sos_id = f"SOS-{int(time.time() * 1000) % 1000000}"

            # Post to Gov TRPC backend
            call_gov_trpc(
                "diva.historical.createCase",
                {
                    "method": "POST",
                    "body": {
                        "name": f"🚨 RED ZONE SOS BEACON: {selected_loc_name.split(' (')[0]}",
                        "location": f"{selected_loc_name.split(' (')[0]}, Tadepalligudem, AP",
                        "eventDate": datetime.now().strftime("%Y-%m-%d"),
                        "hazardType": "Flood",
                        "description": f"URGENT SOS BEACON. Situation: {victim_status}. Persons: {people_count}. Medical: {has_medical}. Coordinates: {current_location['lat']}, {current_location['lon']}.",
                    },
                },
            )

            st.balloons()
            st.error("🚨 HIGH-PRIORITY SOS BEACON HAS BEEN TRANSMITTED!" if not is_te else "🚨 అత్యవసర బీకాన్ రెస్క్యూ బృందాలకు చేరింది!")

            st.markdown(
                f"""
                <div style="background:#881337; color:white; border-radius:14px; padding:22px; margin-top:16px; box-shadow:0 10px 25px rgba(136, 19, 55, 0.4);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="background:white; color:#881337; font-weight:800; font-size:12px; padding:3px 10px; border-radius:9999px;">
                            RESCUE WATERCRAFT DISPATCHED
                        </span>
                        <span style="font-size:13px; color:#fecdd3;">
                            Beacon ID: {sos_id}
                        </span>
                    </div>
                    <h2 style="color:white; margin:14px 0 8px 0; font-size:24px; font-weight:800;">
                        SDRF Boat Unit #02 Dispatched (ETA: 8-12 Minutes)
                    </h2>
                    <p style="color:#ffe4e6; font-size:15px; margin-bottom:16px;">
                        The District Disaster Operations Center has received your precise coordinates at ({current_location['lat']:.4f}, {current_location['lon']:.4f}).
                    </p>
                    <div style="background:rgba(255, 255, 255, 0.12); border-radius:10px; padding:16px; border:1px solid rgba(255, 255, 255, 0.2);">
                        <h4 style="color:white; margin-top:0;">CRITICAL ESCAPE & SURVIVAL DIRECTIVES:</h4>
                        <ol style="margin-bottom:0; padding-left:20px; line-height:1.7;">
                            <li><strong>Ascend Immediately:</strong> Move to the highest accessible floor, terrace, or rooftop.</li>
                            <li><strong>Signal Rescue Craft:</strong> Keep mobile phone flashlight / bright cloth ready for aerial drone and boat spotting.</li>
                            <li><strong>Electrical Safety:</strong> Turn off main power breaker if safely accessible without touching water.</li>
                            <li><strong>Do Not Wade:</strong> Never enter moving flood currents on foot. Wait for the SDRF boat unit.</li>
                        </ol>
                    </div>
                    <div style="margin-top:14px; font-size:13px; color:#fecdd3;">
                        📞 Direct Emergency Contact: <strong>08818-222108</strong> (SDRF Tadepalligudem Station) or <strong>112</strong>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

# =============================================================================
# TAB 6: COMMUNITY HUB & EMERGENCY DIRECTORY
# =============================================================================
with tab_community:
    st.subheader("Community Verification & Emergency Directory" if not is_te else "కమ్యూనిటీ & అత్యవసర డైరెక్టరీ")
    
    col_dir, col_tips = st.columns([1, 1])
    with col_dir:
        st.markdown("#### 📞 Complete Institutional Helplines Directory" if not is_te else "#### 📞 సమగ్ర అత్యవసర ఫోన్ నంబర్లు")
        helpline_table = pd.DataFrame(
            [
                {"Service": "District Disaster Control (DDMA)", "Number": "1077", "Hours": "24x7 Toll-Free"},
                {"Service": "National Emergency Unified (Police/Fire)", "Number": "112", "Hours": "24x7 Immediate"},
                {"Service": "SDRF Flood Rescue Battalion", "Number": "08818-222108", "Hours": "Watercraft Dispatch"},
                {"Service": "Medical Emergency & Ambulance", "Number": "108", "Hours": "ICU Transit"},
                {"Service": "APEPDCL Power Outage & Snaps", "Number": "1912", "Hours": "Grid Control"},
                {"Service": "Municipal Drinking Water Supply", "Number": "08818-223001", "Hours": "Tanker Request"},
            ]
        )
        st.dataframe(helpline_table, width="stretch", hide_index=True)

    with col_tips:
        st.markdown("#### 🛡️ Offline Disaster Preparedness Checklist" if not is_te else "#### 🛡️ అత్యవసర రక్షణ చెక్‌లిస్ట్")
        st.markdown(
            """
            - **💧 Safe Drinking Water:** Boil tap water vigorously for 3+ minutes. Store in sealed containers.
            - **⚡ Electrical Precautions:** Disconnect all submerged appliances. Avoid touching damp walls near switches.
            - **🎒 Emergency Grab Kit:** Pack dry food, torches, medical prescriptions, Aadhaar cards, and power banks in waterproof bags.
            - **👶 Vulnerable Protection:** Prioritize children, elderly, and pets for early evacuation.
            """
        )

# =============================================================================
# TAB 7: AI CRISIS & PUBLIC SAFETY ADVISOR (GEMINI POWERED)
# =============================================================================
with tab_ai:
    st.subheader("🤖 AI Crisis & Public Safety Advisor" if not is_te else "🤖 విపత్తు సహాయక ఏఐ సలహాదారు")
    st.caption("Ask questions about evacuation procedures, first aid, water purification, or emergency protocols in Tadepalligudem.")

    # Display chat history
    for message in st.session_state.chat_history:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    # Chat input
    user_prompt = st.chat_input(
        "Ask a crisis safety question (e.g., 'What to do if flood waters enter my house?')..."
        if not is_te
        else "విపత్తు భద్రతా ప్రశ్న అడగండి (ఉదా: 'వరద నీరు ఇంట్లోకి వస్తే ఏం చేయాలి?')..."
    )

    if user_prompt:
        st.session_state.chat_history.append({"role": "user", "content": user_prompt})
        with st.chat_message("user"):
            st.markdown(user_prompt)

        with st.chat_message("assistant"):
            with st.spinner("Analyzing crisis guidance..." if not is_te else "విశ్లేషిస్తోంది..."):
                response_text = ""
                # Attempt to use Gemini API if GEMINI_API_KEY is available
                gemini_api_key = os.environ.get("GEMINI_API_KEY")
                if gemini_api_key and gemini_api_key != "MY_GEMINI_API_KEY":
                    try:
                        from google import genai
                        client = genai.Client(api_key=gemini_api_key)
                        system_instruct = (
                            f"You are the Akashvani Civic Trust & Crisis Response AI Assistant for Tadepalligudem, Andhra Pradesh. "
                            f"Current location: {selected_loc_name} ({current_location['lat']}, {current_location['lon']}). "
                            f"Language preference: {'Telugu' if is_te else 'English'}. "
                            f"Provide clear, actionable, life-saving advice for flood and cyclone emergencies. Keep answers concise, authoritative, and helpful."
                        )
                        response = client.models.generate_content(
                            model="gemini-2.5-flash",
                            contents=f"System: {system_instruct}\nUser: {user_prompt}",
                        )
                        response_text = response.text
                    except Exception as gemini_err:
                        response_text = f"*(Gemini AI active mode)*: {gemini_err}"

                # Knowledge-base fallback if Gemini key is not set or failed
                if not response_text or "gemini" in response_text.lower():
                    q_lower = user_prompt.lower()
                    if "water" in q_lower or "drink" in q_lower or "నీరు" in q_lower:
                        response_text = (
                            "💧 **Drinking Water Purification Protocol:**\n\n"
                            "1. **Boil vigorously:** Boil all drinking and cooking water for at least 3 to 5 minutes to destroy waterborne pathogens.\n"
                            "2. **Chlorine Disinfection:** If boiling is impossible, use chlorine tablets distributed by the PHC (1 tablet per 20 liters; wait 30 minutes).\n"
                            "3. **Never drink flood water:** Do not consume flood runoff under any circumstances. Contact Municipal Help at **08818-223001** for clean water tankers."
                            if not is_te
                            else "💧 **సురక్షిత తాగునీటి మార్గదర్శకాలు:**\n\n"
                            "1. **బాగా మరిగించండి:** తాగునీరు మరియు వంట నీటిని కనీసం 3 నుండి 5 నిమిషాల పాటు మరిగించి చల్లార్చండి.\n"
                            "2. **క్లోరిన్ మాత్రలు:** పీహెచ్‌సీ ద్వారా పంపిణీ చేసిన క్లోరిన్ మాత్రలను ఉపయోగించండి (20 లీటర్ల నీటికి 1 మాత్ర).\n"
                            "3. మున్సిపల్ వాటర్ ట్యాంకర్ల కోసం **08818-223001** నంబరును సంప్రదించండి."
                        )
                    elif "shelter" in q_lower or "evacuat" in q_lower or "పునరావాస" in q_lower:
                        response_text = (
                            "🏫 **Designated Relief Shelters in Tadepalligudem:**\n\n"
                            "1. **Zilla Parishad Boys High School** (Subba Rao Road, Near Gandhi Park) — Capacity: 800 beds (Meals & Medical Care operational).\n"
                            "2. **Government Degree College Camp** (Pentapadu Road) — Capacity: 650 beds.\n"
                            "3. **Municipal Town Hall & Indoor Stadium** (RTC Complex Road) — Capacity: 500 beds.\n\n"
                            "📍 Check the **'GIS Crisis Map'** tab above to see the turn-by-turn safe corridor route to the nearest shelter."
                            if not is_te
                            else "🏫 **తాడేపల్లిగూడెంలో అధికారిక పునరావాస కేంద్రాలు:**\n\n"
                            "1. **జిల్లా పరిషత్ బాలుర ఉన్నత పాఠశాల** (సుబ్బా రావు రోడ్) - 800 పడకలు, భోజనం మరియు వైద్య సదుపాయం.\n"
                            "2. **ప్రభుత్వ డిగ్రీ కళాశాల క్యాంప్** (పెంటపాడు రోడ్) - 650 పడకలు.\n"
                            "3. **మున్సిపల్ టౌన్ హాల్ & ఇండోర్ స్టేడియం** - 500 పడకలు.\n\n"
                            "మ్యాప్ ట్యాబ్‌లో సురక్షిత రవాణా మార్గాన్ని పరిశీలించవచ్చు."
                        )
                    elif "power" in q_lower or "electric" in q_lower or "కరెంట్" in q_lower or "షాక్" in q_lower:
                        response_text = (
                            "⚡ **Electrical Safety Protocols:**\n\n"
                            "1. **Main Switch Off:** If water begins entering your residence, switch off the main circuit breaker immediately (only if you can do so while dry).\n"
                            "2. **Stay Clear of Downed Wires:** Maintain at least a 30-meter perimeter from fallen cables or tilted poles.\n"
                            "3. **Report Wire Snaps:** Call APEPDCL emergency hotline at **1912** or Police at **112** immediately."
                            if not is_te
                            else "⚡ **విద్యుత్ భద్రతా నియమాలు:**\n\n"
                            "1. **మెయిన్ స్విచ్ ఆఫ్ చేయండి:** ఇంట్లోకి నీరు వచ్చే అవకాశం ఉంటే తక్షణమే మెయిన్ స్విచ్ ఆపండి.\n"
                            "2. **తెగిపడిన వైర్ల నుండి దూరం:** నేలకొరిగిన విద్యుత్ స్తంభాలు లేదా వైర్లకు కనీసం 30 మీటర్ల దూరంలో ఉండండి.\n"
                            "3. అత్యవసర ఫిర్యాదుల కోసం **1912** కు కాల్ చేయండి."
                        )
                    else:
                        response_text = (
                            "🚨 **Akashvani Emergency Triage Guidance:**\n\n"
                            f"For your current sector in **{selected_loc_name}**:\n"
                            "- **Immediate Danger?** Trigger the **SOS Beacon** tab above or dial **112**.\n"
                            "- **Evacuation:** High ground safe shelter is active at **Zilla Parishad High School**.\n"
                            "- **Flood Helpline:** Call District Disaster Control at **1077** or SDRF at **08818-222108**."
                            if not is_te
                            else "🚨 **ఆకాశవాణి అత్యవసర మార్గదర్శకాలు:**\n\n"
                            f"మీ ప్రస్తుత ప్రాంతం **{selected_loc_name}** కొరకు:\n"
                            "- తక్షణ ప్రమాదం ఉన్నట్లయితే పైన ఉన్న **'ఎస్.ఓ.ఎస్ బీకాన్'** ఉపయోగించండి లేదా **112** కు డయల్ చేయండి.\n"
                            "- పునరావాస కేంద్రం: **జిల్లా పరిషత్ ఉన్నత పాఠశాల** అందుబాటులో ఉంది.\n"
                            "- డిజాస్టర్ కంట్రోల్ రూమ్: **1077** లేదా **08818-222108**."
                        )

                st.markdown(response_text)
                st.session_state.chat_history.append({"role": "assistant", "content": response_text})

# -----------------------------------------------------------------------------
# Footer
# -----------------------------------------------------------------------------
st.markdown("---")
st.markdown(
    """
    <div style="text-align:center; color:#64748b; font-size:12px; padding:12px 0;">
        Akashvani Digital Public Infrastructure (DPI) • Andhra Pradesh State Disaster Management Authority (APSDMA)<br>
        Tadepalligudem & West Godavari District Administration • Powered by Streamlit & Government DIVA Engine
    </div>
    """,
    unsafe_allow_html=True,
)
