# LLM Comparator

A comprehensive tool for comparing and calculating costs across different Large Language Model (LLM) providers. This application helps developers and teams make informed decisions about LLM usage by providing clear cost comparisons and optimization insights.

## Features

- 📊 Unified dashboard for LLM cost calculations
- 💰 Real-time cost estimates across multiple providers
- 🔄 Compare different LLM providers (GPT-4, Claude, Cohere, etc.)
- 📈 Performance benchmarks and model comparisons
- 📚 Comprehensive tutorials and FAQs
- 🔍 Detailed model information including parameters, context size, and licensing
- 💻 Modern React-based UI with responsive design
- 🚀 FastAPI backend for efficient data processing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. Clone the repository
```bash
git clone https://github.com/latenightbit/llm-comparator.git
cd llm-comparator
```

2. Install frontend dependencies
```bash
cd frontend
npm install
```

3. Install backend dependencies
```bash
cd ../backend
pip install fastapi uvicorn httpx
```

### Environment Setup

No additional environment variables are required for basic setup. The application uses default configurations for development.

### Running the Application

1. Start the backend server
```bash
cd backend
uvicorn main:app --reload
```

2. Start the frontend development server
```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## API Documentation

### Endpoints

1. `/pricing` (GET)
   - Fetches real-time pricing data from OpenRouter
   - Returns list of providers with input/output costs

2. `/calculate` (POST)
   - Calculates costs based on input/output tokens
   - Request body: {
     "input_tokens": number,
     "output_tokens": number,
     "custom_providers": array
   }

3. `/benchmark-table` (GET)
   - Returns comprehensive model benchmarks
   - Query parameters:
     - sort_key: Field to sort by
     - direction: "asc" or "desc"

4. `/benchmarks/{model_name}` (GET)
   - Returns specific model benchmark metrics

## Features in Detail

### Cost Calculator
- Real-time cost estimation for multiple providers
- Support for custom provider configurations
- Token-based calculation for both input and output
- Local storage for saving custom configurations

### Benchmark Comparison
- Compare models across multiple metrics:
  - MMLU (Massive Multitask Language Understanding)
  - HumanEval (Code Generation)
  - GPQA (General Purpose Question Answering)
  - DROP (Reading Comprehension)
- Sort and filter capabilities
- Detailed model specifications

### Privacy & Security
- No data storage of queries
- Real-time API calls to official sources
- Local storage for user preferences

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- OpenRouter API for real-time LLM pricing data
- React and FastAPI for the technical stack
- The open-source community for benchmark datasets and metrics