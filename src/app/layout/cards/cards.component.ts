import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface CardItem {
  id: number;
  title: string;
  description?: string;
  image: string;
  category?: string;
  location?: string;
  date?: string | Date;
  views?: number;
  favorites?: number;
  status?: string; // aprobado, pendiente, rechazado
  rawStatus?: string;
  formLink?: string;
}

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.css']
})
export class CardsComponent {
  @Input() items: CardItem[] = [];
  @Input() pageSize = 6;
  // when true cards are displayed in a single column (one per row)
  @Input() singleColumn: boolean = false;
  // TemplateRefs for customizable slots
  @Input() badgeTemplate?: TemplateRef<any>;
  @Input() actionTemplate?: TemplateRef<any>;
  @Input() overlayTemplate?: TemplateRef<any>;
  @Input() footerTemplate?: TemplateRef<any>;

  // Simple flags for small variations
  @Input() showLocation = true;
  @Input() ctaLabel = 'Descubrir';
  @Input() showRoadmapButton = false;  // Nuevo: controla si se muestra el botón Roadmap
  @Input() downLoadQrCode: boolean = true;
  @Input() roadmapLabel = 'Roadmap';   // Nuevo: texto del botón Roadmap
  @Input() showStatus = false;
    @Input() baseUrlForQR: string = 'https://conectaemprendessr.onrender.com/';
  // NUEVO: Control para cards de altura fija (específico para eventos)
  @Input() fixedHeightCards: boolean = false;

  @Output() discover = new EventEmitter<CardItem>();
  @Output() toggleFavorite = new EventEmitter<CardItem>();
  @Output() roadmap = new EventEmitter<CardItem>();  // Nuevo: evento para Roadmap

  currentPage = 1;

  get totalPages(): number {
    return Math.max(1, Math.ceil((this.items?.length || 0) / this.pageSize));
  }

  get pagedItems(): CardItem[] {
    if (!this.items) return [];
    const start = (this.currentPage - 1) * this.pageSize;
    return this.items.slice(start, start + this.pageSize);
  }

  goTo(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDiscover(item: CardItem) {
    this.discover.emit(item);
  }

  onToggleFavorite(item: CardItem, event?: Event) {
    if (event) event.stopPropagation();
    this.toggleFavorite.emit(item);
  }

  onRoadmap(item: CardItem) {
    this.roadmap.emit(item);
  }

  isEditDisabled(item: any): boolean {
    return item?.rawStatus === 'PENDIENTE_APROBACION'
      || item?.rawStatus === 'EN_REVISION'
      || item?.rawStatus === 'RECHAZADO';
  }

  async downloadQR(item: CardItem, event?: Event): Promise<void> {
    if (event) {
      event.stopPropagation();
    }

    try {
      // Generar URL del QR
      const qrUrl = this.getQRCodeUrl(item);
      
      if (!qrUrl) {
        console.error('No se pudo generar la URL del QR');
        return;
      }

      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_${this.fileName(item.title)}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error al descargar el QR:', error);
      alert('Error al descargar el código QR. Por favor, intenta nuevamente.');
    }
  }


  private getQRCodeUrl(item: CardItem): string {
    if (!this.baseUrlForQR) {
      console.warn('baseUrlForQR no está configurado');
      return '';
    }

    const evaluacionUrl = `${this.baseUrlForQR}/valoracion/${item.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(evaluacionUrl)}`;
  }

  private fileName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }
}