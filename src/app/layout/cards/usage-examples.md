Ejemplos de uso de `app-cards`

1) Emprendimientos (estructura por defecto — imagen, badge categoría, CTA grande)

```html
<app-cards [items]="emprendimientos" pageSize="6" ctaLabel="Descubrir"></app-cards>
```

2) Eventos (personaliza badge para mostrar fecha y action para botón secundario "Ver Detalle")

```html
<!--define templates localmente en la pag que usa las cards-->
<ng-template #eventBadge let-item>
  <div class="absolute top-3 left-3">
    <div class="bg-blue-600 text-white px-3 py-1 rounded-xl text-sm shadow">12 Abril</div>
  </div>
</ng-template>

<ng-template #eventActions let-item>
  <div class="flex flex-col gap-2">
    <button (click)="onRegister(item)" class="w-full bg-orange-500 text-white py-2 rounded-lg">Registrarse</button>
    <a (click)="onDiscover(item)" class="text-center text-orange-500 mt-2">Ver Detalle</a>
  </div>
</ng-template>

<!--pasar templates como inputs al componente -->
<app-cards [items]="eventos"
           [badgeTemplate]="eventBadge"
           [actionTemplate]="eventActions"
           [showLocation]="true"
           ctaLabel="Registrarse">
</app-cards>
```

Notas:
- Los templates reciben como contexto el item actual (use `let-item` en su `ng-template`).
- Puede añadir mas templates (footerTemplate) para insertar metadatos adicionales.
