import { Pipe, PipeTransform } from '@angular/core';
import { Provincia } from '../../mantenimiento/mantenimiento.types';


@Pipe({
  name: 'filterProvincia',
    standalone: true
})
export class FilterProvinciaPipe implements PipeTransform {
  transform(provincias: Provincia[], filtro: string): Provincia[] {
    if (!provincias || !filtro) return provincias;
    const filtroLower = filtro.toLowerCase();
    return provincias.filter(p => p.provincia.toLowerCase().includes(filtroLower));
  }
}