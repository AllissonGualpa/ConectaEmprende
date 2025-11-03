// roadmap.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';

interface StepDetail {
  title: string;
  tips: string[];
}

interface Step {
  id: string;
  title: string;
  description: string;
  color: string;
  details: StepDetail;
}

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.css']
})
export class RoadmapComponent implements OnInit {
  visibleSteps: number[] = [];
  selectedStep: Step | null = null;
  showModal: boolean = false;

  steps: Step[] = [
    { 
      id: 'S1',
      title: 'Idea', 
      description: 'Genera y define tu idea de negocio de manera creativa.',
      color: '#9ABE37',
      details: {
        title: 'Consejos para Generar tu Idea de Negocio',
        tips: [
          'Identifica problemas reales: Las mejores ideas resuelven necesidades específicas del mercado.',
          'Combina tus pasiones con tus habilidades para crear algo único y auténtico.',
          'Investiga tendencias emergentes en tu industria para anticiparte a la demanda.',
          'Habla con potenciales clientes antes de comprometerte con una idea específica.',
          'No busques la perfección desde el inicio, empieza con un concepto y mejóralo gradualmente.',
          'Observa qué funciona en otros mercados y adapta esas ideas a tu contexto local.'
        ]
      }
    },
    { 
      id: 'S2',
      title: 'Validación', 
      description: 'Comprueba si tu idea tiene demanda y si es viable.',
      color: '#0B7A94',
      details: {
        title: 'Claves para Validar tu Idea',
        tips: [
          'Crea un MVP (Producto Mínimo Viable) para probar tu idea con recursos limitados.',
          'Realiza encuestas y entrevistas a tu público objetivo para conocer sus necesidades reales.',
          'Analiza a tu competencia: ¿qué están haciendo bien y qué podrías mejorar?',
          'Prueba diferentes propuestas de valor y mide cuál genera más interés.',
          'Establece métricas claras de éxito antes de comenzar tu validación.',
          'No tengas miedo al feedback negativo, es una oportunidad para mejorar tu propuesta.'
        ]
      }
    },
    { 
      id: 'S3',
      title: 'Planificación', 
      description: 'Organiza recursos, pasos y prioridades para tu negocio.',
      color: '#F6A027',
      details: {
        title: 'Estrategias de Planificación Efectiva',
        tips: [
          'Define objetivos SMART (específicos, medibles, alcanzables, relevantes y temporales).',
          'Crea un plan financiero realista que incluya proyecciones de ingresos y gastos.',
          'Establece hitos y fechas límite para mantener el enfoque y medir el progreso.',
          'Identifica los recursos clave que necesitas: equipo, tecnología, capital y aliados.',
          'Desarrolla un plan de contingencia para los principales riesgos identificados.',
          'Prioriza tareas según su impacto: enfócate primero en lo que genera más valor.'
        ]
      }
    },
    { 
      id: 'S4',
      title: 'Desarrollo', 
      description: 'Construye tu producto y prueba mejoras constantemente.',
      color: '#C15836',
      details: {
        title: 'Mejores Prácticas de Desarrollo',
        tips: [
          'Adopta metodologías ágiles para iterar rápidamente y adaptarte a cambios.',
          'Mantén la comunicación constante con tu equipo y establece roles claros.',
          'Testea frecuentemente con usuarios reales para detectar problemas temprano.',
          'Documenta procesos importantes para facilitar el crecimiento y escalabilidad.',
          'No te quedes atascado en la perfección, lanza y mejora sobre la marcha.',
          'Construye alianzas estratégicas que aceleren tu desarrollo y amplíen tu alcance.'
        ]
      }
    },
    { 
      id: 'S5',
      title: 'Lanzamiento', 
      description: 'Lanza tu negocio y empieza a captar clientes.',
      color: '#B0C9A4',
      details: {
        title: 'Estrategias para un Lanzamiento Exitoso',
        tips: [
          'Genera expectativa antes del lanzamiento con campañas de pre-lanzamiento.',
          'Define tu estrategia de marketing digital: redes sociales, email, contenido y publicidad.',
          'Ofrece incentivos atractivos a los primeros clientes para generar tracción inicial.',
          'Mide todo: instala herramientas de analytics para entender el comportamiento de tus usuarios.',
          'Prepara un excelente servicio al cliente para convertir compradores en promotores.',
          'Celebra los pequeños logros y mantén la motivación de tu equipo en esta etapa crucial.'
        ]
      }
    },
  ];

  ngOnInit(): void {
    // Animar la aparición de cada paso secuencialmente
    this.steps.forEach((_, index) => {
      setTimeout(() => {
        this.visibleSteps.push(index);
      }, index * 400);
    });
  }

  openStepDetails(step: Step): void {
    this.selectedStep = step;
    this.showModal = true;
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedStep = null;
    document.body.style.overflow = 'auto';
    
    // Reiniciar animación del roadmap
    this.visibleSteps = [];
    this.steps.forEach((_, index) => {
      setTimeout(() => {
        this.visibleSteps.push(index);
      }, index * 400);
    });
  }
}