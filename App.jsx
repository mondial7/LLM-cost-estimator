import React, { useState, useMemo } from ‘react’;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from ‘@/components/ui/card’;
import { Input } from ‘@/components/ui/input’;
import { Label } from ‘@/components/ui/label’;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from ‘@/components/ui/select’;
import { Slider } from ‘@/components/ui/slider’;
import { Calculator, DollarSign, MessageSquare, Users, ExternalLink, BookOpen } from ‘lucide-react’;

// Configuration object for easy model management
const MODEL_CONFIG = {
‘claude-opus-4’: {
name: ‘Claude Opus 4’,
provider: ‘Anthropic’,
pricing: {
input: 15.00 / 1000000,  // $15 per 1M tokens
output: 75.00 / 1000000  // $75 per 1M tokens
},
docs: {
api: ‘https://docs.anthropic.com’,
pricing: ‘https://www.anthropic.com/pricing’
}
},
‘claude-sonnet-4’: {
name: ‘Claude Sonnet 4’,
provider: ‘Anthropic’,
pricing: {
input: 3.00 / 1000000,   // $3 per 1M tokens
output: 15.00 / 1000000  // $15 per 1M tokens
},
docs: {
api: ‘https://docs.anthropic.com’,
pricing: ‘https://www.anthropic.com/pricing’
}
},
‘claude-3-opus’: {
name: ‘Claude 3 Opus’,
provider: ‘Anthropic’,
pricing: {
input: 15.00 / 1000000,  // $15 per 1M tokens
output: 75.00 / 1000000  // $75 per 1M tokens
},
docs: {
api: ‘https://docs.anthropic.com’,
pricing: ‘https://www.anthropic.com/pricing’
}
},
‘claude-3-sonnet’: {
name: ‘Claude 3 Sonnet’,
provider: ‘Anthropic’,
pricing: {
input: 3.00 / 1000000,   // $3 per 1M tokens
output: 15.00 / 1000000  // $15 per 1M tokens
},
docs: {
api: ‘https://docs.anthropic.com’,
pricing: ‘https://www.anthropic.com/pricing’
}
},
‘claude-3-haiku’: {
name: ‘Claude 3 Haiku’,
provider: ‘Anthropic’,
pricing: {
input: 0.25 / 1000000,   // $0.25 per 1M tokens
output: 1.25 / 1000000   // $1.25 per 1M tokens
},
docs: {
api: ‘https://docs.anthropic.com’,
pricing: ‘https://www.anthropic.com/pricing’
}
},
‘gemini-2.5-pro’: {
name: ‘Gemini 2.5 Pro’,
provider: ‘Google’,
pricing: {
input: 2.50 / 1000000,   // $2.50 per 1M tokens
output: 10.00 / 1000000  // $10.00 per 1M tokens
},
docs: {
api: ‘https://ai.google.dev/gemini-api/docs’,
pricing: ‘https://ai.google.dev/pricing’
}
},
‘gemini-2.5-flash’: {
name: ‘Gemini 2.5 Flash’,
provider: ‘Google’,
pricing: {
input: 0.075 / 1000000,  // $0.075 per 1M tokens
output: 0.30 / 1000000   // $0.30 per 1M tokens
},
docs: {
api: ‘https://ai.google.dev/gemini-api/docs’,
pricing: ‘https://ai.google.dev/pricing’
}
},
‘gpt-4-turbo’: {
name: ‘GPT-4 Turbo’,
provider: ‘OpenAI’,
pricing: {
input: 10.00 / 1000000,  // $10 per 1M tokens
output: 30.00 / 1000000  // $30 per 1M tokens
},
docs: {
api: ‘https://platform.openai.com/docs/api-reference’,
pricing: ‘https://openai.com/pricing’
}
},
‘gpt-3.5-turbo’: {
name: ‘GPT-3.5 Turbo’,
provider: ‘OpenAI’,
pricing: {
input: 0.50 / 1000000,   // $0.50 per 1M tokens
output: 1.50 / 1000000   // $1.50 per 1M tokens
},
docs: {
api: ‘https://platform.openai.com/docs/api-reference’,
pricing: ‘https://openai.com/pricing’
}
}
};

