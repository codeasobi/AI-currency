class CurrencyExchange {
    constructor() {
        this.rates = [];
        this.chart = null;
        this.initializeChart();
        this.setupEventListeners();
        this.fetchRates();
    }

    async fetchRates() {
        try {
            const loadingMessage = document.createElement('div');
            loadingMessage.innerHTML = 'Loading exchange rates...';
            document.querySelector('.container').appendChild(loadingMessage);
    
            const response = await fetch('https://api.exchangerate.host/timeseries?' + new URLSearchParams({
                start_date: this.getThreeMonthsAgo(),
                end_date: this.getCurrentDate(),
                base: 'USD',
                symbols: 'TWD,JPY'
            }));
            
            const data = await response.json();
            this.processRates(data);
            
            // Update last updated time
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
            
            loadingMessage.remove();
        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            alert('Error loading exchange rates. Please try again later.');
        }
    }    

    getThreeMonthsAgo() {
        const date = new Date();
        date.setMonth(date.getMonth() - 3);
        return date.toISOString().split('T')[0];
    }

    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    processRates(data) {
        // API data process
        this.rates = Object.entries(data.rates).map(([date, rates]) => ({
            date,
            usdTwd: rates.TWD,
            jpyTwd: rates.TWD / rates.JPY,
            usdJpy: rates.JPY
        }));

        this.updateChart();
        this.updateTable();
    }

    initializeChart() {
        const ctx = document.getElementById('rateChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'USD/TWD',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                    },
                    {
                        label: 'JPY/TWD',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                    },
                    {
                        label: 'USD/JPY',
                        data: [],
                        borderColor: 'rgb(153, 102, 255)',
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    updateChart() {
        this.chart.data.labels = this.rates.map(rate => rate.date);
        this.chart.data.datasets[0].data = this.rates.map(rate => rate.usdTwd);
        this.chart.data.datasets[1].data = this.rates.map(rate => rate.jpyTwd);
        this.chart.data.datasets[2].data = this.rates.map(rate => rate.usdJpy);
        this.chart.update();
    }

    updateTable() {
        const tbody = document.getElementById('rateTableBody');
        tbody.innerHTML = this.rates.map(rate => `
            <tr>
                <td>${rate.date}</td>
                <td>${rate.usdTwd.toFixed(4)}</td>
                <td>${rate.jpyTwd.toFixed(4)}</td>
                <td>${rate.usdJpy.toFixed(4)}</td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        document.getElementById('chartView').addEventListener('click', () => {
            document.getElementById('chartContainer').style.display = 'block';
            document.getElementById('tableContainer').style.display = 'none';
        });

        document.getElementById('tableView').addEventListener('click', () => {
            document.getElementById('chartContainer').style.display = 'none';
            document.getElementById('tableContainer').style.display = 'block';
        });
    }
}

// initiate
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyExchange();
});