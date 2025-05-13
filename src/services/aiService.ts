const OPENROUTER_API_KEY = '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';
const MODEL = 'openai/gpt-3.5-turbo-0613';

interface AnalysisResult {
  uaw?: {
    simple?: number;
    average?: number;
    complex?: number;
    total?: number;
  };
  uucw?: {
    simple?: number;
    average?: number;
    complex?: number;
    total?: number;
  };
  tcf?: {
    factors?: {
      id: number;
      value: number;
    }[];
  };
  ef?: {
    factors?: {
      id: number;
      value: number;
    }[];
  };
  explanation?: string;
}

export const aiService = {
  analyzeText: async (text: string): Promise<string> => {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          // 'HTTP-Referer': window.location.origin,
          'HTTP-Referer': 'https://ccdl.netlify.app/',
          'X-Title': 'UCP Calculator'
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          frequency_penalty: 0.5,
          messages: [
            {
              role: 'user',
              content: `You must follow these exact steps to analyze the text:

1. IDENTIFY all actors and categorize them as Simple, Average, or Complex. Count each category.
2. IDENTIFY all use cases and categorize them as Simple, Average, or Complex. Count each category.
3. CALCULATE UAW using EXACTLY this formula: UAW = (Simple Actors × 1) + (Average Actors × 2) + (Complex Actors × 3)
4. CALCULATE UUCW using EXACTLY this formula: UUCW = (Simple Use Cases × 5) + (Average Use Cases × 10) + (Complex Use Cases × 15)
5. Rate each TCF factor from 0 to 5 based on their influence in the text (if present).
6. Rate each EF factor from 0 to 5 based on their influence in the text (if present).

You must create valid JSON with the following structure:
{
  "uaw": {
    "simple": [exact count of simple actors],
    "average": [exact count of average actors],
    "complex": [exact count of complex actors],
    "total": [calculated UAW value using the formula]
  },
  "uucw": {
    "simple": [exact count of simple use cases],
    "average": [exact count of average use cases],
    "complex": [exact count of complex use cases],
    "total": [calculated UUCW value using the formula]
  },
  "tcf": {
    "factors": [
      { "id": 1, "value": [rating 0-5] },
      { "id": 2, "value": [rating 0-5] },
      { "id": 3, "value": [rating 0-5] },
      { "id": 4, "value": [rating 0-5] },
      { "id": 5, "value": [rating 0-5] },
      { "id": 6, "value": [rating 0-5] },
      { "id": 7, "value": [rating 0-5] },
      { "id": 8, "value": [rating 0-5] },
      { "id": 9, "value": [rating 0-5] },
      { "id": 10, "value": [rating 0-5] },
      { "id": 11, "value": [rating 0-5] },
      { "id": 12, "value": [rating 0-5] },
      { "id": 13, "value": [rating 0-5] }
    ]
  },
  "ef": {
    "factors": [
      { "id": 1, "value": [rating 0-5] },
      { "id": 2, "value": [rating 0-5] },
      { "id": 3, "value": [rating 0-5] },
      { "id": 4, "value": [rating 0-5] },
      { "id": 5, "value": [rating 0-5] },
      { "id": 6, "value": [rating 0-5] },
      { "id": 7, "value": [rating 0-5] },
      { "id": 8, "value": [rating 0-5] }
    ]
  }
}

After the JSON, please provide a detailed "Calculations:" section showing your step-by-step calculations for UAW and UUCW. Include your reasoning for categorizing each actor and use case. This explanation will be shown to the user to help them understand your analysis.

TCF factors are:
1. Distributed System
2. Response Time/Performance
3. End-User Efficiency
4. Complex Internal Processing
5. Reusability
6. Easy to Install
7. Easy to Use
8. Portability
9. Easy to Change
10. Concurrency
11. Special Security Features
12. Provide Direct Access for Third Parties
13. Special User Training Facilities

EF factors are:
1. Familiarity with Project
2. Application Experience
3. Object-Oriented Experience
4. Lead Analyst Capability
5. Motivation
6. Stable Requirements
7. Part-Time Staff
8. Difficult Programming Language

Here's the text to analyze: ${text}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  },
  analyzeImage: async (image: File): Promise<string> => {
    try {
      const base64Image = await fileToBase64(image);
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          // 'HTTP-Referer': window.location.origin,
          'HTTP-Referer': 'https://ccdl.netlify.app/',
          'X-Title': 'UCP Calculator'
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          frequency_penalty: 0.5,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You must follow these exact steps to analyze the image:

1. IDENTIFY all actors and categorize them as Simple, Average, or Complex. Count each category.
2. IDENTIFY all use cases and categorize them as Simple, Average, or Complex. Count each category.
3. CALCULATE UAW using EXACTLY this formula: UAW = (Simple Actors × 1) + (Average Actors × 2) + (Complex Actors × 3)
4. CALCULATE UUCW using EXACTLY this formula: UUCW = (Simple Use Cases × 5) + (Average Use Cases × 10) + (Complex Use Cases × 15)
5. Rate each TCF factor from 0 to 5 based on their influence in the image (if present).
6. Rate each EF factor from 0 to 5 based on their influence in the image (if present).

You must create valid JSON with the following structure:
{
  "uaw": {
    "simple": [exact count of simple actors],
    "average": [exact count of average actors],
    "complex": [exact count of complex actors],
    "total": [calculated UAW value using the formula]
  },
  "uucw": {
    "simple": [exact count of simple use cases],
    "average": [exact count of average use cases],
    "complex": [exact count of complex use cases],
    "total": [calculated UUCW value using the formula]
  },
  "tcf": {
    "factors": [
      { "id": 1, "value": [rating 0-5] },
      { "id": 2, "value": [rating 0-5] },
      { "id": 3, "value": [rating 0-5] },
      { "id": 4, "value": [rating 0-5] },
      { "id": 5, "value": [rating 0-5] },
      { "id": 6, "value": [rating 0-5] },
      { "id": 7, "value": [rating 0-5] },
      { "id": 8, "value": [rating 0-5] },
      { "id": 9, "value": [rating 0-5] },
      { "id": 10, "value": [rating 0-5] },
      { "id": 11, "value": [rating 0-5] },
      { "id": 12, "value": [rating 0-5] },
      { "id": 13, "value": [rating 0-5] }
    ]
  },
  "ef": {
    "factors": [
      { "id": 1, "value": [rating 0-5] },
      { "id": 2, "value": [rating 0-5] },
      { "id": 3, "value": [rating 0-5] },
      { "id": 4, "value": [rating 0-5] },
      { "id": 5, "value": [rating 0-5] },
      { "id": 6, "value": [rating 0-5] },
      { "id": 7, "value": [rating 0-5] },
      { "id": 8, "value": [rating 0-5] }
    ]
  }
}

After the JSON, please provide a detailed "Calculations:" section showing your step-by-step calculations for UAW and UUCW. Include your reasoning for categorizing each actor and use case. This explanation will be shown to the user to help them understand your analysis.

TCF factors are:
1. Distributed System
2. Response Time/Performance
3. End-User Efficiency
4. Complex Internal Processing
5. Reusability
6. Easy to Install
7. Easy to Use
8. Portability
9. Easy to Change
10. Concurrency
11. Special Security Features
12. Provide Direct Access for Third Parties
13. Special User Training Facilities

EF factors are:
1. Familiarity with Project
2. Application Experience
3. Object-Oriented Experience
4. Lead Analyst Capability
5. Motivation
6. Stable Requirements
7. Part-Time Staff
8. Difficult Programming Language`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  },
  parseAnalysisFromText: (text: string): AnalysisResult | null => {
    try {
      console.log("Processing text:", text);

      // First extract the JSON part
      let jsonData: AnalysisResult | null = null;
      let explanation = '';

      // Extract explanation first for later use
      const calculationMatch = text.match(/(?:calculations?|explanation|thinking|reasoning)(?:\s*:|[^\w]*?\n)([\s\S]+?)(?=```|\{|$)/i);
      if (calculationMatch && calculationMatch[1]) {
        explanation = calculationMatch[1].trim();
      }

      // First attempt: try to extract and fix the entire JSON structure
      // Look for a pattern that resembles JSON structure with our expected keys
      const fullJsonPattern = /\{[\s\S]*?"uaw"[\s\S]*?"uucw"[\s\S]*?(?:"tcf"[\s\S]*?)?(?:"ef"[\s\S]*?)?\}/;
      const jsonMatch = text.match(fullJsonPattern);

      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log("Found potential JSON structure:", jsonStr);

        // Clean and normalize the JSON
        // 1. Fix common spacing issues
        const cleanedJsonStr = jsonStr.replace(/\s+(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ' ');

        // 2. Fix quotes (ensure property names are quoted)
        const quotedJsonStr = cleanedJsonStr.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');

        // 3. Fix extra commas before closing brackets
        const normalizedJsonStr = quotedJsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

        // 4. Try to extract and combine misplaced EF section if it exists outside main object
        const efSectionPattern = /\{\s*"ef"\s*:\s*\{[\s\S]*?\}\s*\}/;
        const efMatch = text.match(efSectionPattern);

        try {
          const result = JSON.parse(normalizedJsonStr);

          // Check if we found a separate EF section and the main JSON doesn't have one
          if (efMatch && !result.ef) {
            try {
              const efSection = JSON.parse(efMatch[0]);
              if (efSection.ef) {
                result.ef = efSection.ef;
                console.log("Merged separate EF section");
              }
            } catch (efError) {
              console.error("Failed to parse separate EF section:", efError);
            }
          }

          // Normalize the result
          jsonData = normalizeAnalysisResult(result);
          console.log("Successfully parsed fixed JSON");
        } catch (parseError) {
          console.error("Failed to parse fixed JSON:", parseError, "with string:", normalizedJsonStr);
        }
      }

      // If the above approach failed, try the more granular approach with code blocks
      if (!jsonData) {
        console.log("Trying code block approach");
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);

        if (jsonMatch && jsonMatch[1]) {
          const jsonStr = jsonMatch[1].trim();
          console.log("Found JSON in code block:", jsonStr);
          try {
            const result = JSON.parse(jsonStr);
            jsonData = normalizeAnalysisResult(result);
          } catch (parseError) {
            console.error("Error parsing JSON from code block:", parseError);
          }
        }
      }

      // If all previous methods failed, try the character-by-character approach
      if (!jsonData) {
        console.log("Trying character-by-character JSON parsing");
        // If no code block found or parsing failed, try to find JSON object with curly braces
        let openBrace = -1;
        let closeBrace = -1;
        let braceCount = 0;
        let inString = false;
        let escapeNext = false;

        // More robust JSON extraction algorithm
        for (let i = 0; i < text.length; i++) {
          const char = text[i];

          if (escapeNext) {
            escapeNext = false;
            continue;
          }

          if (char === '\\') {
            escapeNext = true;
            continue;
          }

          if (char === '"' && !escapeNext) {
            inString = !inString;
            continue;
          }

          if (inString) continue;

          if (char === '{') {
            if (braceCount === 0) {
              openBrace = i;
            }
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              closeBrace = i;

              // Found a complete JSON object
              const jsonCandidate = text.substring(openBrace, closeBrace + 1);

              try {
                // Check if this is a valid JSON with expected structure
                const parsed = JSON.parse(jsonCandidate);
                if (parsed.uaw || parsed.uucw || parsed.tcf || parsed.ef) {
                  console.log("Found valid JSON structure:", jsonCandidate);
                  jsonData = normalizeAnalysisResult(parsed);
                  break;
                }
              } catch (e) {
                // Continue searching if this wasn't valid JSON
                console.log("Invalid JSON, continuing search");
              }

              // Reset to continue searching
              openBrace = -1;
              closeBrace = -1;
            }
          }
        }

        // If we found potential JSON but failed to parse it, try to fix it
        if (openBrace !== -1 && closeBrace !== -1 && !jsonData) {
          const jsonStr = text.substring(openBrace, closeBrace + 1);
          console.log("Attempting to repair JSON:", jsonStr);

          try {
            // Fix potentially invalid JSON by ensuring proper quotes
            const fixedJson = jsonStr.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
            const result = JSON.parse(fixedJson);
            jsonData = normalizeAnalysisResult(result);
          } catch (parseError) {
            console.error("Error parsing repaired JSON:", parseError);
          }
        }
      }

      // Special case: attempt to parse individual sections if complete JSON parsing failed
      if (!jsonData) {
        console.log("Attempting to parse individual sections");
        jsonData = {};

        // Try to extract UAW section
        const uawPattern = /"uaw"\s*:\s*{[^}]*}/;
        const uawMatch = text.match(uawPattern);
        if (uawMatch) {
          try {
            const uawJson = JSON.parse(`{${uawMatch[0]}}`);
            if (uawJson.uaw) {
              jsonData.uaw = {
                simple: convertToNumber(uawJson.uaw.simple),
                average: convertToNumber(uawJson.uaw.average),
                complex: convertToNumber(uawJson.uaw.complex),
                total: convertToNumber(uawJson.uaw.total)
              };
              console.log("Extracted UAW section:", jsonData.uaw);
            }
          } catch (e) {
            console.error("Failed to parse UAW section");
          }
        }

        // Try to extract UUCW section
        const uucwPattern = /"uucw"\s*:\s*{[^}]*}/;
        const uucwMatch = text.match(uucwPattern);
        if (uucwMatch) {
          try {
            const uucwJson = JSON.parse(`{${uucwMatch[0]}}`);
            if (uucwJson.uucw) {
              jsonData.uucw = {
                simple: convertToNumber(uucwJson.uucw.simple),
                average: convertToNumber(uucwJson.uucw.average),
                complex: convertToNumber(uucwJson.uucw.complex),
                total: convertToNumber(uucwJson.uucw.total)
              };
              console.log("Extracted UUCW section:", jsonData.uucw);
            }
          } catch (e) {
            console.error("Failed to parse UUCW section");
          }
        }

        // If we didn't parse any sections successfully, reset to null
        if (!jsonData.uaw && !jsonData.uucw) {
          jsonData = null;
        }
      }

      // If we found JSON data, add the explanation
      if (jsonData) {
        // Special handling for malformed EF section, which often happens in AI responses
        if (!jsonData.ef || (jsonData.ef && (!jsonData.ef.factors || jsonData.ef.factors.length === 0))) {
          console.log("No EF factors found in primary JSON, looking for standalone EF section");

          // Look for a standalone EF section in the text
          const efPattern = /\{\s*["']?ef["']?\s*:\s*\{["']?factors["']?\s*:\s*\[\s*\{.*?\}\s*\]\s*\}\s*\}/i;
          const efMatch = text.match(efPattern);

          if (efMatch) {
            try {
              console.log("Found potential standalone EF section:", efMatch[0]);
              // Clean up the found string to make it valid JSON
              let efString = efMatch[0].replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');
              efString = efString.replace(/\s+/g, ' ').trim();

              const efData = JSON.parse(efString);
              if (efData.ef && efData.ef.factors) {
                console.log("Successfully parsed standalone EF section");
                jsonData.ef = {
                  factors: efData.ef.factors.map((factor: any) => {
                    // Clean up factor IDs and values
                    const id = factor.id;
                    const value = factor.value;

                    // If id is a string, clean it up
                    if (typeof id === 'string') {
                      const cleanedId = parseInt(id.replace(/\s+/g, '').replace(/[^\d]/g, ''));
                      return {
                        id: isNaN(cleanedId) ? 0 : cleanedId,
                        value: isNaN(value) ? 0 : parseFloat(value.replace(/\s+/g, ''))
                      };
                    }

                    return {
                      id: isNaN(id) ? 0 : id,
                      value: isNaN(value) ? 0 : parseFloat(value.replace(/\s+/g, ''))
                    };
                  })
                };
              }
            } catch (e) {
              console.error("Failed to parse standalone EF section:", e);
            }
          } else {
            // Try to extract individual EF factors
            console.log("Looking for individual EF factors");
            const factorPattern = /\{\s*["']?\s*id\s*["']?\s*:\s*(\d+)\s*,\s*["']?\s*value\s*["']?\s*:\s*(\d+)\s*\}/g;
            const factors = [];
            let match;

            while ((match = factorPattern.exec(text)) !== null) {
              factors.push({
                id: parseInt(match[1]),
                value: parseInt(match[2])
              });
            }

            if (factors.length > 0) {
              console.log("Found individual EF factors:", factors);
              jsonData.ef = { factors };
            }
          }
        }

        // Add explanation from earlier or try to extract it if not already done
        if (!explanation && !jsonData.explanation) {
          // Try to extract explanation
          const explanationPattern = /(?:calculations?|explanation|thinking|reasoning)(?:\s*:|[^\w]*?\n)([\s\S]+?)(?=$)/i;
          const match = text.match(explanationPattern);
          if (match && match[1]) {
            explanation = match[1].trim();
          } else {
            // If no specific explanation section, use everything after the JSON
            const jsonEndPos = text.lastIndexOf('}') + 1;
            if (jsonEndPos > 0 && jsonEndPos < text.length) {
              explanation = text.substring(jsonEndPos).trim();
            }
          }
        }

        jsonData.explanation = explanation || jsonData.explanation;
        console.log("Final JSON data with explanation:", jsonData);
      } else {
        console.error("No valid JSON found in text");
      }

      return jsonData;
    } catch (error) {
      console.error('Failed to parse JSON from text:', error);
      return null;
    }
  }
};

// Helper function to normalize analysis results
function normalizeAnalysisResult(data: any): AnalysisResult {
  const result: AnalysisResult = {};

  // Normalize UAW values
  if (data.uaw) {
    result.uaw = {
      simple: convertToNumber(data.uaw.simple),
      average: convertToNumber(data.uaw.average),
      complex: convertToNumber(data.uaw.complex),
      total: convertToNumber(data.uaw.total)
    };
  }

  // Normalize UUCW values
  if (data.uucw) {
    result.uucw = {
      simple: convertToNumber(data.uucw.simple),
      average: convertToNumber(data.uucw.average),
      complex: convertToNumber(data.uucw.complex),
      total: convertToNumber(data.uucw.total)
    };
  }

  // Normalize TCF factors
  if (data.tcf && data.tcf.factors) {
    // Ensure factors is an array
    const factorsArray = Array.isArray(data.tcf.factors)
      ? data.tcf.factors
      : Object.values(data.tcf.factors);

    result.tcf = {
      factors: factorsArray.map((factor: any) => {
        // Handle malformed factor IDs and values
        const id = factor.id;
        const value = factor.value;

        // Clean up ID if it's a string with non-numeric characters
        if (typeof id === 'string') {
          const cleanedId = parseInt(id.replace(/\s+/g, '').replace(/[^\d]/g, ''));
          return {
            id: isNaN(cleanedId) ? 0 : cleanedId,
            value: convertToNumber(value)
          };
        }

        // Handle value, which might be a string with spaces or other characters
        if (typeof value === 'string') {
          const cleanedValue = parseFloat(value.replace(/\s+/g, ''));
          return {
            id: isNaN(id) ? 0 : id,
            value: convertToNumber(cleanedValue)
          };
        }

        return {
          id: isNaN(Number(id)) ? 0 : Number(id),
          value: convertToNumber(value)
        };
      }).filter((factor: any) => factor.id > 0 && factor.id <= 13) // Only keep valid factor IDs
    };
  }

  // Normalize EF factors
  if (data.ef && data.ef.factors) {
    // Ensure factors is an array
    const factorsArray = Array.isArray(data.ef.factors)
      ? data.ef.factors
      : Object.values(data.ef.factors);

    result.ef = {
      factors: factorsArray.map((factor: any) => {
        // Handle malformed factor IDs and values
        const id = factor.id;
        const value = factor.value;

        // Clean up ID if it's a string with non-numeric characters
        if (typeof id === 'string') {
          const cleanedId = parseInt(id.replace(/\s+/g, '').replace(/[^\d]/g, ''));
          return {
            id: isNaN(cleanedId) ? 0 : cleanedId,
            value: convertToNumber(value)
          };
        }

        // Handle value, which might be a string with spaces or other characters
        if (typeof value === 'string') {
          const cleanedValue = parseFloat(value.replace(/\s+/g, ''));
          return {
            id: isNaN(id) ? 0 : id,
            value: convertToNumber(cleanedValue)
          };
        }

        return {
          id: isNaN(Number(id)) ? 0 : Number(id),
          value: convertToNumber(value)
        };
      }).filter((factor: any) => factor.id > 0 && factor.id <= 8) // Only keep valid factor IDs
    };
  }

  console.log("Normalized result:", result);
  return result;
}

// Helper function to convert various value formats to numbers
function convertToNumber(value: any): number {
  if (value === undefined || value === null) return 0;

  if (typeof value === 'number') return value;

  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point
    const numStr = value.replace(/[^\d.-]/g, '');
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : num;
  }

  return 0;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
} 