// Use case presets for quick estimation
const USE_CASE_PRESETS = {
‘chatbot’: {
name: ‘Customer Support Chatbot’,
description: ‘AI assistant handling customer inquiries, FAQs, and basic troubleshooting’,
example: ‘Example: E-commerce support bot answering questions about orders, shipping, returns, and product information. Each conversation typically involves 5-10 exchanges.’,
avgInputTokens: 150,
avgOutputTokens: 200,
requestsPerUser: 20
},
‘content’: {
name: ‘Content Generation’,
description: ‘Creating articles, marketing copy, product descriptions, or social media posts’,
example: ‘Example: Marketing platform generating blog posts, email campaigns, and social media content. Users provide brief outlines and receive full content pieces.’,
avgInputTokens: 500,
avgOutputTokens: 1000,
requestsPerUser: 10
},
‘analysis’: {
name: ‘Document Analysis’,
description: ‘Summarizing documents, extracting insights, or analyzing large texts’,
example: ‘Example: Legal tech tool analyzing contracts for key terms, risks, and compliance issues. Processes 5-10 page documents and provides structured summaries.’,
avgInputTokens: 2000,
avgOutputTokens: 500,
requestsPerUser: 5
},
‘code-assistant’: {
name: ‘Code Assistant’,
description: ‘Helping developers write, debug, and refactor code’,
example: ‘Example: IDE plugin that suggests code completions, explains errors, and helps with refactoring. Developers use it throughout their coding sessions.’,
avgInputTokens: 800,
avgOutputTokens: 400,
requestsPerUser: 50
},
‘data-extraction’: {
name: ‘Data Extraction’,
description: ‘Extracting structured data from unstructured sources’,
example: ‘Example: Invoice processing system extracting vendor names, amounts, dates, and line items from PDF invoices for accounting software.’,
avgInputTokens: 1500,
avgOutputTokens: 300,
requestsPerUser: 30
},
‘translation’: {
name: ‘Translation Service’,
description: ‘Translating text between languages with context awareness’,
example: ‘Example: Business communication platform translating emails and documents while preserving tone and technical terminology.’,
avgInputTokens: 400,
avgOutputTokens: 400,
requestsPerUser: 25
},
‘research-assistant’: {
name: ‘Research Assistant’,
description: ‘Helping users find information, answer complex questions, and synthesize research’,
example: ‘Example: Academic tool helping students research topics, find sources, and create comprehensive summaries with citations.’,
avgInputTokens: 300,
avgOutputTokens: 800,
requestsPerUser: 15
},
‘personalization’: {
name: ‘Personalization Engine’,
description: ‘Creating personalized recommendations or customized content’,
example: ‘Example: E-learning platform adapting course content and exercises based on student performance and learning style.’,
avgInputTokens: 600,
avgOutputTokens: 350,
requestsPerUser: 40
},
‘custom’: {
name: ‘Custom Use Case’,
description: ‘Define your own parameters for a specific use case’,
example: ‘Customize the token counts and request frequency based on your specific application needs.’,
avgInputTokens: 0,
avgOutputTokens: 0,
requestsPerUser: 0
}
};

