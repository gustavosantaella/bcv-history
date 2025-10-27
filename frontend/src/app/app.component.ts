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
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  rates: Rate[] = [];
  filteredRates: Rate[] = [];
  loading = true;
  error: string | null = null;
  selectedDate: string = '';
  showAlert: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadRates();
  }

  loadRates(): void {
    this.loading = true;
    this.error = null;
    
    this.apiService.getRates().subscribe({
      next: (data) => {
        this.rates = data;
        this.filteredRates = [...this.rates];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading rates:', err);
        this.error = 'Error al cargar los datos. Por favor, intenta más tarde.';
        this.loading = false;
      }
    });
  }

  refresh(): void {
    this.loadRates();
  }

  filterByDate(): void {
    if (!this.selectedDate) {
      this.filteredRates = [...this.rates];
      return;
    }

    // Convertir la fecha seleccionada al formato usado (DD/MM/YYYY)
    const selectedDateFormatted = this.formatDate(this.selectedDate);
    this.filteredRates = this.rates.filter(rate => 
      rate.date.includes(selectedDateFormatted)
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  clearFilter(): void {
    this.selectedDate = '';
    this.filteredRates = [...this.rates];
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

