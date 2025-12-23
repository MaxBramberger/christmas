import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {EncryptedKVStoreService} from "../util/key-value-store.service";
import {NgIf} from "@angular/common";
import {MarkdownComponent, MarkdownModule, MarkdownService, provideMarkdown} from "ngx-markdown";

@Component({
    selector: 'app-display-message',
    templateUrl: 'message-display.component.html',
    imports: [
        NgIf,
        MarkdownComponent,
    ],
    providers: [provideMarkdown({}),],
    styleUrl: 'message-display.component.scss',
    standalone: true
})
export class DisplayMessageComponent implements OnInit {
    message: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private store: EncryptedKVStoreService
    ) {
    }

    async ngOnInit() {
        // Get query parameter 'key' from the URL
        const hashHex = this.route.snapshot.queryParamMap.get('key');
        console.log('key from url', hashHex)
        if (!hashHex) return;

        try {
            this.message = await this.store.getFromHashHex(hashHex);
        } catch (err) {
            console.error('Failed to load message', err);
            this.message = null;
        }
    }
}