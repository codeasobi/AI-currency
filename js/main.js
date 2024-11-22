class CurrencyExchange {
    constructor() {
        this.rates = [];
        this.chart = null;
        this.updateInterval = 1800000; // 30 minutes
        this.initializeChart();
        this.setupEventListeners();
        this.startAutoUpdate();
    }

    startAutoUpdate() {
        this.fetchRates();
        setInterval(() => {
            this.fetchRates();
        }, this.updateInterval);
    }

    async fetchRates() {
        try {
            // 使用更简单的API端点
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            const data = await response.json();
            
            console.log('API Response:', data); // 调试日志

            if (!data || !data.rates) {
                throw new Error('Invalid data format from API');
            }

            // 创建单个汇率数据点
            const rateData = {
                date: new Date().toISOString().split('T')[0],
                usdTwd: data.rates.TWD,
                jpyTwd: data.rates.TWD / data.rates.JPY,
                usdJpy: data.rates.JPY
            };

            console.log('Processed Rate Data:', rateData); // 调试日志

            // 添加到现有数据中
            this.rates.push(rateData);

            // 只保留最近30天的数据
            if (this.rates.length > 30) {
                this.rates.shift();
            }

            this.updateChart();
            this.updateTable();
            document.getElementById('lastUpdate').textContent = new Date().toLocaleString();

        } catch (error) {
            console.error('Failed to fetch exchange rates:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = `Error: ${error.message}`;
            const container = document.querySelector('.container');
            // 移除旧的错误消息
            const oldError = container.querySelector('.error-message');
            if (oldError) {
                oldError.remove();
            }
            container.prepend(errorDiv);
        }
    }

    updateChart() {
        if (!this.chart) {
            return;
        }

        this.chart.data.labels = this.rates.map(rate => rate.date);
        this.chart.data.datasets[0].data = this.rates.map(rate => rate.usdTwd);
        this.chart.data.datasets[1].data = this.rates.map(rate => rate.jpyTwd);
        this.chart.data.datasets[2].data = this.rates.map(rate => rate.usdJpy);
        this.chart.update();
    }

    updateTable() {
        const tbody = document.getElementById('rateTableBody');
        if (!tbody) {
            return;
        }

        tbody.innerHTML = this.rates.map(rate => `
            <tr>
                <td>${rate.date}</td>
                <td>${Number(rate.usdTwd).toFixed(4)}</td>
                <td>${Number(rate.jpyTwd).toFixed(4)}</td>
                <td>${Number(rate.usdJpy).toFixed(4)}</td>
            </tr>
        `).join('');
    }

    initializeChart() {
        const ctx = document.getElementById('rateChart');
        if (!ctx) {
            console.error('Chart canvas not found');
            return;
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'USD/TWD',
                        data: [],
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1
                    },
                    {
                        label: 'JPY/TWD',
                        data: [],
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1
                    },
                    {
                        label: 'USD/JPY',
                        data: [],
                        borderColor: 'rgb(153, 102, 255)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    setupEventListeners() {
        const chartViewBtn = document.getElementById('chartView');
        const tableViewBtn = document.getElementById('tableView');
        const chartContainer = document.getElementById('chartContainer');
        const tableContainer = document.getElementById('tableContainer');

        if (chartViewBtn && tableViewBtn) {
            chartViewBtn.addEventListener('click', () => {
                chartContainer.style.display = 'block';
                tableContainer.style.display = 'none';
                chartViewBtn.classList.add('btn-primary');
                chartViewBtn.classList.remove('btn-secondary');
                tableViewBtn.classList.add('btn-secondary');
                tableViewBtn.classList.remove('btn-primary');
            });

            tableViewBtn.addEventListener('click', () => {
                chartContainer.style.display = 'none';
                tableContainer.style.display = 'block';
                tableViewBtn.classList.add('btn-primary');
                tableViewBtn.classList.remove('btn-secondary');
                chartViewBtn.classList.add('btn-secondary');
                chartViewBtn.classList.remove('btn-primary');
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CurrencyExchange();
});