function LLMCostEstimator() {
const [selectedModel, setSelectedModel] = useState(‘claude-sonnet-4’);
const [useCase, setUseCase] = useState(‘chatbot’);
const [monthlyUsers, setMonthlyUsers] = useState(1000);
const [avgInputTokens, setAvgInputTokens] = useState(150);
const [avgOutputTokens, setAvgOutputTokens] = useState(200);
const [requestsPerUser, setRequestsPerUser] = useState(20);

// Update form when use case changes
React.useEffect(() => {
if (useCase !== ‘custom’) {
const preset = USE_CASE_PRESETS[useCase];
setAvgInputTokens(preset.avgInputTokens);
setAvgOutputTokens(preset.avgOutputTokens);
setRequestsPerUser(preset.requestsPerUser);
}
}, [useCase]);

// Calculate costs
const costEstimate = useMemo(() => {
const model = MODEL_CONFIG[selectedModel];
const totalRequests = monthlyUsers * requestsPerUser;
const totalInputTokens = totalRequests * avgInputTokens;
const totalOutputTokens = totalRequests * avgOutputTokens;

```
const inputCost = totalInputTokens * model.pricing.input;
const outputCost = totalOutputTokens * model.pricing.output;
const totalCost = inputCost + outputCost;

return {
  totalRequests,
  totalInputTokens,
  totalOutputTokens,
  inputCost,
  outputCost,
  totalCost,
  costPerUser: totalCost / monthlyUsers,
  costPerRequest: totalCost / totalRequests
};
```

}, [selectedModel, monthlyUsers, avgInputTokens, avgOutputTokens, requestsPerUser]);

const formatCurrency = (amount) => {
return new Intl.NumberFormat(‘en-US’, {
style: ‘currency’,
currency: ‘USD’,
minimumFractionDigits: 2,
maximumFractionDigits: 2
}).format(amount);
};

const formatNumber = (num) => {
return new Intl.NumberFormat(‘en-US’).format(num);
};

return (
<div className="max-w-4xl mx-auto p-6 space-y-6">
<Card>
<CardHeader>
<CardTitle className="flex items-center gap-2">
<Calculator className="w-6 h-6" />
LLM Cost Estimator
</CardTitle>
<CardDescription>
Estimate your monthly costs for using LLM APIs in your application
</CardDescription>
</CardHeader>
</Card>

```
  <div className="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model">LLM Model</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODEL_CONFIG).map(([key, model]) => (
                <SelectItem key={key} value={key}>
                  {model.name} ({model.provider})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="usecase">Use Case</Label>
          <Select value={useCase} onValueChange={setUseCase}>
            <SelectTrigger id="usecase">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(USE_CASE_PRESETS).map(([key, preset]) => (
                <SelectItem key={key} value={key}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {useCase && (
            <div className="mt-2 p-3 bg-muted rounded-md text-sm space-y-1">
              <p className="text-muted-foreground">{USE_CASE_PRESETS[useCase].description}</p>
              <p className="text-xs italic">{USE_CASE_PRESETS[useCase].example}</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Monthly Active Users: {formatNumber(monthlyUsers)}
          </Label>
          <Slider
            id="users"
            value={[monthlyUsers]}
            onValueChange={(value) => setMonthlyUsers(value[0])}
            min={100}
            max={100000}
            step={100}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-tokens">
            Average Input Tokens per Request
          </Label>
          <Input
            id="input-tokens"
            type="number"
            value={avgInputTokens}
            onChange={(e) => setAvgInputTokens(Number(e.target.value))}
            disabled={useCase !== 'custom'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="output-tokens">
            Average Output Tokens per Request
          </Label>
          <Input
            id="output-tokens"
            type="number"
            value={avgOutputTokens}
            onChange={(e) => setAvgOutputTokens(Number(e.target.value))}
            disabled={useCase !== 'custom'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requests" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests per User per Month
          </Label>
          <Input
            id="requests"
            type="number"
            value={requestsPerUser}
            onChange={(e) => setRequestsPerUser(Number(e.target.value))}
            disabled={useCase !== 'custom'}
          />
        </div>
      </CardContent>
    </Card>

    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Monthly Cost Estimate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-3xl font-bold text-primary">
              {formatCurrency(costEstimate.totalCost)}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Input tokens cost:</span>
                <span>{formatCurrency(costEstimate.inputCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Output tokens cost:</span>
                <span>{formatCurrency(costEstimate.outputCost)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-muted-foreground">Cost per user:</span>
                <span>{formatCurrency(costEstimate.costPerUser)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost per request:</span>
                <span>{formatCurrency(costEstimate.costPerRequest)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total requests:</span>
              <span>{formatNumber(costEstimate.totalRequests)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total input tokens:</span>
              <span>{formatNumber(costEstimate.totalInputTokens)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total output tokens:</span>
              <span>{formatNumber(costEstimate.totalOutputTokens)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Model Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Input:</span>
              <span>${(MODEL_CONFIG[selectedModel].pricing.input * 1000000).toFixed(2)} / 1M tokens</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Output:</span>
              <span>${(MODEL_CONFIG[selectedModel].pricing.output * 1000000).toFixed(2)} / 1M tokens</span>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2">
              <a 
                href={MODEL_CONFIG[selectedModel].docs.api} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <BookOpen className="w-4 h-4" />
                API Documentation
                <ExternalLink className="w-3 h-3" />
              </a>
              <a 
                href={MODEL_CONFIG[selectedModel].docs.pricing} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <DollarSign className="w-4 h-4" />
                Official Pricing
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</div>
```

);
}

export default LLMCostEstimator;