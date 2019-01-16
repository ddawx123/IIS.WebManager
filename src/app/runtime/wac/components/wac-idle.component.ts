
import { Component } from '@angular/core';

@Component({
    selector: 'wac-idle',
    template: `
    <div class="center">
        <h1>Navigating...</h1>
        <p><i class="fa fa-spinner fa-pulse fa-3x"></i></p>
    </div>
`,
    styles: [`
    .center {
        text-align: center;
    }

    h1 {
        margin-bottom: 50px;
        font-size: 300%;
    }
`],
})
export class WACIdleComponent {}
