from openai import AsyncOpenAI
import json
import asyncio
import urllib.parse
import httpx
from app.core.config import settings

client = AsyncOpenAI(
    api_key=settings.OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    timeout=60.0,
    max_retries=2
)

class AIService:
    @staticmethod
    async def generate_blog(topic: str, difficulty: str, word_count: int, include_code: bool, include_diagrams: bool = False):
        prompt = f"Generate a comprehensive, engaging blog post about {topic} at a {difficulty} level. " \
                 f"It should be approximately {word_count} words long. " \
                 f"CRITICAL: Structure the content clearly using point-wise lists (bullet points) for better readability. " \
                 f"DO NOT use any emojis. "
        if include_code:
            prompt += "Include relevant Python code examples. "
        if include_diagrams:
            prompt += "Include Mermaid.js diagram code where appropriate. "
        
        system_prompt = "You are an expert technical blog writer. Output ONLY a valid JSON object with the following keys: 'title', 'content', 'seo_title', 'seo_description'. For 'content', use Markdown, heavily use bullet points, and NEVER use emojis."

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
            # Handle cases where the model nests the content under a "blog" key
            if isinstance(parsed, dict) and "blog" in parsed:
                parsed = parsed["blog"]
            return parsed
        except Exception as e:
            return {"title": f"Error: {e}", "content": "Failed to generate blog.", "seo_title": "-", "seo_description": "-"}

    @staticmethod
    async def get_tutor_response(message: str, history: list):
        try:
            messages = [{"role": "system", "content": "You are a helpful AI tutor. Guide the student using Socratic questioning. Do not give direct answers immediately. DO NOT use emojis."}]
            for msg in history:
                messages.append(msg)
            messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {e}"

    @staticmethod
    async def generate_quiz(content: str):
        try:
            prompt = f"Generate a multiple-choice quiz based on this content:\n\n{content}"
            system_prompt = "Output ONLY a valid JSON list of objects. Each object must have: 'question' (string), 'options' (list of exactly 4 strings), 'answer' (string matching one option EXACTLY). NO EMOJIS."
            
            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            parsed = json.loads(response.choices[0].message.content)
            if isinstance(parsed, dict):
                first_key = list(parsed.keys())[0]
                if isinstance(parsed[first_key], list):
                    return parsed[first_key]
                return [parsed]
            return parsed
        except Exception as e:
            return [{"question": f"Error: {e}", "options": ["-", "-", "-"], "answer": "-"}]

    @staticmethod
    async def get_assistant_response(message: str, history: list, system_prompt: str = "You are a helpful AI Assistant.", image_data: str = None, model: str = "google/gemini-2.0-flash-001"):
        try:
            # Inject strict rule modifications into whatever the chosen base system prompt is
            enhanced_sys_prompt = system_prompt + (
                " CRITICAL RULES: 1. NO EMOJIS EVER. 2. Use point-wise lists (bullet points) extensively. "
                "3. You ARE capable of reading uploaded files and seeing images. If the user attaches a file, its text is automatically extracted and provided to you in the prompt. If they attach an image, you can see it. Do NOT claim you cannot process files or images. "
                "4. If the user asks you to generate, create, or draw an image or a video, explain that they need to click the 'Image Gen' or 'Video Gen' buttons located directly above the chat input box to use the dedicated image/video generation tools."
            )
            messages = [{"role": "system", "content": enhanced_sys_prompt}]
            for msg in history:
                messages.append(msg)

            # If image data is provided, use multimodal message format
            if image_data:
                user_content = [
                    {"type": "text", "text": message},
                    {"type": "image_url", "image_url": {"url": image_data}}
                ]
                messages.append({"role": "user", "content": user_content})
            else:
                messages.append({"role": "user", "content": message})

            response = await client.chat.completions.create(
                model=model,
                messages=messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error connecting to AI Assistant: {str(e)}"

    @staticmethod
    async def generate_image(prompt: str):
        try:
            print(f"Generating image for prompt: {prompt}")
            
            # Use Gemini to extract simple search keywords for Unsplash
            response = await client.chat.completions.create(
                model="google/gemini-2.0-flash-001",
                messages=[
                    {"role": "system", "content": "Extract 3 to 5 simple, concrete search keywords from the user's image request. Output ONLY the keywords separated by spaces. No sentences, no punctuation, no quotes. Example: 'sunset mountains lake'"},
                    {"role": "user", "content": prompt}
                ]
            )
            search_keywords = response.choices[0].message.content.strip()
            print(f"Search keywords: {search_keywords}")
            
            headers = {"Authorization": f"Client-ID {settings.UNSPLASH_SECRET_KEY}"}
            
            # Build search queries: combined keywords, individual keywords, then generic fallback
            individual_keywords = [kw.strip() for kw in search_keywords.split() if len(kw.strip()) > 2]
            queries_to_try = [search_keywords] + individual_keywords[:3] + [prompt]
            
            async with httpx.AsyncClient() as hc:
                image_url = None
                for query in queries_to_try:
                    encoded_query = urllib.parse.quote(query)
                    unsplash_url = f"https://api.unsplash.com/photos/random?query={encoded_query}"
                    res = await hc.get(unsplash_url, headers=headers)
                    if res.status_code == 200:
                        data = res.json()
                        image_url = data.get('urls', {}).get('regular', '')
                        if image_url:
                            print(f"Unsplash match found for query: '{query}'")
                            break
                    print(f"Unsplash query '{query}' failed (status {res.status_code}), trying next...")
                
                # Last resort: use picsum.photos random image
                if not image_url:
                    print("All Unsplash queries failed. Using picsum.photos fallback.")
                    image_url = f"https://picsum.photos/1080/720?random={hash(prompt) % 10000}"
            
            print(f"Successfully fetched Image URL: {image_url}")
            return {"url": image_url, "prompt": search_keywords}
            
        except Exception as e:
            print(f"Error in generate_image: {e}")
            raise ValueError(f"Image generation failed: {str(e)}")

    @staticmethod
    async def generate_video(prompt: str):
        """Generate a video using fal.ai MiniMax Video API with proper status handling."""
        FAL_BASE = "https://queue.fal.run/fal-ai/minimax-video"
        headers = {
            "Authorization": f"Key {settings.FAL_API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            print(f"Generating video for prompt: {prompt}")

            async with httpx.AsyncClient(timeout=60.0) as hc:
                # 1. Submit the job to the queue
                submit_res = await hc.post(
                    FAL_BASE,
                    headers=headers,
                    json={"prompt": prompt, "prompt_optimizer": True}
                )
                if submit_res.status_code not in (200, 201, 202):
                    raise ValueError(f"fal.ai submit error ({submit_res.status_code}): {submit_res.text}")

                submit_data = submit_res.json()
                request_id = submit_data.get("request_id")
                # Use the URLs provided by fal.ai response
                status_url = submit_data.get("status_url", f"{FAL_BASE}/requests/{request_id}/status")
                result_url = submit_data.get("response_url", f"{FAL_BASE}/requests/{request_id}")

                if not request_id:
                    raise ValueError(f"No request_id in fal.ai response: {submit_data}")

                print(f"fal.ai job submitted: {request_id}")
                print(f"Status URL: {status_url}")

                # 2. Poll for completion (max 5 minutes)
                max_wait = 300
                elapsed = 0
                poll_interval = 5

                while elapsed < max_wait:
                    await asyncio.sleep(poll_interval)
                    elapsed += poll_interval

                    status_res = await hc.get(status_url, headers=headers)
                    # fal.ai returns 202 for IN_PROGRESS/IN_QUEUE — this is normal!
                    if status_res.status_code not in (200, 202):
                        print(f"Status poll error: {status_res.status_code} {status_res.text}")
                        continue

                    status_data = status_res.json()
                    status = status_data.get("status", "").upper()
                    print(f"fal.ai job status ({elapsed}s): {status}")

                    if status == "COMPLETED":
                        break
                    elif status in ("FAILED", "CANCELLED"):
                        raise ValueError(f"fal.ai job {status}: {status_data}")
                else:
                    raise ValueError("Video generation timed out after 5 minutes.")

                # 3. Fetch the result
                result_res = await hc.get(result_url, headers=headers)
                if result_res.status_code != 200:
                    raise ValueError(f"fal.ai result error ({result_res.status_code}): {result_res.text}")

                result_data = result_res.json()
                video_url = result_data.get("video", {}).get("url", "")
                if not video_url:
                    raise ValueError(f"No video URL in result: {result_data}")

                print(f"Video generated successfully: {video_url}")
                return {"url": video_url, "prompt": prompt}

        except Exception as e:
            print(f"Error in generate_video: {e}")
            raise ValueError(f"Video generation failed: {str(e)}")
