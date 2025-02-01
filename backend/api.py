from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenRequest(BaseModel):
    input_tokens: int
    output_tokens: int

# Current pricing (prices per 1M tokens)
LLM_PRICES = [
    {"provider": "OpenAI", "model": "GPT-4", "input": 5.0, "output": 15.0},
    {"provider": "Anthropic", "model": "Claude 3", "input": 0.8, "output": 4.0},
    {"provider": "Google", "model": "Gemini", "input": 3.5, "output": 10.5},
]

@app.post("/calculate")
async def calculate_cost(request: TokenRequest):
    calculations = []
    for model in LLM_PRICES:
        input_cost = (request.input_tokens / 1000000) * model["input"]
        output_cost = (request.output_tokens / 1000000) * model["output"]
        calculations.append({
            "provider": model["provider"],
            "model": model["model"],
            "total_cost": round(input_cost + output_cost, 5),
            "input_cost": round(input_cost, 5),
            "output_cost": round(output_cost, 5)
        })
    return sorted(calculations, key=lambda x: x["total_cost"])
