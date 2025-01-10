
const tableBody = document.querySelector("table tbody");


function loadLocalStorageData() {

    tableBody.innerHTML = "";


    Object.keys(localStorage).forEach((key, index) => {
        const data = localStorage.getItem(key);

    
        try {
            const parsedData = JSON.parse(data);


            const row = document.createElement("tr");

            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${parsedData.age || "N/A"}</td>
                <td>${parsedData.gender || "N/A"}</td>
                <td>${parsedData.internetUsage || "N/A"}</td>
                <td>${parsedData.browser1 || "N/A"}</td> 
                <td>${parsedData.browser2 || "N/A"}</td>     
                <td>${parsedData.browser3 || "N/A"}</td>     
                <td>${parsedData.knowsImageSites || "N/A"}</td>     
                <td>${parsedData.imageSiteResponse || "N/A"}</td>     
                
                
                
                <td>${parsedData.task1 || "N/A"}</td>
                <td>${parsedData.task2 || "N/A"}</td>
                <td>${parsedData.task3 || "N/A"}</td>
                <td>${parsedData.task4 || "N/A"}</td> 
                <td>${parsedData.comparison || "N/A"}</td>





                <td>${parsedData.susResponses || "N/A"}</td>

                <td>${parsedData.slider1 || "N/A"}</td>     
                <td>${parsedData.slider2 || "N/A"}</td>     
                <td>${parsedData.slider3 || "N/A"}</td>     
   

            `;

            tableBody.appendChild(row);
        } catch (error) {
            console.error(`Erro ao analisar os dados da chave ${key}:`, error);
        }
    });
}

document.addEventListener("DOMContentLoaded", loadLocalStorageData);









function createDoughnutChart() {
    const labels = [];
    const dataValues = [];


    document.querySelectorAll("table tbody tr").forEach((row) => {
        const gender = row.cells[2].textContent;
        if (gender !== "N/A") {
            const index = labels.indexOf(gender);
            if (index === -1) {
                labels.push(gender); 
                dataValues.push(1); 
            } else {
                dataValues[index] += 1; 
            }
        }
    });

    const data = {
        labels: labels,
        datasets: [{
            label: 'Distribuição por Gênero',
            data: dataValues,
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'], 
        }],
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Gênero no Questionário'
                }
            }
        },
    };

    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, config);
}

document.addEventListener('DOMContentLoaded', function () {
    loadLocalStorageData();
    createDoughnutChart();  
});










function createSusResponsesChart() {
    const labels = [];
    const dataValues = [];
    const backgroundColors = []; 


    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    document.querySelectorAll("table tbody tr").forEach((row, index) => {
        const susResponses = row.cells[14].textContent; 
        if (susResponses !== "N/A") {
            const responses = susResponses.split(',');
            responses.forEach((response, responseIndex) => {
                labels.push(`User ${index + 1} - Q${responseIndex + 1}`); 
                dataValues.push(parseFloat(response.trim())); 
                backgroundColors.push(colors[index % colors.length]); 
            });
        }
    });


    const data = {
        labels: labels,
        datasets: [{
            label: 'SUS Responses',
            data: dataValues,
            backgroundColor: backgroundColors, 
            borderColor: backgroundColors,
            borderWidth: 1,
        }],
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text: 'System Usability Scale Responses'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'SUS Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Responses'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }
            }
        },
    };

    const ctx = document.getElementById('myChart2').getContext('2d');
    new Chart(ctx, config);
}
