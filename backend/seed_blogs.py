import asyncio
from app.db.session import init_db
from app.models.base_models import Blog, User, Course, Quiz, ChatHistory

async def seed_blogs():
    # Initialize Beanie
    await init_db([User, Blog, Course, Quiz, ChatHistory])
    
    blogs = [
        {
            "title": "Introduction to Python for AI",
            "slug": "python-for-ai-intro",
            "content": "# Python Basics\nPython is the primary language for AI...",
            "category": "Python Basics",
            "tags": ["Python", "Intro"],
            "seo_title": "Python for AI Intro",
            "seo_description": "Start your AI journey with Python basics."
        },
        {
            "title": "Mathematics for Machine Learning",
            "slug": "math-for-ml",
            "content": "# Math in AI\nMatrix multiplication and derivatives are key...",
            "category": "Math",
            "tags": ["Math", "Linear Algebra"],
            "seo_title": "AI Math Guide",
            "seo_description": "Essential math for ML."
        },
        {
            "title": "Mastering NumPy and Pandas",
            "slug": "numpy-pandas-mastery",
            "content": "# Data Manipulation\nUse NumPy for arrays and Pandas for dataframes...",
            "category": "Libraries",
            "tags": ["NumPy", "Pandas"],
            "seo_title": "NumPy & Pandas Guide",
            "seo_description": "Data processing for AI."
        },
        {
            "title": "Deep Dive into Machine Learning",
            "slug": "ml-deep-dive",
            "content": "# ML Fundamentals\nUnderstanding regression and classification...",
            "category": "Machine Learning",
            "tags": ["ML", "Supervised"],
            "seo_title": "ML Deep Dive",
            "seo_description": "Core ML concepts."
        },
        {
            "title": "Neural Networks Explained",
            "slug": "neural-networks-intro",
            "content": "# Deep Learning\nNeurons, layers, and backpropagation...",
            "category": "Deep Learning",
            "tags": ["DL", "Neural Networks"],
            "seo_title": "Neural Networks 101",
            "seo_description": "Intro to Deep Learning."
        },
        {
            "title": "Generative AI and GANs",
            "slug": "gen-ai-gans",
            "content": "# Generative AI\nHow GANs create new images...",
            "category": "Generative AI",
            "tags": ["GenAI", "GANs"],
            "seo_title": "Generative AI Guide",
            "seo_description": "Create with AI."
        },
        {
            "title": "Computer Vision with CNNs",
            "slug": "computer-vision-cnn",
            "content": "# Computer Vision\nConvolutional Neural Networks are amazing for images...",
            "category": "Computer Vision",
            "tags": ["CV", "CNN"],
            "seo_title": "Computer Vision Guide",
            "seo_description": "Vision models with AI."
        },
        {
            "title": "Natural Language Processing Basics",
            "slug": "nlp-basics",
            "content": "# NLP\nFrom tokenization to word embeddings...",
            "category": "NLP",
            "tags": ["NLP", "Text"],
            "seo_title": "NLP 101",
            "seo_description": "Text analysis with AI."
        },
        {
            "title": "Building Large Language Models",
            "slug": "llm-builder-guide",
            "content": "# LLM Engineering\nArchitecture of state-of-the-art transformers...",
            "category": "LLM Builder",
            "tags": ["LLM", "Transformers"],
            "seo_title": "LLM Builder Guide",
            "seo_description": "Build your own LLM."
        }
    ]

    for blog_data in blogs:
        existing = await Blog.find_one(Blog.slug == blog_data["slug"])
        if not existing:
            blog = Blog(**blog_data, is_published=True)
            await blog.insert()
    
    print("Blogs seeded successfully to MongoDB!")

if __name__ == "__main__":
    asyncio.run(seed_blogs())
