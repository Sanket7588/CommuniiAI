const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

const width = 600;
const height = 600;
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });

async function createPieChart(dataArray) {
    // Check if dataArray is valid
    if (!Array.isArray(dataArray) || dataArray.some(isNaN)) {
        throw new Error("Invalid data array");
    }

    const configuration = {
        type: 'pie',
        data: {
            labels: ['Confidence Level', 'Grammar Level', 'Filler Words Level'],
            datasets: [{
                data: dataArray,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: 'Sample Pie Chart',
                    font: { size: 20 }
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    };

    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);

    // Ensure directory exists
    const dirPath = path.join(__dirname, 'public', 'static');
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log("📁 Created folder: public/static");
    }

    // Save chart in the folder
    const filePath = path.join(dirPath, 'pie-chart.png');
    fs.writeFileSync(filePath, buffer);
    console.log("✅ Pie chart generated:", filePath);
}

module.exports = { createPieChart };