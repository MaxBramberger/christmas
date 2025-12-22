import { Routes } from '@angular/router';
import {DisplayMessageComponent} from "./components/message-display.component";
import {QrCodeComponent} from "./components/qr-code.component";

export const routes: Routes = [
    { path: 'message', component: DisplayMessageComponent},
    { path: 'qr', component: QrCodeComponent}
];
