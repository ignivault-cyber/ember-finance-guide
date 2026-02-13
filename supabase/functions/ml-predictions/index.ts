import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { financialContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a financial ML analysis engine. Given a user's financial data, you MUST return predictions using the provided tool. Analyze the data carefully and provide realistic, data-driven predictions.

Key analysis rules:
- Default risk: Use DTI ratio, EMI burden, emergency fund adequacy, and loan mix to estimate probability (0-100)
- Credit score: Estimate CIBIL-equivalent score (300-900) based on debt patterns, payment capacity, utilization
- Repayment optimization: Calculate optimal monthly allocation across loans considering rates and balances
- Anomaly detection: Flag any unusual patterns in expenses vs income, high-rate loans, low savings

Be precise with numbers. Use the actual financial data provided.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this financial profile and return ML predictions:\n${JSON.stringify(financialContext, null, 2)}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_ml_predictions",
              description: "Return structured ML prediction results for the financial profile",
              parameters: {
                type: "object",
                properties: {
                  defaultRisk: {
                    type: "object",
                    properties: {
                      probability: { type: "number", description: "Default probability 0-100" },
                      riskLevel: { type: "string", enum: ["low", "moderate", "high", "critical"] },
                      keyFactors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            factor: { type: "string" },
                            impact: { type: "string", enum: ["positive", "negative", "neutral"] },
                            weight: { type: "number", description: "How much this factor contributes 0-1" }
                          },
                          required: ["factor", "impact", "weight"]
                        }
                      },
                      recommendation: { type: "string" }
                    },
                    required: ["probability", "riskLevel", "keyFactors", "recommendation"]
                  },
                  creditScore: {
                    type: "object",
                    properties: {
                      estimated: { type: "number", description: "Estimated CIBIL score 300-900" },
                      range: {
                        type: "object",
                        properties: {
                          low: { type: "number" },
                          high: { type: "number" }
                        },
                        required: ["low", "high"]
                      },
                      category: { type: "string", enum: ["poor", "fair", "good", "very_good", "excellent"] },
                      factors: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            score: { type: "number", description: "Factor score 0-100" },
                            status: { type: "string", enum: ["excellent", "good", "fair", "poor"] }
                          },
                          required: ["name", "score", "status"]
                        }
                      },
                      improvementTips: { type: "array", items: { type: "string" } }
                    },
                    required: ["estimated", "range", "category", "factors", "improvementTips"]
                  },
                  repaymentOptimizer: {
                    type: "object",
                    properties: {
                      strategy: { type: "string", enum: ["avalanche", "snowball", "hybrid"] },
                      reason: { type: "string" },
                      allocations: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            loanName: { type: "string" },
                            currentEMI: { type: "number" },
                            suggestedEMI: { type: "number" },
                            priority: { type: "number", description: "1 = highest priority" },
                            interestSaved: { type: "number" },
                            monthsSaved: { type: "number" }
                          },
                          required: ["loanName", "currentEMI", "suggestedEMI", "priority", "interestSaved", "monthsSaved"]
                        }
                      },
                      totalInterestSaved: { type: "number" },
                      totalMonthsSaved: { type: "number" }
                    },
                    required: ["strategy", "reason", "allocations", "totalInterestSaved", "totalMonthsSaved"]
                  },
                  anomalies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["spending", "debt", "savings", "income"] },
                        severity: { type: "string", enum: ["info", "warning", "critical"] },
                        title: { type: "string" },
                        description: { type: "string" },
                        metric: { type: "string" },
                        value: { type: "string" },
                        benchmark: { type: "string" }
                      },
                      required: ["type", "severity", "title", "description", "metric", "value", "benchmark"]
                    }
                  }
                },
                required: ["defaultRisk", "creditScore", "repaymentOptimizer", "anomalies"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "return_ml_predictions" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "ML service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "ML model returned no predictions" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const predictions = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(predictions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ML prediction error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
