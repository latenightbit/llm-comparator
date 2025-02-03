from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pathlib import Path
import json

app = FastAPI()

# Enable CORS for your frontend running on localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the path to your benchmarks folder.
# (Assumes main.py is in backend/ and the data folder is a sibling of backend/)
BENCHMARKS_PATH = Path(__file__).parent.parent / "data" / "benchmarks"

def get_benchmarks(model_name: str):
    """
    Search through the models folder and return the qualitative_metrics for a model 
    whose "name" matches (case-insensitive).
    """
    for vendor_dir in (BENCHMARKS_PATH / "models").iterdir():
        for model_dir in vendor_dir.iterdir():
            json_path = model_dir / "model.json"
            if json_path.exists():
                with open(json_path, "r") as f:
                    data = json.load(f)
                if data.get("name", "").lower() == model_name.lower():
                    return data.get("qualitative_metrics", [])
    return []

@app.get("/pricing")
async def get_pricing():
    """
    Fetch pricing data from OpenRouter.
    """
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
            # Multiply by 1,000,000 because our calculator expects cost per 1M tokens.
            "inputCost": prompt_cost * 1_000_000,
            "outputCost": completion_cost * 1_000_000
        })
    return providers

@app.post("/calculate")
async def calculate_cost(request: dict):
    """
    Given input/output token counts and a list of provider objects (sent as "custom_providers"),
    calculate and return the cost for each provider.
    """
    print("Received calculation request:", request)
    
    input_tokens = max(0, int(request.get("input_tokens", 0)))
    output_tokens = max(0, int(request.get("output_tokens", 0)))
    providers = request.get("custom_providers", [])
    
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

@app.get("/benchmarks/{model_name}")
async def get_model_benchmarks(model_name: str):
    """
    Return qualitative_metrics for a given model.
    """
    return get_benchmarks(model_name)

@app.get("/benchmark-table")
async def get_benchmark_table(
    sort_key: str = Query("name", description="Sort by key (e.g., organization, name, license, parameters, context, inputCost, outputCost, GPQA, MMLU, MMLUPro, DROP, HumanEval, multimodal)"),
    direction: str = Query("desc", description="Sort direction: 'asc' or 'desc'")
):
    """
    Scans the benchmarks/models folder and returns a list of benchmark objects.
    For each benchmark object, an "organization" field is added (inferred from the vendor folder).
    Also, this endpoint fetches OpenRouter pricing data and, if a matching pricing record is found
    (matched by model name, case-insensitive), it overrides the benchmark's inputCost and outputCost.
    Finally, the benchmark objects are sorted based on the query parameters.
    """
    # Scan the benchmarks folder.
    benchmarks = []
    models_path = BENCHMARKS_PATH / "models"
    for vendor_dir in models_path.iterdir():
        if vendor_dir.is_dir():
            organization = vendor_dir.name.capitalize()
            for model_dir in vendor_dir.iterdir():
                if model_dir.is_dir():
                    json_path = model_dir / "model.json"
                    if json_path.exists():
                        with open(json_path, "r") as f:
                            data = json.load(f)
                        data["organization"] = organization
                        benchmarks.append(data)
    
    # Fetch OpenRouter pricing data.
    pricing = []
    try:
        async with httpx.AsyncClient() as client:
            pricing_response = await client.get("https://openrouter.ai/api/v1/models")
            pricing_json = pricing_response.json()
            pricing = pricing_json.get("data", [])
    except Exception as e:
        print("Error fetching OpenRouter pricing in benchmark-table:", e)
    
    # Build a dictionary keyed by pricing name (lowercase).
    pricing_dict = { rec.get("name", "").lower(): rec for rec in pricing }
    
    # Override benchmark inputCost/outputCost if pricing data is available.
    for bench in benchmarks:
        bench_name = bench.get("name", "").lower()
        if bench_name in pricing_dict:
            rec = pricing_dict[bench_name]
            try:
                prompt_cost = float(rec.get("pricing", {}).get("prompt", "0"))
                completion_cost = float(rec.get("pricing", {}).get("completion", "0"))
            except ValueError:
                prompt_cost = 0
                completion_cost = 0
            bench["inputCost"] = prompt_cost * 1_000_000
            bench["outputCost"] = completion_cost * 1_000_000

    # Helper: determine a sort value from a benchmark object given a key.
    def get_sort_value(bench, key):
        if key == "organization":
            return bench.get("organization", "").lower()
        if key == "name":
            return bench.get("name", "").lower()
        if key == "license":
            return bench.get("license", "").lower()
        if key == "parameters":
            return bench.get("param_count", 0)
        if key == "context":
            return bench.get("input_context_size", 0)
        if key == "inputCost":
            return bench.get("inputCost", 0)
        if key == "outputCost":
            return bench.get("outputCost", 0)
        if key in ["GPQA", "MMLU", "MMLUPro", "DROP", "HumanEval"]:
            metrics = bench.get("qualitative_metrics", [])
            for m in metrics:
                if m.get("dataset_name", "").lower() == key.lower():
                    return m.get("score", 0)
            return 0
        if key == "multimodal":
            return 1 if bench.get("multimodal") else 0
        return ""
    
    # Determine sort direction.
    reverse = True if direction.lower() == "desc" else False
    benchmarks.sort(key=lambda b: get_sort_value(b, sort_key), reverse=reverse)

    return benchmarks