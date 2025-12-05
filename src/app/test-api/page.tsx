"use client";

import { useEffect, useState } from 'react';

export default function TestAPI() {
    const [apiKeyStatus, setApiKeyStatus] = useState<string>('Checking...');
    const [apiTestResult, setApiTestResult] = useState<string>('Not tested yet');

    useEffect(() => {
        // Check if API key is loaded
        const apiKey = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

        if (apiKey) {
            setApiKeyStatus(`✅ API Key loaded (${apiKey.substring(0, 10)}...)`);
        } else {
            setApiKeyStatus('❌ API Key NOT loaded - check .env.local file');
        }

        // Test API call
        const testAPI = async () => {
            try {
                const headers: HeadersInit = {
                    'Content-Type': 'application/json',
                };

                if (apiKey) {
                    headers['X-Api-Key'] = apiKey;
                }

                const response = await fetch('https://api.pokemontcg.io/v2/cards?page=1&pageSize=1', {
                    headers
                });

                if (response.ok) {
                    const data = await response.json();
                    setApiTestResult(`✅ API Test SUCCESSFUL - Got ${data.data.length} card(s)`);
                } else {
                    setApiTestResult(`❌ API Test FAILED - Status: ${response.status} ${response.statusText}`);
                }
            } catch (error: any) {
                setApiTestResult(`❌ API Test ERROR: ${error.message}`);
            }
        };

        testAPI();
    }, []);

    return (
        <div style={{ padding: '40px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔍 API Diagnostics</h1>

            <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Environment Variable Status:</h2>
                <p style={{ fontSize: '16px' }}>{apiKeyStatus}</p>
            </div>

            <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>API Connection Test:</h2>
                <p style={{ fontSize: '16px' }}>{apiTestResult}</p>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Instructions:</h2>
                <ol style={{ fontSize: '14px', lineHeight: '1.8' }}>
                    <li>Make sure you created <code>.env.local</code> file in the project root</li>
                    <li>Add: <code>NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_api_key_here</code></li>
                    <li>Save the file</li>
                    <li><strong>Restart the dev server</strong> (Stop with Ctrl+C and run <code>npm run dev</code> again)</li>
                    <li>Refresh this page</li>
                </ol>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#3a2a2a', borderRadius: '8px' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px', color: '#ff6b6b' }}>⚠️ Important:</h2>
                <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
                    Environment variables in Next.js are loaded when the dev server starts.
                    If you just created or modified .env.local, you MUST restart the dev server for changes to take effect.
                </p>
            </div>
        </div>
    );
}
