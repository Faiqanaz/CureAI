import re
import random

# ─────────────────────────────
# Greetings / Thanks / Basic
# ─────────────────────────────

greetings = ["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening"]
thanks_words = ["thanks", "thank you", "thx", "shukriya"]

greeting_responses = [
    "👋 Hi! I'm CureAI. How are you feeling today?",
    "Hello 😊 Tell me your symptoms step by step.",
    "Hey! I'm here to help you. What are you feeling right now?"
]

thanks_responses = [
    "You're welcome 😊 Take care of your health.",
    "Happy to help 🩺 If anything else comes up, I'm here.",
    "No problem 👍 Wishing you a quick recovery."
]

# ─────────────────────────────
# Symptom + Disease Mapping
# ─────────────────────────────

symptom_map = {
    "fever": ["fever", "temperature", "hot body", "bukhar"],
    "cough": ["cough", "khansi", "dry cough", "wet cough"],
    "weakness": ["weak", "fatigue", "thakan", "low energy"],
    "headache": ["headache", "sir dard", "migraine"],
    "vomiting": ["vomit", "ulti", "nausea"],
    "breathing": ["breathless", "short breath", "asthma", "saans"],
    "chest_pain": ["chest pain", "seene ka dard"],
    "body_pain": ["body pain", "joint pain", "muscle pain"],
    "dizziness": ["dizzy", "chakkar"]
}

# ─────────────────────────────
# Disease Logic (Pakistan based)
# ─────────────────────────────

def detect_disease(symptoms, duration):
    s = set(symptoms)

    # Dengue
    if "fever" in s and "body_pain" in s and duration >= 2:
        return "⚠️ It may be **Dengue Fever**"

    # Flu / Viral
    if "fever" in s and "cough" in s:
        return "🤒 It looks like **Viral Flu / Infection**"

    # COVID
    if "fever" in s and "breathing" in s:
        return "⚠️ Possible **COVID-like infection**"

    # TB (long cough)
    if "cough" in s and duration >= 14:
        return "⚠️ Possible **Tuberculosis (TB)** — needs urgent check"

    # Asthma
    if "breathing" in s:
        return "🌬️ It may be **Asthma / Respiratory issue**"

    # Anxiety / BP
    if "chest_pain" in s and "dizziness" in s:
        return "⚠️ Could be **BP or Anxiety-related issue**"

    return "🔍 Symptoms need more analysis"

# ─────────────────────────────
# Medicine Suggestion (SAFE OTC ONLY)
# ─────────────────────────────

def suggest_medicine(symptoms):
    s = set(symptoms)

    meds = []

    if "fever" in s:
        meds.append("💊 Paracetamol (for fever & pain relief)")

    if "cough" in s:
        meds.append("💊 Cough syrup (Dry or Wet depending on type)")

    if "body_pain" in s:
        meds.append("💊 Paracetamol or Ibuprofen (mild pain relief)")

    if "weakness" in s:
        meds.append("🥤 ORS / hydration fluids")

    return meds

# ─────────────────────────────
# Extract Symptoms
# ─────────────────────────────

def extract_symptoms(text):
    found = []

    for key, words in symptom_map.items():
        if any(w in text for w in words):
            found.append(key)

    return found

# ─────────────────────────────
# MAIN LOGIC
# ─────────────────────────────

def get_response(user_input: str):

    text = user_input.lower()

    # THANK YOU HANDLING
    if any(word in text for word in thanks_words):
        return random.choice(thanks_responses)

    # GREETING
    if any(word in text for word in greetings):
        return random.choice(greeting_responses)

    # HOW ARE YOU
    if "how are you" in text:
        return "😊 I'm CureAI and I'm here to help you. Tell me what's bothering you."

    # EMERGENCY
    if "chest pain" in text or "can't breathe" in text or "severe bleeding" in text:
        return (
            "🚨 EMERGENCY ALERT\n"
            "Please go to nearest hospital immediately or call 1122 (Pakistan)."
        )

    # ─────────────────────────────
    # STEP 1: SYMPTOMS
    # ─────────────────────────────
    symptoms = extract_symptoms(text)

    if symptoms:
        return (
            "🩺 I understand your symptoms.\n"
            "📅 How many days have you been experiencing this?"
        )

    # ─────────────────────────────
    # STEP 2: DURATION DETECTION
    # ─────────────────────────────
    match = re.search(r"(\d+)\s*(day|days)", text)

    if match:
        days = int(match.group(1))

        # fake previous symptoms fallback (simple version)
        symptoms = ["fever", "cough"]  # you can replace with session memory later

        disease = detect_disease(symptoms, days)
        meds = suggest_medicine(symptoms)

        return (
            f"{disease}\n\n"
            f"💊 Immediate Relief Suggestions:\n- " +
            "\n- ".join(meds) +
            "\n\n🏥 If symptoms continue, consult a doctor."
        )

    # DEFAULT
    return (
        "🤔 Can you tell me:\n"
        "• Your symptoms\n"
        "• How long you have them\n"
        "• Any other issues (fever, cough, weakness etc.)"
    )