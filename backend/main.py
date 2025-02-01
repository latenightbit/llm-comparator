from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI()

# Enable CORS for your frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint to fetch pricing data from OpenRouter dynamically
@app.get("/pricing")
async def get_pricing():
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://openrouter.ai/api/v1/models")
            data = response.json()
    except Exception as e:
        print("Error fetching OpenRouter pricing:", e)
        return []

    providers = []
    for model in data.get("data", []):
        try:
            prompt_cost = float(model.get("pricing", {}).get("prompt", "0"))
            completion_cost = float(model.get("pricing", {}).get("completion", "0"))
        except ValueError:
            prompt_cost = 0
            completion_cost = 0

        providers.append({
            "name": model.get("name", "Unknown"),
            "model": model.get("id", "Unknown"),
            # Multiply by 1,000,000 because our calculator expects cost per 1M tokens
            "inputCost": prompt_cost * 1_000_000,
            "outputCost": completion_cost * 1_000_000
        })
    return providers

# Calculation endpoint that uses the providers passed from the front end.
@app.post("/calculate")
async def calculate_cost(request: dict):
    # Log the received request for debugging.
    print("Received calculation request:", request)
    
    input_tokens = max(0, int(request.get("input_tokens", 0)))
    output_tokens = max(0, int(request.get("output_tokens", 0)))
    # Expecting the front end to pass a list of providers under "custom_providers"
    providers = request.get("custom_providers", [])
    
    # Log the providers received
    print("Providers for calculation:", providers)
    
    results = []
    for provider in providers:
        try:
            input_rate = float(provider.get("inputCost", 0))
            output_rate = float(provider.get("outputCost", 0))
        except ValueError:
            input_rate = 0
            output_rate = 0

        input_cost = round((input_tokens / 1_000_000) * input_rate, 2)
        output_cost = round((output_tokens / 1_000_000) * output_rate, 2)
        results.append({
            "provider": provider.get("name", "Unknown"),
            "model": provider.get("model", "Unknown"),
            "input_cost": input_cost,
            "output_cost": output_cost,
            "total_cost": round(input_cost + output_cost, 2)
        })
    
    print("Calculation results:", results)
    return results