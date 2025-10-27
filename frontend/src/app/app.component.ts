import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { ApiService } from './services/api.service';
import { Rate } from './models/rate.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  currentTime: string = '';
  currentDate: string = '';
  currentLanguage: string = 'es';
  private timeInterval?: any;

  rates: Rate[] = [];
  filteredRates: Rate[] = [];
  paginatedRates: Rate[] = [];
  loading = true;
  error: string | null = null;
  dateFrom: string = '';
  dateTo: string = '';
  showAlert: boolean = true;

  // Paginación
  currentPage: number = 1;
  pageSize: number = 20;
  totalPages: number = 0;

  // Configuraciones de gráficas
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };
  public lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Precio del Dólar (Bs.)',
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
  };
  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Variación (%)',
        backgroundColor: [],
      },
    ],
  };

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
    },
  };
  public pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
      },
    ],
  };

  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      r: {
        beginAtZero: true,
      },
    },
  };
  public radarChartData: ChartData<'radar'> = {
    labels: [],
    datasets: [
      {
        label: 'Tendencia',
        data: [],
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        borderColor: 'rgba(99, 102, 241, 1)',
      },
    ],
  };

  constructor(
    private apiService: ApiService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {
    this.translate.setDefaultLang('es');
    this.translate.use('es');
    this.updateClock();
    // Actualizar reloj cada segundo
    this.timeInterval = setInterval(() => {
      this.updateClock();
    }, 1000);
  }

  updateClock(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString(
      this.currentLanguage === 'es' ? 'es-VE' : 'en-US',
      {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }
    );
    this.currentDate = now.toLocaleDateString(
      this.currentLanguage === 'es' ? 'es-VE' : 'en-US',
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  }

  changeLanguage(language: string): void {
    this.currentLanguage = language;
    this.translate.use(language);
    this.updateClock();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadRates();
  }

  setDefaultDateRange(): void {
    const today = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(today.getMonth() - 3);

    // Formato YYYY-MM-DD para input[type="date"]
    this.dateTo = today.toISOString().split('T')[0];
    this.dateFrom = threeMonthsAgo.toISOString().split('T')[0];
  }

  loadRates(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getRates().subscribe({
      next: (data) => {
        this.rates = this.sortByDateDescending(data);
        this.currentPage = 1;
        this.filterByDateRange();
        this.updateCharts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading rates:', err);
        this.error = 'Error al cargar los datos. Por favor, intenta más tarde.';
        this.loading = false;
      },
    });
  }

  sortByDateDescending(rates: Rate[]): Rate[] {
    return rates.sort((a, b) => {
      // Convertir DD/MM/YYYY a YYYY-MM-DD para comparación
      const dateA = this.parseDate(a.date);
      const dateB = this.parseDate(b.date);
      return dateB.getTime() - dateA.getTime(); // Descendente (más reciente primero)
    });
  }

  parseDate(dateString: string): Date {
    // Formato: DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en Date son 0-indexed
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(0); // Fecha inválida
  }

  refresh(): void {
    this.loadRates();
  }

  filterByDateRange(): void {
    if (!this.dateFrom || !this.dateTo) {
      this.filteredRates = [...this.rates];
      this.updatePagination();
      this.updateCharts();
      return;
    }

    // Convertir fechas del formato YYYY-MM-DD a Date para comparación
    const fromDate = new Date(this.dateFrom);
    const toDate = new Date(this.dateTo);
    // Ajustar toDate al final del día
    toDate.setHours(23, 59, 59, 999);

    this.filteredRates = this.rates.filter((rate) => {
      const rateDate = this.parseDate(rate.date);
      return rateDate >= fromDate && rateDate <= toDate;
    });
    this.currentPage = 1;
    this.updatePagination();
    this.updateCharts();
  }

  updateCharts(): void {
    this.updateLineChart();
    this.updateBarChart();
    this.updatePieChart();
    this.updateRadarChart();

    // Usar setTimeout para asegurar que Angular detecte los cambios
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  updateLineChart(): void {
    const data = this.filteredRates.slice(0, 100); // Últimos 100 registros para mejor rendimiento
    const labels = data.map((rate) => rate.date).reverse();
    const values = data
      .map((rate) => parseFloat(rate.value || rate.dollar || '0'))
      .reverse();

    // Crear nueva referencia para que Angular detecte el cambio
    this.lineChartData = {
      labels: labels,
      datasets: [
        {
          data: values,
          label: 'Precio del Dólar (Bs.)',
          borderColor: 'rgba(99, 102, 241, 1)',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          pointRadius: 2,
          pointHoverRadius: 4,
        },
      ],
    };
  }

  updateBarChart(): void {
    const data = this.filteredRates.slice(0, 30); // Últimos 30 registros
    const labels = data
      .map((rate) => rate.date.split('/')[0] + '/' + rate.date.split('/')[1])
      .reverse();

    const variations = data
      .map((rate) => parseFloat(rate.variation || '0'))
      .reverse();
    const colors = variations.map((v) =>
      v > 0
        ? 'rgba(34, 197, 94, 0.8)'
        : v < 0
        ? 'rgba(239, 68, 68, 0.8)'
        : 'rgba(156, 163, 175, 0.8)'
    );

    // Crear nueva referencia para que Angular detecte el cambio
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          data: variations,
          label: 'Variación (%)',
          backgroundColor: colors,
        },
      ],
    };
  }

  updatePieChart(): void {
    // Agrupar por año
    const dataByYear: { [key: string]: number } = {};

    this.filteredRates.forEach((rate) => {
      const year = rate.date.split('/')[2]; // Año está en posición [2] en DD/MM/YYYY
      if (!dataByYear[year]) {
        dataByYear[year] = 0;
      }
      dataByYear[year]++;
    });

    const labels = Object.keys(dataByYear).sort();
    const data = Object.values(dataByYear);

    // Crear nueva referencia para que Angular detecte el cambio
    this.pieChartData = {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(236, 72, 153, 0.8)',
          ],
        },
      ],
    };
  }

  updateRadarChart(): void {
    // Gráfica de tendencias por mes
    const months = [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
    ];

    const dataByMonth = new Array(12).fill(0);
    let countByMonth = new Array(12).fill(0);

    this.filteredRates.forEach((rate) => {
      const parts = rate.date.split('/');
      const month = parseInt(parts[1], 10) - 1; // Mes está en posición [1]
      if (month >= 0 && month < 12) {
        dataByMonth[month] += parseFloat(rate.variation || '0');
        countByMonth[month]++;
      }
    });

    // Calcular promedios
    const avgByMonth = dataByMonth.map((sum, index) =>
      countByMonth[index] > 0 ? sum / countByMonth[index] : 0
    );

    // Crear nueva referencia para que Angular detecte el cambio
    this.radarChartData = {
      labels: months,
      datasets: [
        {
          label: 'Tendencia',
          data: avgByMonth,
          backgroundColor: 'rgba(99, 102, 241, 0.3)',
          borderColor: 'rgba(99, 102, 241, 1)',
        },
      ],
    };
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredRates.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedRates = this.filteredRates.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  getPageNumbers(): number[] {
    const maxPagesToShow = 5;
    const pages: number[] = [];
    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxPagesToShow / 2)
    );
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    // Ajustar startPage si estamos cerca del final
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  clearFilter(): void {
    this.setDefaultDateRange();
    this.filteredRates = [...this.rates]; // Ya viene ordenado de loadRates
    this.currentPage = 1;
    this.updatePagination();
    this.updateCharts();
  }

  closeAlert(): void {
    this.showAlert = false;
  }

  getVariationClass(variation: string): string {
    const value = parseFloat(variation);
    if (value > 0) {
      return 'text-green-600 bg-green-100';
    } else if (value < 0) {
      return 'text-red-600 bg-red-100';
    }
    return 'text-gray-600 bg-gray-100';
  }

  getVariationClassForCard(variation: string): string {
    const value = parseFloat(variation);
    if (value > 0) {
      return 'bg-green-400/20 text-green-100';
    } else if (value < 0) {
      return 'bg-red-400/20 text-red-100';
    }
    return 'bg-white/20 text-white';
  }

  getVariationIcon(variation: string): string {
    const value = parseFloat(variation);
    if (value > 0) {
      return '↑';
    } else if (value < 0) {
      return '↓';
    }
    return '→';
  }
}
