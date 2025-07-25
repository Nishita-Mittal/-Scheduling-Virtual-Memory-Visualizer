//cpu.js
        function showAlgo(id) {
            document.querySelectorAll('.algo-section').forEach(section => {
                section.classList.remove('active');
            });

            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });

            document.getElementById(id).classList.add('active');
            event.target.classList.add('active');
        }
        function addRow(tbodyId) {
            const tbody = document.getElementById(tbodyId);

            const tr = document.createElement('tr');
            
            const tdProcess = document.createElement('td');
            tr.appendChild(tdProcess);

            const tdArrival = document.createElement('td');
            const arrivalInput = document.createElement('input');
            arrivalInput.type = 'number';
            arrivalInput.value = '0';
            arrivalInput.min = '0';
            tdArrival.appendChild(arrivalInput);
            tr.appendChild(tdArrival);

            const tdBurst = document.createElement('td');
            const burstInput = document.createElement('input');
            burstInput.type = 'number';
            burstInput.value = '1';
            burstInput.min = '1';
            tdBurst.appendChild(burstInput);
            tr.appendChild(tdBurst);

            if (tbodyId === 'priority-tbody') {
                const tdPriority = document.createElement('td');
                const priorityInput = document.createElement('input');
                priorityInput.type = 'number';
                priorityInput.value = '1';
                priorityInput.min = '1';
                tdPriority.appendChild(priorityInput);
                tr.appendChild(tdPriority);
            }

            const tdAction = document.createElement('td');
            const delButton = document.createElement('button');
            delButton.textContent = '❌';
            delButton.onclick = function() { deleteRow(this, tbodyId); };
            tdAction.appendChild(delButton);
            tr.appendChild(tdAction);

    tbody.appendChild(tr);

    renumberProcesses(tbodyId);
}

function deleteRow(button, tbodyId) {
    const row = button.parentNode.parentNode;
    row.remove();
    renumberProcesses(tbodyId);
}

function renumberProcesses(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    const rows = tbody.rows;

    for (let i = 0; i < rows.length; i++) {
        rows[i].cells[0].textContent = 'P' + (i + 1);
    }
}

function collectCpuData(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    const rows = tbody.querySelectorAll("tr");

    const data = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        const process = cells[0].textContent;
        const arrivalTime = parseInt(cells[1].querySelector("input").value);
        const burstTime = parseInt(cells[2].querySelector("input").value);

        if (tbodyId === 'priority-tbody') {
            const priority = parseInt(cells[3].querySelector("input").value);
            data.push({ process, arrivalTime, burstTime, priority });
        } else {
            data.push({ process, arrivalTime, burstTime });
        }
    });

    return data;
}


function runCpuAlgorithm(algorithm, tbodyId) {
    const processData = collectCpuData(tbodyId);
    let quantum = null;
    if (algorithm === 'rr') {
        const quantumInput = document.getElementById("quantum");
    if (!quantumInput) {
        alert("Please provide a Quantum input field with id='quantum'");
        return;
    }
    quantum = parseInt(quantumInput.value);
}
    // Send the data to backend using a function from api.js
    sendCpuDataToBackend(algorithm, processData,quantum)
        .then(result => {
                    console.log("Backend Result:", result);
                    const avgTatElem = document.getElementById(`avg-tat-${algorithm}`);
                    const avgWtElem = document.getElementById(`avg-wt-${algorithm}`);


        if (avgTatElem && avgWtElem) {
           avgTatElem.textContent = `Average TAT: ${result.average_tat.toFixed(2)}`;
            avgWtElem.textContent = `Average WT: ${result.average_wt.toFixed(2)}`;

        } else {
            console.warn(`Missing average display elements for ${algorithm}`);
        }
           renderGanttChart(algorithm, result.gantt_chart, `${algorithm}-gantt-chart`, quantum);
            
        })
        
        .catch(error => {
            console.error("Error:", error);
            alert("Failed to fetch CPU scheduling result. Is Flask running?");
        });
}


// cpu.js
// Assuming sendCpuDataToBackend is already imported or available globally
function renderGanttChart(algorithm, ganttData, canvasId) {
  try {
    const labels = ganttData.map((segment, index) => `${segment.pid} [${segment.start}-${segment.end}]`);

    const dataset = {
      label: 'Execution',
      data: ganttData.map((segment, index) => ({
        x: [segment.start, segment.end],
        y: index,
        _start: segment.start,
        _end: segment.end,
        pid: segment.pid
      })),
      backgroundColor: ganttData.map(segment => getColorForProcess(segment.pid)),
      borderColor: "black",
      borderWidth: 1,
      barThickness: 20,
      borderSkipped: false
    };

    const ctx = document.getElementById(canvasId).getContext("2d");

    if (window.ganttChartInstance) {
      window.ganttChartInstance.destroy();
    }

    window.ganttChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [dataset]
      },
      options: {
        indexAxis: 'y',
        scales: {
          x: {
            beginAtZero: true,
            stacked: false,
            title: {
              display: true,
              text: "Time"
            }
          },
          y: {
            stacked: false,
            title: {
              display: true,
              text: "Execution Order"
            },
            ticks: {
              callback: function(value, index) {
                const segment = ganttData[index];
                return `${segment.pid} [${segment.start}-${segment.end}]`;
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const dataItem = context.raw;
                const process = dataItem.pid;
                const start = dataItem._start;
                const end = dataItem._end;
                return `${process}: [${start} - ${end}]`;
              }
            }
          },
          legend: {
            display: false
          }
        },
        responsive: true,
        maintainAspectRatio: false
      }
    });

  } catch (error) {
    console.error("Error rendering Gantt chart:", error);
  }
}


// Helper: Assign consistent colors to processes (you can customize this)
function getColorForProcess(processId) {
    const colors = [
        '#4dc9f6', '#f67019', '#f53794', '#537bc4',
        '#acc236', '#166a8f', '#00a950', '#58595b',
        '#8549ba'
    ];

    if (!processId || typeof processId !== 'string') {
        return '#000000'; // fallback color
    }

    if (processId.toLowerCase() === "idle") {
        return "#d3d3d3"; // Light gray for idle time
    }
    
    // Simple hash to map string to color
    let hash = 0;
    for (let i = 0; i < processId.length; i++) {
        hash = processId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}



