import { Injectable } from '@angular/core';
import {Subject} from 'rxjs/internal/Subject';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notification$: Subject<string> = new Subject<string>();

  constructor() { }
}
