import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Rate } from './models/rate.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
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

  constructor(private apiService: ApiService) {}

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
