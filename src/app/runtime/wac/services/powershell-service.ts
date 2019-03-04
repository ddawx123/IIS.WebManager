import { Injectable, Inject } from '@angular/core'
import { AppContextService } from '@microsoft/windows-admin-center-sdk/angular'
import { PowerShell, PowerShellSession } from '@microsoft/windows-admin-center-sdk/core'
import { Observable } from 'rxjs'
import { PowerShellScripts } from '../../../../generated/powershell-scripts'
import { Request, Response, ResponseOptions, Headers } from '@angular/http'
import { WACInfo } from 'runtime/runtime.wac'
import { LoggerFactory, Logger, LogLevel, logError } from 'diagnostics/logger'
import { map, mergeMap, shareReplay, tap } from 'rxjs/operators'

const PS_SESSION_KEY = 'wac-iis'

@Injectable()
export class PowershellService {
  private logger: Logger
  private session: Observable<PowerShellSession>
  private sessionId = Math.random().toString(36).substring(2, 15) // TODO: modify this with WAC session ID

  constructor(
    private loggerFactory: LoggerFactory,
    private appContext: AppContextService,
    @Inject('WACInfo') private wac: WACInfo,
  ) {
    this.scheduleSession()
    // not exactly sure why we need to force evaluate this observable here
    // but if we don't, install page would not work
    let sub = this.session.subscribe(_=>{},_=>{}, ()=>{
      sub.unsubscribe()
    })
    this.logger = loggerFactory.Create(this)
  }

  private scheduleSession() {
    this.session = this.wac.NodeName.pipe(
      map(nodeName => this.appContext.powerShell.createSession(nodeName, PS_SESSION_KEY)),
      shareReplay()
    )
  }

  public Reset() {
    this.session.subscribe(s => {
      s.dispose()
      this.scheduleSession()
    })
  }

  public run<T>(pwCmdString: string, psParameters: any): Observable<T> {
    return this.invoke(pwCmdString, psParameters, null)
  }

  public invokeHttp(req: Request): Observable<Response> {
    let requestEncoded = btoa(JSON.stringify(req))
    return this.invoke<ResponseOptions>(
      PowerShellScripts.local_http,
      { requestBase64: requestEncoded },
      (k, v) => {
        switch (k) {
          case 'body':
            try {
              return atob(v)
            } catch {
              return v
            }

          case 'headers':
            // we need to explicitly wrap it otherwise when we pass it to new Response(res), the header would remain a plain object
            return new Headers(v)

          default:
            return v
        }
      }).pipe(map(res => {
        let response = new Response(res)
        if (res.status < 200 || res.status >= 400) {
          throw response
        }
        return response
    }))
  }

  private invoke<T>(pwCmdString: string, psParameters: any, reviver: (key: any, value: any) => any = null): Observable<T> {
    psParameters.sessionId = this.sessionId;
    var flags: string[] = [];  // use ['verbose'] to debug
    var compiled: string = PowerShell.createScript(pwCmdString, psParameters, flags);
    var scriptName: string = pwCmdString.split("\n")[0]
    return this.session.pipe(
      mergeMap(ps => ps.powerShell.run(compiled)),
      logError(this.logger, LogLevel.WARN, `Script ${scriptName} failed`),
      mergeMap(response => {
        if (!response) {
          throw `Powershell command ${scriptName} returns no response`;
        }
        if (!response.results) {
          throw `Powershell command ${scriptName} returns null response`;
        }
        if (response.results.length <= 0) {
          throw `Powershell command ${scriptName} returns empty response`;
        }
        return response.results.map(result => {
          let rtnObject: any = JSON.parse(result, reviver);
          if (rtnObject && rtnObject.errorsReported) {
            this.logger.log(LogLevel.ERROR,
              `Unexpected error from powershell script ${name}:\n${rtnObject.errorsReported}`);
          }
          return rtnObject;
        });
      }),
    );
  }
}
