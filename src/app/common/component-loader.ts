import { Type, Compiler, ModuleWithComponentFactories } from '@angular/core'
import { WebSiteListComponentName,
    AppPoolComponentName,
    WebFilesComponentName,
    WebAppListComponentName,
    VdirListComponentName,
    AuthenticationComponentName,
    AuthorizationComponentName,
    CertificatesComponentName,
    CentralCertificateComponentName,
    DefaultDocumentsComponentName,
    DirectoryBrowsingComponentName,
    IpRestrictionsComponentName,
    LoggingComponentName,
    MimeMapsComponentName,
    MonitoringComponentName,
    ModulesComponentName,
    CompressionComponentName,
    RequestFilteringComponentName,
    HttpResponseHeadersComponentName,
    RequestTracingComponentName,
    StaticContentComponentName,
    UrlRewriteComponentName,
    ComponentReference,
    FilesComponentName,
    UploadComponentName,
    WarningComponentName,
    AppModuleName
} from '../main/settings'
import { WebSitesModule } from 'webserver/websites/websites.module';
import { AppPoolsModule } from 'webserver/app-pools/app-pools.module';
import { AppModule } from 'main/app.module';
import { WebFilesModule } from 'webserver/files/webfiles.module';
import { WebAppsModule } from 'webserver/webapps/webapps.module';
import { VdirsModule } from 'webserver/vdirs/vdirs.module';
import { AuthenticationModule } from 'webserver/authentication/authentication.module';
import { AuthorizationModule } from 'webserver/authorization/authorization.module';
import { CertificatesModule } from 'certificates/certificates.module';
import { CentralCertificateModule } from 'webserver/central-certificates/central-certificate.module';
import { DefaultDocumentsModule } from 'webserver/default-documents/default-documents.module';
import { DirectoryBrowsingModule } from 'webserver/directory-browsing/directory-browsing.module';
import { IpRestrictionsModule } from 'webserver/ip-restrictions/ip-restrictions.module';
import { LoggingModule } from 'webserver/logging/logging.module';
import { MimeMapsModule } from 'webserver/mime-maps/mime-maps.module';
import { MonitoringModule } from 'webserver/monitoring/monitoring.module';
import { ModulesModule } from 'webserver/modules/modules.module';
import { CompressionModule } from 'webserver/compression/compression.module';
import { RequestFilteringModule } from 'webserver/request-filtering/request-filtering.module';
import { Module as WarningsModule } from 'notification/warning.component';
import { Module as FilesUploadModule } from 'files/upload.component';
import { FilesModule } from 'files/files.module';
import { UrlRewriteModule } from 'webserver/url-rewrite/url-rewrite.module';
import { StaticContentModule } from 'webserver/static-content/static-content.module';
import { RequestTracingModule } from 'webserver/request-tracing/request-tracing.module';
import { HttpResponseHeadersModule } from 'webserver/http-response-headers/http-response-headers.module';


export class ComponentLoader {
    public static async LoadAsync(compiler: Compiler, component: ComponentReference): Promise<ModuleWithComponentFactories<{}>> {
        // cannot assign module type as property of ComponentReference to avoid circular reference
        var moduleType: Type<any>;
        switch (component.component_name) {
            case WebSiteListComponentName:
                moduleType = WebSitesModule;
                break;

            case AppPoolComponentName:
                moduleType = AppPoolsModule;
                break;

            case WebFilesComponentName:
                moduleType = WebFilesModule;
                break;

            case WebAppListComponentName:
                moduleType = WebAppsModule;
                break;

            case VdirListComponentName:
                moduleType = VdirsModule;
                break;

            case AuthenticationComponentName:
                moduleType = AuthenticationModule;
                break;

            case AuthorizationComponentName:
                moduleType = AuthorizationModule;
                break;

            case CertificatesComponentName:
                moduleType = CertificatesModule;
                break;

            case CentralCertificateComponentName:
                moduleType = CentralCertificateModule;
                break;

            case DefaultDocumentsComponentName:
                moduleType = DefaultDocumentsModule;
                break;

            case DirectoryBrowsingComponentName:
                moduleType = DirectoryBrowsingModule;
                break;

            case IpRestrictionsComponentName:
                moduleType = IpRestrictionsModule;
                break;

            case LoggingComponentName:
                moduleType = LoggingModule;
                break;

            case MimeMapsComponentName:
                moduleType = MimeMapsModule;
                break;

            case MonitoringComponentName:
                moduleType = MonitoringModule;
                break;

            case ModulesComponentName:
                moduleType = ModulesModule;
                break;

            case CompressionComponentName:
                moduleType = CompressionModule;
                break;

            case RequestFilteringComponentName:
                moduleType = RequestFilteringModule;
                break;

            case HttpResponseHeadersComponentName:
                moduleType = HttpResponseHeadersModule;
                break;

            case RequestTracingComponentName:
                moduleType = RequestTracingModule;
                break;

            case StaticContentComponentName:
                moduleType = StaticContentModule;
                break;

            case UrlRewriteComponentName:
                moduleType = UrlRewriteModule;
                break;

            case FilesComponentName:
                moduleType = FilesModule;
                break;

            case UploadComponentName:
                moduleType = FilesUploadModule;
                break;

            case WarningComponentName:
                moduleType = WarningsModule;
                break;

            case AppModuleName:
                moduleType = AppModule;
                break;

            default:
                throw new Error("Unexpected component " + component.component_name);
        }
        return compiler.compileModuleAndAllComponentsAsync(moduleType);
    }
}
