import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Estudiante } from '../models/estudiante';

@Injectable({ providedIn: 'root' })
export class EstudiantesService {

  private url = 'https://jsonplaceholder.typicode.com/comments';

  constructor(private http: HttpClient) {}

  getEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<any[]>(this.url).pipe(
      map(comentarios =>
        comentarios
          .slice(0, 20)
          .map(c => ({
            id: c.id,
            nombre: c.name,
            email: c.email,
            nota: 1 + ((c.id * 7) % 41) / 10,
            observacion: '',
          }))
      )
    );
  }
}
