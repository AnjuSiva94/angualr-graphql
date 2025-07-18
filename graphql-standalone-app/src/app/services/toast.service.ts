import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  constructor(private snackBar: MatSnackBar) {}

  show(message: string, duration = 3000, action = 'Close') {
    this.snackBar.open(message, action, { duration });
  }

  success(message: string) {
    this.show(message + ' ✅');
  }

  error(message: string) {
    this.show(message + ' ❌');
  }

  info(message: string) {
    this.show(message);
  }
} 
