import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {EncryptedKVStoreService} from "./util/key-value-store.service";
import {MESSAGES} from "./util/initial-store";
import {DisplayMessageComponent} from "./components/message-display.component";
import {MarkdownComponent} from "ngx-markdown";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, DisplayMessageComponent, MarkdownComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    title = 'christmas';

    keyValueStoreService = inject(EncryptedKVStoreService);

    async loadMessagesIfPresent(): Promise<string[]> {
        try {
            const response = await fetch('/messages/messages.json');

            if (!response.ok) {
                return []; // 404, etc.
            }

            return await response.json();
        } catch {
            return [];
        }
    }

    async ngOnInit() {
        const messages = await this.loadMessagesIfPresent();
        for (const message of messages) {
            const key = await this.keyValueStoreService.put(message)
            console.log('key', key, 'message', message)
        }

        if (messages.length > 0) {
            console.log(this.keyValueStoreService.exportToJson());
        }
    }

}
