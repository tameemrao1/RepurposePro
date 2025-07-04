// Test OpenRouter API
const OPENROUTER_API_KEY = "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";

async function testOpenRouterAPI() {
  try {
    console.log("Testing OpenRouter API...");
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://repurpose-pro.vercel.app",
        "X-Title": "Repurpose Pro",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free",
        messages: [
          {
            role: "user",
            content: "Hello, this is a test message. Please respond with a short greeting."
          }
        ],
        max_tokens: 50,
        temperature: 0.7
      })
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("API response:", JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error("Error testing OpenRouter API:", error);
    throw error;
  }
}

// Run the test
testOpenRouterAPI()
  .then(() => console.log("Test completed successfully"))
  .catch((error) => console.error("Test failed:", error));