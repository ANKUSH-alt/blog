from openai import AsyncOpenAI
import json
import urllib.parse
import httpx
from app.core.config import settings

client = AsyncOpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1"
)

class AIService:
    @staticmethod
    async def generate_blog(topic: str, difficulty: str, word_count: int, include_code: bool, include_diagrams: bool = False):
        prompt = f"Generate a comprehensive, engaging blog post about {topic} at a {difficulty} level. " \
                 f"It should be approximately {word_count} words long. " \
                 f"CRITICAL: Structure the content clearly using point-wise lists (bullet points) for better readability. " \
                 f"DO NOT use any emojis. To explain concepts visually, include highly relevant topic images using this markdown syntax: `![alt text](https://image.pollinations.ai/prompt/highly%20detailed%20description%20of%20concept)` where the URL path is a URL-encoded descriptive prompt. "
        if include_code:
            prompt += "Include relevant Python code examples. "
        if include_diagrams:
            prompt += "Include Mermaid.js diagram code where appropriate. "
        
        system_prompt = "You are an expert technical blog writer. Output ONLY a valid JSON object with the following keys: 'title', 'content', 'seo_title', 'seo_description'. For 'content', use Markdown, heavily use bullet points, use pollinations.ai for images, and NEVER use emojis."

        try:
            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            content = response.choices[0].message.content
            parsed = json.loads(content)
            # Handle cases where the model returns a list instead of a dict
            if isinstance(parsed, list) and len(parsed) > 0:
                parsed = parsed[0]
            if not isinstance(parsed, dict):
                raise ValueError(f"Expected a JSON object, got {type(parsed).__name__}")
            # Ensure required keys exist
            return {
                "title": parsed.get("title", f"Mastering {topic}"),
                "content": parsed.get("content", ""),
                "seo_title": parsed.get("seo_title", f"Guide to {topic}"),
                "seo_description": parsed.get("seo_description", f"Learn about {topic}.")
            }
        except Exception as e:
            print(f"Error in generate_blog: {e}")
            # Fallback mock if API fails
            return {
                "title": f"Mastering {topic} (Draft)",
                "content": f"# {topic}\n\n[Generation failed: {str(e)}]\n\nThis is a {difficulty} level guide to {topic}...",
                "seo_title": f"Guide to {topic}",
                "seo_description": f"Learn about {topic}."
            }

    @staticmethod
    async def get_tutor_response(message: str, history: list):
        try:
            tutor_prompt = (
                "You are an expert AI and Coding Tutor. "
                "CRITICAL RULES: "
                "1. DO NOT use ANY emojis in your responses. Ever. "
                "2. Structure your explanations strictly using concise point-wise lists (bullet points). "
                "3. To explain topics visually, you MUST inject image placeholders using Markdown. Use this format: `![Description](https://image.pollinations.ai/prompt/detailed%20url%20encoded%20description%20of%20image)`."
            )
            messages = [{"role": "system", "content": tutor_prompt}]
            for msg in history:
                messages.append(msg)
            messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error connecting to AI Tutor: {str(e)}"

    @staticmethod
    async def generate_quiz(content: str):
        prompt = f"Generate a JSON array of 3 multiple choice questions based on this content: {content}. Each question should have 'question', 'options' (list of 4), and 'answer' (the correct option string)."
        try:
            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            data = json.loads(response.choices[0].message.content)
            return data.get("quiz", data.get("questions", data))
        except Exception as e:
            return [{"question": f"Error: {e}", "options": ["-", "-", "-"], "answer": "-"}]

    @staticmethod
    async def get_assistant_response(message: str, history: list, system_prompt: str = "You are a helpful AI Assistant."):
        try:
            # Inject strict rule modifications into whatever the chosen base system prompt is
            enhanced_sys_prompt = system_prompt + (
                " CRITICAL RULES: 1. NO EMOJIS EVER. 2. Use point-wise lists (bullet points) extensively. "
                "3. ALWAYS include visual aids using Markdown images: `![alt text](https://image.pollinations.ai/prompt/url%20encoded%20visual%20description)`."
            )
            messages = [{"role": "system", "content": enhanced_sys_prompt}]
            for msg in history:
                messages.append(msg)
            messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error connecting to AI Assistant: {str(e)}"

    @staticmethod
    async def generate_image(prompt: str):
        try:
            print(f"Generating image for prompt: {prompt}")
            
            # Enhance prompt with Gemini for better results
            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=[
                    {"role": "system", "content": "You are an AI image prompt enhancer. Enhance the user's prompt to be highly detailed for an image generator. Output ONLY the enhanced prompt text in English, without any markdown, quotes, or conversational text. Limit to 50 words."},
                    {"role": "user", "content": prompt}
                ]
            )
            enhanced_prompt = response.choices[0].message.content.strip()
            print(f"Enhanced prompt: {enhanced_prompt}")
            
            encoded_prompt = urllib.parse.quote(enhanced_prompt)
            # Use random seed to avoid caching same image
            import random
            seed = random.randint(1, 999999)
            image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={seed}"
            
            print(f"Successfully generated Image URL: {image_url}")
            return {"url": image_url, "prompt": enhanced_prompt}
            
        except Exception as e:
            print(f"Error in generate_image: {e}")
            raise ValueError(f"Image generation failed: {str(e)}")

