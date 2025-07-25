
// api.js
async function sendCpuDataToBackend(algorithm, data, quantum = null) {
    const url = `http://127.0.0.1:5000/api/cpu/${algorithm}`;
    
    const payload = {
        processes: data
    };

    // Add quantum to payload only for Round Robin
    if (algorithm === 'rr' && quantum !== null) {
        payload.quantum = quantum;
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error("Failed to fetch CPU scheduling result");
    }

    const result = await response.json();
    return result;
}
