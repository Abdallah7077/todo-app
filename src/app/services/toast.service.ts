import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  visible = false;
  message = '';
  isError = false;

  private timer: any;

  show(msg: string, isError = false) {
    clearTimeout(this.timer);

    this.message = msg;
    this.isError = isError;
    this.visible = true;

    this.timer = setTimeout(() => {
      this.visible = false;
    }, 3000);
  }
}
