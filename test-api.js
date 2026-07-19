import fs from 'fs';

async function testGenerateMap() {
    const env = fs.readFileSync('.env', 'utf-8');
    const keyMatch = env.match(/VITE_GEMINI_API_KEY=(.+)/);
    const key = keyMatch[1].trim();
    
    const context = `
            You are the ArenaMind Spatial AI. Generate a structural layout for Estadio Azteca.
            Return a JSON array of exactly 3 to 4 Points of Interest (POIs) that exist in this stadium.
            CRITICAL: You are on a strict token budget. Keep all string fields under 10 words.
            Use realistic coordinates based on a 3D grid where X is -10 to 10, Y is 0 to 5 (height), and Z is -10 to 10.
            Types must be exactly one of: "Entry", "Exit", "Washroom", "Canteen", "Seating", "Medical".
            Return ONLY valid JSON array: [{ "id": "str", "name": "str", "type": "str", "position": [x, y, z] }]
        `;
    const prompt = `Generate 3D POI map for Estadio Azteca`;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: context + "\n\n" + prompt }] }],
        generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
        }
    };
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.error) {
            console.error('API Error:', data.error.message);
        } else {
            const text = data.candidates[0].content.parts[0].text;
            console.log('Raw output:\n', text);
            try {
                const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
                console.log('Parsed successfully:', parsed);
            } catch (e) {
                console.error('JSON Parse Error:', e);
            }
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

testGenerateMap();
