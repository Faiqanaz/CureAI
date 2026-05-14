import re
import random

# ─────────────────────────────
# MEMORY (Conversation State)
# ─────────────────────────────

conversation = {
    "symptoms": [],
    "days": None,
    "asked_days": False,
    "asked_more": False
}

# ─────────────────────────────
# Greetings / Thanks / Basic
# ─────────────────────────────

greetings = [
    "hi", "hello", "hey", "salam",
    "assalam", "good morning", "good evening"
]

thanks_words = [
    "thanks", "thank you", "thx", "shukriya"
]

greeting_responses = [
    "👋 Hi! I'm CureAI, your personal medical assistant.\n\nHow are you feeling today?",
    "Hello 😊 Tell me your symptoms step by step.",
    "Hey! I'm here to help you. What are you feeling right now?"
]

thanks_responses = [
    "You're welcome 😊 Take care of your health.",
    "Happy to help 🩺 If anything else comes up, I'm here.",
    "No problem 👍 Wishing you a quick recovery."
]

# ─────────────────────────────
# Symptom Mapping
# ─────────────────────────────

symptom_map = {

    "fever": ["fever", "temperature", "hot body", "bukhar"],
    "cough": ["cough", "khansi", "dry cough", "wet cough"],
    "weakness": ["weakness", "weak", "fatigue", "thakan", "low energy"],
    "headache": ["headache", "sir dard", "migraine"],
    "vomiting": ["vomit", "vomiting", "ulti", "nausea"],
    "breathing": ["breathless", "short breath", "asthma", "saans"],
    "chest_pain": ["chest pain", "seene ka dard"],
    "body_pain": ["body pain", "joint pain", "muscle pain"],
    "dizziness": ["dizzy", "chakkar"],
    "rash": ["rash", "red spots", "skin rash"],
    "low_bp": ["low bp", "low blood pressure", "bp low"],
    "high_bp": ["high bp", "bp high", "high blood pressure"],
    "dehydration": ["dehydrated", "dehydration", "dry mouth", "less water"],
    "anxiety": ["anxiety", "panic", "panic attack", "stress"],
    "sleepless": ["can't sleep", "cant sleep", "sleepless", "insomnia"],
    "heart_racing": ["fast heartbeat", "heart racing", "heartbeat fast"]
}

# ─────────────────────────────
# SMART INSIGHTS (IMPROVED)
# ─────────────────────────────

def get_probable_insights(symptoms, days):

    s = set(symptoms)
    insights = []

    if "headache" in s:

        if days >= 5:
            insights.append("🧠 Possible Chronic Headache / Migraine (long duration)")
        else:
            insights.append("🧠 Headache detected (stress or dehydration possible)")

    if "headache" in s and "weakness" in s:
        insights.append("⚡ Fatigue / dehydration-related headache possible")

    if "headache" in s and "dizziness" in s:
        insights.append("⚠️ Low BP or migraine trigger possible")

    if "fever" in s and "headache" in s:
        insights.append("🤒 Viral flu / infection possible")

    if "heart_racing" in s and "sleepless" in s:
        insights.append("😟 Anxiety or stress-related symptoms")

    # NEW REAL-WORLD BEHAVIOR FIX
    if len(s) <= 1:
        insights.append("⚠️ Only 1 symptom detected — add more details for better accuracy")

    return insights

# ─────────────────────────────
# DISEASE LOGIC
# ─────────────────────────────

def detect_disease(symptoms, duration):

    s = set(symptoms)

    if "fever" in s and "body_pain" in s and "weakness" in s:
        return "⚠️ Possible Dengue Fever"

    if "fever" in s and "cough" in s:
        return "🤒 Possible Viral Flu"

    if "fever" in s and "breathing" in s:
        return "⚠️ Possible COVID-like infection"

    if "cough" in s and duration >= 14:
        return "⚠️ Possible Tuberculosis (TB)"

    if "headache" in s and duration >= 5:
        return "🧠 Possible Migraine / Chronic Headache"

    if "headache" in s and "dizziness" in s:
        return "⚠️ Possible BP issue or migraine"

    if "breathing" in s:
        return "🌬️ Respiratory issue possible"

    if "low_bp" in s:
        return "⚠️ Possible Low BP"

    if "dehydration" in s:
        return "💧 Possible Dehydration"

    if "anxiety" in s:
        return "😟 Possible Anxiety"

    if "sleepless" in s:
        return "🌙 Possible Insomnia"

    return "🔍 Symptoms need more medical analysis"

