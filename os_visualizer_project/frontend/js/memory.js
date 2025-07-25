
//memory.js
function showAlgo(id, event) {
    document.querySelectorAll('.algo-section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(id).classList.add('active');
    event.target.classList.add('active');
}
async function runAlgorithm(algorithm, frames, referenceString, outputId) {
    try {
        const response = await fetch(`http://127.0.0.1:5000/api/${algorithm}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                frames: parseInt(frames),
                reference_string: referenceString.split(",").map(Number),
            }),
        });

        const result = await response.json();

        console.log("API Result:", result);  // 🔍 ADD THIS

        // Display page faults
        document.getElementById(`${algorithm}-faults`).textContent = `Page Faults: ${result.page_faults}`;

        // Draw chart
        drawChart(`${algorithm}-memory-chart`, result.frame_states);

    } catch (error) {
        console.error("Full Error:", error);
        document.getElementById(outputId).innerHTML = `<p style="color:red;">Error: ${error.message}</p>`;
    }
}


function runFIFO() {
    const frames = document.getElementById("fifo-frames").value;
    const refString = document.getElementById("fifo-reference").value;
    runAlgorithm("fifo", frames, refString, "fifo-output");
}

function runLRU() {
    const frames = document.getElementById("lru-frames").value;
    const refString = document.getElementById("lru-reference").value;
    runAlgorithm("lru", frames, refString, "lru-output");
}

function runOptimal() {
    const frames = document.getElementById("optimal-frames").value;
    const refString = document.getElementById("optimal-reference").value;
    runAlgorithm("optimal", frames, refString, "optimal-output");
}
//new code
let chartInstances = {};  // Global chart registry

function drawChart(canvasId, frameStates) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();  // destroy old chart before redrawing
    }

    const labels = frameStates.map((_, i) => `Step ${i + 1}`);
    const datasets = [];

    const numFrames = Math.max(...frameStates.map(fs => fs.length));

    for (let frameIndex = 0; frameIndex < numFrames; frameIndex++) {
        const data = frameStates.map(state => state[frameIndex] !== undefined ? state[frameIndex] : null);
        datasets.push({
            label: `Frame ${frameIndex + 1}`,
            data: data,
            borderColor: getRandomColor(),
            fill: false,
            tension: 0.1
        });
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}


function getRandomColor() {
    return `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;
}

