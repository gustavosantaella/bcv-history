import { Chart, registerables } from 'chart.js';

// Registra todos los elementos de Chart.js (scales, controllers, elements, plugins)
Chart.register(...registerables);

export { Chart };
