import {Component, inject, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {EncryptedKVStoreService} from "./util/key-value-store.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'christmas';

  keyValueStoreService = inject(EncryptedKVStoreService);

  async ngOnInit() {
    const key  = await this.keyValueStoreService.put('Secret message.')
    console.log(this.keyValueStoreService['store'])
    console.log(key)
    console.log(await this.keyValueStoreService.getFromHashHex(key));
  }

}
