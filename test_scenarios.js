const prompts = [
    'Sudden heavy rain. Fans in open sectors 100-110 are rushing to the Main Concourse for cover.',
    'Complete power loss at South Gate. Turnstiles and scanners are offline.',
    'Temperatures exceeded 100F. 50+ fans in VIP deck reporting heat exhaustion simultaneously.',
    'Ticketless fans attempting to breach North Gate fencing.',
    'Sudden transport strike. South Metro Station is closed indefinitely, 20,000 fans stranded.'
];

async function run() {
    for (let p of prompts) {
const ctx = `You are the ArenaMind Decision Engine.
Simulate the operational consequences of this action: "${p}".
CRITICAL: You are on a strict token budget. Keep every string field under 15 words. Be extremely brief.

You must return a JSON object matching this interface exactly:
{
    "recommendation": "string",
    "reasoning": "string",
    "evidence": ["string"],
    "confidenceScore": number,
    "alternativeActions": ["string"],
    "expectedImpact": "string",
    "risks": ["string"],
    "cost": "string",
    "operationalComplexity": "Low" | "Medium" | "High",
    "affectedPeople": number,
    "recoveryStrategy": "string",
    "estimatedCarbonReductionKg": number
}`;
        
        const payload = {
            contents: [{ role: 'user', parts: [{ text: ctx + '\n\nRun complex decision simulation.' }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        };
        
        console.log('-----------------------------');
        console.log('Testing:', p);
        
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY_HERE`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!res.ok) {
                console.error('HTTP Error:', res.status, await res.text());
                continue;
            }
            
            const data = await res.json();
            const text = data.candidates[0].content.parts[0].text;
            console.log('Finish Reason:', data.candidates[0].finishReason);
            console.log('Raw Output:', text);
            
            try {
                const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
                JSON.parse(clean);
                console.log('✅ SUCCESS JSON PARSE\n');
            } catch (e) {
                console.error('❌ JSON PARSE FAILED:', e.message, '\n');
            }
        } catch (err) {
            console.error('Fetch error:', err.message);
        }
        
        // Add a 2.5 second delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 2500));
    }
}

run();
