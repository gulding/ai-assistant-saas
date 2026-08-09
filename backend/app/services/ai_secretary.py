import os
from openai import OpenAI
from app.schemas import MeetingCreate, EmailDraft
from datetime import datetime
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def parse_meeting_request(text: str) -> MeetingCreate:
    prompt = f"""
    You are an AI Secretary. A user has forwarded a meeting request or text.
    Extract the following details: title, description, start_time (ISO8601), end_time (ISO8601), and participants (comma separated).
    Assume the current year is {datetime.now().year} if not specified.
    
    Text: {text}
    
    Return ONLY a valid JSON object matching this schema:
    {{
        "title": "...",
        "description": "...",
        "start_time": "YYYY-MM-DDTHH:MM:SS",
        "end_time": "YYYY-MM-DDTHH:MM:SS",
        "participants": "email1, email2"
    }}
    """
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful AI secretary that outputs strict JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    data = json.loads(response.choices[0].message.content)
    return MeetingCreate(**data)

def draft_meeting_reply(text: str) -> EmailDraft:
    prompt = f"""
    You are an AI Secretary. An incoming meeting request has been received.
    Based on the email, draft a professional reply confirming a time.
    Extract the sender's email to use as the recipient. If missing, use "unknown@sender.com".
    
    Text: {text}
    
    Return ONLY a valid JSON object matching this schema:
    {{
        "recipient": "sender_email@example.com",
        "suggested_time": "The time you are suggesting or confirming",
        "body": "The actual text of the email reply you drafted"
    }}
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful AI secretary that outputs strict JSON."},
            {"role": "user", "content": prompt}
        ],
        response_format={ "type": "json_object" }
    )
    
    data = json.loads(response.choices[0].message.content)
    return EmailDraft(**data)
