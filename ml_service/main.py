from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline
from sklearn.metrics.pairwise import cosine_similarity
import uvicorn

import joblib
import os

app = FastAPI(title="FreelanceHub ML Service", description="Machine Learning API for Freelance platform")

MODEL_PATH = "category_model.joblib"

# --- Dummy Data for Category Prediction Model ---
# In a real scenario, this would be loaded from a saved model or retrained less frequently.
category_training_data = [
    ("Need a responsive React website with Tailwind", "Web Development"),
    ("Looking for a logo design for my startup", "Graphic Design"),
    ("Develop a mobile app using Flutter", "Mobile Apps"),
    ("Write SEO optimized blog posts", "Writing"),
    ("Create a REST API using Node.js and MongoDB", "Web Development"),
    ("Design UI/UX for an e-commerce app", "Graphic Design"),
    ("Fix bugs in our iOS Swift app", "Mobile Apps"),
    ("Translate document from English to Spanish", "Writing"),
]

if os.path.exists(MODEL_PATH):
    # Load persisted model
    category_model = joblib.load(MODEL_PATH)
    print("Loaded persisted category model from disk.")
else:
    # Train simple category predictor and persist
    print("Training and persisting category model to disk...")
    X_train = [item[0] for item in category_training_data]
    y_train = [item[1] for item in category_training_data]

    category_model = make_pipeline(TfidfVectorizer(stop_words='english'), MultinomialNB())
    category_model.fit(X_train, y_train)
    joblib.dump(category_model, MODEL_PATH)

# --- Pydantic Models for Requests ---
class CategoryPredictRequest(BaseModel):
    description: str

class Freelancer(BaseModel):
    id: str
    skills: List[str]
    title: str
    category: str
    rating: float = 0.0

class RecommendRequest(BaseModel):
    description: str
    skills: List[str]
    freelancers: List[Freelancer]

# --- Endpoints ---

@app.post("/predict-category")
def predict_category(request: CategoryPredictRequest):
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description is empty")
    
    # Predict category
    predicted_category = category_model.predict([request.description])[0]
    return {"category": predicted_category}

@app.post("/recommend-freelancers")
def recommend_freelancers(request: RecommendRequest):
    if not request.freelancers:
        return {"recommendations": []}

    # Combine project requirements into a single document
    project_text = request.description + " " + " ".join(request.skills)

    # Combine freelancer profiles into documents
    freelancer_texts = []
    for f in request.freelancers:
        # Heavily weight skills in matching
        f_text = f.title + " " + f.category + " " + " ".join(f.skills) * 2 
        freelancer_texts.append(f_text)

    # Vectorize and calculate cosine similarity
    vectorizer = TfidfVectorizer(stop_words='english')
    # Fit on all texts to build vocabulary
    all_texts = [project_text] + freelancer_texts
    try:
        tfidf_matrix = vectorizer.fit_transform(all_texts)
        
        # Calculate similarity between project (index 0) and freelancers (index 1 to N)
        cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        
        # Add similarity scores to freelancers and sort
        results = []
        for i, f in enumerate(request.freelancers):
            score = float(cosine_sim[i])
            # Small boost for rating (optional, making sure not to override similarity completely)
            final_score = score + (f.rating * 0.01)
            results.append({
                "freelancerId": f.id,
                "similarity_score": round(final_score, 4)
            })
            
        # Sort by highest score
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        
        return {"freelancers": results[:5]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
