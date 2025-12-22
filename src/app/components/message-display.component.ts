import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {EncryptedKVStoreService} from "../util/key-value-store.service";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-display-message',
    template: `
        <div *ngIf="message; else noMessage">
            <h2>Message:</h2>
            <p>{{ message }}</p>
        </div>
        <ng-template #noMessage>
            <p>No message found for this key.</p>
        </ng-template>
    `,
    imports: [
        NgIf
    ],
    standalone: true
})
export class DisplayMessageComponent implements OnInit {
    message: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private store: EncryptedKVStoreService
    ) {}

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