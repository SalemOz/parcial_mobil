import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonGrid, IonRow, IonCol,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonInput, IonText, IonButton, IonButtons,
  IonList, IonAvatar, IonLabel, IonBadge, IonModal, IonTextarea,
  ToastController,
} from '@ionic/angular';
import { Estudiante } from '../models/estudiante';
import { EstudiantesService } from '../services/estudiantes.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonItem, IonInput, IonText, IonButton, IonButtons,
    IonList, IonAvatar, IonLabel, IonBadge, IonModal, IonTextarea,
  ],
})
export class HomePage implements OnInit {

  estudiantes: Estudiante[] = [];
  estudiantesFiltrados: Estudiante[] = [];

  notaMin: number | null = null;
  notaMax: number | null = null;
  error = '';

  modalAbierto = false;
  seleccionado: Estudiante | null = null;
  observacionTexto = '';

  constructor(
    private estudiantesService: EstudiantesService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.estudiantesService.getEstudiantes().subscribe(data => {
      this.estudiantes = data;
      this.aplicarFiltros();
    });
  }

  aplicarFiltros() {
    this.error = '';

    const min = this.aNumero(this.notaMin);
    const max = this.aNumero(this.notaMax);

    if ((min !== null && (min < 0 || min > 5)) || (max !== null && (max < 0 || max > 5))) {
      this.error = 'Las notas deben estar entre 0 y 5';
      this.estudiantesFiltrados = [];
      return;
    }

    if (min !== null && max !== null && min > max) {
      this.error = 'La nota mínima no puede ser mayor que la máxima';
      this.estudiantesFiltrados = [];
      return;
    }

    const desde = min ?? 0;
    const hasta = max ?? 5;

    this.estudiantesFiltrados = this.estudiantes.filter(
      e => e.nota >= desde && e.nota <= hasta
    );
  }

  limpiarFiltros() {
    this.notaMin = null;
    this.notaMax = null;
    this.error = '';
    this.estudiantesFiltrados = [...this.estudiantes];
  }

  get promedioGeneral(): number {
    if (this.estudiantesFiltrados.length === 0) {
      return 0;
    }
    const suma = this.estudiantesFiltrados.reduce((total, e) => total + e.nota, 0);
    return Math.round((suma / this.estudiantesFiltrados.length) * 100) / 100;
  }

  estado(e: Estudiante): string {
    return e.nota < 3.0 ? 'Reprobado' : 'Aprobado';
  }

  colorEstado(e: Estudiante): string {
    return e.nota < 3.0 ? 'danger' : 'success';
  }

  abrirModal(e: Estudiante) {
    this.seleccionado = e;
    this.observacionTexto = e.observacion;
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  async guardarObservacion() {
    const texto = this.observacionTexto.trim();

    if (texto === '') {
      await this.mostrarToast('La observación no puede estar vacía', 'warning');
      return;
    }

    const estudiante = this.estudiantes.find(e => e.id === this.seleccionado?.id);
    if (estudiante) {
      estudiante.observacion = texto;
    }

    this.cerrarModal();
    await this.mostrarToast('Observación guardada correctamente', 'success');
  }

  private aNumero(valor: number | string | null): number | null {
    if (valor === null || valor === undefined || String(valor).trim() === '') {
      return null;
    }
    const numero = Number(valor);
    return isNaN(numero) ? null : numero;
  }

  private async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      duration: 2500,
      color,
    });
    await toast.present();
  }
}