# ─────────────────────────────
# MEDICINE SUGGESTION (IMPROVED)
# ─────────────────────────────

def suggest_medicine(symptoms):

    s = set(symptoms)
    meds = []

    if "fever" in s:
        meds.append("💊 Paracetamol (fever relief)")

    if "headache" in s:
        meds.append("💊 Paracetamol / Ibuprofen (Pakistan OTC safe use)")

    if "body_pain" in s:
        meds.append("💊 Ibuprofen / Paracetamol")

    if "weakness" in s:
        meds.append("🥤 ORS + hydration")

    if "dehydration" in s:
        meds.append("💧 ORS + water intake")

    # 🔥 MIGRAINE UPGRADE
    if "headache" in s and "dizziness" in s:
        meds.append("🧠 Rest in dark room + hydration + Paracetamol")

    if "high_bp" in s:
        meds.append("🧂 Reduce salt + rest")

    if "low_bp" in s:
        meds.append("🥤 Fluids + slow movement")

    if "anxiety" in s:
        meds.append("🧘 Deep breathing")

    if "sleepless" in s:
        meds.append("🌙 Avoid screens before sleep")

    return meds

# ─────────────────────────────
# EXTRACT SYMPTOMS
# ─────────────────────────────

def extract_symptoms(text):

    found = []

    for key, words in symptom_map.items():
        for w in words:
            if w in text:
                found.append(key)
                break

    return found

# ─────────────────────────────
# RESET
# ─────────────────────────────

def reset_conversation():
    conversation["symptoms"] = []
    conversation["days"] = None
    conversation["asked_days"] = False
    conversation["asked_more"] = False

# ─────────────────────────────
# MAIN LOGIC
# ─────────────────────────────

def get_response(user_input: str):

    text = user_input.lower().strip()

    # THANK YOU
    if any(word in text for word in thanks_words):
        reset_conversation()
        return random.choice(thanks_responses)

    # GREETING
    if any(word == text for word in greetings):
        return random.choice(greeting_responses)

    if "how are you" in text:
        return "😊 I'm CureAI. Tell me your symptoms."

    # EMERGENCY
    emergency_words = ["can't breathe", "cant breathe", "severe bleeding", "heart attack"]

    if "chest pain" in text or any(w in text for w in emergency_words):
        reset_conversation()
        return "🚨 EMERGENCY: Go to hospital or call 1122 (Pakistan)"

    # SYMPTOMS
    symptoms = extract_symptoms(text)

    if symptoms:

        for s in symptoms:
            if s not in conversation["symptoms"]:
                conversation["symptoms"].append(s)

        if not conversation["asked_days"]:
            conversation["asked_days"] = True
            return "📅 How many days are you feeling this?"

        if conversation["days"]:
            return "🤔 Any other symptoms? (or say 'nothing more')"

    # DURATION
    match = re.search(r"\b(\d+)\b", text)

    if match and conversation["asked_days"]:
        conversation["days"] = int(match.group(1))
        return "🤔 Any other symptoms?"

    # ─────────────────────────────
    # FINAL (SMART STOP LOGIC IMPROVED)
    # ─────────────────────────────

    end_words = [
        "nothing more", "that's all", "thats all",
        "no more symptoms", "i am fine", "im fine",
        "i feel better", "all good", "done", "finished"
    ]

    if any(word in text for word in end_words):

        symptoms = conversation["symptoms"]
        days = conversation["days"] or 1

        disease = detect_disease(symptoms, days)
        meds = suggest_medicine(symptoms)
        insights = get_probable_insights(symptoms, days)

        response = f"{disease}\n\n🧠 Analysis:\n- " + "\n- ".join(insights)

        response += "\n\n💊 Medicines:\n- " + "\n- ".join(meds)

        response += "\n\n⚠️ Consult doctor if symptoms persist."
        response += "\n\n😊 Get well soon!"

        reset_conversation()
        return response

    return "🤔 Tell me symptoms + duration"