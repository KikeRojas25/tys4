import { SelectItem } from 'primeng/api';

export const SUSTENTOS_LIQUIDACION: SelectItem[] = [
  { value: 1, label: 'Manifiesto Firmado' },
  { value: 2, label: 'Factura' },
  { value: 3, label: 'Guía de Remisión' },
  { value: 4, label: 'C-PAN' },
];

export const WEBREPORTS_URL = 'http://104.36.166.65/webreports';

export const ES_LOCALE = {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Borrar',
};
