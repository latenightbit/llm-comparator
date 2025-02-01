# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for your frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/calculate")
async def calculate_cost(request: dict):
    # Safely get token values (default to 0 if not provided)
    input_tokens = max(0, int(request.get("input_tokens", 0)))
    output_tokens = max(0, int(request.get("output_tokens", 0)))
    # Get the list of selected providers (which may include default ones from the frontend)
    providers = request.get("custom_providers", [])
    
    results = []
    # Loop through only the providers that were sent by the front end
    for provider in providers:
        try:
            # Retrieve the cost values from the provider object.
            # (They will match your front-end numbers whether the provider is default or custom.)
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
    
    return results