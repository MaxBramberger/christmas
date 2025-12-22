import {Component, inject, Input, OnChanges, OnInit} from '@angular/core';
import {NgIf} from "@angular/common";
import {QRCodeModule} from "angularx-qrcode";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-qr-code',
    template: `
        @if(qrCodeData){
            <qrcode [qrdata]="qrCodeData" [width]="256" [errorCorrectionLevel]="'M'"></qrcode>
        } @else{
            Invalid url.
        }
    `,
    standalone: true,
    imports: [
        NgIf,
        QRCodeModule
    ]
})
export class QrCodeComponent implements OnInit {
    qrCodeData: string | null = null;
    route = inject(ActivatedRoute);

    async ngOnInit() {
        try {
            const hashHex = this.route.snapshot.queryParamMap.get('key');
            this.qrCodeData = `${window.location.origin}/christmas/message?key=${hashHex}`;
            console.log(this.qrCodeData, this.route.root);
        } catch (err) {
            console.error('Failed to generate QR code', err);
            this.qrCodeData = "";
        }
    }
}
