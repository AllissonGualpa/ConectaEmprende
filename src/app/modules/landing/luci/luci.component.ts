import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../layout/navbar/navbar.component';
import { FooterComponent } from '../../../layout/footer/footer.component';
import { createChat } from '@n8n/chat';
import { Environment } from '../../../../environments/environment';

@Component({
  selector: 'app-luci',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './luci.component.html',
  styleUrls: ['./luci.component.css'],
})
export class LuciComponent{
  ngOnInit() {
    createChat({
        webhookUrl: Environment.luciWebhookUrl,
  
        // 👇 Usa fullscreen, pero lo encapsulamos
        mode: "fullscreen",
        target: "#luci-chat-container",
        initialMessages:[
            "👋 ¡Hola, emprendedor/a! Soy Luci, tu asistente para impulsar ideas y negocios 🚀",
            "✨ Puedo ayudarte a validar tu idea, entender a tu cliente ideal, crear una propuesta de valor y planear tus próximos pasos.",
            "🧠 Cuéntame: ¿qué estás pensando emprender o qué reto tienes ahora mismo en tu proyecto? 💬"
        ],
        enableStreaming: true,
        i18n: {
          en: {
            title: "💡 Luci - Tu Asistente de Emprendimiento",
            subtitle: "Acompañándote en cada paso de tu emprendimiento 🚀",
            footer: "Desarrollado con ❤️ y potenciado por IA",
            getStarted: "✨ Empezar conversación",
            inputPlaceholder: "Escribe tu mensaje aquí... 💬",
            closeButtonTooltip: "Cerrar chat ✖️"
          }
        },
        theme: {
          primary: "#4C79FF"
        }
      });
  }
}
